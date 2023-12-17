package configuration

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
)

func (service *Service) registerAPIEndpoints(httpServer *api.HTTPServer, routeRegister routing.RouteRegister) {
	authorize := accesscontrol.Middleware(service.accessControl)

	ReadPageAccess := accesscontrol.EvalAll(
		accesscontrol.EvalAny(
			accesscontrol.EvalPermission(ActionRead),
			accesscontrol.EvalPermission(ActionCreate),
			accesscontrol.EvalPermission(ActionDelete),
			accesscontrol.EvalPermission(ActionWrite),
		),
	)
	NewPageAccess := accesscontrol.EvalAll(
		accesscontrol.EvalPermission(ActionDelete),
		accesscontrol.EvalPermission(ActionCreate),
	)
	EditPageAccess := accesscontrol.EvalAll(
		accesscontrol.EvalPermission(ActionRead),
		accesscontrol.EvalPermission(ActionWrite),
	)

	//UI
	routeRegister.Get("/org/configurationtypes", authorize(ReadPageAccess), httpServer.Index)
	routeRegister.Get("/org/configurationtypes/edit/*", authorize(EditPageAccess), httpServer.Index)
	routeRegister.Get("/org/configurationtypes/new", authorize(NewPageAccess), httpServer.Index)

	//APIs
	routeRegister.Group("api/configurationtypes", func(configurationsRoute routing.RouteRegister) {
		configurationsRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionCreate)), routing.Wrap(service.CreateConfigurationType))
		configurationsRoute.Put("/:id", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateConfigurationType))
		configurationsRoute.Delete("/:id", authorize(accesscontrol.EvalPermission(ActionDelete)), routing.Wrap(service.DeleteConfigurationType))
		configurationsRoute.Get("/:id", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetConfigurationTypeById))
		configurationsRoute.Get("/search", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.SearchConfigurationType))
		configurationsRoute.Get("/association/:association", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetConfigurationTypesWithAssociationTypes))
		configurationsRoute.Get("/association/:association/type/:type", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetConfigurationTypeByType))
	})

	routeRegister.Group("api/orgs", func(configurationRoute routing.RouteRegister) {
		configurationRoute.Put("/configurations/:config", authorize(accesscontrol.EvalPermission(ActionOrgWrite)), routing.Wrap(service.UpdateOrgConfiguration))
		configurationRoute.Get("/configurations/:config", authorize(accesscontrol.EvalPermission(ActionOrgRead)), routing.Wrap(service.GetOrgConfiguration))
	})
}
