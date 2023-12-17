package resource

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
	"github.com/jayaraj/messages/client/resource"
)

func (service *Service) PostResourceHistoryData(c *contextmodel.ReqContext) response.Response {
	uuid := web.Params(c.Req)[":uuid"]
	dataType := web.Params(c.Req)[":dataType"]

	if dataType != "data" && dataType != "event" {
		return response.Error(http.StatusBadRequest, "invalid url", nil)
	}

	topic := "historyData"
	dto := client.HistoricalDataMsg{
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
		UUID: uuid,
	}
	if dataType != "data" {
		topic = "historyEvent"
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}

	if err := service.devMgmt.RequestTopic(c.Req.Context(), client.WriterTopic(topic), dto); err != nil {
		return response.Error(500, "failed to write", err)
	}
	return response.Success("success")
}

func (service *Service) SendResourceDownlink(c *contextmodel.ReqContext) response.Response {
	if !service.IsResourceAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	dto := client.DownlinkMsg{
		ResourceId: id,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	if err := service.devMgmt.Publish(c.Req.Context(), client.SubscriberTopic("downlink"), body); err != nil {
		return response.Error(500, "failed to update", err)
	}
	return response.Success("updated")
}

func (service *Service) GetResourceDownlink(c *contextmodel.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":resourceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	if id != 0 && !service.IsResourceAccessible(c) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	config := web.Params(c.Req)[":config"]

	url := fmt.Sprintf("%sapi/resources/%d/downlink/%s", service.cfg.ResourceHost, id, config)
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
	return response.JSON(http.StatusOK, req.Response)
}
