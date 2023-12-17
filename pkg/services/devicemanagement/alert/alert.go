package alert

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/web"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/alerts"
	"github.com/jayaraj/messages/client/resource"
)

func (service *Service) isAlertAccessible(c *contextmodel.ReqContext, name string) bool {
	dto := alerts.AlertAccessibleMsg{
		Name: name,
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
	}
	//GetCache
	cacheKey := fmt.Sprintf("isalertaccessible-%s-%d", name, c.UserID)
	if err := service.devMgmt.GetCache(c.Req.Context(), cacheKey, &dto.Result); err == nil {
		return dto.Result
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return false
	}
	url := fmt.Sprintf("%sapi/alerts/%s/access", service.cfg.AlertHost, name)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return false
	}
	if req.StatusCode != http.StatusOK {
		return false
	}
	return true
}

func (service *Service) SearchAlerts(c *contextmodel.ReqContext) response.Response {
	var group *string
	var resourceIdPtr *int64
	var name *string
	var state *string
	query := c.Query("query")
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}
	groupPath := c.Query("group")
	groupService := service.devMgmt.GetGroup()
	resourceService := service.devMgmt.GetResource()
	if groupPath != "" {
		if !groupService.IsGroupPathAccessible(c, groupPath) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
		group = &groupPath
	}
	resourceId, err := strconv.ParseInt(c.Query("resource"), 10, 64)
	if err == nil && resourceId != 0 {
		if !resourceService.IsResourceAccessibleById(c, resourceId) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
		resourceIdPtr = &resourceId
	}
	alertName := c.Query("name")
	if alertName != "" {
		name = &alertName
	}
	alertState := c.Query("state")
	if alertState != "" {
		state = &alertState
	}
	cmd := &alerts.SearchAlertsMsg{
		Query:      query,
		Page:       int64(page),
		PerPage:    int64(perPage),
		OrgId:      c.OrgID,
		GroupPath:  group,
		ResourceId: resourceIdPtr,
		Name:       name,
		State:      state,
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
	}
	body, err := json.Marshal(cmd)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/alerts/search", service.cfg.AlertHost)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to search", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
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

func (service *Service) ConfigureAlert(c *contextmodel.ReqContext) response.Response {
	dto := &alerts.ConfigureAlertMsg{
		OrgId: c.OrgID,
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	if !service.isAlertAccessible(c, dto.Name) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}

	groupService := service.devMgmt.GetGroup()
	resourceService := service.devMgmt.GetResource()
	if dto.GroupPath != nil && *dto.GroupPath != "" {
		if !groupService.IsGroupPathAccessible(c, *dto.GroupPath) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
	}
	if dto.ResourceId != nil && *dto.ResourceId != 0 {
		if !resourceService.IsResourceAccessibleById(c, *dto.ResourceId) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
	}

	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/alerts/configure", service.cfg.AlertHost)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPut,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to update", err)
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

func (service *Service) EnabledAlert(c *contextmodel.ReqContext) response.Response {
	dto := &alerts.EnableAlertMsg{
		OrgId: c.OrgID,
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	if !service.isAlertAccessible(c, dto.Name) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}

	groupService := service.devMgmt.GetGroup()
	resourceService := service.devMgmt.GetResource()
	if dto.GroupPath != nil && *dto.GroupPath != "" {
		if !groupService.IsGroupPathAccessible(c, *dto.GroupPath) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
	}
	if dto.ResourceId != nil && *dto.ResourceId != 0 {
		if !resourceService.IsResourceAccessibleById(c, *dto.ResourceId) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
	}

	url := fmt.Sprintf("%sapi/alerts/enable", service.cfg.AlertHost)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPut,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to update", err)
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

func (service *Service) GetGrafoAlert(c *contextmodel.ReqContext) response.Response {
	var group *string
	var resource *int64
	name := web.Params(c.Req)[":name"]

	groupPath := c.Query("group")
	groupService := service.devMgmt.GetGroup()
	resourceService := service.devMgmt.GetResource()

	if groupPath != "" {
		if !groupService.IsGroupPathAccessible(c, groupPath) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
		group = &groupPath
	}
	resourceId, err := strconv.ParseInt(c.Query("resource"), 10, 64)
	if err == nil {
		if !resourceService.IsResourceAccessibleById(c, resourceId) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
		resource = &resourceId
	}

	cmd := &alerts.GetAlertMsg{
		Name:       name,
		OrgId:      c.OrgID,
		GroupPath:  group,
		ResourceId: resource,
	}
	if !service.isAlertAccessible(c, cmd.Name) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	body, err := json.Marshal(cmd)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/alerts/%s", service.cfg.AlertHost, cmd.Name)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to search", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	cmd.Result.Role = string(devicemanagement.ConvertStringToRole(cmd.Result.Role))
	return response.JSON(http.StatusOK, cmd.Result)
}
