package connection

import (
	"context"
	"encoding/json"
	"fmt"

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
	reportChan    chan TriggerReportGenerationMsg
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
		reportChan:    make(chan TriggerReportGenerationMsg, 1000),
	}
	if err := service.declareFixedRoles(acService); err != nil {
		return err
	}
	service.registerAPIEndpoints(hs, routeRegister)
	bus.AddEventListener(service.ProcessObjectFromRecord)
	devMgmt.RegisterBackgroundService(service)
	service.log.Info("Loaded connection")
	return nil
}

func (service *Service) ProcessObjectFromRecord(ctx context.Context, msg *devicemanagement.ProcessObjectFromRecordEvent) error {
	switch msg.Topic {
	case billing.CreateConnections, billing.CreateConnectionResources:

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

func (s *Service) Run(ctx context.Context) (err error) {
	defer func() {
		if r := recover(); r != nil {
			switch t := r.(type) {
			case error:
				err = serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrapf(r.(error), "connections background service panic recovered"))
			default:
				err = serviceerrors.NewServiceError(serviceerrors.ErrExternalError, fmt.Errorf("connections background service unknown panic error: %v", t))
			}
		}
	}()
	for {
		select {
		case request := <-s.reportChan:
			if err := s.TriggerReportGeneration(ctx, &request); err != nil {
				s.log.Error("failed generating report file", err.Error())
			}
		case <-ctx.Done():
			s.log.Info("connections background service closed")
			return ctx.Err()
		}
	}
}
