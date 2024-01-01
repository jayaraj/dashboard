package connection

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/services/org"
	"github.com/grafana/grafana/pkg/setting"
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
		acService:     acService,
		log:           log.New("connection.service"),
	}
	if err := service.declareFixedRoles(acService); err != nil {
		return err
	}
	service.registerAPIEndpoints(hs, routeRegister)
	service.log.Info("Loaded connection")
	return nil
}
