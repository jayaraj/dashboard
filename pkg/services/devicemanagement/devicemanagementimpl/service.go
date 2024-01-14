package devicemanagementimpl

import (
	"context"
	"fmt"
	"reflect"

	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/infra/remotecache"
	"github.com/grafana/grafana/pkg/registry"
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
	"github.com/jayaraj/infra/serviceerrors"
	USER "github.com/jayaraj/messages/client/user"
	"github.com/pkg/errors"
	"golang.org/x/sync/errgroup"
)

type Service struct {
	context            context.Context
	childRoutines      *errgroup.Group
	shutdownFn         context.CancelFunc
	cfg                *setting.Cfg
	nats               NATS.Nats
	log                log.Logger
	cache              *remotecache.RemoteCache
	resource           devicemanagement.ResourceService
	group              devicemanagement.GroupService
	user               devicemanagement.UserService
	configuration      devicemanagement.ConfigurationService
	backgroundServices []registry.BackgroundService
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
		cfg:                cfg,
		nats:               n,
		cache:              remoteCache,
		log:                log.New("devicemanagement.service"),
		backgroundServices: make([]registry.BackgroundService, 0),
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
	if service.configuration, err = configuration.ProvideService(cfg, service, ac, acService, hs, routeRegister); err != nil {
		return nil, errors.Wrap(err, "failed to start configurations")
	}
	if err = inventory.ProvideService(cfg, service, ac, acService, hs, routeRegister); err != nil {
		return nil, errors.Wrap(err, "failed to start inventories")
	}
	if err = fileloader.ProvideService(cfg, service, bus, ac, acService, hs, routeRegister); err != nil {
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

func (service *Service) GetConfiguration() devicemanagement.ConfigurationService {
	return service.configuration
}

func (service *Service) RegisterBackgroundService(svc registry.BackgroundService) error {
	service.backgroundServices = append(service.backgroundServices, svc)
	return nil
}

func (s *Service) Run(ctx context.Context) (err error) {
	defer func() {
		if r := recover(); r != nil {
			switch t := r.(type) {
			case error:
				err = serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrapf(r.(error), "devicemanagement  panic recovered"))
			default:
				err = serviceerrors.NewServiceError(serviceerrors.ErrExternalError, fmt.Errorf("devicemanagement unknown panic error: %v", t))
			}
		}
	}()
	rootCtx, shutdownFn := context.WithCancel(ctx)
	childRoutines, childCtx := errgroup.WithContext(rootCtx)

	for i := range s.backgroundServices {
		svc := s.backgroundServices[i]
		childRoutines.Go(func() error {
			select {
			case <-ctx.Done():
				return ctx.Err()
			default:
			}
			err := svc.Run(childCtx)
			if err != nil && !errors.Is(err, context.Canceled) {
				s.log.Error("stopped background service", "reason", err)
				return errors.Wrap(err, "stopped background service")
			}
			s.log.Debug("stopped background service", "reason", err)
			return nil
		})
	}

	<-ctx.Done()
	shutdownFn()
	if err := childRoutines.Wait(); err != nil && reflect.TypeOf(err) != reflect.TypeOf(context.Canceled) {
		s.log.Error("failed waiting for services to shutdown")
	}
	s.log.Info("device management service closed")
	return ctx.Err()
}
