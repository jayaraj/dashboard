package connection

import (
	"bytes"
	"context"
	"encoding/csv"
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

func (service *Service) GetOrgConnectionsCSV(c *contextmodel.ReqContext) response.Response {
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}
	msg := &billing.GetAllOrgConnectionsMsg{
		OrgId:   c.OrgID,
		Page:    int64(page),
		PerPage: int64(perPage),
	}

	if err := service.devMgmt.RequestTopic(c.Req.Context(), client.BillingTopic(billing.GetAllOrgConnections), msg); err != nil {
		return response.Error(500, "failed to get org connections", err)
	}

	// Generate CSV from connections data
	csvData, err := service.generateConnectionsCSV(msg.Result.Connections)
	if err != nil {
		return response.Error(500, "failed to generate csv", err)
	}

	// Return CSV as a downloadable file
	return response.Respond(http.StatusOK, csvData.Bytes()).
		SetHeader("Content-Type", "text/csv").
		SetHeader("Content-Disposition", "attachment; filename=connections.csv")
}

func (service *Service) generateConnectionsCSV(connections []billing.Connection) (*bytes.Buffer, error) {
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	// Write CSV header
	header := []string{
		"connection",
		"profile",
		"status",
		"name",
		"phone",
		"email",
		"address1",
		"address2",
		"city",
		"state",
		"country",
		"pincode",
		"latitude",
		"longitude",
	}
	if err := writer.Write(header); err != nil {
		return nil, err
	}

	// Write data rows
	for _, conn := range connections {
		record := []string{
			strconv.FormatInt(conn.ConnectionExt, 10),
			conn.Profile,
			conn.Status,
			conn.Name,
			conn.Phone,
			conn.Email,
			conn.Address1,
			conn.Address2,
			conn.City,
			conn.State,
			conn.Country,
			conn.Pincode,
			fmt.Sprintf("%f", conn.Latitude),
			fmt.Sprintf("%f", conn.Longitude),
		}
		if err := writer.Write(record); err != nil {
			return nil, err
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return nil, err
	}

	return &buf, nil
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

func (service *Service) GetConnectionByExt(c *contextmodel.ReqContext) response.Response {
	//Only for SuperAdmin
	if !c.GetOrgRole().Includes(roletype.RoleSuperAdmin) && !c.IsGrafanaAdmin {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	number, err := strconv.ParseInt(web.Params(c.Req)[":number"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	connection, err := service.getConnectionByExt(c.Req.Context(), number)
	if err != nil {
		return response.Error(http.StatusInternalServerError, "failed to get connection", err)
	}
	return response.JSON(http.StatusOK, connection)
}

func (service *Service) getConnectionByExt(ctx context.Context, number int64) (billing.Connection, error) {
	var conn billing.Connection
	url := fmt.Sprintf("%sapi/connections/number/%d", service.cfg.BillingHost, number)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(ctx, req); err != nil {
		return conn, err
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return conn, err
		}
		return conn, fmt.Errorf("failed to get connection: %s", errResponse.Message)
	}
	if err := json.Unmarshal(req.Response, &conn); err != nil {
		return conn, err
	}
	return conn, nil
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

func (service *Service) SubscribeConnectionByExt(c *contextmodel.ReqContext) response.Response {
	//Only for SuperAdmin
	if !c.GetOrgRole().Includes(roletype.RoleSuperAdmin) && !c.IsGrafanaAdmin {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	number, err := strconv.ParseInt(web.Params(c.Req)[":number"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	subscribeConnection := SubscribeConnectionMsg{}
	if err := web.Bind(c.Req, &subscribeConnection); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}

	getConnection := billing.GetConnectionByExtMsg{}
	url := fmt.Sprintf("%sapi/connections/number/%d", service.cfg.BillingHost, number)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get connection", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &getConnection.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}

	updateConnection := &billing.UpdateConnectionMsg{
		Id:        getConnection.Result.Id,
		Login:     c.Login,
		Profile:   getConnection.Result.Profile,
		Status:    getConnection.Result.Status,
		Name:      getConnection.Result.Name,
		Address1:  getConnection.Result.Address1,
		City:      getConnection.Result.City,
		State:     getConnection.Result.State,
		Country:   getConnection.Result.Country,
		Pincode:   getConnection.Result.Pincode,
		Address2:  getConnection.Result.Address2,
		Phone:     getConnection.Result.Phone,
		Email:     getConnection.Result.Email,
		Latitude:  getConnection.Result.Latitude,
		Longitude: getConnection.Result.Longitude,
		Extras:    getConnection.Result.Extras,
	}
	if updateConnection.Extras == nil {
		updateConnection.Extras = make(map[string]interface{})
	}
	if !service.subscribe(updateConnection.Extras, subscribeConnection.Number) {
		return response.Error(http.StatusBadRequest, "already subscribed", nil)
	}

	body, err := json.Marshal(updateConnection)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url = fmt.Sprintf("%sapi/connections/%d", service.cfg.BillingHost, getConnection.Result.Id)
	req = &devicemanagement.RestRequest{
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
	return response.Success("subscribed")
}

func (service *Service) UnsubscribeConnectionByExt(c *contextmodel.ReqContext) response.Response {
	//Only for SuperAdmin
	if !c.GetOrgRole().Includes(roletype.RoleSuperAdmin) && !c.IsGrafanaAdmin {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	number, err := strconv.ParseInt(web.Params(c.Req)[":number"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	subscribeConnection := SubscribeConnectionMsg{}
	if err := web.Bind(c.Req, &subscribeConnection); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}

	getConnection := billing.GetConnectionByExtMsg{}
	url := fmt.Sprintf("%sapi/connections/number/%d", service.cfg.BillingHost, number)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get connection", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &getConnection.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}

	updateConnection := &billing.UpdateConnectionMsg{
		Id:        getConnection.Result.Id,
		Login:     c.Login,
		Profile:   getConnection.Result.Profile,
		Status:    getConnection.Result.Status,
		Name:      getConnection.Result.Name,
		Address1:  getConnection.Result.Address1,
		City:      getConnection.Result.City,
		State:     getConnection.Result.State,
		Country:   getConnection.Result.Country,
		Pincode:   getConnection.Result.Pincode,
		Address2:  getConnection.Result.Address2,
		Phone:     getConnection.Result.Phone,
		Email:     getConnection.Result.Email,
		Latitude:  getConnection.Result.Latitude,
		Longitude: getConnection.Result.Longitude,
		Extras:    getConnection.Result.Extras,
	}
	if updateConnection.Extras == nil {
		return response.Error(http.StatusBadRequest, "not subscribed", nil)
	}
	if !service.unsubscribe(updateConnection.Extras, subscribeConnection.Number) {
		return response.Error(http.StatusBadRequest, "not subscribed", nil)
	}

	body, err := json.Marshal(updateConnection)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url = fmt.Sprintf("%sapi/connections/%d", service.cfg.BillingHost, getConnection.Result.Id)
	req = &devicemanagement.RestRequest{
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
	return response.Success("unsubscribed")
}

func (service *Service) subscribe(extras map[string]interface{}, id float64) bool {
	if extras["wa_id"] == nil {
		extras["wa_id"] = []interface{}{}
	}
	queue, ok := extras["wa_id"].([]interface{})
	if !ok {
		return false
	}
	for _, v := range queue {
		if vv, ok := v.(float64); ok && vv == id {
			extras["wa_id"] = queue
			return false
		}
	}
	queue = append(queue, id)
	if len(queue) > 3 {
		queue = queue[len(queue)-3:]
	}
	extras["wa_id"] = queue
	return true
}

func (service *Service) unsubscribe(extras map[string]interface{}, id float64) bool {
	queue, ok := extras["wa_id"].([]interface{})
	if !ok {
		return false
	}
	found := false
	newQueue := make([]interface{}, 0, len(queue))
	for _, v := range queue {
		if vv, ok := v.(float64); ok && vv == id {
			found = true
			continue
		}
		newQueue = append(newQueue, v)
	}
	if found {
		extras["wa_id"] = newQueue
		return true
	}
	return false
}
