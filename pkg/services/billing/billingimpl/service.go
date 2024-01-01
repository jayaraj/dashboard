package billingimpl

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/infra/remotecache"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/billing"
	"github.com/grafana/grafana/pkg/services/billing/connection"
	"github.com/grafana/grafana/pkg/services/billing/fixedcharge"
	"github.com/grafana/grafana/pkg/services/billing/profile"
	User "github.com/grafana/grafana/pkg/services/billing/user"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/services/org"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/pkg/errors"
)

type Service struct {
	cfg              *setting.Cfg
	log              log.Logger
	cache            *remotecache.RemoteCache
	devicemanagement devicemanagement.DeviceManagementService
}

func ProvideService(
	db db.DB,
	cfg *setting.Cfg,
	devicemanagement devicemanagement.DeviceManagementService,
	ac accesscontrol.AccessControl,
	acService accesscontrol.Service,
	hs *api.HTTPServer,
	orgService org.Service,
	routeRegister routing.RouteRegister,
	remoteCache *remotecache.RemoteCache,
	bus bus.Bus) (billing.BillingService, error) {

	service := &Service{
		cfg:              cfg,
		cache:            remoteCache,
		devicemanagement: devicemanagement,
		log:              log.New("billing.service"),
	}

	var err error
	//Initialize services
	if err = User.ProvideService(db, cfg, devicemanagement, bus); err != nil {
		return service, errors.Wrap(err, "failed to start user")
	}
	if err = connection.ProvideService(cfg, devicemanagement, ac, acService, hs, routeRegister, orgService, bus); err != nil {
		return service, errors.Wrap(err, "failed to start connection")
	}
	if err = profile.ProvideService(cfg, devicemanagement, ac, acService, hs, routeRegister); err != nil {
		return service, errors.Wrap(err, "failed to start profile")
	}
	if err = fixedcharge.ProvideService(cfg, devicemanagement, ac, acService, hs, routeRegister); err != nil {
		return service, errors.Wrap(err, "failed to start fixedcharge")
	}
	return service, nil
}
