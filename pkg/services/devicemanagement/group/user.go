package group

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/services/user"
	"github.com/grafana/grafana/pkg/web"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/resource"
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
	orgUser := resource.AddGroupUserMsg{
		OrgId: c.OrgID,
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToString(c),
		},
	}
	if err := web.Bind(c.Req, &orgUser); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}

	query := user.GetUserProfileQuery{UserID: orgUser.UserId}
	u, err := service.userService.GetProfile(c.Req.Context(), &query)
	if err != nil {
		if errors.Is(err, user.ErrUserNotFound) {
			return response.Error(404, user.ErrUserNotFound.Error(), nil)
		}
		return response.Error(500, "Failed to get user", err)
	}

	//TODO Moving user information to dashboard from resources
	// roleMsg := contextmodel.GetOrgUserRoleMsg{UserId: c.UserID, OrgId: c.OrgID}

	// if err := hs.SQLStore.GetOrgUserRole(c.Req.Context(), &roleMsg); err != nil {
	// 	if errors.Is(err, contextmodel.ErrOrgUserNotFound) {
	// 		return response.Error(404, contextmodel.ErrOrgUserNotFound.Error(), nil)
	// 	}
	// 	return response.Error(500, "Failed to get org user", err)
	// }

	orgUser.Email = u.Email
	orgUser.Phone = u.Phone
	orgUser.Login = u.Login
	orgUser.Name = u.Name
	orgUser.Role = "ROLE_VIEWER" //TODO MOVE
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
