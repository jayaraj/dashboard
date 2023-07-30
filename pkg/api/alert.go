package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/resources"
	"github.com/grafana/grafana/pkg/web"
)

func (hs *HTTPServer) isAlertAccessible(c *models.ReqContext, name string) bool {
	dto := dtos.AlertAccessibleMsg{
		Name: name,
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
		},
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return false
	}
	url := fmt.Sprintf("%sapi/alerts/%s/access", hs.ResourceService.GetConfig().ReaderUrl, name)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return false
	}
	if req.StatusCode != http.StatusOK {
		return false
	}
	return true
}

func (hs *HTTPServer) SearchAlerts(c *models.ReqContext) response.Response {
	var group *string
	var resource *int64
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
	if groupPath != "" {
		if !hs.isGroupPathAccessible(c, groupPath) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
		group = &groupPath
	}
	resourceId, err := strconv.ParseInt(c.Query("resource"), 10, 64)
	if err == nil && resourceId != 0 {
		if !hs.isResourceAccessible(c, resourceId) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
		resource = &resourceId
	}
	alertName := c.Query("name")
	if alertName != "" {
		name = &alertName
	}
	alertState := c.Query("state")
	if alertState != "" {
		state = &alertState
	}
	cmd := &dtos.SearchAlertsMsg{
		Query:      query,
		Page:       int64(page),
		PerPage:    int64(perPage),
		OrgId:      c.OrgID,
		GroupPath:  group,
		ResourceId: resource,
		Name:       name,
		State:      state,
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
		},
	}
	body, err := json.Marshal(cmd)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/alerts/search", hs.ResourceService.GetConfig().ReaderUrl)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to search", err)
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

func (hs *HTTPServer) ConfigureAlert(c *models.ReqContext) response.Response {
	dto := &dtos.ConfigureAlertMsg{
		OrgId: c.OrgID,
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
		},
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	if !hs.isAlertAccessible(c, dto.Name) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}

	if dto.GroupPath != nil && *dto.GroupPath != "" {
		if !hs.isGroupPathAccessible(c, *dto.GroupPath) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
	}
	if dto.ResourceId != nil && *dto.ResourceId != 0 {
		if !hs.isResourceAccessible(c, *dto.ResourceId) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
	}

	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/alerts/configure", hs.ResourceService.GetConfig().ReaderUrl)
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

func (hs *HTTPServer) EnabledAlert(c *models.ReqContext) response.Response {
	dto := &dtos.EnableAlertMsg{
		OrgId: c.OrgID,
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
		},
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	if !hs.isAlertAccessible(c, dto.Name) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}

	if dto.GroupPath != nil && *dto.GroupPath != "" {
		if !hs.isGroupPathAccessible(c, *dto.GroupPath) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
	}
	if dto.ResourceId != nil && *dto.ResourceId != 0 {
		if !hs.isResourceAccessible(c, *dto.ResourceId) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
	}

	url := fmt.Sprintf("%sapi/alerts/enable", hs.ResourceService.GetConfig().ReaderUrl)
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

func (hs *HTTPServer) GetGrafoAlert(c *models.ReqContext) response.Response {
	var group *string
	var resource *int64
	name := web.Params(c.Req)[":name"]

	groupPath := c.Query("group")
	if groupPath != "" {
		if !hs.isGroupPathAccessible(c, groupPath) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
		group = &groupPath
	}
	resourceId, err := strconv.ParseInt(c.Query("resource"), 10, 64)
	if err == nil {
		if !hs.isResourceAccessible(c, resourceId) {
			return response.Error(http.StatusForbidden, "cannot access", nil)
		}
		resource = &resourceId
	}

	cmd := &dtos.GetAlertMsg{
		Name:       name,
		OrgId:      c.OrgID,
		GroupPath:  group,
		ResourceId: resource,
	}
	if !hs.isAlertAccessible(c, cmd.Name) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	body, err := json.Marshal(cmd)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/alerts/%s", hs.ResourceService.GetConfig().ReaderUrl, cmd.Name)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to search", err)
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
	cmd.Result.Role = string(dtos.ConvertStringToRole(cmd.Result.Role))
	return response.JSON(http.StatusOK, cmd.Result)
}
