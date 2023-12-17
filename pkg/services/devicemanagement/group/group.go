package group

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/response"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/resource"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/web"
)

func (service *Service) IsGroupAccessible(c *contextmodel.ReqContext) (bool, int64) {
	id, err := strconv.ParseInt(web.Params(c.Req)[":groupId"], 10, 64)
	if err != nil {
		return false, 0
	}
	return service.IsGroupAccessibleById(c, id), id
}

func (service *Service) IsGroupAccessibleById(c *contextmodel.ReqContext, id int64) bool {
	if c.IsGrafanaAdmin {
		return true
	}
	dto := resource.IsGroupAccessibleMsg{
		GroupId: id,
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
	}
	//GetCache
	cacheKey := fmt.Sprintf("isgroupaccessible-%d-%d", id, c.UserID)
	if err := service.devMgmt.GetCache(c.Req.Context(), cacheKey, &dto.Result); err == nil {
		return dto.Result
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return false
	}
	url := fmt.Sprintf("%sapi/groups/%d/access", service.cfg.ResourceHost, id)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		service.log.Error(err.Error())
		return false
	}
	if req.StatusCode == http.StatusOK {
		dto.Result = true
	}

	//SetCache
	service.devMgmt.SetCache(c.Req.Context(), cacheKey, dto.Result)
	return dto.Result
}

func (service *Service) IsGroupPathAccessible(c *contextmodel.ReqContext, groupPath string) bool {
	if c.IsGrafanaAdmin {
		return true
	}
	dto := resource.IsGroupPathAccessibleMsg{
		GroupPath: groupPath,
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
	}
	//GetCache
	cacheKey := fmt.Sprintf("isgrouppathaccessible-%s-%d", groupPath, c.UserID)
	if err := service.devMgmt.GetCache(c.Req.Context(), cacheKey, &dto.Result); err == nil {
		return dto.Result
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return false
	}
	url := fmt.Sprintf("%sapi/groups/path/access", service.cfg.ResourceHost)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		service.log.Error(err.Error())
		return false
	}

	if req.StatusCode == http.StatusOK {
		dto.Result = true
	}
	//SetCache
	service.devMgmt.SetCache(c.Req.Context(), cacheKey, dto.Result)
	return dto.Result
}

func (service *Service) CreateGroup(c *contextmodel.ReqContext) response.Response {
	dto := resource.CreateGroupMsg{
		OrgId: c.OrgID,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create group", err)
	}
	url := fmt.Sprintf("%s%s", service.cfg.ResourceHost, "api/groups")
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to create group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
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

func (service *Service) GetGroups(c *contextmodel.ReqContext) response.Response {
	query := c.Query("query")
	parent := c.QueryInt("parent")
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}
	dto := resource.GetGroupsMsg{
		Query:  query,
		Parent: int64(parent),
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
		Page:    int64(page),
		PerPage: int64(perPage),
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal get group", err)
	}
	url := fmt.Sprintf("%sapi/groups/search", service.cfg.ResourceHost)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
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

func (service *Service) GetGroupsByType(c *contextmodel.ReqContext) response.Response {
	query := c.Query("query")
	groupType := c.Query("type")
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}
	dto := resource.GetGroupsByTypeMsg{
		Query: query,
		Type:  groupType,
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
		Page:    int64(page),
		PerPage: int64(perPage),
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal get group", err)
	}
	url := fmt.Sprintf("%sapi/groups/searchbytype", service.cfg.ResourceHost)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
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

func (service *Service) GetGroupById(c *contextmodel.ReqContext) response.Response {
	access, id := service.IsGroupAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	url := fmt.Sprintf("%sapi/groups/%d", service.cfg.ResourceHost, id)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	dto := resource.GetGroupByIdMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}

	//check parent group accessiblity
	if *dto.Result.Parent != -1 {
		if !service.IsGroupAccessibleById(c, *dto.Result.Parent) {
			*dto.Result.Parent = -1
		}
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (service *Service) UpdateGroup(c *contextmodel.ReqContext) response.Response {
	access, id := service.IsGroupAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	dto := resource.UpdateGroupMsg{
		Id: id,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update group", err)
	}
	url := fmt.Sprintf("%sapi/groups/%d", service.cfg.ResourceHost, id)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPut,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to update group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	return response.Success("updated")
}

func (service *Service) DeleteGroup(c *contextmodel.ReqContext) response.Response {
	access, id := service.IsGroupAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	url := fmt.Sprintf("%sapi/groups/%d", service.cfg.ResourceHost, id)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodDelete,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to delete group", err)
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

func (service *Service) GetGroupParent(c *contextmodel.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":groupId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	dto := resource.GetParentGroupsMsg{
		GroupId: id,
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal get group", err)
	}
	url := fmt.Sprintf("%sapi/groups/%d/parent", service.cfg.ResourceHost, id)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
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

func (service *Service) GetGroupPathName(c *contextmodel.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":groupId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	url := fmt.Sprintf("%sapi/groups/%d/pathname", service.cfg.ResourceHost, id)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get group", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	dto := resource.GetGroupPathNameMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	resp := struct {
		Pathname string `json:"pathname"`
	}{
		Pathname: dto.Result,
	}
	return response.JSON(http.StatusOK, resp)
}
