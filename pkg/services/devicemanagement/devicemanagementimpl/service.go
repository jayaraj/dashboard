package devicemanagementimpl

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/infra/remotecache"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/services/devicemanagement/alert"
	"github.com/grafana/grafana/pkg/services/devicemanagement/configuration"
	"github.com/grafana/grafana/pkg/services/devicemanagement/fileloader"
	"github.com/grafana/grafana/pkg/services/devicemanagement/group"
	"github.com/grafana/grafana/pkg/services/devicemanagement/inventory"
	"github.com/grafana/grafana/pkg/services/devicemanagement/resource"
	"github.com/grafana/grafana/pkg/services/devicemanagement/tag"
	"github.com/grafana/grafana/pkg/services/user"
	"github.com/grafana/grafana/pkg/setting"
	NATS "github.com/jayaraj/infra/nats"
	"github.com/pkg/errors"
)

type Service struct {
	cfg      *setting.Cfg
	nats     NATS.Nats
	log      log.Logger
	cache    *remotecache.RemoteCache
	resource devicemanagement.ResourceService
	group    devicemanagement.GroupService
}

func ProvideService(cfg *setting.Cfg, ac accesscontrol.AccessControl, acService accesscontrol.Service, hs *api.HTTPServer, routeRegister routing.RouteRegister, remoteCache *remotecache.RemoteCache, userService user.Service) (devicemanagement.DeviceManagementService, error) {
	config := NATS.Config{
		URL:    cfg.NatsHost,
		Group:  cfg.NatsGroup,
		Prefix: cfg.NatsPrefix,
	}
	n := NATS.New(config)
	service := &Service{
		cfg:   cfg,
		nats:  n,
		cache: remoteCache,
		log:   log.New("devicemanagement.service"),
	}

	var syncMessages = map[string]NATS.NatsHandler{}
	for key, value := range syncMessages {
		if err := n.RegisterNatsHandlers(key, value); err != nil {
			return nil, errors.Wrap(err, "failed to register sync message handlers")
		}
	}
	var err error
	//Initialize services
	if service.resource, err = resource.ProvideService(cfg, service, ac, acService, hs, routeRegister); err != nil {
		return nil, errors.Wrap(err, "failed to start resources")
	}
	if service.group, err = group.ProvideService(cfg, service, ac, acService, hs, routeRegister, userService); err != nil {
		return nil, errors.Wrap(err, "failed to start groups")
	}
	if err = tag.ProvideService(cfg, service, ac, acService, hs, routeRegister); err != nil {
		return nil, errors.Wrap(err, "failed to start tags")
	}
	if err = configuration.ProvideService(cfg, service, ac, acService, hs, routeRegister); err != nil {
		return nil, errors.Wrap(err, "failed to start configurations")
	}
	if err = inventory.ProvideService(cfg, service, ac, acService, hs, routeRegister); err != nil {
		return nil, errors.Wrap(err, "failed to start inventories")
	}
	if err = fileloader.ProvideService(cfg, service, ac, acService, hs, routeRegister); err != nil {
		return nil, errors.Wrap(err, "failed to start file loader")
	}
	if err = alert.ProvideService(cfg, service, ac, acService, hs, routeRegister); err != nil {
		return nil, errors.Wrap(err, "failed to start alerts")
	}
	return service, nil
}

func (service *Service) GetResource() devicemanagement.ResourceService {
	return service.resource
}
func (service *Service) GetGroup() devicemanagement.GroupService {
	return service.group
}
