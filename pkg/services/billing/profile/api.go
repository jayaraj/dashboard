package profile

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
)

func (service *Service) registerAPIEndpoints(httpServer *api.HTTPServer, routeRegister routing.RouteRegister) {
	authorize := accesscontrol.Middleware(service.accessControl)

	//UI
	routeRegister.Get("/org/profiles", authorize(ReadPageAccess), httpServer.Index)
	routeRegister.Get("/org/profiles/edit/*", authorize(EditPageAccess), httpServer.Index)
	routeRegister.Get("/org/profiles/new", authorize(NewPageAccess), httpServer.Index)
	routeRegister.Get("/org/profiles/:id/slabs/new", authorize(NewPageAccess), httpServer.Index)
	routeRegister.Get("/org/profiles/:id/slabs/edit/*", authorize(EditPageAccess), httpServer.Index)

	//APIs
	routeRegister.Group("api/profiles", func(profilesRoute routing.RouteRegister) {
		profilesRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionCreate)), routing.Wrap(service.CreateProfile))
		profilesRoute.Get("/", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.SearchProfiles))
		profilesRoute.Put("/:profileId", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateProfile))
		profilesRoute.Get("/:profileId", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetProfileById))
		profilesRoute.Delete("/:profileId", authorize(accesscontrol.EvalPermission(ActionDelete)), routing.Wrap(service.DeleteProfile))

		profilesRoute.Get("/:profileId/slabs", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetSlabsByProfile))
		profilesRoute.Post("/:profileId/slabs", authorize(accesscontrol.EvalPermission(ActionCreate)), routing.Wrap(service.CreateSlab))
		profilesRoute.Put("/:profileId/slabs/:slabId", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateSlab))
		profilesRoute.Get("/:profileId/slabs/:slabId", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetSlabById))
		profilesRoute.Delete("/:profileId/slabs/:slabId", authorize(accesscontrol.EvalPermission(ActionDelete)), routing.Wrap(service.DeleteSlab))
	})

}
