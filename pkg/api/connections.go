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
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/org"
	"github.com/grafana/grafana/pkg/services/resources"
	"github.com/grafana/grafana/pkg/web"
)

func (hs *HTTPServer) CreateConnection(c *models.ReqContext) response.Response {
	dto := dtos.CreateConnectionMsg{
		OrgId: c.OrgID,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	if !hs.isGroupAccessible(c.Req.Context(), dto.GroupParentId, dtos.User{
		UserId: c.UserID,
		OrgId:  c.OrgID,
		Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
	}) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}

	dto.Login = c.NameOrFallback()
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/connections", hs.ResourceService.GetConfig().BillingUrl)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to create", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (hs *HTTPServer) SearchConnections(c *models.ReqContext) response.Response {
	query := c.Query("query")
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}

	cmd := dtos.SearchConnectionsMsg{
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
		},
		Query:   query,
		Page:    int64(page),
		PerPage: int64(perPage),
	}
	body, err := json.Marshal(cmd)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/connections/search", hs.ResourceService.GetConfig().BillingUrl)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, cmd.Result)
}

func (hs *HTTPServer) UpdateConnection(c *models.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	dto := &dtos.UpdateConnectionMsg{
		Id: id,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/connections/%d", hs.ResourceService.GetConfig().BillingUrl, id)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPut,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to update", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	return response.Success("updated")
}

func (hs *HTTPServer) GetConnectionById(c *models.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	url := fmt.Sprintf("%sapi/connections/%d", hs.ResourceService.GetConfig().BillingUrl, id)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	cmd := dtos.GetConnectionByIdMsg{}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, cmd.Result)
}

func (hs *HTTPServer) DeleteConnection(c *models.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	url := fmt.Sprintf("%sapi/connections/%d", hs.ResourceService.GetConfig().BillingUrl, id)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodDelete,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to delete", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	return response.Success("deleted")
}

func (hs *HTTPServer) GetConnectionLogs(c *models.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}

	url := fmt.Sprintf("%sapi/connections/%d/logs?page=%d&perPage=%d", hs.ResourceService.GetConfig().BillingUrl, id, page, perPage)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	cmd := dtos.GetConnectionLogsMsg{}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, cmd.Result)
}

func (hs *HTTPServer) GetConnectionByExt(c *models.ReqContext) response.Response {
	number, err := strconv.ParseInt(web.Params(c.Req)[":number"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "number is invalid", err)
	}
	url := fmt.Sprintf("%sapi/connections/number/%d", hs.ResourceService.GetConfig().BillingUrl, number)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	cmd := dtos.GetConnectionByExtMsg{}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, cmd.Result)
}

func (hs *HTTPServer) GetConnectionByGroup(c *models.ReqContext) response.Response {
	groupId, err := strconv.ParseInt(web.Params(c.Req)[":groupId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "number is invalid", err)
	}
	url := fmt.Sprintf("%sapi/connections/group/%d", hs.ResourceService.GetConfig().BillingUrl, groupId)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	cmd := dtos.GetConnectionByGroupMsg{}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse

		if req.StatusCode == http.StatusNotFound {
			cmd.Result = dtos.Connection{
				GroupId: groupId,
			}
			return response.JSON(http.StatusOK, cmd.Result)
		}
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, cmd.Result)
}

func (hs *HTTPServer) GetConnectionsByGroupPathId(c *models.ReqContext) response.Response {
	path := web.Params(c.Req)[":grouppath"]
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}
	url := fmt.Sprintf("%sapi/grouppath/grouppath/%s?page=%d&perPage=%d", hs.ResourceService.GetConfig().BillingUrl, path, page, perPage)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	cmd := dtos.GetConnectionsByGroupPathIdMsg{}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, cmd.Result)
}

