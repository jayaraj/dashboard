package fixedcharge

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
)

func (service *Service) registerAPIEndpoints(httpServer *api.HTTPServer, routeRegister routing.RouteRegister) {
	authorize := accesscontrol.Middleware(service.accessControl)

	//UI
	routeRegister.Get("/org/fixedcharges", authorize(ReadPageAccess), httpServer.Index)
	routeRegister.Get("/org/fixedcharges/edit/*", authorize(EditPageAccess), httpServer.Index)
	routeRegister.Get("/org/fixedcharges/new", authorize(NewPageAccess), httpServer.Index)

	//APIs
	routeRegister.Group("api/fixedcharges", func(fixedchargesRoute routing.RouteRegister) {
		fixedchargesRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionCreate)), routing.Wrap(service.CreateFixedCharge))
		fixedchargesRoute.Get("/", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetFixedCharges))
		fixedchargesRoute.Put("/:fixedchargeId", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateFixedCharge))
		fixedchargesRoute.Get("/:fixedchargeId", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetFixedChargeById))
		fixedchargesRoute.Delete("/:fixedchargeId", authorize(accesscontrol.EvalPermission(ActionDelete)), routing.Wrap(service.DeleteFixedCharge))
	})

}
