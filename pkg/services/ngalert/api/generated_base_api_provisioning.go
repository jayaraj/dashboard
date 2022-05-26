/*Package api contains base API implementation of unified alerting
 *
 *Generated by: Swagger Codegen (https://github.com/swagger-api/swagger-codegen.git)
 *
 *Do not manually edit these files, please find ngalert/api/swagger-codegen/ for commands on how to generate them.
 */

package api

import (
	"net/http"

	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/middleware"
	"github.com/grafana/grafana/pkg/models"
	apimodels "github.com/grafana/grafana/pkg/services/ngalert/api/tooling/definitions"
	"github.com/grafana/grafana/pkg/services/ngalert/metrics"
	"github.com/grafana/grafana/pkg/web"
)

type ProvisioningApiForkingService interface {
	RouteDeleteContactpoints(*models.ReqContext) response.Response
	RouteDeleteMuteTiming(*models.ReqContext) response.Response
	RouteDeleteTemplate(*models.ReqContext) response.Response
	RouteGetContactpoints(*models.ReqContext) response.Response
	RouteGetMuteTiming(*models.ReqContext) response.Response
	RouteGetMuteTimings(*models.ReqContext) response.Response
	RouteGetPolicyTree(*models.ReqContext) response.Response
	RouteGetTemplate(*models.ReqContext) response.Response
	RouteGetTemplates(*models.ReqContext) response.Response
	RoutePostContactpoints(*models.ReqContext) response.Response
	RoutePostMuteTiming(*models.ReqContext) response.Response
	RoutePutContactpoint(*models.ReqContext) response.Response
	RoutePutMuteTiming(*models.ReqContext) response.Response
	RoutePutPolicyTree(*models.ReqContext) response.Response
	RoutePutTemplate(*models.ReqContext) response.Response
}

func (f *ForkedProvisioningApi) RouteDeleteContactpoints(ctx *models.ReqContext) response.Response {
	return f.forkRouteDeleteContactpoints(ctx)
}

func (f *ForkedProvisioningApi) RouteDeleteMuteTiming(ctx *models.ReqContext) response.Response {
	return f.forkRouteDeleteMuteTiming(ctx)
}

func (f *ForkedProvisioningApi) RouteDeleteTemplate(ctx *models.ReqContext) response.Response {
	return f.forkRouteDeleteTemplate(ctx)
}

func (f *ForkedProvisioningApi) RouteGetContactpoints(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetContactpoints(ctx)
}

func (f *ForkedProvisioningApi) RouteGetMuteTiming(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetMuteTiming(ctx)
}

func (f *ForkedProvisioningApi) RouteGetMuteTimings(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetMuteTimings(ctx)
}

func (f *ForkedProvisioningApi) RouteGetPolicyTree(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetPolicyTree(ctx)
}

func (f *ForkedProvisioningApi) RouteGetTemplate(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetTemplate(ctx)
}

func (f *ForkedProvisioningApi) RouteGetTemplates(ctx *models.ReqContext) response.Response {
	return f.forkRouteGetTemplates(ctx)
}

