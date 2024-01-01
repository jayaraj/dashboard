package fixedcharge

import (
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/org"
)

const (
	ActionCreate = "fixedcharges:create"
	ActionDelete = "fixedcharges:delete"
	ActionRead   = "fixedcharges:read"
	ActionWrite  = "fixedcharges:write"
	ScopeRoot    = "fixedcharges"
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

	fixedchargesCreatorRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:fixedcharges:creator",
			DisplayName: "Fixed charges creator",
			Description: "Create, read, write or delete fixed charges",
			Group:       "FixedCharges",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionCreate},
				{Action: ActionDelete, Scope: ScopeAll},
				{Action: ActionRead, Scope: ScopeAll},
				{Action: ActionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	fixedchargesWriterRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:fixedcharges:writer",
			DisplayName: "Fixed charges writer",
			Description: "Read, write a fixed charge",
			Group:       "FixedCharges",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead, Scope: ScopeAll},
				{Action: ActionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	fixedchargesReaderRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:fixedcharges:reader",
			DisplayName: "Fixed charges reader",
			Description: "Read fixed charges",
			Group:       "FixedCharges",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	return ac.DeclareFixedRoles(fixedchargesCreatorRole, fixedchargesWriterRole, fixedchargesReaderRole)
}
