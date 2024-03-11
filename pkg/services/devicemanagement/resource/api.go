package resource

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
)

func (service *Service) registerAPIEndpoints(httpServer *api.HTTPServer, routeRegister routing.RouteRegister) {
	authorize := accesscontrol.Middleware(service.accessControl)

	//UI
	routeRegister.Get("/org/resources", authorize(ReadPageAccess), httpServer.Index)
	routeRegister.Get("/org/resources/edit/*", authorize(EditPageAccess), httpServer.Index)
	routeRegister.Get("/org/resources/new", authorize(NewPageAccess), httpServer.Index)

	//APIs
	routeRegister.Group("api/resources", func(resourcesRoute routing.RouteRegister) {
		resourcesRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionCreate)), routing.Wrap(service.CreateResource))
		resourcesRoute.Get("/search", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.SearchResources))
		resourcesRoute.Get("/searchbytype", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetResourcesByType))
		resourcesRoute.Get("/:resourceId", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetResourceById))
		resourcesRoute.Put("/:resourceId", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateResource))
		resourcesRoute.Post("/:resourceId/cleandata", authorize(accesscontrol.EvalPermission(ActionDeleteData)), routing.Wrap(service.CleanResourceData))
		resourcesRoute.Delete("/:resourceId", authorize(accesscontrol.EvalPermission(ActionDelete)), routing.Wrap(service.DeleteResource))
		resourcesRoute.Get("/:resourceId/groups", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetResourceGroups))
		resourcesRoute.Post("/uuid/:uuid/history/:dataType", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.PostResourceHistoryData))
		resourcesRoute.Get("/:resourceId/tags/search", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetResourceTags))
		resourcesRoute.Put("/:resourceId/tags", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateResourceTags))
		resourcesRoute.Post("/:resourceId/downlink", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.SendResourceDownlink))
		resourcesRoute.Get("/:resourceId/downlink/:config", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetResourceDownlink))
	})

	routeRegister.Group("api/resources", func(configurationRoute routing.RouteRegister) {
		configurationRoute.Put("/:resourceId/configurations/:config", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateResourceConfiguration))
		configurationRoute.Get("/:resourceId/configurations/:config", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetResourceConfiguration))
	})
}
