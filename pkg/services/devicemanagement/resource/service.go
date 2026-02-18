package resource

import (
	"context"
	"fmt"

	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
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
	cfg           *setting.Cfg
	log           log.Logger
	fileChan      chan devicemanagement.UpdateResourceDataMsg
}

func ProvideService(cfg *setting.Cfg, devMgmt devicemanagement.DeviceManagementService, ac accesscontrol.AccessControl, acService accesscontrol.Service, hs *api.HTTPServer, routeRegister routing.RouteRegister) (devicemanagement.ResourceService, error) {
	service := &Service{
		accessControl: ac,
		devMgmt:       devMgmt,
		cfg:           cfg,
		log:           log.New("resource.service"),
		fileChan:      make(chan devicemanagement.UpdateResourceDataMsg, 100),
	}
	if err := service.declareFixedRoles(acService); err != nil {
		return service, err
	}
	service.registerAPIEndpoints(hs, routeRegister)
	devMgmt.RegisterBackgroundService(service)
	service.log.Info("Loaded resoures")
	return service, nil
}

func (s *Service) Run(ctx context.Context) (err error) {
	defer func() {
		if r := recover(); r != nil {
			switch t := r.(type) {
			case error:
				err = serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrapf(r.(error), "resource panic recovered"))
			default:
				err = serviceerrors.NewServiceError(serviceerrors.ErrExternalError, fmt.Errorf("resource unknown panic error: %v", t))
			}
		}
	}()
	for {
		select {
		case request := <-s.fileChan:
			if err := s.processCsv(ctx, request); err != nil {
				s.log.Error("failed processing file", err.Error())
			}
		case <-ctx.Done():
			s.log.Info("resource  service closed")
			return ctx.Err()
		}
	}
}
