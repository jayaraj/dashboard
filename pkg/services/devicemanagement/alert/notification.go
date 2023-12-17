package alert

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/alerts"
)

func (service *Service) GetWhatsapp(c *contextmodel.ReqContext) response.Response {
	url := fmt.Sprintf("%sapi/whatsapp", service.cfg.AlertHost)
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
	dto := alerts.GetWhatsAppQRMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}
