package api

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/components/simplejson"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/dashboards"
	"github.com/grafana/grafana/pkg/setting"

	. "github.com/smartystreets/goconvey/convey"
)

// This tests three main scenarios.
// If a user has access to execute an action on a dashboard:
//   1. and the dashboard is in a folder which does not have an acl
//   2. and the dashboard is in a folder which does have an acl
// 3. Post dashboard response tests

func TestDashboardApiEndpoint(t *testing.T) {
	Convey("Given a dashboard with a parent folder which does not have an acl", t, func() {
		fakeDash := m.NewDashboard("Child dash")
		fakeDash.Id = 1
		fakeDash.FolderId = 1
		fakeDash.HasAcl = false

		bus.AddHandler("test", func(query *m.GetDashboardsBySlugQuery) error {
			dashboards := []*m.Dashboard{fakeDash}
			query.Result = dashboards
			return nil
		})

		var getDashboardQueries []*m.GetDashboardQuery

		bus.AddHandler("test", func(query *m.GetDashboardQuery) error {
			query.Result = fakeDash
			getDashboardQueries = append(getDashboardQueries, query)
			return nil
		})

		viewerRole := m.ROLE_VIEWER
		editorRole := m.ROLE_EDITOR

		aclMockResp := []*m.DashboardAclInfoDTO{
			{Role: &viewerRole, Permission: m.PERMISSION_VIEW},
			{Role: &editorRole, Permission: m.PERMISSION_EDIT},
		}

		bus.AddHandler("test", func(query *m.GetDashboardAclInfoListQuery) error {
			query.Result = aclMockResp
			return nil
		})

		bus.AddHandler("test", func(query *m.GetTeamsByUserQuery) error {
			query.Result = []*m.Team{}
			return nil
		})

		// This tests two scenarios:
		// 1. user is an org viewer
		// 2. user is an org editor

		Convey("When user is an Org Viewer", func() {
			role := m.ROLE_VIEWER

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				dash := GetDashboardShouldReturn200(sc)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})

				Convey("Should not be able to edit or save dashboard", func() {
					So(dash.Meta.CanEdit, ShouldBeFalse)
					So(dash.Meta.CanSave, ShouldBeFalse)
					So(dash.Meta.CanAdmin, ShouldBeFalse)
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				dash := GetDashboardShouldReturn200(sc)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})

				Convey("Should not be able to edit or save dashboard", func() {
					So(dash.Meta.CanEdit, ShouldBeFalse)
					So(dash.Meta.CanSave, ShouldBeFalse)
					So(dash.Meta.CanAdmin, ShouldBeFalse)
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				CallDeleteDashboard(sc)
				So(sc.resp.Code, ShouldEqual, 403)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				CallDeleteDashboardByUid(sc)
				So(sc.resp.Code, ShouldEqual, 403)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions/1", "/api/dashboards/id/:dashboardId/versions/:id", role, func(sc *scenarioContext) {
				CallGetDashboardVersion(sc)
				So(sc.resp.Code, ShouldEqual, 403)
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions", "/api/dashboards/id/:dashboardId/versions", role, func(sc *scenarioContext) {
				CallGetDashboardVersions(sc)
				So(sc.resp.Code, ShouldEqual, 403)
			})
		})

		Convey("When user is an Org Editor", func() {
			role := m.ROLE_EDITOR

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				dash := GetDashboardShouldReturn200(sc)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})

				Convey("Should be able to edit or save dashboard", func() {
					So(dash.Meta.CanEdit, ShouldBeTrue)
					So(dash.Meta.CanSave, ShouldBeTrue)
					So(dash.Meta.CanAdmin, ShouldBeFalse)
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				dash := GetDashboardShouldReturn200(sc)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})

				Convey("Should be able to edit or save dashboard", func() {
					So(dash.Meta.CanEdit, ShouldBeTrue)
					So(dash.Meta.CanSave, ShouldBeTrue)
					So(dash.Meta.CanAdmin, ShouldBeFalse)
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				CallDeleteDashboard(sc)
				So(sc.resp.Code, ShouldEqual, 200)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				CallDeleteDashboardByUid(sc)
				So(sc.resp.Code, ShouldEqual, 200)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions/1", "/api/dashboards/id/:dashboardId/versions/:id", role, func(sc *scenarioContext) {
				CallGetDashboardVersion(sc)
				So(sc.resp.Code, ShouldEqual, 200)
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions", "/api/dashboards/id/:dashboardId/versions", role, func(sc *scenarioContext) {
				CallGetDashboardVersions(sc)
				So(sc.resp.Code, ShouldEqual, 200)
			})
		})
	})

	Convey("Given a dashboard with a parent folder which has an acl", t, func() {
		fakeDash := m.NewDashboard("Child dash")
		fakeDash.Id = 1
		fakeDash.FolderId = 1
		fakeDash.HasAcl = true
		setting.ViewersCanEdit = false

		bus.AddHandler("test", func(query *m.GetDashboardsBySlugQuery) error {
			dashboards := []*m.Dashboard{fakeDash}
			query.Result = dashboards
			return nil
		})

		aclMockResp := []*m.DashboardAclInfoDTO{
			{
				DashboardId: 1,
				Permission:  m.PERMISSION_EDIT,
				UserId:      200,
			},
		}

		bus.AddHandler("test", func(query *m.GetDashboardAclInfoListQuery) error {
			query.Result = aclMockResp
			return nil
		})

		var getDashboardQueries []*m.GetDashboardQuery

		bus.AddHandler("test", func(query *m.GetDashboardQuery) error {
			query.Result = fakeDash
			getDashboardQueries = append(getDashboardQueries, query)
			return nil
		})

		bus.AddHandler("test", func(query *m.GetTeamsByUserQuery) error {
			query.Result = []*m.Team{}
			return nil
		})

		// This tests six scenarios:
		// 1. user is an org viewer AND has no permissions for this dashboard
		// 2. user is an org editor AND has no permissions for this dashboard
		// 3. user is an org viewer AND has been granted edit permission for the dashboard
		// 4. user is an org viewer AND all viewers have edit permission for this dashboard
		// 5. user is an org viewer AND has been granted an admin permission
		// 6. user is an org editor AND has been granted a view permission

		Convey("When user is an Org Viewer and has no permissions for this dashboard", func() {
			role := m.ROLE_VIEWER

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				sc.handlerFunc = GetDashboard
				sc.fakeReqWithParams("GET", sc.url, map[string]string{}).exec()

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})

				Convey("Should be denied access", func() {
					So(sc.resp.Code, ShouldEqual, 403)
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				sc.handlerFunc = GetDashboard
				sc.fakeReqWithParams("GET", sc.url, map[string]string{}).exec()

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})

				Convey("Should be denied access", func() {
					So(sc.resp.Code, ShouldEqual, 403)
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				CallDeleteDashboard(sc)
				So(sc.resp.Code, ShouldEqual, 403)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				CallDeleteDashboardByUid(sc)
				So(sc.resp.Code, ShouldEqual, 403)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions/1", "/api/dashboards/id/:dashboardId/versions/:id", role, func(sc *scenarioContext) {
				CallGetDashboardVersion(sc)
				So(sc.resp.Code, ShouldEqual, 403)
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions", "/api/dashboards/id/:dashboardId/versions", role, func(sc *scenarioContext) {
				CallGetDashboardVersions(sc)
				So(sc.resp.Code, ShouldEqual, 403)
			})
		})

		Convey("When user is an Org Editor and has no permissions for this dashboard", func() {
			role := m.ROLE_EDITOR

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				sc.handlerFunc = GetDashboard
				sc.fakeReqWithParams("GET", sc.url, map[string]string{}).exec()

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})

				Convey("Should be denied access", func() {
					So(sc.resp.Code, ShouldEqual, 403)
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				sc.handlerFunc = GetDashboard
				sc.fakeReqWithParams("GET", sc.url, map[string]string{}).exec()

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})

				Convey("Should be denied access", func() {
					So(sc.resp.Code, ShouldEqual, 403)
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				CallDeleteDashboard(sc)
				So(sc.resp.Code, ShouldEqual, 403)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				CallDeleteDashboardByUid(sc)
				So(sc.resp.Code, ShouldEqual, 403)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions/1", "/api/dashboards/id/:dashboardId/versions/:id", role, func(sc *scenarioContext) {
				CallGetDashboardVersion(sc)
				So(sc.resp.Code, ShouldEqual, 403)
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions", "/api/dashboards/id/:dashboardId/versions", role, func(sc *scenarioContext) {
				CallGetDashboardVersions(sc)
				So(sc.resp.Code, ShouldEqual, 403)
			})
		})

		Convey("When user is an Org Viewer but has an edit permission", func() {
			role := m.ROLE_VIEWER

			mockResult := []*m.DashboardAclInfoDTO{
				{OrgId: 1, DashboardId: 2, UserId: 1, Permission: m.PERMISSION_EDIT},
			}

			bus.AddHandler("test", func(query *m.GetDashboardAclInfoListQuery) error {
				query.Result = mockResult
				return nil
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				dash := GetDashboardShouldReturn200(sc)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})

				Convey("Should be able to get dashboard with edit rights", func() {
					So(dash.Meta.CanEdit, ShouldBeTrue)
					So(dash.Meta.CanSave, ShouldBeTrue)
					So(dash.Meta.CanAdmin, ShouldBeFalse)
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				dash := GetDashboardShouldReturn200(sc)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})

				Convey("Should be able to get dashboard with edit rights", func() {
					So(dash.Meta.CanEdit, ShouldBeTrue)
					So(dash.Meta.CanSave, ShouldBeTrue)
					So(dash.Meta.CanAdmin, ShouldBeFalse)
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				CallDeleteDashboard(sc)
				So(sc.resp.Code, ShouldEqual, 200)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				CallDeleteDashboardByUid(sc)
				So(sc.resp.Code, ShouldEqual, 200)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions/1", "/api/dashboards/id/:dashboardId/versions/:id", role, func(sc *scenarioContext) {
				CallGetDashboardVersion(sc)
				So(sc.resp.Code, ShouldEqual, 200)
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions", "/api/dashboards/id/:dashboardId/versions", role, func(sc *scenarioContext) {
				CallGetDashboardVersions(sc)
				So(sc.resp.Code, ShouldEqual, 200)
			})
		})

		Convey("When user is an Org Viewer and viewers can edit", func() {
			role := m.ROLE_VIEWER
			setting.ViewersCanEdit = true

			mockResult := []*m.DashboardAclInfoDTO{
				{OrgId: 1, DashboardId: 2, UserId: 1, Permission: m.PERMISSION_VIEW},
			}

			bus.AddHandler("test", func(query *m.GetDashboardAclInfoListQuery) error {
				query.Result = mockResult
				return nil
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				dash := GetDashboardShouldReturn200(sc)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})

				Convey("Should be able to get dashboard with edit rights but can save should be false", func() {
					So(dash.Meta.CanEdit, ShouldBeTrue)
					So(dash.Meta.CanSave, ShouldBeFalse)
					So(dash.Meta.CanAdmin, ShouldBeFalse)
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				dash := GetDashboardShouldReturn200(sc)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})

				Convey("Should be able to get dashboard with edit rights but can save should be false", func() {
					So(dash.Meta.CanEdit, ShouldBeTrue)
					So(dash.Meta.CanSave, ShouldBeFalse)
					So(dash.Meta.CanAdmin, ShouldBeFalse)
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				CallDeleteDashboard(sc)
				So(sc.resp.Code, ShouldEqual, 403)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				CallDeleteDashboardByUid(sc)
				So(sc.resp.Code, ShouldEqual, 403)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})
			})
		})

		Convey("When user is an Org Viewer but has an admin permission", func() {
			role := m.ROLE_VIEWER

			mockResult := []*m.DashboardAclInfoDTO{
				{OrgId: 1, DashboardId: 2, UserId: 1, Permission: m.PERMISSION_ADMIN},
			}

			bus.AddHandler("test", func(query *m.GetDashboardAclInfoListQuery) error {
				query.Result = mockResult
				return nil
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				dash := GetDashboardShouldReturn200(sc)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})

				Convey("Should be able to get dashboard with edit rights", func() {
					So(dash.Meta.CanEdit, ShouldBeTrue)
					So(dash.Meta.CanSave, ShouldBeTrue)
					So(dash.Meta.CanAdmin, ShouldBeTrue)
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				dash := GetDashboardShouldReturn200(sc)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})

				Convey("Should be able to get dashboard with edit rights", func() {
					So(dash.Meta.CanEdit, ShouldBeTrue)
					So(dash.Meta.CanSave, ShouldBeTrue)
					So(dash.Meta.CanAdmin, ShouldBeTrue)
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				CallDeleteDashboard(sc)
				So(sc.resp.Code, ShouldEqual, 200)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				CallDeleteDashboardByUid(sc)
				So(sc.resp.Code, ShouldEqual, 200)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions/1", "/api/dashboards/id/:dashboardId/versions/:id", role, func(sc *scenarioContext) {
				CallGetDashboardVersion(sc)
				So(sc.resp.Code, ShouldEqual, 200)
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions", "/api/dashboards/id/:dashboardId/versions", role, func(sc *scenarioContext) {
				CallGetDashboardVersions(sc)
				So(sc.resp.Code, ShouldEqual, 200)
			})
		})

		Convey("When user is an Org Editor but has a view permission", func() {
			role := m.ROLE_EDITOR

			mockResult := []*m.DashboardAclInfoDTO{
				{OrgId: 1, DashboardId: 2, UserId: 1, Permission: m.PERMISSION_VIEW},
			}

			bus.AddHandler("test", func(query *m.GetDashboardAclInfoListQuery) error {
				query.Result = mockResult
				return nil
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				dash := GetDashboardShouldReturn200(sc)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})

				Convey("Should not be able to edit or save dashboard", func() {
					So(dash.Meta.CanEdit, ShouldBeFalse)
					So(dash.Meta.CanSave, ShouldBeFalse)
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				dash := GetDashboardShouldReturn200(sc)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})

				Convey("Should not be able to edit or save dashboard", func() {
					So(dash.Meta.CanEdit, ShouldBeFalse)
					So(dash.Meta.CanSave, ShouldBeFalse)
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/db/child-dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
				CallDeleteDashboard(sc)
				So(sc.resp.Code, ShouldEqual, 403)

				Convey("Should lookup dashboard by slug", func() {
					So(getDashboardQueries[0].Slug, ShouldEqual, "child-dash")
				})
			})

			loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/uid/abcdefghi", "/api/dashboards/uid/:uid", role, func(sc *scenarioContext) {
				CallDeleteDashboardByUid(sc)
				So(sc.resp.Code, ShouldEqual, 403)

				Convey("Should lookup dashboard by uid", func() {
					So(getDashboardQueries[0].Uid, ShouldEqual, "abcdefghi")
				})
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions/1", "/api/dashboards/id/:dashboardId/versions/:id", role, func(sc *scenarioContext) {
				CallGetDashboardVersion(sc)
				So(sc.resp.Code, ShouldEqual, 403)
			})

			loggedInUserScenarioWithRole("When calling GET on", "GET", "/api/dashboards/id/2/versions", "/api/dashboards/id/:dashboardId/versions", role, func(sc *scenarioContext) {
				CallGetDashboardVersions(sc)
				So(sc.resp.Code, ShouldEqual, 403)
			})
		})
	})

	Convey("Given two dashboards with the same title in different folders", t, func() {
		dashOne := m.NewDashboard("dash")
		dashOne.Id = 2
		dashOne.FolderId = 1
		dashOne.HasAcl = false

		dashTwo := m.NewDashboard("dash")
		dashTwo.Id = 4
		dashTwo.FolderId = 3
		dashTwo.HasAcl = false

		bus.AddHandler("test", func(query *m.GetDashboardsBySlugQuery) error {
			dashboards := []*m.Dashboard{dashOne, dashTwo}
			query.Result = dashboards
			return nil
		})

		role := m.ROLE_EDITOR

		loggedInUserScenarioWithRole("When calling DELETE on", "DELETE", "/api/dashboards/db/dash", "/api/dashboards/db/:slug", role, func(sc *scenarioContext) {
			CallDeleteDashboard(sc)

			Convey("Should result in 412 Precondition failed", func() {
				So(sc.resp.Code, ShouldEqual, 412)
				result := sc.ToJson()
				So(result.Get("status").MustString(), ShouldEqual, "multiple-slugs-exists")
				So(result.Get("message").MustString(), ShouldEqual, m.ErrDashboardsWithSameSlugExists.Error())
			})
		})
	})

	Convey("Post dashboard response tests", t, func() {

		// This tests that a valid request returns correct response

		Convey("Given a correct request for creating a dashboard", func() {
			cmd := m.SaveDashboardCommand{
				OrgId:  1,
				UserId: 5,
				Dashboard: simplejson.NewFromAny(map[string]interface{}{
					"title": "Dash",
				}),
				Overwrite: true,
				FolderId:  3,
				IsFolder:  false,
				Message:   "msg",
			}

			mock := &dashboards.FakeDashboardService{
				SaveDashboardResult: &m.Dashboard{
					Id:      2,
					Uid:     "uid",
					Title:   "Dash",
					Slug:    "dash",
					Version: 2,
				},
			}

			postDashboardScenario("When calling POST on", "/api/dashboards", "/api/dashboards", mock, cmd, func(sc *scenarioContext) {
				CallPostDashboardShouldReturnSuccess(sc)

				Convey("It should call dashboard service with correct data", func() {
					dto := mock.SavedDashboards[0]
					So(dto.OrgId, ShouldEqual, cmd.OrgId)
					So(dto.User.UserId, ShouldEqual, cmd.UserId)
					So(dto.Dashboard.FolderId, ShouldEqual, 3)
					So(dto.Dashboard.Title, ShouldEqual, "Dash")
					So(dto.Overwrite, ShouldBeTrue)
					So(dto.Message, ShouldEqual, "msg")
				})

				Convey("It should return correct response data", func() {
					result := sc.ToJson()
					So(result.Get("status").MustString(), ShouldEqual, "success")
					So(result.Get("id").MustInt64(), ShouldEqual, 2)
					So(result.Get("uid").MustString(), ShouldEqual, "uid")
					So(result.Get("slug").MustString(), ShouldEqual, "dash")
					So(result.Get("url").MustString(), ShouldEqual, "/d/uid/dash")
				})
			})
		})

		// This tests that invalid requests returns expected error responses

		Convey("Given incorrect requests for creating a dashboard", func() {
			testCases := []struct {
				SaveError          error
				ExpectedStatusCode int
			}{
				{SaveError: m.ErrDashboardNotFound, ExpectedStatusCode: 404},
				{SaveError: m.ErrFolderNotFound, ExpectedStatusCode: 400},
				{SaveError: m.ErrDashboardWithSameUIDExists, ExpectedStatusCode: 400},
				{SaveError: m.ErrDashboardWithSameNameInFolderExists, ExpectedStatusCode: 412},
				{SaveError: m.ErrDashboardVersionMismatch, ExpectedStatusCode: 412},
				{SaveError: m.ErrDashboardTitleEmpty, ExpectedStatusCode: 400},
				{SaveError: m.ErrDashboardFolderCannotHaveParent, ExpectedStatusCode: 400},
				{SaveError: m.ErrDashboardContainsInvalidAlertData, ExpectedStatusCode: 500},
				{SaveError: m.ErrDashboardFailedToUpdateAlertData, ExpectedStatusCode: 500},
				{SaveError: m.ErrDashboardFailedGenerateUniqueUid, ExpectedStatusCode: 500},
				{SaveError: m.ErrDashboardTypeMismatch, ExpectedStatusCode: 400},
				{SaveError: m.ErrDashboardFolderWithSameNameAsDashboard, ExpectedStatusCode: 400},
				{SaveError: m.ErrDashboardWithSameNameAsFolder, ExpectedStatusCode: 400},
				{SaveError: m.ErrDashboardFolderNameExists, ExpectedStatusCode: 400},
				{SaveError: m.ErrDashboardUpdateAccessDenied, ExpectedStatusCode: 403},
				{SaveError: m.ErrDashboardInvalidUid, ExpectedStatusCode: 400},
				{SaveError: m.ErrDashboardUidToLong, ExpectedStatusCode: 400},
				{SaveError: m.UpdatePluginDashboardError{PluginId: "plug"}, ExpectedStatusCode: 412},
			}

			cmd := m.SaveDashboardCommand{
				OrgId: 1,
				Dashboard: simplejson.NewFromAny(map[string]interface{}{
					"title": "",
				}),
			}

			for _, tc := range testCases {
				mock := &dashboards.FakeDashboardService{
					SaveDashboardError: tc.SaveError,
				}

				postDashboardScenario(fmt.Sprintf("Expect '%s' error when calling POST on", tc.SaveError.Error()), "/api/dashboards", "/api/dashboards", mock, cmd, func(sc *scenarioContext) {
					CallPostDashboard(sc)
					So(sc.resp.Code, ShouldEqual, tc.ExpectedStatusCode)
				})
			}
		})
	})

	Convey("Given two dashboards being compared", t, func() {
		mockResult := []*m.DashboardAclInfoDTO{}
		bus.AddHandler("test", func(query *m.GetDashboardAclInfoListQuery) error {
			query.Result = mockResult
			return nil
		})

		bus.AddHandler("test", func(query *m.GetDashboardVersionQuery) error {
			query.Result = &m.DashboardVersion{
				Data: simplejson.NewFromAny(map[string]interface{}{
					"title": "Dash" + string(query.DashboardId),
				}),
			}
			return nil
		})

		cmd := dtos.CalculateDiffOptions{
			Base: dtos.CalculateDiffTarget{
				DashboardId: 1,
				Version:     1,
			},
			New: dtos.CalculateDiffTarget{
				DashboardId: 2,
				Version:     2,
			},
			DiffType: "basic",
		}

		Convey("when user does not have permission", func() {
			role := m.ROLE_VIEWER

			postDiffScenario("When calling POST on", "/api/dashboards/calculate-diff", "/api/dashboards/calculate-diff", cmd, role, func(sc *scenarioContext) {
				CallPostDashboard(sc)
				So(sc.resp.Code, ShouldEqual, 403)
			})
		})

		Convey("when user does have permission", func() {
			role := m.ROLE_ADMIN

			postDiffScenario("When calling POST on", "/api/dashboards/calculate-diff", "/api/dashboards/calculate-diff", cmd, role, func(sc *scenarioContext) {
				CallPostDashboard(sc)
				So(sc.resp.Code, ShouldEqual, 200)
			})
		})
	})
}