func (hs *HTTPServer) SendConnectionUserOtp(c *models.ReqContext) response.Response {
	number, err := strconv.ParseInt(web.Params(c.Req)[":number"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "number is invalid", err)
	}
	dto := dtos.SendConnectionUserOtpMsg{
		ConnectionExt: number,
		UserId:        c.UserID,
		Name:          c.NameOrFallback(),
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/connections/number/%d/otp", hs.ResourceService.GetConfig().BillingUrl, number)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to create", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	return response.Success("sent otp to connection holder")
}

func (hs *HTTPServer) AddUserConnection(c *models.ReqContext) response.Response {
	number, err := strconv.ParseInt(web.Params(c.Req)[":number"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "number is invalid", err)
	}

	dto := dtos.AddUserConnectionMsg{
		ConnectionExt: number,
		UserId:        c.UserID,
		Login:         c.Login,
		Email:         c.Email,
		Name:          c.NameOrFallback(),
		Role:          dtos.ConvertRoleToString(org.RoleViewer),
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
		},
		CreatedBy: c.NameOrFallback(),
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/connections/number/%d/users", hs.ResourceService.GetConfig().BillingUrl, number)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to create", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}

	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}

	//Adding user to org
	addUsrCmd := models.AddOrgUserCommand{
		LoginOrEmail: c.Login,
		Role:         org.RoleViewer,
		OrgId:        dto.Result.OrgId,
		UserId:       c.UserID,
	}

	if err := hs.SQLStore.AddOrgUser(c.Req.Context(), &addUsrCmd); err != nil {
		if errors.Is(err, models.ErrOrgUserAlreadyAdded) {
			return response.Success("added user to connection")
		}
		return response.Error(500, "Could not add user to organization", err)
	}

	//Removing user from org 1
	if c.OrgID == 1 {
		removeUsrCmd := &models.RemoveOrgUserCommand{
			UserId: c.UserID,
			OrgId:  1,
		}
		if err := hs.SQLStore.RemoveOrgUser(c.Req.Context(), removeUsrCmd); err != nil {
			if errors.Is(err, models.ErrLastOrgAdmin) {
				return response.Error(400, "Cannot remove last organization admin", nil)
			}
			return response.Error(500, "Failed to remove user from organization", err)
		}

		if removeUsrCmd.UserWasDeleted {
			if err := hs.accesscontrolService.DeleteUserPermissions(c.Req.Context(), accesscontrol.GlobalOrgID, removeUsrCmd.UserId); err != nil {
				hs.log.Warn("failed to delete permissions for user", "userID", removeUsrCmd.UserId, "orgID", accesscontrol.GlobalOrgID, "err", err)
			}
			return response.Success("User deleted")
		}

		if err := hs.accesscontrolService.DeleteUserPermissions(c.Req.Context(), 1, removeUsrCmd.UserId); err != nil {
			hs.log.Warn("failed to delete permissions for user", "userID", removeUsrCmd.UserId, "orgID", 1, "err", err)
		}
		return hs.logoutUserFromAllDevicesInternal(c.Req.Context(), c.UserID)
	}

	if c.OrgID != dto.Result.OrgId {
		hs.changeOrg(c, dto.Result.OrgId)
	}
	return response.Success("added user to connection")
}

func (hs *HTTPServer) GetConnectionUsers(c *models.ReqContext) response.Response {
	access, connection := hs.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}

	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}

	url := fmt.Sprintf("%sapi/groups/%d/users?page=%d&perPage=%d", hs.ResourceService.GetConfig().ResourceUrl, connection.GroupId, page, perPage)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	cmd := dtos.GetConnectionUsersMsg{}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	for i, gu := range cmd.Result.Groupusers {
		cmd.Result.Groupusers[i].Role = string(dtos.ConvertStringToRole(gu.Role))
	}
	return response.JSON(http.StatusOK, cmd.Result)
}

