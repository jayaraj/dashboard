package fileloader

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
)

func (service *Service) registerAPIEndpoints(httpServer *api.HTTPServer, routeRegister routing.RouteRegister) {
	authorize := accesscontrol.Middleware(service.accessControl)

	//UI
	routeRegister.Get("/csventries", authorize(ReadPageAccess), httpServer.Index)
	routeRegister.Get("/csventries/:id/errors", authorize(ReadPageAccess), httpServer.Index)

	//APIs
	routeRegister.Group("api/csventries", func(csvloaderRoute routing.RouteRegister) {
		csvloaderRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionCsvCreate)), routing.Wrap(service.UploadCsv))
		csvloaderRoute.Get("/search", authorize(accesscontrol.EvalPermission(ActionCsvRead)), routing.Wrap(service.SearchCsv))
		csvloaderRoute.Delete("/:id", authorize(accesscontrol.EvalPermission(ActionCsvDelete)), routing.Wrap(service.DeleteCsv))
		csvloaderRoute.Get("/:id", authorize(accesscontrol.EvalPermission(ActionCsvRead)), routing.Wrap(service.GetCsvById))
		csvloaderRoute.Get("/:id/errors", authorize(accesscontrol.EvalPermission(ActionCsvRead)), routing.Wrap(service.GetCsvErrorsById))
	})

	routeRegister.Group("api/storage", func(storageRoute routing.RouteRegister) {
		storageRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionFileCreate)), routing.Wrap(service.UploadFile))
	})
}
