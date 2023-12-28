package group

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
)

func (service *Service) registerAPIEndpoints(httpServer *api.HTTPServer, routeRegister routing.RouteRegister) {
	authorize := accesscontrol.Middleware(service.accessControl)

	//UI
	routeRegister.Get("/org/groups", authorize(ReadPageAccess), httpServer.Index)
	routeRegister.Get("/org/groups/new", authorize(NewPageAccess), httpServer.Index)
	routeRegister.Get("/org/groups/edit/*", authorize(EditPageAccess), httpServer.Index)
	routeRegister.Get("/org/groups/:id/new", authorize(NewPageAccess), httpServer.Index)
	routeRegister.Get("/org/groups/:id/resources/new", authorize(NewPageAccess), httpServer.Index)

	//APIs
	routeRegister.Group("api/groups", func(groupsRoute routing.RouteRegister) {
		groupsRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionCreate)), routing.Wrap(service.CreateGroup))
		groupsRoute.Get("/", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetGroups))
		groupsRoute.Get("/searchbytype", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetGroupsByType))
		groupsRoute.Get("/:groupId", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetGroupById))
		groupsRoute.Put("/:groupId", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateGroup))
		groupsRoute.Delete("/:groupId", authorize(accesscontrol.EvalPermission(ActionDelete)), routing.Wrap(service.DeleteGroup))
		groupsRoute.Get("/:groupId/parent", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetGroupParent))
		groupsRoute.Get("/:groupId/resources", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetGroupResources))
		groupsRoute.Get("/:groupId/users", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetGroupUsers))
		groupsRoute.Post("/:groupId/resources", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.CreateGroupResource))
		groupsRoute.Post("/:groupId/resources/:uuid", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.AddGroupResources))
		groupsRoute.Get("/:groupId/pathname", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetGroupPathName))
		groupsRoute.Get("/:groupId/tags/search", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetGroupTags))
		groupsRoute.Put("/:groupId/tags", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.UpdateGroupTags))
	})

	routeRegister.Group("api/groups", func(configurationRoute routing.RouteRegister) {
		configurationRoute.Put("/:groupId/configurations/:config", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateGroupConfiguration))
		configurationRoute.Get("/:groupId/configurations/:config", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetGroupConfiguration))
	})

	routeRegister.Group("api/groupusers", func(groupsRoute routing.RouteRegister) {
		groupsRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.AddGroupUser))
		groupsRoute.Delete("/:id", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.DeleteGroupUser))
	})

	routeRegister.Group("api/groupresources", func(groupsRoute routing.RouteRegister) {
		groupsRoute.Delete("/:id", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.DeleteGroupResource))
	})
}
