package user

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/infra/db"
	"github.com/grafana/grafana/pkg/models/roletype"
	"github.com/jayaraj/infra/serviceerrors"
	"github.com/jayaraj/messages/client"

	"github.com/grafana/grafana/pkg/services/devicemanagement"
	ORG "github.com/grafana/grafana/pkg/services/org"
	USER "github.com/grafana/grafana/pkg/services/user"
	"github.com/jayaraj/messages/client/org"
	"github.com/jayaraj/messages/client/user"
	"github.com/pkg/errors"
)

func (service *Service) UpdateOrgUser(ctx context.Context, msg *devicemanagement.UpdateOrgUserEvent) error {

	userMsg := user.GetOrgUserMsg{
		UserId: msg.UserId,
		OrgId:  msg.OrgId,
	}
	if err := service.GetOrgUser(ctx, &userMsg); err != nil {
		return err
	}
	dto := user.UpdateOrgUserMsg{
		Login:  userMsg.Result.Login,
		Email:  userMsg.Result.Email,
		Name:   userMsg.Result.Name,
		Phone:  userMsg.Result.Phone,
		Role:   devicemanagement.ConvertRoleToString(roletype.RoleType(userMsg.Result.Role)),
		OrgId:  userMsg.Result.OrgId,
		UserId: userMsg.Result.UserId,
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return errors.Wrap(err, "marshal failed for update org user")
	}
	url := fmt.Sprintf("%sapi/orgs/%d/users/%d", service.cfg.ResourceHost, msg.OrgId, msg.UserId)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPut,
	}
	if err := service.devMgmt.RestRequest(ctx, req); err != nil {
		return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrap(err, "failed to update"))
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrap(err, "failed unmarshal error"))
		}
		return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.New(errResponse.Message))
	}
	return nil
}

func (service *Service) UpdateUser(ctx context.Context, msg *devicemanagement.UpdateUserEvent) error {
	userMsg, err := service.GetUser(ctx, msg.UserId)
	if err != nil {
		return err
	}

	dto := user.UpdateUserMsg{
		Login:  userMsg.Login,
		Email:  userMsg.Email,
		Name:   userMsg.Name,
		Phone:  userMsg.Phone,
		UserId: userMsg.ID,
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return errors.Wrap(err, "marshal failed for update org user")
	}
	url := fmt.Sprintf("%sapi/users/%d", service.cfg.ResourceHost, msg.UserId)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPut,
	}
	if err := service.devMgmt.RestRequest(ctx, req); err != nil {
		return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrap(err, "failed to update"))
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrap(err, "failed unmarshal error"))
		}
		return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.New(errResponse.Message))
	}
	return nil
}

func (service *Service) DeleteOrg(ctx context.Context, msg *devicemanagement.DeleteOrgEvent) error {
	dto := org.DeleteOrgMsg{
		Id: msg.OrgId,
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return errors.Wrap(err, "marshal failed for delete org by Id")
	}
	if err := service.devMgmt.Publish(ctx, client.ResourcesTopic(org.DeleteOrg), body); err != nil {
		return errors.Wrap(err, "publish delete org failed for resources")
	}
	if err := service.devMgmt.Publish(ctx, client.ReaderTopic(org.DeleteOrg), body); err != nil {
		return errors.Wrap(err, "publish delete org failed for reader")
	}
	if err := service.devMgmt.Publish(ctx, client.WriterTopic(org.DeleteOrg), body); err != nil {
		return errors.Wrap(err, "publish delete org failed for writer")
	}

	return nil
}

func (service *Service) DeleteOrgUser(ctx context.Context, msg *devicemanagement.DeleteOrgUserEvent) error {
	dto := user.DeleteOrgUserMsg{
		OrgId:  msg.OrgId,
		UserId: msg.UserId,
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return errors.Wrap(err, "marshal failed for delete org_user")
	}
	if err := service.devMgmt.Publish(ctx, client.ResourcesTopic(user.DeleteOrgUser), body); err != nil {
		return errors.Wrap(err, "publish delete org_user failed for resources")
	}
	if err := service.devMgmt.Publish(ctx, client.ReaderTopic(user.DeleteOrgUser), body); err != nil {
		return errors.Wrap(err, "publish delete user failed for reader")
	}
	if err := service.devMgmt.Publish(ctx, client.WriterTopic(user.DeleteOrgUser), body); err != nil {
		return errors.Wrap(err, "publish delete user failed for writer")
	}
	return nil
}

func (service *Service) DeleteUser(ctx context.Context, msg *devicemanagement.DeleteUserEvent) error {
	dto := user.DeleteUserMsg{
		UserId: msg.UserId,
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return errors.Wrap(err, "marshal failed for delete user")
	}
	if err := service.devMgmt.Publish(ctx, client.ResourcesTopic(user.DeleteUser), body); err != nil {
		return errors.Wrap(err, "publish delete user failed for resources")
	}
	if err := service.devMgmt.Publish(ctx, client.ReaderTopic(user.DeleteUser), body); err != nil {
		return errors.Wrap(err, "publish delete user failed for reader")
	}
	if err := service.devMgmt.Publish(ctx, client.WriterTopic(user.DeleteUser), body); err != nil {
		return errors.Wrap(err, "publish delete user failed for writer")
	}
	return nil
}

