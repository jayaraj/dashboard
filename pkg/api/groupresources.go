package api

import (
	"context"
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

func (hs *HTTPServer) DeleteGroupResource(c *models.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":id"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	url := fmt.Sprintf("%sapi/groupresources/%d", hs.ResourceService.GetConfig().ResourceUrl, id)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodDelete,
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
	return response.Success("deleted")
}

func (hs *HTTPServer) GetResourceByUUID(ctx context.Context, uuid string) (dtos.Resource, error) {
	resource := dtos.Resource{}
	url := fmt.Sprintf("%sapi/resources/uuid/%s", hs.ResourceService.GetConfig().ResourceUrl, uuid)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := hs.ResourceService.RestRequest(ctx, req); err != nil {
		return resource, err
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return resource, err
		}
		return resource, errors.New(errResponse.Message)
	}
	if err := json.Unmarshal(req.Response, &resource); err != nil {
		return resource, err
	}
	return resource, nil
}

func (hs *HTTPServer) AddGroupResources(c *models.ReqContext) response.Response {
	access, groupId := hs.IsGroupAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	uuid := web.Params(c.Req)[":uuid"]
	resource, err := hs.GetResourceByUUID(c.Req.Context(), uuid)
	if err != nil {
		return response.Error(http.StatusNotFound, "uuid is not found", err)
	}
	if !hs.isResourceAccessible(c, resource.Id) {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}

	dto := dtos.AddGroupResourceMsg{
		GroupId:    groupId,
		ResourceId: resource.Id,
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
		},
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal add", err)
	}
	url := fmt.Sprintf("%sapi/groupresources", hs.ResourceService.GetConfig().ResourceUrl)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := hs.ResourceService.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to add", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	return response.Success("added")
}
