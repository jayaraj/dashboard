package connection

import (
	"context"
	"encoding/json"

	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/services/org"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/jayaraj/infra/serviceerrors"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/billing"
	"github.com/jayaraj/messages/client/resource"
	"github.com/pkg/errors"
)

type Service struct {
	accessControl accesscontrol.AccessControl
	devMgmt       devicemanagement.DeviceManagementService
	cfg           *setting.Cfg
	orgService    org.Service
	acService     accesscontrol.Service
	log           log.Logger
	bus           bus.Bus
}

func ProvideService(
	cfg *setting.Cfg,
	devMgmt devicemanagement.DeviceManagementService,
	ac accesscontrol.AccessControl,
	acService accesscontrol.Service,
	hs *api.HTTPServer,
	routeRegister routing.RouteRegister,
	orgService org.Service,
	bus bus.Bus) error {

	service := &Service{
		accessControl: ac,
		devMgmt:       devMgmt,
		cfg:           cfg,
		orgService:    orgService,
		acService:     acService,
		bus:           bus,
		log:           log.New("connection.service"),
	}
	if err := service.declareFixedRoles(acService); err != nil {
		return err
	}
	service.registerAPIEndpoints(hs, routeRegister)
	bus.AddEventListener(service.ProcessObjectFromRecord)
	service.log.Info("Loaded connection")
	return nil
}

func (service *Service) ProcessObjectFromRecord(ctx context.Context, msg *devicemanagement.ProcessObjectFromRecordEvent) error {
	switch msg.Topic {
	case billing.CreateConnections:

		request := resource.ProcessFromCsvRecordMsg{
			CsvEntryId:   msg.CsvEntryId,
			OrgId:        msg.OrgId,
			RecordNumber: msg.RecordNumber,
			Record:       msg.Record,
		}
		body, err := json.Marshal(request)
		if err != nil {
			return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrap(err, "marshal process csv record failed"))
		}
		if err := service.devMgmt.Publish(ctx, client.BillingTopic(msg.Topic), body); err != nil {
			return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrapf(err, "publish %s for processing csv record failed", msg.Topic))
		}
	default:
		return nil
	}
	return nil
}