func GetDashboardShouldReturn200(sc *scenarioContext) dtos.DashboardFullWithMeta {
	CallGetDashboard(sc)

	So(sc.resp.Code, ShouldEqual, 200)

	dash := dtos.DashboardFullWithMeta{}
	err := json.NewDecoder(sc.resp.Body).Decode(&dash)
	So(err, ShouldBeNil)

	return dash
}

func CallGetDashboard(sc *scenarioContext) {
	sc.handlerFunc = GetDashboard
	sc.fakeReqWithParams("GET", sc.url, map[string]string{}).exec()
}

func CallGetDashboardVersion(sc *scenarioContext) {
	bus.AddHandler("test", func(query *m.GetDashboardVersionQuery) error {
		query.Result = &m.DashboardVersion{}
		return nil
	})

	sc.handlerFunc = GetDashboardVersion
	sc.fakeReqWithParams("GET", sc.url, map[string]string{}).exec()
}

func CallGetDashboardVersions(sc *scenarioContext) {
	bus.AddHandler("test", func(query *m.GetDashboardVersionsQuery) error {
		query.Result = []*m.DashboardVersionDTO{}
		return nil
	})

	sc.handlerFunc = GetDashboardVersions
	sc.fakeReqWithParams("GET", sc.url, map[string]string{}).exec()
}

