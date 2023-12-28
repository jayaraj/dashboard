package inventory

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
)

func (service *Service) registerAPIEndpoints(httpServer *api.HTTPServer, routeRegister routing.RouteRegister) {
	authorize := accesscontrol.Middleware(service.accessControl)

	//UI
	routeRegister.Get("/inventories", authorize(ReadPageAccess), httpServer.Index)
	routeRegister.Get("/inventories/edit/*", authorize(EditPageAccess), httpServer.Index)
	routeRegister.Get("/inventories/new", authorize(NewPageAccess), httpServer.Index)

	//APIs
	routeRegister.Group("api/inventories", func(inventoriesRoute routing.RouteRegister) {
		inventoriesRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionCreate)), routing.Wrap(service.CreateInventory))
		inventoriesRoute.Get("/search", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.SearchInventory))
		inventoriesRoute.Get("/:inventoryId", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetInventoryById))
		inventoriesRoute.Put("/:inventoryId", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateInventory))
		inventoriesRoute.Delete("/:inventoryId", authorize(accesscontrol.EvalPermission(ActionDelete)), routing.Wrap(service.DeleteInventory))
		inventoriesRoute.Get("/uuid/:uuid", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetInventoryByUUID))
	})

	routeRegister.Group("api/inventories", func(configurationRoute routing.RouteRegister) {
		configurationRoute.Put("/:inventoryId/configurations/:config", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateInventoryConfiguration))
		configurationRoute.Get("/:inventoryId/configurations/:config", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetInventoryConfiguration))
	})
}
