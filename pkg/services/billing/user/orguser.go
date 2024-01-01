package user

import (
	"context"
	"encoding/json"

	"github.com/jayaraj/messages/client"

	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/jayaraj/messages/client/org"
	"github.com/jayaraj/messages/client/user"
	"github.com/pkg/errors"
)

func (service *Service) DeleteOrg(ctx context.Context, msg *devicemanagement.DeleteOrgEvent) error {
	dto := org.DeleteOrgMsg{
		Id: msg.OrgId,
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return errors.Wrap(err, "marshal failed for delete org by Id")
	}
	if err := service.devMgmt.Publish(ctx, client.BillingTopic(org.DeleteOrg), body); err != nil {
		return errors.Wrap(err, "publish delete org failed for billing")
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
	if err := service.devMgmt.Publish(ctx, client.BillingTopic(user.DeleteOrgUser), body); err != nil {
		return errors.Wrap(err, "publish delete org_user failed for billing")
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
	if err := service.devMgmt.Publish(ctx, client.BillingTopic(user.DeleteUser), body); err != nil {
		return errors.Wrap(err, "publish delete user failed for billing")
	}
	return nil
}
