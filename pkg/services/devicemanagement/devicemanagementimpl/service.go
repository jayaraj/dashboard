package devicemanagementimpl

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/db"
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
	User "github.com/grafana/grafana/pkg/services/devicemanagement/user"
	"github.com/grafana/grafana/pkg/services/user"
	"github.com/grafana/grafana/pkg/setting"
	NATS "github.com/jayaraj/infra/nats"
	USER "github.com/jayaraj/messages/client/user"
	"github.com/pkg/errors"
)

type Service struct {
	cfg      *setting.Cfg
	nats     NATS.Nats
	log      log.Logger
	cache    *remotecache.RemoteCache
	resource devicemanagement.ResourceService
	group    devicemanagement.GroupService
	user     devicemanagement.UserService
}

func ProvideService(
	db db.DB,
	cfg *setting.Cfg,
	ac accesscontrol.AccessControl,
	acService accesscontrol.Service,
	hs *api.HTTPServer,
	routeRegister routing.RouteRegister,
	remoteCache *remotecache.RemoteCache,
	userService user.Service,
	bus bus.Bus) (devicemanagement.DeviceManagementService, error) {

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
	if service.user, err = User.ProvideService(db, cfg, service, bus); err != nil {
		return nil, errors.Wrap(err, "failed to start groups")
	}
	if err := n.Init(); err != nil {
		service.log.Error("nats init failed: ", err.Error())
		return service, err
	}

	//Sync Messages
	var syncMessages = map[string]NATS.NatsHandler{
		USER.GetOrgUser:            &getOrgUser{user: service.user},
		USER.SearchOrgUsers:        &searchOrgUsers{user: service.user},
		USER.SearchUsersByOrgUsers: &searchUsersByOrgUsers{user: service.user},
	}
	for key, value := range syncMessages {
		if err := n.RegisterNatsHandlers(key, value); err != nil {
			return nil, errors.Wrap(err, "failed to register sync message handlers")
		}
	}
	return service, nil
}

func (service *Service) GetResource() devicemanagement.ResourceService {
	return service.resource
}
func (service *Service) GetGroup() devicemanagement.GroupService {
	return service.group
}

func (service *Service) GetUser() devicemanagement.UserService {
	return service.user
}
