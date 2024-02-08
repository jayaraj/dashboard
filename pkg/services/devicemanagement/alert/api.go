package alert

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
)

func (service *Service) registerAPIEndpoints(httpServer *api.HTTPServer, routeRegister routing.RouteRegister) {
	authorize := accesscontrol.Middleware(service.accessControl)

	//UI
	routeRegister.Get("/org/alertdefinitions", authorize(ReadPageAccess), httpServer.Index)
	routeRegister.Get("/org/alertdefinitions/edit/*", authorize(EditPageAccess), httpServer.Index)
	routeRegister.Get("/org/alertdefinitions/new", authorize(NewPageAccess), httpServer.Index)

	//APIs
	routeRegister.Group("api/alertdefinitions", func(alertdefinitionsRoute routing.RouteRegister) {
		alertdefinitionsRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionDefinitionCreate)), routing.Wrap(service.CreateAlertDefinition))
		alertdefinitionsRoute.Put("/:alertDefinitionId", authorize(accesscontrol.EvalPermission(ActionDefinitionWrite)), routing.Wrap(service.UpdateAlertDefinition))
		alertdefinitionsRoute.Get("/:alertDefinitionId", authorize(accesscontrol.EvalPermission(ActionDefinitionRead)), routing.Wrap(service.GetAlertDefinitionById))
		alertdefinitionsRoute.Post("/:alertDefinitionId/test", authorize(accesscontrol.EvalPermission(ActionDefinitionWrite)), routing.Wrap(service.TestAlertDefinition))
		alertdefinitionsRoute.Get("/search", authorize(accesscontrol.EvalPermission(ActionDefinitionRead)), routing.Wrap(service.SearchAlertDefinitions))
		alertdefinitionsRoute.Delete("/:alertDefinitionId", authorize(accesscontrol.EvalPermission(ActionDefinitionDelete)), routing.Wrap(service.DeleteAlertDefinition))
	})

	routeRegister.Group("api/grafoalerts", func(alertsRoute routing.RouteRegister) {
		alertsRoute.Put("/configuration", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.ConfigureAlert))
		alertsRoute.Put("/enabled", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.EnabledAlert))
		alertsRoute.Get("/search", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.SearchAlerts))
		alertsRoute.Get("/name/:name", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetGrafoAlert))
		alertsRoute.Get("/:alertId/history", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetAlertHistory))
	})

	routeRegister.Group("api/alertnotifications", func(alertsRoute routing.RouteRegister) {
		alertsRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.UpdateOrCreateAlertNotification))
		alertsRoute.Get("/:name", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetAlertNotification))
	})

	routeRegister.Group("api/notifications", func(alertsRoute routing.RouteRegister) {
		alertsRoute.Get("/whatsapp", authorize(accesscontrol.EvalPermission(ActionNotificationRead)), routing.Wrap(service.GetWhatsapp))
	})

}
