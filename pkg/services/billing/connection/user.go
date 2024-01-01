package connection

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/models/roletype"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/services/org"
	"github.com/grafana/grafana/pkg/web"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/billing"
	"github.com/jayaraj/messages/client/resource"
	"github.com/jayaraj/messages/client/user"
	"github.com/pkg/errors"
)

func (service *Service) GetConnectionUsers(c *contextmodel.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	connection, access := service.IsConnectionAccessibleById(c, id)
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

	url := fmt.Sprintf("%sapi/groups/%d/users?query=%s&page=%d&perPage=%d", service.cfg.ResourceHost, connection.GroupId, query, page, perPage)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}

	dto := resource.GetGroupUsersMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	for i, gu := range dto.Result.GroupUsers {
		dto.Result.GroupUsers[i].Role = string(devicemanagement.ConvertStringToRole(gu.Role))
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (service *Service) addUserToOrg(ctx context.Context, orgId int64, userId int64) error {
	createOrgUserCmd := org.AddOrgUserCommand{OrgID: orgId, UserID: userId, Role: org.RoleViewer}
	if err := service.orgService.AddOrgUser(ctx, &createOrgUserCmd); err != nil {
		if errors.Is(err, org.ErrOrgUserAlreadyAdded) {
			return nil
		}
		return errors.Wrap(err, "failed while trying to create org user")
	}
	if err := service.bus.Publish(ctx, &devicemanagement.UpdateOrgUserEvent{
		UserId: userId,
		OrgId:  orgId,
	}); err != nil {
		return errors.Wrap(err, "failed to publish update org_user event")
	}
	return nil
}

func (service *Service) removeUserFromOrg(ctx context.Context, orgId int64, userId int64) error {
	removeOrgUserCmd := org.RemoveOrgUserCommand{OrgID: orgId, UserID: userId}
	if err := service.orgService.RemoveOrgUser(ctx, &removeOrgUserCmd); err != nil {
		return errors.Wrap(err, "failed to remove user from org")
	}
	if err := service.bus.Publish(ctx, &devicemanagement.DeleteOrgUserEvent{
		UserId: userId,
		OrgId:  orgId,
	}); err != nil {
		return errors.Wrap(err, "failed to publish delete org_user event")
	}
	if err := service.acService.DeleteUserPermissions(ctx, orgId, userId); err != nil {
		service.log.Error("failed to delete permissions for user", "id", userId, "orgId", orgId, "error", err)
	}
	return nil
}

func (service *Service) AddUserConnection(c *contextmodel.ReqContext) response.Response {
	number, err := strconv.ParseInt(web.Params(c.Req)[":number"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "number is invalid", err)
	}

	dto := billing.AddConnectionUserByNumberMsg{
		ConnectionExt: number,
		UserId:        c.UserID,
		Login:         c.Login,
		Email:         c.Email,
		Phone:         c.Phone,
		Name:          c.NameOrFallback(),
		Role:          devicemanagement.ConvertRoleToString(org.RoleViewer),
		CreatedBy:     c.Login,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/connections/number/%d/users", service.cfg.BillingHost, number)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to create", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}

	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(500, "failed unmarshal error ", err)
	}

	//Adding user to org
	if err := service.addUserToOrg(c.Req.Context(), dto.Result.OrgId, c.UserID); err != nil {
		return response.Error(req.StatusCode, "failed to add user to org ", err)
	}

	//Removing user from org 1
	if c.OrgID == 1 {
		if err := service.removeUserFromOrg(c.Req.Context(), dto.Result.OrgId, c.UserID); err != nil {
			return response.Error(req.StatusCode, "failed to add user to org ", err)
		}
	}

	var redirectOrg struct {
		OrgId int64 `json:"org_id"`
	}
	redirectOrg.OrgId = 0
	if c.OrgID != dto.Result.OrgId {
		redirectOrg.OrgId = dto.Result.OrgId
	}
	return response.JSON(http.StatusOK, redirectOrg)
}

func (service *Service) RemoveUserConnection(c *contextmodel.ReqContext) response.Response {
	if !service.IsConnectionAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	userId, err := strconv.ParseInt(web.Params(c.Req)[":userId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "userId is invalid", err)
	}

	userService := service.devMgmt.GetUser()
	orgUserCmd := &user.GetOrgUserMsg{
		UserId: userId,
		OrgId:  c.OrgID,
	}
	if err := userService.GetOrgUser(c.Req.Context(), orgUserCmd); err != nil {
		return response.Error(500, "get org_user profile failed", nil)
	}

	if c.OrgRole <= roletype.RoleType(orgUserCmd.Result.Role) {
		if userId != c.UserID {
			return response.Error(403, "cannot remove others", nil)
		}
	}

	url := fmt.Sprintf("%sapi/connections/%d/users/%d?deleted_by=%s", service.cfg.BillingHost, id, userId, c.Login)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodDelete,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to delete", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}

	//Get any connection available
	url = fmt.Sprintf("%sapi/orgs/%d/users/%d/connection", service.cfg.BillingHost, c.OrgID, userId)
	req = &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	userConnections := billing.GetAvailableConnectionMsg{}
	if err := json.Unmarshal(req.Response, &userConnections.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}

	var redirectOrg struct {
		OrgId int64 `json:"org_id"`
	}
	redirectOrg.OrgId = 0

	//exit if user has another connection in same org
	if c.OrgID == userConnections.Result.OrgId {
		return response.JSON(http.StatusOK, redirectOrg)
	}
	//remove user from current org
	service.removeUserFromOrg(c.Req.Context(), c.OrgID, userId)

	//add user to org 1 when connections found in any org
	if userConnections.Result.OrgId == 0 {
		service.addUserToOrg(c.Req.Context(), 1, userId)
		redirectOrg.OrgId = 1
	} else {
		redirectOrg.OrgId = userConnections.Result.OrgId
	}

	if c.UserID != userId {
		redirectOrg.OrgId = 0
	}

	return response.JSON(http.StatusOK, redirectOrg)
}

func (service *Service) SendConnectionUserOtp(c *contextmodel.ReqContext) response.Response {
	number, err := strconv.ParseInt(web.Params(c.Req)[":number"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "number is invalid", err)
	}
	dto := billing.SendConnectionOtpMsg{
		ConnectionExt: number,
		UserId:        c.UserID,
		Name:          c.NameOrFallback(),
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/connections/number/%d/otp", service.cfg.BillingHost, number)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to create", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	return response.Success("sent otp to connection holder")
}
