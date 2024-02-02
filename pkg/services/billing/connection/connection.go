package connection

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/web"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/billing"
	"github.com/jayaraj/messages/client/resource"
	"github.com/pkg/errors"
)

func (service *Service) IsConnectionAccessible(c *contextmodel.ReqContext) (billing.Connection, bool) {
	var connection billing.Connection
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return connection, false
	}
	return service.IsConnectionAccessibleById(c, id)
}

func (service *Service) IsConnectionAccessibleById(c *contextmodel.ReqContext, id int64) (billing.Connection, bool) {
	var connection billing.Connection
	// GetCache
	cacheKey := fmt.Sprintf("connection-%d", id)
	if err := service.devMgmt.GetCache(c.Req.Context(), cacheKey, &connection); err != nil {
		connection, err = service.GetConnection(c.Req.Context(), id)
		if err != nil {
			return connection, false
		}
		// SetCache
		service.devMgmt.SetCache(c.Req.Context(), cacheKey, connection)
	}
	if c.IsGrafanaAdmin {
		return connection, true
	}

	var access bool
	// GetCache
	cacheKey = fmt.Sprintf("isconnectionaccessible-%d-%d", id, c.UserID)
	if err := service.devMgmt.GetCache(c.Req.Context(), cacheKey, &access); err == nil {
		return connection, access
	}
	access = service.IsConnectionGroupAccessible(c, connection)
	// SetCache
	service.devMgmt.SetCache(c.Req.Context(), cacheKey, access)
	return connection, access
}

func (service *Service) GetConnection(ctx context.Context, id int64) (billing.Connection, error) {
	dto := billing.GetConnectionByIdMsg{
		Id:     id,
		Result: billing.Connection{},
	}
	url := fmt.Sprintf("%sapi/connections/%d", service.cfg.BillingHost, id)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(ctx, req); err != nil {
		return dto.Result, err
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return dto.Result, err
		}
		return dto.Result, errors.New(errResponse.Message)
	}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return dto.Result, err
	}
	return dto.Result, nil
}

func (service *Service) IsConnectionGroupAccessible(c *contextmodel.ReqContext, connection billing.Connection) bool {
	if c.IsGrafanaAdmin {
		return true
	}
	var access bool
	//GetCache
	cacheKey := fmt.Sprintf("isconnectionaccessible-%d-%d", connection.Id, c.UserID)
	if err := service.devMgmt.GetCache(c.Req.Context(), cacheKey, &access); err == nil {
		return access
	}
	groupService := service.devMgmt.GetGroup()
	access = groupService.IsGroupAccessibleById(c, connection.GroupId)
	//SetCache
	service.devMgmt.SetCache(c.Req.Context(), cacheKey, access)
	return access
}

func (service *Service) CreateConnection(c *contextmodel.ReqContext) response.Response {
	dto := billing.CreateConnectionMsg{
		OrgId: c.OrgID,
		Login: c.Login,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	groupService := service.devMgmt.GetGroup()
	if !groupService.IsGroupAccessibleById(c, dto.GroupParentId) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}

	url := fmt.Sprintf("%sapi/connections", service.cfg.BillingHost)
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

func (service *Service) SearchConnections(c *contextmodel.ReqContext) response.Response {
	query := c.Query("query")
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}

	cmd := billing.SearchConnectionsMsg{
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
		Query:   query,
		Page:    int64(page),
		PerPage: int64(perPage),
	}
	body, err := json.Marshal(cmd)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/connections/search", service.cfg.BillingHost)
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
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, cmd.Result)
}

func (service *Service) UpdateConnection(c *contextmodel.ReqContext) response.Response {
	_, access := service.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	dto := &billing.UpdateConnectionMsg{
		Id:    id,
		Login: c.Login,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}

	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/connections/%d", service.cfg.BillingHost, id)
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

func (service *Service) GetConnectionById(c *contextmodel.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	connection, err := service.GetConnection(c.Req.Context(), id)
	if err != nil {
		return response.Error(http.StatusInternalServerError, "failed to get", err)
	}
	access := service.IsConnectionGroupAccessible(c, connection)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	return response.JSON(http.StatusOK, connection)
}

func (service *Service) DeleteConnection(c *contextmodel.ReqContext) response.Response {
	_, access := service.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	url := fmt.Sprintf("%sapi/connections/%d", service.cfg.BillingHost, id)
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

func (service *Service) GetConnectionLogs(c *contextmodel.ReqContext) response.Response {
	_, access := service.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
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

	url := fmt.Sprintf("%sapi/connections/%d/logs?page=%d&perPage=%d", service.cfg.BillingHost, id, page, perPage)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	cmd := billing.GetConnectionLogsMsg{}
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