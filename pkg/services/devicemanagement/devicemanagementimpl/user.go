package devicemanagementimpl

import (
	"context"
	"encoding/json"

	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/jayaraj/infra/nats"
	"github.com/jayaraj/infra/serviceerrors"
	"github.com/jayaraj/messages/client/user"
	"github.com/pkg/errors"

	NATS "github.com/nats-io/nats.go"
)

type getOrgUser struct {
	user devicemanagement.UserService
}

func (g *getOrgUser) Process(ctx context.Context, msg *NATS.Msg) nats.NatsResponse {
	response := nats.NewNatsResponse()

	request := &user.GetOrgUserMsg{}
	if err := json.Unmarshal(msg.Data, request); err != nil {
		response.SetError(serviceerrors.ErrExternalError, errors.Wrap(err, "parsing getOrgUser failed").Error())
		return *response
	}
	if err := g.user.GetOrgUser(ctx, request); err != nil {
		response.SetError(serviceerrors.ErrExternalError, errors.Wrap(err, "getOrgUser failed").Error())
		return *response
	}
	response.Reply = request
	return *response
}

type searchOrgUsers struct {
	user devicemanagement.UserService
}

func (s *searchOrgUsers) Process(ctx context.Context, msg *NATS.Msg) nats.NatsResponse {
	response := nats.NewNatsResponse()

	request := &user.SearchOrgUsersMsg{}
	if err := json.Unmarshal(msg.Data, request); err != nil {
		response.SetError(serviceerrors.ErrExternalError, errors.Wrap(err, "parsing searchOrgUsers failed").Error())
		return *response
	}
	if err := s.user.SearchOrgUsers(ctx, request); err != nil {
		response.SetError(serviceerrors.ErrExternalError, errors.Wrap(err, "searchOrgUsers failed").Error())
		return *response
	}
	response.Reply = request
	return *response
}

type searchUsersByOrgUsers struct {
	user devicemanagement.UserService
}

func (s *searchUsersByOrgUsers) Process(ctx context.Context, msg *NATS.Msg) nats.NatsResponse {
	response := nats.NewNatsResponse()

	request := &user.SearchUsersByOrgUsersMsg{}
	if err := json.Unmarshal(msg.Data, request); err != nil {
		response.SetError(serviceerrors.ErrExternalError, errors.Wrap(err, "parsing searchUsersByOrgUsers failed").Error())
		return *response
	}
	if err := s.user.SearchUsersByOrgUsers(ctx, request); err != nil {
		response.SetError(serviceerrors.ErrExternalError, errors.Wrap(err, "searchUsersByOrgUsers failed").Error())
		return *response
	}
	response.Reply = request
	return *response
}
