package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/org"
	"github.com/grafana/grafana/pkg/services/resources"
	"github.com/grafana/grafana/pkg/web"
)

func (hs *HTTPServer) UpdateAlertDefinition(c *models.ReqContext) response.Response {
	access, id := hs.IsAlertDefinitionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	dto := &dtos.UpdateAlertDefinitionMsg{
		Id: id,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	dto.Role = dtos.ConvertRoleToString(org.RoleType(dto.Role))
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/alertdefinitions/%d", hs.ResourceService.GetConfig().ReaderUrl, id)
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

func (hs *HTTPServer) GetAlertDefinitionById(c *models.ReqContext) response.Response {
	access, id := hs.IsAlertDefinitionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	url := fmt.Sprintf("%sapi/alertdefinitions/%d", hs.ResourceService.GetConfig().ReaderUrl, id)
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
	cmd := dtos.GetAlertDefinitionByIdMsg{}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	cmd.Result.Role = string(dtos.ConvertStringToRole(cmd.Result.Role))
	return response.JSON(http.StatusOK, cmd.Result)
}

func (hs *HTTPServer) SearchAlertDefinitions(c *models.ReqContext) response.Response {
	var group *string
	var resource *int64
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
	alertState := c.Query("state")
	if alertState != "" {
		state = &alertState
	}

	cmd := &dtos.SearchAlertDefinitionMsg{
		Query:      query,
		Page:       int64(page),
		PerPage:    int64(perPage),
		OrgId:      c.OrgID,
		GroupPath:  group,
		ResourceId: resource,
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
	url := fmt.Sprintf("%sapi/alertdefinitions/search", hs.ResourceService.GetConfig().ReaderUrl)
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
	for i, _ := range cmd.Result.AlertDefinitions {
		cmd.Result.AlertDefinitions[i].Role = string(dtos.ConvertStringToRole(cmd.Result.AlertDefinitions[i].Role))
	}
	return response.JSON(http.StatusOK, cmd.Result)
}

func (hs *HTTPServer) IsAlertDefinitionAccessible(c *models.ReqContext) (bool, int64) {
	alertDefinitionId, ok := web.Params(c.Req)[":alertDefinitionId"]
	if !ok {
		alertDefinitionId = web.Params(c.Req)[":id"]
	}
	id, err := strconv.ParseInt(alertDefinitionId, 10, 64)
	if err != nil {
		return false, 0
	}
	if c.IsGrafanaAdmin {
		return true, id
	}
	user := dtos.User{
		UserId: c.UserID,
		OrgId:  c.OrgID,
		Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
	}
	return hs.isAlertDefinitionAccessible(c.Req.Context(), id, user), id
}

func (hs *HTTPServer) isAlertDefinitionAccessible(ctx context.Context, alertDefinitionId int64, user dtos.User) bool {
	dto := dtos.IsAlertDefinitionAccessibleMsg{
		Id:   alertDefinitionId,
		User: user,
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return false
	}
	url := fmt.Sprintf("%sapi/alertdefinitions/%d/access", hs.ResourceService.GetConfig().ReaderUrl, alertDefinitionId)
	req := &resources.RestRequest{
		Url:        url,
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
