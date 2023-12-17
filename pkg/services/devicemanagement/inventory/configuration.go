package inventory

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

func (service *Service) UpdateInventoryConfiguration(c *contextmodel.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":inventoryId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}

	config := web.Params(c.Req)[":config"]
	dto := resource.UpdateInventoryConfigurationMsg{
		InventoryId: id,
		Type:        config,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/inventories/%d/configurations", service.cfg.ResourceHost, id)
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

func (service *Service) GetInventoryConfiguration(c *contextmodel.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":inventoryId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}

	config := web.Params(c.Req)[":config"]

	dto := &resource.GetInventoryConfigurationMsg{
		InventoryId: id,
		Type:        config,
		User: resource.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   devicemanagement.ConvertRoleToStringFromCtx(c),
		},
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}

	url := fmt.Sprintf("%sapi/inventories/%d/configurations/%s", service.cfg.ResourceHost, id, config)
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

	return response.JSON(http.StatusOK, req.Response)
}
