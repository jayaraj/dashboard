package api

import (
	"net/http"

	"github.com/grafana/grafana/pkg/middleware"
	macaron "gopkg.in/macaron.v1"
)

type Router interface {
	Handle(method, pattern string, handlers []macaron.Handler) *macaron.Route
}

type RouteRegister interface {
	Get(string, ...macaron.Handler)
	Post(string, ...macaron.Handler)
	Delete(string, ...macaron.Handler)
	Put(string, ...macaron.Handler)
	Patch(string, ...macaron.Handler)
	Any(string, ...macaron.Handler)

	Group(string, func(RouteRegister), ...macaron.Handler)

	Register(Router) *macaron.Router
}

func newRouteRegister() RouteRegister {
	return &routeRegister{
		prefix:         "",
		routes:         []route{},
		subfixHandlers: []macaron.Handler{},
	}
}

type route struct {
	method   string
	pattern  string
	handlers []macaron.Handler
}

type routeRegister struct {
	prefix         string
	subfixHandlers []macaron.Handler
	routes         []route
	groups         []*routeRegister
}

func (rr *routeRegister) Group(pattern string, fn func(rr RouteRegister), handlers ...macaron.Handler) {
	group := &routeRegister{
		prefix:         rr.prefix + pattern,
		subfixHandlers: append(rr.subfixHandlers, handlers...),
		routes:         []route{},
	}

	fn(group)
	rr.groups = append(rr.groups, group)
}

func (rr *routeRegister) Register(router Router) *macaron.Router {
	for _, r := range rr.routes {
		router.Handle(r.method, r.pattern, r.handlers)
	}

	for _, g := range rr.groups {
		g.Register(router)
	}

	return &macaron.Router{}
}

func (rr *routeRegister) route(pattern, method string, handlers ...macaron.Handler) {
	//inject tracing

	h := append(rr.subfixHandlers, handlers...)
	h = append([]macaron.Handler{middleware.RequestMetrics(pattern)}, h...)

	rr.routes = append(rr.routes, route{
		method:   method,
		pattern:  rr.prefix + pattern,
		handlers: h,
	})
}

func (rr *routeRegister) Get(pattern string, handlers ...macaron.Handler) {
	rr.route(pattern, http.MethodGet, handlers...)
}

func (rr *routeRegister) Post(pattern string, handlers ...macaron.Handler) {
	rr.route(pattern, http.MethodPost, handlers...)
}

func (rr *routeRegister) Delete(pattern string, handlers ...macaron.Handler) {
	rr.route(pattern, http.MethodDelete, handlers...)
}

func (rr *routeRegister) Put(pattern string, handlers ...macaron.Handler) {
	rr.route(pattern, http.MethodPut, handlers...)
}

func (rr *routeRegister) Patch(pattern string, handlers ...macaron.Handler) {
	rr.route(pattern, http.MethodPatch, handlers...)
}

func (rr *routeRegister) Any(pattern string, handlers ...macaron.Handler) {
	rr.route(pattern, "*", handlers...)
}