func (hs *HTTPServer) RemoveUserConnection(c *models.ReqContext) response.Response {
	access, connection := hs.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	userId, err := strconv.ParseInt(web.Params(c.Req)[":userId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "userId is invalid", err)
	}
	if c.OrgRole == org.RoleViewer {
		if userId != c.UserID {
			return response.Error(403, "cannot remove others", nil)
		}
	}

	url := fmt.Sprintf("%sapi/connections/%d/users/%d?deleted_by=%s", hs.ResourceService.GetConfig().BillingUrl, connection.Id, userId, c.NameOrFallback())
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodDelete,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to delete", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}

	//connections by user delete from org if no connections
	url = fmt.Sprintf("%sapi/orgs/%d/users/%d/connections", hs.ResourceService.GetConfig().BillingUrl, c.OrgID, c.UserID)
	req = &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	userConnections := dtos.GetConnectionsByUserMsg{}
	if err := json.Unmarshal(req.Response, &userConnections.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	if userConnections.Result.Count == 0 {
		removeUsrCmd := &models.RemoveOrgUserCommand{
			UserId: c.UserID,
			OrgId:  c.OrgID,
		}
		if err := hs.SQLStore.RemoveOrgUser(c.Req.Context(), removeUsrCmd); err != nil {
			if errors.Is(err, models.ErrLastOrgAdmin) {
				return response.Error(400, "Cannot remove last organization admin", nil)
			}
			return response.Error(500, "Failed to remove user from organization", err)
		}

		if removeUsrCmd.UserWasDeleted {
			if err := hs.accesscontrolService.DeleteUserPermissions(c.Req.Context(), accesscontrol.GlobalOrgID, removeUsrCmd.UserId); err != nil {
				hs.log.Warn("failed to delete permissions for user", "userID", removeUsrCmd.UserId, "orgID", accesscontrol.GlobalOrgID, "err", err)
			}
			return response.Success("User deleted")
		}

		if err := hs.accesscontrolService.DeleteUserPermissions(c.Req.Context(), 1, removeUsrCmd.UserId); err != nil {
			hs.log.Warn("failed to delete permissions for user", "userID", removeUsrCmd.UserId, "orgID", 1, "err", err)
		}
		return hs.logoutUserFromAllDevicesInternal(c.Req.Context(), c.UserID)
	}

	//add user to default org 1
	url = fmt.Sprintf("%sapi/users/%d/connections", hs.ResourceService.GetConfig().BillingUrl, c.UserID)
	req = &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	userAllConnections := dtos.GetAllConnectionsByUserMsg{}
	if err := json.Unmarshal(req.Response, &userAllConnections.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}

	if userAllConnections.Result.Count == 0 {
		addUsrCmd := models.AddOrgUserCommand{
			LoginOrEmail: c.Login,
			Role:         org.RoleViewer,
			OrgId:        1,
			UserId:       c.UserID,
		}

		if err := hs.SQLStore.AddOrgUser(c.Req.Context(), &addUsrCmd); err != nil {
			if errors.Is(err, models.ErrOrgUserAlreadyAdded) {
				return response.Success("removed user from connection")
			}
			return response.Error(500, "Could not add user to organization", err)
		}
		return hs.logoutUserFromAllDevicesInternal(c.Req.Context(), c.UserID)
	}
	return response.Success("removed user from connection")
}

func (hs *HTTPServer) changeOrg(c *models.ReqContext, orgId int64) {

	if !hs.validateUsingOrg(c.Req.Context(), c.UserID, orgId) {
		hs.NotFoundHandler(c)
	}

	cmd := models.SetUsingOrgCommand{UserId: c.UserID, OrgId: orgId}

	if err := hs.SQLStore.SetUsingOrg(c.Req.Context(), &cmd); err != nil {
		hs.NotFoundHandler(c)
	}

	c.Redirect(hs.Cfg.AppSubURL + "/")
}

func (hs *HTTPServer) CreateConnectionResource(c *models.ReqContext) response.Response {
	access, connection := hs.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	dto := dtos.CreateGroupResourceMsg{
		OrgId:   c.OrgID,
		GroupId: connection.GroupId,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/connections/%d/resources?created_by=%s", hs.ResourceService.GetConfig().BillingUrl, connection.Id, c.NameOrFallback())
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to create", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (hs *HTTPServer) GetConnectionResources(c *models.ReqContext) response.Response {
	access, connection := hs.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
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
	url := fmt.Sprintf("%sapi/groups/%d/resources?query=%s&page=%d&perPage=%d", hs.ResourceService.GetConfig().ResourceUrl, connection.GroupId, query, page, perPage)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	dto := dtos.GetGroupResourcesMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (hs *HTTPServer) RemoveConnectionResource(c *models.ReqContext) response.Response {
	access, connection := hs.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	resourceId, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "resourceId is invalid", err)
	}
	uuid := c.Query("uuid")

	url := fmt.Sprintf("%sapi/connections/%d/resources/%d?uuid=%s&deleted_by=%s", hs.ResourceService.GetConfig().BillingUrl, connection.Id, resourceId, uuid, c.NameOrFallback())
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodDelete,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to delete", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	return response.Success("removed user from connection")
}

func (hs *HTTPServer) IsConnectionAccessible(c *models.ReqContext) (bool, dtos.Connection) {
	connectionId, ok := web.Params(c.Req)[":connectionId"]
	if !ok {
		connectionId = web.Params(c.Req)[":id"]
	}
	id, err := strconv.ParseInt(connectionId, 10, 64)
	if err != nil {
		return false, dtos.Connection{}
	}
	user := dtos.User{
		UserId: c.UserID,
		OrgId:  c.OrgID,
		Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
	}
	return hs.isConnectionAccessible(c, id, user)
}

func (hs *HTTPServer) isConnectionAccessible(c *models.ReqContext, connectionId int64, user dtos.User) (bool, dtos.Connection) {
	dto := dtos.GetConnectionByIdMsg{
		Id: connectionId,
	}
	url := fmt.Sprintf("%sapi/connections/%d", hs.ResourceService.GetConfig().BillingUrl, connectionId)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return false, dtos.Connection{}
	}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return false, dtos.Connection{}
	}
	if c.IsGrafanaAdmin {
		return true, dto.Result
	}
	return hs.isGroupAccessible(c.Req.Context(), dto.Result.GroupId, user), dto.Result
}
