package api

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/api/routing"
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/annotations"
	"github.com/grafana/grafana/pkg/services/sqlstore"
	"github.com/grafana/grafana/pkg/services/sqlstore/mockstore"
)

func TestAnnotationsAPIEndpoint(t *testing.T) {
	hs := setupSimpleHTTPServer(nil)
	store := sqlstore.InitTestDB(t)
	store.Cfg = hs.Cfg
	hs.SQLStore = store

	t.Run("Given an annotation without a dashboard ID", func(t *testing.T) {
		cmd := dtos.PostAnnotationsCmd{
			Time: 1000,
			Text: "annotation text",
			Tags: []string{"tag1", "tag2"},
		}

		updateCmd := dtos.UpdateAnnotationsCmd{
			Time: 1000,
			Text: "annotation text",
			Tags: []string{"tag1", "tag2"},
		}

		patchCmd := dtos.PatchAnnotationsCmd{
			Time: 1000,
			Text: "annotation text",
			Tags: []string{"tag1", "tag2"},
		}

		t.Run("When user is an Org Viewer", func(t *testing.T) {
			role := models.ROLE_VIEWER
			t.Run("Should not be allowed to save an annotation", func(t *testing.T) {
				postAnnotationScenario(t, "When calling POST on", "/api/annotations", "/api/annotations", role,
					cmd, func(sc *scenarioContext) {
						sc.fakeReqWithParams("POST", sc.url, map[string]string{}).exec()
						assert.Equal(t, 403, sc.resp.Code)
					})

				putAnnotationScenario(t, "When calling PUT on", "/api/annotations/1", "/api/annotations/:annotationId",
					role, updateCmd, func(sc *scenarioContext) {
						sc.fakeReqWithParams("PUT", sc.url, map[string]string{}).exec()
						assert.Equal(t, 403, sc.resp.Code)
					})

				patchAnnotationScenario(t, "When calling PATCH on", "/api/annotations/1",
					"/api/annotations/:annotationId", role, patchCmd, func(sc *scenarioContext) {
						sc.fakeReqWithParams("PATCH", sc.url, map[string]string{}).exec()
						assert.Equal(t, 403, sc.resp.Code)
					})

				mock := mockstore.NewSQLStoreMock()
				loggedInUserScenarioWithRole(t, "When calling DELETE on", "DELETE", "/api/annotations/1",
					"/api/annotations/:annotationId", role, func(sc *scenarioContext) {
						fakeAnnoRepo = &fakeAnnotationsRepo{}
						annotations.SetRepository(fakeAnnoRepo)
						sc.handlerFunc = hs.DeleteAnnotationByID
						sc.fakeReqWithParams("DELETE", sc.url, map[string]string{}).exec()
						assert.Equal(t, 403, sc.resp.Code)
					}, mock)
			})
		})

		t.Run("When user is an Org Editor", func(t *testing.T) {
			role := models.ROLE_EDITOR
			t.Run("Should be able to save an annotation", func(t *testing.T) {
				postAnnotationScenario(t, "When calling POST on", "/api/annotations", "/api/annotations", role,
					cmd, func(sc *scenarioContext) {
						sc.fakeReqWithParams("POST", sc.url, map[string]string{}).exec()
						assert.Equal(t, 200, sc.resp.Code)
					})

				putAnnotationScenario(t, "When calling PUT on", "/api/annotations/1", "/api/annotations/:annotationId", role, updateCmd, func(sc *scenarioContext) {
					sc.fakeReqWithParams("PUT", sc.url, map[string]string{}).exec()
					assert.Equal(t, 200, sc.resp.Code)
				})

				patchAnnotationScenario(t, "When calling PATCH on", "/api/annotations/1", "/api/annotations/:annotationId", role, patchCmd, func(sc *scenarioContext) {
					sc.fakeReqWithParams("PATCH", sc.url, map[string]string{}).exec()
					assert.Equal(t, 200, sc.resp.Code)
				})
				mock := mockstore.NewSQLStoreMock()
				loggedInUserScenarioWithRole(t, "When calling DELETE on", "DELETE", "/api/annotations/1",
					"/api/annotations/:annotationId", role, func(sc *scenarioContext) {
						fakeAnnoRepo = &fakeAnnotationsRepo{}
						annotations.SetRepository(fakeAnnoRepo)
						sc.handlerFunc = hs.DeleteAnnotationByID
						sc.fakeReqWithParams("DELETE", sc.url, map[string]string{}).exec()
						assert.Equal(t, 200, sc.resp.Code)
					}, mock)
			})
		})
	})

	t.Run("Given an annotation with a dashboard ID and the dashboard does not have an ACL", func(t *testing.T) {
		cmd := dtos.PostAnnotationsCmd{
			Time:        1000,
			Text:        "annotation text",
			Tags:        []string{"tag1", "tag2"},
			DashboardId: 1,
			PanelId:     1,
		}

		updateCmd := dtos.UpdateAnnotationsCmd{
			Time: 1000,
			Text: "annotation text",
			Tags: []string{"tag1", "tag2"},
			Id:   1,
		}

		patchCmd := dtos.PatchAnnotationsCmd{
			Time: 8000,
			Text: "annotation text 50",
			Tags: []string{"foo", "bar"},
			Id:   1,
		}

		deleteCmd := dtos.DeleteAnnotationsCmd{
			DashboardId: 1,
			PanelId:     1,
		}

		t.Run("When user is an Org Viewer", func(t *testing.T) {
			role := models.ROLE_VIEWER
			t.Run("Should not be allowed to save an annotation", func(t *testing.T) {
				postAnnotationScenario(t, "When calling POST on", "/api/annotations", "/api/annotations", role, cmd, func(sc *scenarioContext) {
					setUpACL()
					sc.fakeReqWithParams("POST", sc.url, map[string]string{}).exec()
					assert.Equal(t, 403, sc.resp.Code)
				})

				putAnnotationScenario(t, "When calling PUT on", "/api/annotations/1", "/api/annotations/:annotationId", role, updateCmd, func(sc *scenarioContext) {
					setUpACL()
					sc.fakeReqWithParams("PUT", sc.url, map[string]string{}).exec()
					assert.Equal(t, 403, sc.resp.Code)
				})

				patchAnnotationScenario(t, "When calling PATCH on", "/api/annotations/1", "/api/annotations/:annotationId", role, patchCmd, func(sc *scenarioContext) {
					setUpACL()
					sc.fakeReqWithParams("PATCH", sc.url, map[string]string{}).exec()
					assert.Equal(t, 403, sc.resp.Code)
				})
				mock := mockstore.NewSQLStoreMock()
				loggedInUserScenarioWithRole(t, "When calling DELETE on", "DELETE", "/api/annotations/1",
					"/api/annotations/:annotationId", role, func(sc *scenarioContext) {
						setUpACL()
						fakeAnnoRepo = &fakeAnnotationsRepo{}
						annotations.SetRepository(fakeAnnoRepo)
						sc.handlerFunc = hs.DeleteAnnotationByID
						sc.fakeReqWithParams("DELETE", sc.url, map[string]string{}).exec()
						assert.Equal(t, 403, sc.resp.Code)
					}, mock)
			})
		})

		t.Run("When user is an Org Editor", func(t *testing.T) {
			role := models.ROLE_EDITOR
			t.Run("Should be able to save an annotation", func(t *testing.T) {
				postAnnotationScenario(t, "When calling POST on", "/api/annotations", "/api/annotations", role, cmd, func(sc *scenarioContext) {
					setUpACL()
					sc.fakeReqWithParams("POST", sc.url, map[string]string{}).exec()
					assert.Equal(t, 200, sc.resp.Code)
				})

				putAnnotationScenario(t, "When calling PUT on", "/api/annotations/1", "/api/annotations/:annotationId", role, updateCmd, func(sc *scenarioContext) {
					setUpACL()
					sc.fakeReqWithParams("PUT", sc.url, map[string]string{}).exec()
					assert.Equal(t, 200, sc.resp.Code)
				})

				patchAnnotationScenario(t, "When calling PATCH on", "/api/annotations/1", "/api/annotations/:annotationId", role, patchCmd, func(sc *scenarioContext) {
					setUpACL()
					sc.fakeReqWithParams("PATCH", sc.url, map[string]string{}).exec()
					assert.Equal(t, 200, sc.resp.Code)
				})
				mock := mockstore.NewSQLStoreMock()
				loggedInUserScenarioWithRole(t, "When calling DELETE on", "DELETE", "/api/annotations/1",
					"/api/annotations/:annotationId", role, func(sc *scenarioContext) {
						setUpACL()
						fakeAnnoRepo = &fakeAnnotationsRepo{}
						annotations.SetRepository(fakeAnnoRepo)
						sc.handlerFunc = hs.DeleteAnnotationByID
						sc.fakeReqWithParams("DELETE", sc.url, map[string]string{}).exec()
						assert.Equal(t, 200, sc.resp.Code)
					}, mock)
			})
		})

		t.Run("When user is an Admin", func(t *testing.T) {
			role := models.ROLE_ADMIN
			t.Run("Should be able to do anything", func(t *testing.T) {
				postAnnotationScenario(t, "When calling POST on", "/api/annotations", "/api/annotations", role, cmd, func(sc *scenarioContext) {
					setUpACL()
					sc.fakeReqWithParams("POST", sc.url, map[string]string{}).exec()
					assert.Equal(t, 200, sc.resp.Code)
				})

				putAnnotationScenario(t, "When calling PUT on", "/api/annotations/1", "/api/annotations/:annotationId", role, updateCmd, func(sc *scenarioContext) {
					setUpACL()
					sc.fakeReqWithParams("PUT", sc.url, map[string]string{}).exec()
					assert.Equal(t, 200, sc.resp.Code)
				})

				patchAnnotationScenario(t, "When calling PATCH on", "/api/annotations/1", "/api/annotations/:annotationId", role, patchCmd, func(sc *scenarioContext) {
					setUpACL()
					sc.fakeReqWithParams("PATCH", sc.url, map[string]string{}).exec()
					assert.Equal(t, 200, sc.resp.Code)
				})

				deleteAnnotationsScenario(t, "When calling POST on", "/api/annotations/mass-delete",
					"/api/annotations/mass-delete", role, deleteCmd, func(sc *scenarioContext) {
						setUpACL()
						sc.fakeReqWithParams("POST", sc.url, map[string]string{}).exec()
						assert.Equal(t, 200, sc.resp.Code)
					})
			})
		})
	})
}