func CallDeleteDashboard(sc *scenarioContext) {
	bus.AddHandler("test", func(cmd *m.DeleteDashboardCommand) error {
		return nil
	})

	sc.handlerFunc = DeleteDashboard
	sc.fakeReqWithParams("DELETE", sc.url, map[string]string{}).exec()
}

func CallDeleteDashboardByUid(sc *scenarioContext) {
	bus.AddHandler("test", func(cmd *m.DeleteDashboardCommand) error {
		return nil
	})

	sc.handlerFunc = DeleteDashboardByUid
	sc.fakeReqWithParams("DELETE", sc.url, map[string]string{}).exec()
}

func CallPostDashboard(sc *scenarioContext) {
	sc.fakeReqWithParams("POST", sc.url, map[string]string{}).exec()
}

func CallPostDashboardShouldReturnSuccess(sc *scenarioContext) {
	CallPostDashboard(sc)

	So(sc.resp.Code, ShouldEqual, 200)
}

func postDashboardScenario(desc string, url string, routePattern string, mock *dashboards.FakeDashboardService, cmd m.SaveDashboardCommand, fn scenarioFunc) {
	Convey(desc+" "+url, func() {
		defer bus.ClearBusHandlers()

		sc := setupScenarioContext(url)
		sc.defaultHandler = wrap(func(c *m.Context) Response {
			sc.context = c
			sc.context.SignedInUser = &m.SignedInUser{OrgId: cmd.OrgId, UserId: cmd.UserId}

			return PostDashboard(c, cmd)
		})

		origNewDashboardService := dashboards.NewService
		dashboards.MockDashboardService(mock)

		sc.m.Post(routePattern, sc.defaultHandler)

		defer func() {
			dashboards.NewService = origNewDashboardService
		}()

		fn(sc)
	})
}

func postDiffScenario(desc string, url string, routePattern string, cmd dtos.CalculateDiffOptions, role m.RoleType, fn scenarioFunc) {
	Convey(desc+" "+url, func() {
		defer bus.ClearBusHandlers()

		sc := setupScenarioContext(url)
		sc.defaultHandler = wrap(func(c *m.Context) Response {
			sc.context = c
			sc.context.SignedInUser = &m.SignedInUser{
				OrgId:  TestOrgID,
				UserId: TestUserID,
			}
			sc.context.OrgRole = role

			return CalculateDashboardDiff(c, cmd)
		})

		sc.m.Post(routePattern, sc.defaultHandler)

		fn(sc)
	})
}

func (sc *scenarioContext) ToJson() *simplejson.Json {
	var result *simplejson.Json
	err := json.NewDecoder(sc.resp.Body).Decode(&result)
	So(err, ShouldBeNil)
	return result
}
