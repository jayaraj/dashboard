package group

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/models/roletype"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/web"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/resource"
	"github.com/jayaraj/messages/client/user"
)

func (service *Service) GetGroupUsers(c *contextmodel.ReqContext) response.Response {
	access, id := service.IsGroupAccessible(c)
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
	url := fmt.Sprintf("%sapi/groups/%d/users?query=%s&page=%d&perPage=%d", service.cfg.ResourceHost, id, query, page, perPage)
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

func (service *Service) AddGroupUser(c *contextmodel.ReqContext) response.Response {
	access, _ := service.IsGroupAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	orgUser := resource.AddGroupUserMsg{
		OrgId: c.OrgID,
	}
	if err := web.Bind(c.Req, &orgUser); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}

	userService := service.devMgmt.GetUser()
	usrCmd := &user.GetOrgUserMsg{
		UserId: c.UserID,
		OrgId:  c.OrgID,
	}
	if err := userService.GetOrgUser(c.Req.Context(), usrCmd); err != nil {
		return response.Error(500, "get user failed", err)
	}

	orgUser.Email = usrCmd.Result.Email
	orgUser.Phone = usrCmd.Result.Phone
	orgUser.Login = usrCmd.Result.Login
	orgUser.Name = usrCmd.Result.Name
	orgUser.Role = devicemanagement.ConvertRoleToString(roletype.RoleType(usrCmd.Result.Role))
	body, err := json.Marshal(&orgUser)
	if err != nil {
		return response.Error(500, "failed marshal create group", err)
	}
	url := fmt.Sprintf("%sapi/groupusers", service.cfg.ResourceHost)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
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

	return response.Success("added")
}

func (service *Service) DeleteGroupUser(c *contextmodel.ReqContext) response.Response {
	//TODO Change the inter face to validate group access
	id, err := strconv.ParseInt(web.Params(c.Req)[":id"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	url := fmt.Sprintf("%sapi/groupusers/%d", service.cfg.ResourceHost, id)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodDelete,
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

	return response.Success("deleted")
}