type fakeAnnotationsRepo struct {
	annotations map[int64]annotations.ItemDTO
}

func (repo *fakeAnnotationsRepo) Delete(params *annotations.DeleteParams) error {
	return nil
}
func (repo *fakeAnnotationsRepo) Save(item *annotations.Item) error {
	item.Id = 1
	return nil
}
func (repo *fakeAnnotationsRepo) Update(item *annotations.Item) error {
	return nil
}
func (repo *fakeAnnotationsRepo) Find(query *annotations.ItemQuery) ([]*annotations.ItemDTO, error) {
	if annotation, has := repo.annotations[query.AnnotationId]; has {
		return []*annotations.ItemDTO{&annotation}, nil
	}
	annotations := []*annotations.ItemDTO{{Id: 1}}
	return annotations, nil
}
func (repo *fakeAnnotationsRepo) FindTags(query *annotations.TagsQuery) (annotations.FindTagsResult, error) {
	result := annotations.FindTagsResult{
		Tags: []*annotations.TagsDTO{},
	}
	return result, nil
}

var fakeAnnoRepo *fakeAnnotationsRepo

func postAnnotationScenario(t *testing.T, desc string, url string, routePattern string, role models.RoleType,
	cmd dtos.PostAnnotationsCmd, fn scenarioFunc) {
	t.Run(fmt.Sprintf("%s %s", desc, url), func(t *testing.T) {
		t.Cleanup(bus.ClearBusHandlers)

		hs := setupSimpleHTTPServer(nil)
		store := sqlstore.InitTestDB(t)
		store.Cfg = hs.Cfg
		hs.SQLStore = store

		sc := setupScenarioContext(t, url)
		sc.defaultHandler = routing.Wrap(func(c *models.ReqContext) response.Response {
			c.Req.Body = mockRequestBody(cmd)
			c.Req.Header.Add("Content-Type", "application/json")
			sc.context = c
			sc.context.UserId = testUserID
			sc.context.OrgId = testOrgID
			sc.context.OrgRole = role

			return hs.PostAnnotation(c)
		})

		fakeAnnoRepo = &fakeAnnotationsRepo{}
		annotations.SetRepository(fakeAnnoRepo)

		sc.m.Post(routePattern, sc.defaultHandler)

		fn(sc)
	})
}

