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

func (hs *HTTPServer) CreateResource(c *models.ReqContext) response.Response {
	dto := dtos.CreateResourceMsg{
		OrgId: c.OrgID,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/resources", hs.ResourceService.GetConfig().ResourceUrl)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to create", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
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

func (hs *HTTPServer) UpdateResource(c *models.ReqContext) response.Response {
	if !hs.IsResourceAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	dto := dtos.UpdateResourceMsg{
		Id: id,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/resources/%d", hs.ResourceService.GetConfig().ResourceUrl, id)
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

func (hs *HTTPServer) DeleteResource(c *models.ReqContext) response.Response {
	if !hs.IsResourceAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	url := fmt.Sprintf("%sapi/resources/%d", hs.ResourceService.GetConfig().ResourceUrl, id)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodDelete,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to delete", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	return response.Success("deleted")
}

// func (hs *HTTPServer) CloneResource(c *models.ReqContext) response.Response {
// 	if !hs.IsResourceAccessible(c) {
// 		return response.Error(http.StatusForbidden, "cannot access", nil)
// 	}
// 	id, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
// 	if err != nil {
// 		return response.Error(http.StatusBadRequest, "id is invalid", err)
// 	}
// 	url := fmt.Sprintf("%sapi/resources/%d/clone", hs.ResourceService.GetConfig().ResourceUrl, id)
// 	req := &resources.RestRequest{
// 		Url:        url,
// 		Request:    nil,
// 		HttpMethod: http.MethodPost,
// 	}
// 	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
// 		return response.Error(500, "failed to clone", err)
// 	}

// 	if req.StatusCode != http.StatusOK {
// 		var errResponse dtos.ErrorResponse
// 		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
// 			return response.Error(req.StatusCode, "failed unmarshal error ", err)
// 		}
// 		return response.Error(req.StatusCode, errResponse.Message, nil)
// 	}
// 	dto := dtos.CloneResourceMsg{}
// 	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
// 		return response.Error(req.StatusCode, "failed unmarshal error ", err)
// 	}
// 	return response.JSON(http.StatusOK, dto.Result)
// }

func (hs *HTTPServer) GetResourceById(c *models.ReqContext) response.Response {
	if !hs.IsResourceAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	url := fmt.Sprintf("%sapi/resources/%d", hs.ResourceService.GetConfig().ResourceUrl, id)
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
			response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	dto := dtos.GetResourceByIdMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (hs *HTTPServer) SearchResources(c *models.ReqContext) response.Response {
	query := c.Query("query")
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}
	dto := &dtos.SearchResourceMsg{
		Query:   query,
		Page:    int64(page),
		PerPage: int64(perPage),
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
		},
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal search", err)
	}
	url := fmt.Sprintf("%sapi/resources/search", hs.ResourceService.GetConfig().ResourceUrl)
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
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (hs *HTTPServer) isResourceAccessible(c *models.ReqContext, id int64) bool {
	if c.IsGrafanaAdmin {
		return true
	}
	dto := dtos.IsResourceAccessibleMsg{
		ResourceId: id,
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
	url := fmt.Sprintf("%sapi/resources/%d/access", hs.ResourceService.GetConfig().ResourceUrl, id)
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

func (hs *HTTPServer) IsResourceAccessible(c *models.ReqContext) bool {
	id, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
	if err != nil {
		return false
	}
	return hs.isResourceAccessible(c, id)
}

func (hs *HTTPServer) GetResourceGroups(c *models.ReqContext) response.Response {
	if !hs.IsResourceAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
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
	url := fmt.Sprintf("%sapi/resources/%d/groups?query=%s&page=%d&perPage=%d", hs.ResourceService.GetConfig().ResourceUrl, id, query, page, perPage)
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
	dto := dtos.GetResourceGroupsMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (hs *HTTPServer) PostResourceHistoryData(c *models.ReqContext) response.Response {
	uuid := web.Params(c.Req)[":uuid"]
	dataType := web.Params(c.Req)[":dataType"]

	if dataType != "data" && dataType != "event" {
		return response.Error(http.StatusBadRequest, "invalid url", nil)
	}

	topic := "historyData"
	dto := dtos.DataMsg{
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
		},
		UUID: uuid,
	}
	if dataType != "data" {
		topic = "historyEvent"
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	if _, err := hs.ResourceService.Request(c.Req.Context(), hs.ResourceService.WriterTopic(topic), body); err != nil {
		return response.Error(500, "failed to write", err)
	}
	return response.Success("success")
}

func (hs *HTTPServer) ResourceDownlink(c *models.ReqContext) response.Response {
	if !hs.IsResourceAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	dto := dtos.DownlinkMsg{
		ResourceId: id,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	if err := hs.ResourceService.Publish(c.Req.Context(), hs.ResourceService.SubscriberTopic("downlink"), body); err != nil {
		return response.Error(500, "failed to update", err)
	}
	return response.Success("updated")
}

func (hs *HTTPServer) GetResourceDownlink(c *models.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	if id != 0 && !hs.IsResourceAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	config := web.Params(c.Req)[":config"]

	url := fmt.Sprintf("%sapi/resources/%d/downlink/%s", hs.ResourceService.GetConfig().ResourceUrl, id, config)
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

	return response.JSON(http.StatusOK, req.Response)
}
