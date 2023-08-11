package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/resources"
	"github.com/grafana/grafana/pkg/web"
)

func (hs *HTTPServer) UpdateOrCreateAlertNotification(c *models.ReqContext) response.Response {

	var dto dtos.UpdateOrCreateAlertNotificationMsg
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}

	dto.OrgId = c.OrgID
	dto.UserId = c.UserID

	user := dtos.User{
		UserId: c.UserID,
		OrgId:  c.OrgID,
		Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
	}

	if !hs.isAlertDefinitionAccessible(c.Req.Context(), dto.AlertDefinitionId, user) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/alertnotifications", hs.ResourceService.GetConfig().ReaderUrl)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
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

func (hs *HTTPServer) GetAlertNotification(c *models.ReqContext) response.Response {
	name := web.Params(c.Req)[":name"]

	url := fmt.Sprintf("%sapi/alertnotifications/%s?org=%d&user=%d", hs.ResourceService.GetConfig().ReaderUrl, name, c.OrgID, c.UserID)
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
	cmd := dtos.GetAlertNotificationMsg{}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, cmd.Result)
}

func (hs *HTTPServer) GetWhatsapp(c *models.ReqContext) response.Response {
	url := fmt.Sprintf("%sapi/whatsapp", hs.ResourceService.GetConfig().ReaderUrl)
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
	qr := dtos.WhatsappQR{}
	if err := json.Unmarshal(req.Response, &qr); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, qr)
}
