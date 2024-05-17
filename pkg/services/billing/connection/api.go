package connection

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
)

func (service *Service) registerAPIEndpoints(httpServer *api.HTTPServer, routeRegister routing.RouteRegister) {
	authorize := accesscontrol.Middleware(service.accessControl)

	//UI
	routeRegister.Get("/org/connections", authorize(ReadPageAccess), httpServer.Index)
	routeRegister.Get("/org/connections/edit/*", authorize(EditPageAccess), httpServer.Index)
	routeRegister.Get("/org/connections/new", authorize(NewPageAccess), httpServer.Index)
	routeRegister.Get("/org/connections/:id/invoices/:invoiceId", authorize(ReadPageAccess), httpServer.Index)

	//APIs
	routeRegister.Group("api/connections", func(connectionsRoute routing.RouteRegister) {
		connectionsRoute.Post("/", authorize(accesscontrol.EvalPermission(ActionCreate)), routing.Wrap(service.CreateConnection))
		connectionsRoute.Get("/", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.SearchConnections))
		connectionsRoute.Put("/:connectionId", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.UpdateConnection))
		connectionsRoute.Get("/:connectionId", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetConnectionById))
		connectionsRoute.Delete("/:connectionId", authorize(accesscontrol.EvalPermission(ActionDelete)), routing.Wrap(service.DeleteConnection))
		connectionsRoute.Get("/:connectionId/logs", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetConnectionLogs))
		connectionsRoute.Put("/:connectionId/resources", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.AddConnectionResource))

		connectionsRoute.Get("/:connectionId/users", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetConnectionUsers))
		connectionsRoute.Delete("/:connectionId/users/:userId", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.RemoveUserConnection))
		connectionsRoute.Post("/:connectionId/users/:userId", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.AddUserConnection))
		connectionsRoute.Post("/number/:number/users", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.AddUserConnectionByNumber))
		connectionsRoute.Post("/number/:number/otp", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.SendConnectionUserOtp))

		connectionsRoute.Get("/:connectionId/invoices", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetInvoices))
		connectionsRoute.Post("/:connectionId/invoices", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.CreateInvoice))
		connectionsRoute.Post("/:connectionId/transactions", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.CreateTransaction))
		connectionsRoute.Get("/:connectionId/transactions", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetConnectionTransactions))

		connectionsRoute.Get("/:connectionId/resources", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetConnectionResources))
		connectionsRoute.Post("/:connectionId/resources", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.CreateConnectionResource))
		connectionsRoute.Delete("/:connectionId/resources/:resourceId", authorize(accesscontrol.EvalPermission(ActionWrite)), routing.Wrap(service.RemoveConnectionResource))
	})

	routeRegister.Group("api/invoices", func(invoicesRoute routing.RouteRegister) {
		invoicesRoute.Get("/:invoiceId", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetInvoice))
		invoicesRoute.Get("/:invoiceId/transactions", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetInvoiceTransactions))
	})

}