func putAnnotationScenario(t *testing.T, desc string, url string, routePattern string, role models.RoleType,
	cmd dtos.UpdateAnnotationsCmd, fn scenarioFunc) {
	t.Run(fmt.Sprintf("%s %s", desc, url), func(t *testing.T) {
		t.Cleanup(bus.ClearBusHandlers)

		hs := setupSimpleHTTPServer(nil)
		store := sqlstore.InitTestDB(t)
		store.Cfg = hs.Cfg
		hs.SQLStore = store

		sc := setupScenarioContext(t, url)
		sc.defaultHandler = routing.Wrap(func(c *models.ReqContext) response.Response {
			c.Req.Body = mockRequestBody(cmd)
			c.Req.Header.Add("Content-Type", "application/json")
			sc.context = c
			sc.context.UserId = testUserID
			sc.context.OrgId = testOrgID
			sc.context.OrgRole = role

			return hs.UpdateAnnotation(c)
		})

		fakeAnnoRepo = &fakeAnnotationsRepo{}
		annotations.SetRepository(fakeAnnoRepo)

		sc.m.Put(routePattern, sc.defaultHandler)

		fn(sc)
	})
}

func patchAnnotationScenario(t *testing.T, desc string, url string, routePattern string, role models.RoleType, cmd dtos.PatchAnnotationsCmd, fn scenarioFunc) {
	t.Run(fmt.Sprintf("%s %s", desc, url), func(t *testing.T) {
		defer bus.ClearBusHandlers()

		hs := setupSimpleHTTPServer(nil)
		store := sqlstore.InitTestDB(t)
		store.Cfg = hs.Cfg
		hs.SQLStore = store

		sc := setupScenarioContext(t, url)
		sc.defaultHandler = routing.Wrap(func(c *models.ReqContext) response.Response {
			c.Req.Body = mockRequestBody(cmd)
			c.Req.Header.Add("Content-Type", "application/json")
			sc.context = c
			sc.context.UserId = testUserID
			sc.context.OrgId = testOrgID
			sc.context.OrgRole = role

			return hs.PatchAnnotation(c)
		})

		fakeAnnoRepo = &fakeAnnotationsRepo{}
		annotations.SetRepository(fakeAnnoRepo)

		sc.m.Patch(routePattern, sc.defaultHandler)

		fn(sc)
	})
}