func (service *Service) GetOrgUser(ctx context.Context, msg *user.GetOrgUserMsg) error {
	return service.db.WithDbSession(ctx, func(dbSession *db.Session) error {
		sess := dbSession.Table("org_user").
			Join("INNER", []string{service.dialect.Quote("user"), "u"}, "org_user.user_id=u.id").
			Where("org_user.org_id = ? AND org_user.user_id = ?", msg.OrgId, msg.UserId).
			Cols(
				"org_user.org_id",
				"org_user.user_id",
				"u.email",
				"u.name",
				"u.phone",
				"u.login",
				"org_user.role",
				"u.last_seen_at",
				"u.created",
				"u.updated",
				"u.is_disabled",
			)

		has, err := sess.Get(&msg.Result)
		if err != nil {
			return err
		}
		if !has {
			return serviceerrors.NewServiceError(serviceerrors.ErrNotFound, errors.New("user not found"))
		}
		msg.Result.AvatarURL = dtos.GetGravatarUrl(msg.Result.Email)
		return nil
	})
}

func (service *Service) GetUser(ctx context.Context, userId int64) (USER.UserProfileDTO, error) {
	response := USER.UserProfileDTO{}
	err := service.db.WithDbSession(ctx, func(dbSession *db.Session) error {
		var usr USER.User
		has, err := dbSession.ID(userId).Get(&usr)
		if !has {
			return serviceerrors.NewServiceError(serviceerrors.ErrNotFound, err)
		}
		response = USER.UserProfileDTO{
			ID:             usr.ID,
			Name:           usr.Name,
			Email:          usr.Email,
			Login:          usr.Login,
			Phone:          usr.Phone,
			Theme:          usr.Theme,
			IsGrafanaAdmin: usr.IsAdmin,
			IsDisabled:     usr.IsDisabled,
			OrgID:          usr.OrgID,
			AvatarURL:      dtos.GetGravatarUrl(usr.Email),
			UpdatedAt:      usr.Updated,
			CreatedAt:      usr.Created,
		}
		return nil
	})
	return response, serviceerrors.NewServiceError(serviceerrors.ErrExternalError, errors.Wrap(err, "failed getting user"))
}

func (service *Service) SearchOrgUsers(ctx context.Context, msg *user.SearchOrgUsersMsg) error {
	return service.db.WithDbSession(ctx, func(dbSession *db.Session) error {
		msg.Result = user.Users{
			Users: make([]user.User, 0),
		}
		queryWithWildcards := "%" + msg.Query + "%"
		offset := msg.PerPage * (msg.Page - 1)
		sess := dbSession.Table("org_user").
			Join("INNER", []string{service.dialect.Quote("user"), "u"}, "org_user.user_id=u.id").
			Where("org_user.org_id = ?", msg.OrgId).
			Where("(LOWER(email) "+service.dialect.LikeStr()+" LOWER(?) OR LOWER(name) "+service.dialect.LikeStr()+" LOWER(?) OR LOWER(login) "+service.dialect.LikeStr()+" LOWER(?))", queryWithWildcards, queryWithWildcards, queryWithWildcards)

		sess.Cols(
			"org_user.org_id",
			"org_user.user_id",
			"u.email",
			"u.name",
			"u.phone",
			"u.login",
			"org_user.role",
			"u.last_seen_at",
			"u.created",
			"u.updated",
			"u.is_disabled",
		).Limit(int(msg.PerPage), int(offset))
		err := sess.Find(&msg.Result.Users)
		if err != nil {
			return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, err)
		}

		orgUser := ORG.OrgUser{}
		countSess := dbSession.Table("org_user").
			Join("INNER", []string{service.dialect.Quote("user"), "u"}, "org_user.user_id=u.id").
			Where("org_user.org_id = ?", msg.OrgId).
			Where("(LOWER(email) "+service.dialect.LikeStr()+" LOWER(?) OR LOWER(name) "+service.dialect.LikeStr()+" LOWER(?) OR LOWER(login) "+service.dialect.LikeStr()+" LOWER(?))", queryWithWildcards, queryWithWildcards, queryWithWildcards)

		count, err := countSess.Count(&orgUser)
		if err != nil {
			return err
		}
		msg.Result.Count = count
		msg.Result.Page = msg.Page
		msg.Result.PerPage = msg.PerPage
		return nil
	})
}

func (service *Service) SearchUsersByOrgUsers(ctx context.Context, msg *user.SearchUsersByOrgUsersMsg) error {
	return service.db.WithDbSession(ctx, func(dbSession *db.Session) error {
		msg.Result = user.Users{
			Users: make([]user.User, 0),
		}
		if len(msg.UserIds) == 0 {
			msg.Result.Count = 0
			msg.Result.Page = 1
			msg.Result.PerPage = 0
			return nil
		}
		sess := dbSession.Table("org_user").
			Join("INNER", []string{service.dialect.Quote("user"), "u"}, "org_user.user_id=u.id").
			Where(fmt.Sprintf("org_user.org_id IN (%s)", strings.Trim(strings.Join(strings.Fields(fmt.Sprint(msg.UserIds)), ","), "[]")))

		sess.Cols(
			"org_user.org_id",
			"org_user.user_id",
			"u.email",
			"u.name",
			"u.phone",
			"u.login",
			"org_user.role",
			"u.last_seen_at",
			"u.created",
			"u.updated",
			"u.is_disabled",
		)
		err := sess.Find(&msg.Result.Users)
		if err != nil {
			return serviceerrors.NewServiceError(serviceerrors.ErrExternalError, err)
		}
		msg.Result.Count = int64(len(msg.Result.Users))
		msg.Result.Page = 1
		msg.Result.PerPage = int64(len(msg.Result.Users))
		return nil
	})
}
