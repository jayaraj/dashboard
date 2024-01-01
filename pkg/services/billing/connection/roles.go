package connection

import (
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/org"
)

const (
	ActionCreate = "connections:create"
	ActionDelete = "connections:delete"
	ActionRead   = "connections:read"
	ActionWrite  = "connections:write"
	ScopeRoot    = "connections"
)

var (
	ScopeAll      = accesscontrol.GetResourceAllScope(ScopeRoot)
	ScopeProvider = accesscontrol.NewScopeProvider(ScopeRoot)

	ReadPageAccess = accesscontrol.EvalAll(
		accesscontrol.EvalAny(
			accesscontrol.EvalPermission(ActionRead),
			accesscontrol.EvalPermission(ActionCreate),
			accesscontrol.EvalPermission(ActionDelete),
			accesscontrol.EvalPermission(ActionWrite),
		),
	)
	NewPageAccess = accesscontrol.EvalAll(
		accesscontrol.EvalPermission(ActionDelete),
		accesscontrol.EvalPermission(ActionCreate),
	)
	EditPageAccess = accesscontrol.EvalAll(
		accesscontrol.EvalAny(
			accesscontrol.EvalPermission(ActionRead),
			accesscontrol.EvalPermission(ActionWrite),
		),
	)
)

func (service *Service) declareFixedRoles(ac accesscontrol.Service) error {

	connectionsCreatorRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:connections:creator",
			DisplayName: "Connection creator",
			Description: "Create, read, write or delete connections",
			Group:       "Connections",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionCreate},
				{Action: ActionDelete, Scope: ScopeAll},
				{Action: ActionRead, Scope: ScopeAll},
				{Action: ActionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleEditor)},
	}

	connectionsWriterRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:connections:writer",
			DisplayName: "Connection writer",
			Description: "Read, write a connection",
			Group:       "Connections",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead, Scope: ScopeAll},
				{Action: ActionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleEditor)},
	}

	connectionsReaderRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:connections:reader",
			DisplayName: "Connection reader",
			Description: "Read connections",
			Group:       "Connections",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	return ac.DeclareFixedRoles(connectionsCreatorRole, connectionsWriterRole, connectionsReaderRole)
}