func deleteAnnotationsScenario(t *testing.T, desc string, url string, routePattern string, role models.RoleType,
	cmd dtos.DeleteAnnotationsCmd, fn scenarioFunc) {
	t.Run(fmt.Sprintf("%s %s", desc, url), func(t *testing.T) {
		defer bus.ClearBusHandlers()

		hs := setupSimpleHTTPServer(nil)
		store := sqlstore.InitTestDB(t)
		store.Cfg = hs.Cfg
		hs.SQLStore = store

		sc := setupScenarioContext(t, url)
		sc.defaultHandler = routing.Wrap(func(c *models.ReqContext) response.Response {
			c.Req.Body = mockRequestBody(cmd)
			c.Req.Header.Add("Content-Type", "application/json")
			sc.context = c
			sc.context.UserId = testUserID
			sc.context.OrgId = testOrgID
			sc.context.OrgRole = role

			return hs.DeleteAnnotations(c)
		})

		fakeAnnoRepo = &fakeAnnotationsRepo{}
		annotations.SetRepository(fakeAnnoRepo)

		sc.m.Post(routePattern, sc.defaultHandler)

		fn(sc)
	})
}

func TestAPI_Annotations_AccessControl(t *testing.T) {
	sc := setupHTTPServer(t, true, true)
	setInitCtxSignedInEditor(sc.initCtx)
	_, err := sc.db.CreateOrgWithMember("TestOrg", testUserID)
	require.NoError(t, err)

	repo := annotations.GetRepository()

	localAnnotation := annotations.Item{
		OrgId:       sc.initCtx.OrgId,
		DashboardId: 1,
	}
	globalAnnotation := annotations.Item{
		OrgId: sc.initCtx.OrgId,
	}

	err = repo.Save(&localAnnotation)
	require.NoError(t, err)
	err = repo.Save(&globalAnnotation)
	require.NoError(t, err)

	type args struct {
		permissions []*accesscontrol.Permission
		url         string
		body        io.Reader
		method      string
	}

	tests := []struct {
		name string
		args args
		want int
	}{
		{
			name: "AccessControl getting annotations with correct permissions is allowed",
			args: args{
				permissions: []*accesscontrol.Permission{{Action: accesscontrol.ActionAnnotationsRead, Scope: accesscontrol.ScopeAnnotationsAll}},
				url:         "/api/annotations",
				method:      http.MethodGet,
			},
			want: http.StatusOK,
		},
		{
			name: "AccessControl getting annotations without permissions is forbidden",
			args: args{
				permissions: []*accesscontrol.Permission{},
				url:         "/api/annotations",
				method:      http.MethodGet,
			},
			want: http.StatusForbidden,
		},
		{
			name: "AccessControl getting tags for annotations with correct permissions is allowed",
			args: args{
				permissions: []*accesscontrol.Permission{{Action: accesscontrol.ActionAnnotationsTagsRead, Scope: accesscontrol.ScopeAnnotationsTagsAll}},
				url:         "/api/annotations/tags",
				method:      http.MethodGet,
			},
			want: http.StatusOK,
		},
		{
			name: "AccessControl getting tags for annotations without correct permissions is forbidden",
			args: args{
				permissions: []*accesscontrol.Permission{{Action: accesscontrol.ActionAnnotationsTagsRead}},
				url:         "/api/annotations/tags",
				method:      http.MethodGet,
			},
			want: http.StatusForbidden,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setAccessControlPermissions(sc.acmock, tt.args.permissions, sc.initCtx.OrgId)
			r := callAPI(sc.server, tt.args.method, tt.args.url, tt.args.body, t)
			assert.Equalf(t, tt.want, r.Code, "Annotations API(%v)", tt.args.url)
		})
	}
}

