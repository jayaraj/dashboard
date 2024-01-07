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
	})

	routeRegister.Group("api/slabs", func(slabsRoute routing.RouteRegister) {
		slabsRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionCreate)), routing.Wrap(service.CreateSlab))
		slabsRoute.Put("/:slabId", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateSlab))
		slabsRoute.Get("/:slabId", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetSlabById))
		slabsRoute.Delete("/:slabId", authorize(accesscontrol.EvalPermission(ActionDelete)), routing.Wrap(service.DeleteSlab))
	})

}