func (f *ForkedProvisioningApi) RoutePostContactpoints(ctx *models.ReqContext) response.Response {
	conf := apimodels.EmbeddedContactPoint{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRoutePostContactpoints(ctx, conf)
}

func (f *ForkedProvisioningApi) RoutePostMuteTiming(ctx *models.ReqContext) response.Response {
	conf := apimodels.MuteTimeInterval{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRoutePostMuteTiming(ctx, conf)
}

func (f *ForkedProvisioningApi) RoutePutContactpoint(ctx *models.ReqContext) response.Response {
	conf := apimodels.EmbeddedContactPoint{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRoutePutContactpoint(ctx, conf)
}

func (f *ForkedProvisioningApi) RoutePutMuteTiming(ctx *models.ReqContext) response.Response {
	conf := apimodels.MuteTimeInterval{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRoutePutMuteTiming(ctx, conf)
}

func (f *ForkedProvisioningApi) RoutePutPolicyTree(ctx *models.ReqContext) response.Response {
	conf := apimodels.Route{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRoutePutPolicyTree(ctx, conf)
}

func (f *ForkedProvisioningApi) RoutePutTemplate(ctx *models.ReqContext) response.Response {
	conf := apimodels.MessageTemplateContent{}
	if err := web.Bind(ctx.Req, &conf); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	return f.forkRoutePutTemplate(ctx, conf)
}

func (api *API) RegisterProvisioningApiEndpoints(srv ProvisioningApiForkingService, m *metrics.API) {
	api.RouteRegister.Group("", func(group routing.RouteRegister) {
		group.Delete(
			toMacaronPath("/api/provisioning/contact-points/{ID}"),
			api.authorize(http.MethodDelete, "/api/provisioning/contact-points/{ID}"),
			metrics.Instrument(
				http.MethodDelete,
				"/api/provisioning/contact-points/{ID}",
				srv.RouteDeleteContactpoints,
				m,
			),
		)
		group.Delete(
			toMacaronPath("/api/provisioning/mute-timings/{name}"),
			api.authorize(http.MethodDelete, "/api/provisioning/mute-timings/{name}"),
			metrics.Instrument(
				http.MethodDelete,
				"/api/provisioning/mute-timings/{name}",
				srv.RouteDeleteMuteTiming,
				m,
			),
		)
		group.Delete(
			toMacaronPath("/api/provisioning/templates/{name}"),
			api.authorize(http.MethodDelete, "/api/provisioning/templates/{name}"),
			metrics.Instrument(
				http.MethodDelete,
				"/api/provisioning/templates/{name}",
				srv.RouteDeleteTemplate,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/provisioning/contact-points"),
			api.authorize(http.MethodGet, "/api/provisioning/contact-points"),
			metrics.Instrument(
				http.MethodGet,
				"/api/provisioning/contact-points",
				srv.RouteGetContactpoints,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/provisioning/mute-timings/{name}"),
			api.authorize(http.MethodGet, "/api/provisioning/mute-timings/{name}"),
			metrics.Instrument(
				http.MethodGet,
				"/api/provisioning/mute-timings/{name}",
				srv.RouteGetMuteTiming,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/provisioning/mute-timings"),
			api.authorize(http.MethodGet, "/api/provisioning/mute-timings"),
			metrics.Instrument(
				http.MethodGet,
				"/api/provisioning/mute-timings",
				srv.RouteGetMuteTimings,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/provisioning/policies"),
			api.authorize(http.MethodGet, "/api/provisioning/policies"),
			metrics.Instrument(
				http.MethodGet,
				"/api/provisioning/policies",
				srv.RouteGetPolicyTree,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/provisioning/templates/{name}"),
			api.authorize(http.MethodGet, "/api/provisioning/templates/{name}"),
			metrics.Instrument(
				http.MethodGet,
				"/api/provisioning/templates/{name}",
				srv.RouteGetTemplate,
				m,
			),
		)
		group.Get(
			toMacaronPath("/api/provisioning/templates"),
			api.authorize(http.MethodGet, "/api/provisioning/templates"),
			metrics.Instrument(
				http.MethodGet,
				"/api/provisioning/templates",
				srv.RouteGetTemplates,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/provisioning/contact-points"),
			api.authorize(http.MethodPost, "/api/provisioning/contact-points"),
			metrics.Instrument(
				http.MethodPost,
				"/api/provisioning/contact-points",
				srv.RoutePostContactpoints,
				m,
			),
		)
		group.Post(
			toMacaronPath("/api/provisioning/mute-timings"),
			api.authorize(http.MethodPost, "/api/provisioning/mute-timings"),
			metrics.Instrument(
				http.MethodPost,
				"/api/provisioning/mute-timings",
				srv.RoutePostMuteTiming,
				m,
			),
		)
		group.Put(
			toMacaronPath("/api/provisioning/contact-points/{ID}"),
			api.authorize(http.MethodPut, "/api/provisioning/contact-points/{ID}"),
			metrics.Instrument(
				http.MethodPut,
				"/api/provisioning/contact-points/{ID}",
				srv.RoutePutContactpoint,
				m,
			),
		)
		group.Put(
			toMacaronPath("/api/provisioning/mute-timings/{name}"),
			api.authorize(http.MethodPut, "/api/provisioning/mute-timings/{name}"),
			metrics.Instrument(
				http.MethodPut,
				"/api/provisioning/mute-timings/{name}",
				srv.RoutePutMuteTiming,
				m,
			),
		)
		group.Put(
			toMacaronPath("/api/provisioning/policies"),
			api.authorize(http.MethodPut, "/api/provisioning/policies"),
			metrics.Instrument(
				http.MethodPut,
				"/api/provisioning/policies",
				srv.RoutePutPolicyTree,
				m,
			),
		)
		group.Put(
			toMacaronPath("/api/provisioning/templates/{name}"),
			api.authorize(http.MethodPut, "/api/provisioning/templates/{name}"),
			metrics.Instrument(
				http.MethodPut,
				"/api/provisioning/templates/{name}",
				srv.RoutePutTemplate,
				m,
			),
		)
	}, middleware.ReqSignedIn)
}
