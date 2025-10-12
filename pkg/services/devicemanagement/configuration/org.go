package configuration

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/web"
	"github.com/pkg/errors"

	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/resource"
)

func (service *Service) UpdateOrgConfiguration(c *contextmodel.ReqContext) response.Response {
	config := web.Params(c.Req)[":config"]
	dto := resource.UpdateOrgConfigurationMsg{
		OrgId: c.OrgID,
		Type:  config,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal update", err)
	}
	url := fmt.Sprintf("%sapi/orgs/%d/configurations", service.cfg.ResourceHost, c.OrgID)
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

func (service *Service) GetOrgConfiguration(c *contextmodel.ReqContext) response.Response {

	config := web.Params(c.Req)[":config"]
	if !service.IsConfigurationAccessible(c, client.ConvertAssociationToString(client.TYPE_ORG), config) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}

	configuration, err := service.GetOrgConfigurations(c.Req.Context(), c.OrgID, config)
	if err != nil {
		return response.Error(http.StatusInternalServerError, "failed to get org configurations", err)
	}
	return response.JSON(http.StatusOK, configuration)
}

func (service *Service) GetOrgConfigurations(ctx context.Context, orgId int64, config string) (resource.OrgConfiguration, error) {
	dto := &resource.GetOrgConfigurationMsg{
		OrgId: orgId,
		Type:  config,
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return resource.OrgConfiguration{}, errors.Wrap(err, "failed marshal update")
	}
	url := fmt.Sprintf("%sapi/orgs/%d/configurations/%s", service.cfg.ResourceHost, orgId, config)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(ctx, req); err != nil {
		return resource.OrgConfiguration{}, errors.Wrap(err, "failed to get org configurations")
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return resource.OrgConfiguration{}, errors.Wrap(err, "failed unmarshal error ")
		}
		return resource.OrgConfiguration{}, errors.New(errResponse.Message)
	}

	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return resource.OrgConfiguration{}, errors.Wrap(err, "failed unmarshal error ")
	}

	return dto.Result, nil
}