func TestService_AnnotationTypeScopeResolver(t *testing.T) {
	type testCaseResolver struct {
		desc    string
		given   string
		want    string
		wantErr error
	}

	testCases := []testCaseResolver{
		{
			desc:    "correctly resolves local annotations",
			given:   "annotations:id:1",
			want:    accesscontrol.ScopeAnnotationsTypeLocal,
			wantErr: nil,
		},
		{
			desc:    "correctly resolves global annotations",
			given:   "annotations:id:2",
			want:    accesscontrol.ScopeAnnotationsTypeGlobal,
			wantErr: nil,
		},
		{
			desc:    "invalid annotation ID",
			given:   "annotations:id:123abc",
			want:    "",
			wantErr: accesscontrol.ErrInvalidScope,
		},
		{
			desc:    "malformed scope",
			given:   "annotations:1",
			want:    "",
			wantErr: accesscontrol.ErrInvalidScope,
		},
	}

	localAnnotation := annotations.ItemDTO{Id: 1, DashboardId: 1}
	globalAnnotation := annotations.ItemDTO{Id: 2}

	fakeAnnoRepo = &fakeAnnotationsRepo{
		annotations: map[int64]annotations.ItemDTO{1: localAnnotation, 2: globalAnnotation},
	}
	annotations.SetRepository(fakeAnnoRepo)

	prefix, resolver := AnnotationTypeScopeResolver()
	require.Equal(t, "annotations:id:", prefix)

	for _, tc := range testCases {
		t.Run(tc.desc, func(t *testing.T) {
			resolved, err := resolver(context.Background(), 1, tc.given)
			if tc.wantErr != nil {
				require.Error(t, err)
				require.Equal(t, tc.wantErr, err)
			} else {
				require.NoError(t, err)
				require.Equal(t, tc.want, resolved)
			}
		})
	}
}

func setUpACL() {
	viewerRole := models.ROLE_VIEWER
	editorRole := models.ROLE_EDITOR

	aclMockResp := []*models.DashboardAclInfoDTO{
		{Role: &viewerRole, Permission: models.PERMISSION_VIEW},
		{Role: &editorRole, Permission: models.PERMISSION_EDIT},
	}

	bus.AddHandler("test", func(ctx context.Context, query *models.GetDashboardAclInfoListQuery) error {
		query.Result = aclMockResp
		return nil
	})

	bus.AddHandler("test", func(ctx context.Context, query *models.GetTeamsByUserQuery) error {
		query.Result = []*models.TeamDTO{}
		return nil
	})
}
