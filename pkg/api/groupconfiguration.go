package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/resources"
	"github.com/grafana/grafana/pkg/web"
)

func (hs *HTTPServer) UpdateGroupConfiguration(c *models.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":groupId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	if id != 0 && !hs.IsGroupAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	config := web.Params(c.Req)[":config"]
	dto := dtos.UpdateGroupConfigurationMsg{
		GroupId: id,
		Type:    config,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/groups/%d/configurations", hs.ResourceService.GetConfig().ResourceUrl, id)
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
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}
	return response.Success("updated")
}

func (hs *HTTPServer) GetGroupConfiguration(c *models.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":groupId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}

	if id != 0 && !hs.IsGroupAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	config := web.Params(c.Req)[":config"]
	url := fmt.Sprintf("%sapi/groups/%d/configurations/%s", hs.ResourceService.GetConfig().ResourceUrl, id, config)
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
		return response.Error(req.StatusCode, errResponse.Message, errors.New(errResponse.Message))
	}

	return response.JSON(http.StatusOK, req.Response)
}
