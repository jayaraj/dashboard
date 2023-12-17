package group

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/services/user"
	"github.com/grafana/grafana/pkg/setting"
)

type Service struct {
	accessControl accesscontrol.AccessControl
	devMgmt       devicemanagement.DeviceManagementService
	cfg           *setting.Cfg
	log           log.Logger
	userService   user.Service
}

func ProvideService(cfg *setting.Cfg, devMgmt devicemanagement.DeviceManagementService, ac accesscontrol.AccessControl, acService accesscontrol.Service, hs *api.HTTPServer, routeRegister routing.RouteRegister, userService user.Service) (devicemanagement.GroupService, error) {
	service := &Service{
		accessControl: ac,
		devMgmt:       devMgmt,
		cfg:           cfg,
		log:           log.New("group.service"),
		userService:   userService,
	}
	if err := service.declareFixedRoles(acService); err != nil {
		return service, err
	}
	service.registerAPIEndpoints(hs, routeRegister)
	service.log.Info("Loaded groups......")
	return service, nil
}
