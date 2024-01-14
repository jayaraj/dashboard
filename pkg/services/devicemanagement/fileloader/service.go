package fileloader

import (
	"context"
	"fmt"

	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/jayaraj/infra/serviceerrors"
	"github.com/pkg/errors"
)

type Service struct {
	accessControl accesscontrol.AccessControl
	devMgmt       devicemanagement.DeviceManagementService
	bus           bus.Bus
	cfg           *setting.Cfg
	log           log.Logger
	fileChan      chan devicemanagement.TriggerCsvProcessMsg
}

func ProvideService(cfg *setting.Cfg, devMgmt devicemanagement.DeviceManagementService, bus bus.Bus, ac accesscontrol.AccessControl, acService accesscontrol.Service, hs *api.HTTPServer, routeRegister routing.RouteRegister) error {
	service := &Service{
		accessControl: ac,
		devMgmt:       devMgmt,
		cfg:           cfg,
		bus:           bus,
		log:           log.New("fileloader.service"),
		fileChan:      make(chan devicemanagement.TriggerCsvProcessMsg, 1),
	}
	if err := service.declareFixedRoles(acService); err != nil {
		return err
	}
	service.registerAPIEndpoints(hs, routeRegister)
	service.log.Info("Loaded file loaders")

	bus.AddEventListener(service.ProcessObjectFromRecord)
	devMgmt.RegisterBackgroundService(service)
	return nil
}

func (s *Service) Run(ctx context.Context) (err error) {
	defer func() {
		if r := recover(); r != nil {
			switch t := r.(type) {
			case error:
				err = serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrapf(r.(error), "fileloader panic recovered"))
			default:
				err = serviceerrors.NewServiceError(serviceerrors.ErrExternalError, fmt.Errorf("fileloader unknown panic error: %v", t))
			}
		}
	}()
	for {
		select {
		case request := <-s.fileChan:
			if err := s.triggerCsvProcess(ctx, request); err != nil {
				s.log.Error("failed processing file", err.Error())
			}
		case <-ctx.Done():
			s.log.Info("fileloader service closed")
			return ctx.Err()
		}
	}
}
