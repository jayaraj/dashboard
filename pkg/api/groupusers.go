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
	"github.com/grafana/grafana/pkg/services/user"
	"github.com/grafana/grafana/pkg/web"
)

func (hs *HTTPServer) UpdateResourceServiceOrgUser(ctx context.Context, orgId int64, userId int64) error {
	query := models.GetUserProfileQuery{UserId: userId}
	if err := hs.SQLStore.GetUserProfile(ctx, &query); err != nil {
		return err
	}
	roleMsg := models.GetOrgUserRoleMsg{UserId: userId, OrgId: query.Result.OrgId}
	if err := hs.SQLStore.GetOrgUserRole(ctx, &roleMsg); err != nil {
		return err
	}

	updateUser := dtos.UpdateOrgUserMsg{
		Login: query.Result.Login,
		Email: query.Result.Email,
		Phone: query.Result.Phone,
		Name:  query.Result.Name,
		Role:  dtos.ConvertRoleToString(roleMsg.Result),
	}
	body, err := json.Marshal(&updateUser)
	if err != nil {
		return err
	}
	url := fmt.Sprintf("%sapi/orgs/%d/users/%d", hs.ResourceService.GetConfig().ResourceUrl, orgId, userId)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPut,
	}
	if err := hs.ResourceService.RestRequest(ctx, req); err != nil {
		return err
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return err
		}
		return errors.New(errResponse.Message)
	}
	return nil
}

func (hs *HTTPServer) DeleteResourceServiceOrgUser(ctx context.Context, orgId int64, userId int64) error {
	url := fmt.Sprintf("%sapi/orgs/%d/users/%d", hs.ResourceService.GetConfig().ResourceUrl, orgId, userId)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodDelete,
	}
	if err := hs.ResourceService.RestRequest(ctx, req); err != nil {
		return err
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return err
		}
		return errors.New(errResponse.Message)
	}
	return nil
}

func (hs *HTTPServer) UpdateResourceServiceUser(ctx context.Context, userId int64) error {
	query := models.GetUserProfileQuery{UserId: userId}
	if err := hs.SQLStore.GetUserProfile(ctx, &query); err != nil {
		return err
	}

	updateUser := dtos.UpdateUserMsg{
		Login: query.Result.Login,
		Email: query.Result.Email,
		Phone: query.Result.Phone,
		Name:  query.Result.Name,
	}
	body, err := json.Marshal(&updateUser)
	if err != nil {
		return err
	}
	url := fmt.Sprintf("%sapi/users/%d", hs.ResourceService.GetConfig().ResourceUrl, userId)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPut,
	}
	if err := hs.ResourceService.RestRequest(ctx, req); err != nil {
		return err
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return err
		}
		return errors.New(errResponse.Message)
	}
	return nil
}

func (hs *HTTPServer) DeleteResourceServiceUser(ctx context.Context, userId int64) error {
	url := fmt.Sprintf("%sapi/users/%d", hs.ResourceService.GetConfig().ResourceUrl, userId)
	req := &resources.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodDelete,
	}
	if err := hs.ResourceService.RestRequest(ctx, req); err != nil {
		return err
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return err
		}
		return errors.New(errResponse.Message)
	}
	return nil
}

func (hs *HTTPServer) DeleteGroupUsers(c *models.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":id"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	url := fmt.Sprintf("%sapi/groupusers/%d", hs.ResourceService.GetConfig().ResourceUrl, id)
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

func (hs *HTTPServer) AddGroupUsers(c *models.ReqContext) response.Response {
	orgUser := dtos.AddGroupUserMsg{
		OrgId: c.OrgID,
		User: dtos.User{
			UserId: c.UserID,
			OrgId:  c.OrgID,
			Role:   dtos.ConvertRoleToString(hs.UserRole(c)),
		},
	}
	if err := web.Bind(c.Req, &orgUser); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}

	query := models.GetUserProfileQuery{UserId: orgUser.UserId}

	if err := hs.SQLStore.GetUserProfile(c.Req.Context(), &query); err != nil {
		if errors.Is(err, user.ErrUserNotFound) {
			return response.Error(404, user.ErrUserNotFound.Error(), nil)
		}
		return response.Error(500, "Failed to get user", err)
	}

	roleMsg := models.GetOrgUserRoleMsg{UserId: orgUser.UserId, OrgId: query.Result.OrgId}

	if err := hs.SQLStore.GetOrgUserRole(c.Req.Context(), &roleMsg); err != nil {
		if errors.Is(err, models.ErrOrgUserNotFound) {
			return response.Error(404, models.ErrOrgUserNotFound.Error(), nil)
		}
		return response.Error(500, "Failed to get org user", err)
	}
	orgUser.Email = query.Result.Email
	orgUser.Phone = query.Result.Phone
	orgUser.Login = query.Result.Login
	orgUser.Name = query.Result.Name
	orgUser.Role = dtos.ConvertRoleToString(roleMsg.Result)
	body, err := json.Marshal(&orgUser)
	if err != nil {
		return response.Error(500, "failed marshal create group", err)
	}
	url := fmt.Sprintf("%sapi/groupusers", hs.ResourceService.GetConfig().ResourceUrl)
	req := &resources.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
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

	return response.Success("added")
}
