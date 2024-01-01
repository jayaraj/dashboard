package user

import (
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/services/sqlstore/migrator"
	"github.com/grafana/grafana/pkg/setting"
)

type Service struct {
	db      db.DB
	dialect migrator.Dialect
	devMgmt devicemanagement.DeviceManagementService
	cfg     *setting.Cfg
	log     log.Logger
	bus     bus.Bus
}

func ProvideService(db db.DB, cfg *setting.Cfg, devMgmt devicemanagement.DeviceManagementService, bus bus.Bus) error {
	service := &Service{
		db:      db,
		dialect: db.GetDialect(),
		devMgmt: devMgmt,
		cfg:     cfg,
		bus:     bus,
		log:     log.New("billing.user.service"),
	}
	bus.AddEventListener(service.DeleteOrg)
	bus.AddEventListener(service.DeleteOrgUser)
	bus.AddEventListener(service.DeleteUser)
	service.log.Info("Loaded billing.user")
	return nil
}
