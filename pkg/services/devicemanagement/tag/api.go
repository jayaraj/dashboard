package tag

import (
	"github.com/grafana/grafana/pkg/api"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
)

func (service *Service) registerAPIEndpoints(httpServer *api.HTTPServer, routeRegister routing.RouteRegister) {
	authorize := accesscontrol.Middleware(service.accessControl)

	//APIs
	routeRegister.Group("api/tags", func(tagsRoute routing.RouteRegister) {
		tagsRoute.Get("/:association", authorize(accesscontrol.EvalPermission(ActionRead)), routing.Wrap(service.GetTags))
	})
}
