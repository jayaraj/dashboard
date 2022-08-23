package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/resources"
	"github.com/grafana/grafana/pkg/services/user"
	"github.com/grafana/grafana/pkg/web"
	"golang.org/x/net/context"
)

func (hs *HTTPServer) CreateGroup(c *models.ReqContext) response.Response {
	dto := dtos.CreateGroupMsg{
		OrgId: c.OrgID,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create group", err)
	}
	req := &resources.RestRequest{
		Url:        "api/groups",
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to create group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (hs *HTTPServer) UpdateGroup(c *models.ReqContext) response.Response {
	if !hs.IsGroupAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":groupId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	dto := dtos.UpdateGroupMsg{
		Id: id,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update group", err)
	}
	req := &resources.RestRequest{
		Url:        fmt.Sprintf("api/groups/%d", id),
		Request:    body,
		HttpMethod: http.MethodPut,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to update group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}
	return response.Success("updated")
}

func (hs *HTTPServer) DeleteGroup(c *models.ReqContext) response.Response {
	if !hs.IsGroupAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":groupId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	req := &resources.RestRequest{
		Url:        fmt.Sprintf("api/groups/%d", id),
		Request:    nil,
		HttpMethod: http.MethodDelete,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to delete group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}
	return response.Success("deleted")
}

func (hs *HTTPServer) GetGroupById(c *models.ReqContext) response.Response {
	if !hs.IsGroupAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":groupId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	req := &resources.RestRequest{
		Url:        fmt.Sprintf("api/groups/%d", id),
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}
	dto := dtos.GetGroupByIdMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (hs *HTTPServer) GetGroups(c *models.ReqContext) response.Response {
	dto := dtos.GetGroupsMsg{
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(c.OrgRole),
		},
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal get group", err)
	}
	req := &resources.RestRequest{
		Url:        "api/groups/search",
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (hs *HTTPServer) GetGroupParent(c *models.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":groupId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	dto := dtos.GetParentGroupsMsg{
		GroupId: id,
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(c.OrgRole),
		},
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal get group", err)
	}
	req := &resources.RestRequest{
		Url:        fmt.Sprintf("api/groups/%d/parent", id),
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (hs *HTTPServer) isGroupAccessible(ctx context.Context, groupId int64, user dtos.User) bool {
	dto := dtos.IsGroupAccessibleMsg{
		GroupId: groupId,
		User:    user,
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return false
	}
	req := &resources.RestRequest{
		Url:        fmt.Sprintf("api/groups/%d/access", groupId),
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(ctx, req); err != nil {
		return false
	}
	if req.StatusCode != http.StatusOK {
		return false
	}
	return true
}

func (hs *HTTPServer) IsGroupAccessible(c *models.ReqContext) bool {
	groupId, ok := web.Params(c.Req)[":groupId"]
	if !ok {
		groupId = web.Params(c.Req)[":id"]
	}
	id, err := strconv.ParseInt(groupId, 10, 64)
	if err != nil {
		return false
	}
	if c.IsGrafanaAdmin {
		return true
	}
	user := dtos.User{
		UserId: c.UserID,
		OrgId:  c.OrgID,
		Role:   dtos.ConvertRoleToString(c.OrgRole),
	}
	return hs.isGroupAccessible(c.Req.Context(), id, user)
}

func (hs *HTTPServer) DeleteGroupResource(c *models.ReqContext) response.Response {
	if !hs.IsGroupAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	req := &resources.RestRequest{
		Url:        fmt.Sprintf("api/resources/groups/%d", id),
		Request:    nil,
		HttpMethod: http.MethodDelete,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}
	return response.Success("deleted")
}

func (hs *HTTPServer) GetGroupResources(c *models.ReqContext) response.Response {
	if !hs.IsGroupAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":groupId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	query := c.Query("query")
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}
	req := &resources.RestRequest{
		Url:        fmt.Sprintf("api/groups/%d/resources?query=%s&page=%d&perPage=%d", id, query, page, perPage),
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}
	dto := dtos.GetGroupResourcesMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (hs *HTTPServer) GetGroupUsers(c *models.ReqContext) response.Response {
	if !hs.IsGroupAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":groupId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	query := c.Query("query")
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}
	req := &resources.RestRequest{
		Url:        fmt.Sprintf("api/groups/%d/users?query=%s&page=%d&perPage=%d", id, query, page, perPage),
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}
	dto := dtos.GetGroupUsersMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (hs *HTTPServer) AddGroupUsers(c *models.ReqContext) response.Response {
	if !hs.IsGroupAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":id"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	orgUser := dtos.AddGroupUserMsg{
		GroupId: id,
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(c.OrgRole),
		},
	}
	if err := web.Bind(c.Req, &orgUser); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}

	query := models.GetUserProfileQuery{UserId: orgUser.UserId}

	if err := hs.SQLStore.GetUserProfile(c.Req.Context(), &query); err != nil {
		if errors.Is(err, user.ErrUserNotFound) {
			return response.Error(404, user.ErrUserNotFound.Error(), nil)
		}
		return response.Error(500, "Failed to get user", err)
	}

	roleMsg := models.GetOrgUserRoleMsg{UserId: orgUser.UserId, OrgId: query.Result.OrgId}

	if err := hs.SQLStore.GetOrgUserRole(c.Req.Context(), &roleMsg); err != nil {
		if errors.Is(err, models.ErrOrgUserNotFound) {
			return response.Error(404, models.ErrOrgUserNotFound.Error(), nil)
		}
		return response.Error(500, "Failed to get org user", err)
	}
	orgUser.Email = query.Result.Email
	orgUser.Login = query.Result.Login
	orgUser.Name = query.Result.Name
	orgUser.Role = dtos.ConvertRoleToString(roleMsg.Result)
	body, err := json.Marshal(&orgUser)
	if err != nil {
		return response.Error(500, "failed marshal create group", err)
	}
	req := &resources.RestRequest{
		Url:        fmt.Sprintf("api/groups/%d/users", id),
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}

	return response.Success("added")
}

func (hs *HTTPServer) DeleteGroupUsers(c *models.ReqContext) response.Response {
	if !hs.IsGroupAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":id"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	userId, err := strconv.ParseInt(web.Params(c.Req)[":userId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "userId is invalid", err)
	}

	req := &resources.RestRequest{
		Url:        fmt.Sprintf("api/groups/%d/users/%d", id, userId),
		Request:    nil,
		HttpMethod: http.MethodDelete,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}

	return response.Success("deleted")
}
