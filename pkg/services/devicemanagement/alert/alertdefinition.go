package alert

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/services/org"
	"github.com/grafana/grafana/pkg/web"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/alerts"
	"github.com/jayaraj/messages/client/resource"
)

func (service *Service) IsAlertDefinitionAccessible(c *contextmodel.ReqContext) (bool, int64) {
	id, err := strconv.ParseInt(web.Params(c.Req)[":alertDefinitionId"], 10, 64)
	if err != nil {
		return false, 0
	}
	return service.isAlertDefinitionAccessible(c, id), id
}

func (service *Service) isAlertDefinitionAccessible(c *contextmodel.ReqContext, id int64) bool {
	if c.IsGrafanaAdmin {
		return true
	}
	dto := alerts.IsAlertDefinitionAccessibleMsg{
		Id: id,
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
	}
	//GetCache
	cacheKey := fmt.Sprintf("isalertdefinitionaccessible-%d-%d", id, c.UserID)
	if err := service.devMgmt.GetCache(c.Req.Context(), cacheKey, &dto.Result); err == nil {
		return dto.Result
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return false
	}
	url := fmt.Sprintf("%sapi/alertdefinitions/%d/access", service.cfg.AlertHost, id)
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

func (service *Service) CreateAlertDefinition(c *contextmodel.ReqContext) response.Response {
	dto := &alerts.CreateAlertDefinitionMsg{}
	if err := web.Bind(c.Req, dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	dto.Role = devicemanagement.ConvertRoleToString(org.RoleType(dto.Role))
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/alertdefinitions", service.cfg.AlertHost)
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
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}

	updateAlertScript := &alerts.UpdateAlertScriptMsg{
		Name: dto.Name,
	}
	updateBody, err := json.Marshal(updateAlertScript)
	if err != nil {
		return response.Error(500, "marshal update alert script failed", err)
	}
	if err := service.devMgmt.Publish(c.Req.Context(), client.ReaderTopic(alerts.UpdateAlertScript), updateBody); err != nil {
		return response.Error(500, "update alert script failed", err)
	}

	return response.JSON(http.StatusOK, dto.Result)
}

func (service *Service) TestAlertDefinition(c *contextmodel.ReqContext) response.Response {
	access, id := service.IsAlertDefinitionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	dto := &alerts.TestAlertScriptMsg{
		Id:    id,
		OrgId: uint64(c.OrgID),
	}
	if err := web.Bind(c.Req, dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}

	if err := service.devMgmt.RequestTopic(c.Req.Context(), client.ReaderTopic(alerts.TestAlertScript), dto); err != nil {
		return response.Error(500, "test alert script failed", err)
	}

	return response.JSON(http.StatusOK, dto.Result)
}

func (service *Service) UpdateAlertDefinition(c *contextmodel.ReqContext) response.Response {
	access, id := service.IsAlertDefinitionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	dto := alerts.UpdateAlertDefinitionMsg{
		Id: id,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	dto.Role = devicemanagement.ConvertRoleToString(org.RoleType(dto.Role))
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/alertdefinitions/%d", service.cfg.AlertHost, id)
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
	updateAlertScript := &alerts.UpdateAlertScriptMsg{
		Name: dto.Name,
	}
	updateBody, err := json.Marshal(updateAlertScript)
	if err != nil {
		return response.Error(500, "marshal update alert script failed", err)
	}
	if err := service.devMgmt.Publish(c.Req.Context(), client.ReaderTopic(alerts.UpdateAlertScript), updateBody); err != nil {
		return response.Error(500, "update alert script failed", err)
	}
	return response.Success("updated")
}

func (service *Service) DeleteAlertDefinition(c *contextmodel.ReqContext) response.Response {
	access, id := service.IsAlertDefinitionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	url := fmt.Sprintf("%sapi/alertdefinitions/%d", service.cfg.AlertHost, id)
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
	return response.Success("deleted")
}

func (service *Service) GetAlertDefinitionById(c *contextmodel.ReqContext) response.Response {
	access, id := service.IsAlertDefinitionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	url := fmt.Sprintf("%sapi/alertdefinitions/%d", service.cfg.AlertHost, id)
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
	cmd := alerts.GetAlertDefinitionByIdMsg{}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	cmd.Result.Role = string(devicemanagement.ConvertStringToRole(cmd.Result.Role))
	return response.JSON(http.StatusOK, cmd.Result)
}

func (service *Service) SearchAlertDefinitions(c *contextmodel.ReqContext) response.Response {
	var group *string
	var resourceIdPtr *int64
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
	alertState := c.Query("state")
	if alertState != "" {
		state = &alertState
	}

	cmd := &alerts.SearchAlertDefinitionMsg{
		Query:      query,
		Page:       int64(page),
		PerPage:    int64(perPage),
		OrgId:      c.OrgID,
		GroupPath:  group,
		ResourceId: resourceIdPtr,
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
	url := fmt.Sprintf("%sapi/alertdefinitions/search", service.cfg.AlertHost)
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
	for i := range cmd.Result.AlertDefinitions {
		cmd.Result.AlertDefinitions[i].Role = string(devicemanagement.ConvertStringToRole(cmd.Result.AlertDefinitions[i].Role))
	}
	return response.JSON(http.StatusOK, cmd.Result)
}
