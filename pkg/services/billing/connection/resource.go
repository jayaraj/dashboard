package connection

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/util"
	"github.com/grafana/grafana/pkg/web"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/billing"
	"github.com/jayaraj/messages/client/resource"
)

func (service *Service) GetConnectionResources(c *contextmodel.ReqContext) response.Response {
	connection, access := service.IsConnectionAccessible(c)
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
	url := fmt.Sprintf("%sapi/groups/%d/resources?query=%s&page=%d&perPage=%d", service.cfg.ResourceHost, connection.GroupId, query, page, perPage)
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
	dto := resource.GetGroupResourcesMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	for i := range dto.Result.GroupResources {
		dto.Result.GroupResources[i].ResourceLastSeenAge = util.GetAgeString(dto.Result.GroupResources[i].ResourceLastSeen)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (service *Service) CreateConnectionResource(c *contextmodel.ReqContext) response.Response {
	connection, access := service.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	dto := billing.CreateConnectionResourceMsg{
		OrgId:   connection.OrgId,
		GroupId: connection.GroupId,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/connections/%d/resources?created_by=%s", service.cfg.BillingHost, connection.Id, c.Login)
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
	return response.JSON(http.StatusOK, dto.Result)
}

func (service *Service) RemoveConnectionResource(c *contextmodel.ReqContext) response.Response {
	connection, access := service.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	resourceId, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "resourceId is invalid", err)
	}
	uuid := c.Query("uuid")

	url := fmt.Sprintf("%sapi/connections/%d/resources/%d?uuid=%s&deleted_by=%s", service.cfg.BillingHost, connection.Id, resourceId, uuid, c.Login)
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
	return response.Success("removed user from connection")
}

func (service *Service) AddConnectionResource(c *contextmodel.ReqContext) response.Response {
	connection, access := service.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	uuid := web.Params(c.Req)[":uuid"]
	resourceService := service.devMgmt.GetResource()
	r, err := resourceService.GetResourceByUUID(c.Req.Context(), uuid)
	if err != nil {
		return response.Error(http.StatusNotFound, "uuid is not found", err)
	}
	if !resourceService.IsResourceAccessibleById(c, r.Id) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	dto := billing.AddConnectionResourceMsg{
		ResourceId:   r.Id,
		UUID:         uuid,
		AddedBy:      c.Login,
		ConnectionId: connection.Id,
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal add", err)
	}
	url := fmt.Sprintf("%sapi/connections/%d/resources", service.cfg.BillingHost, connection.Id)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPut,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to add", err)
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
