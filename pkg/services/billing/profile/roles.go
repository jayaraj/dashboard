package profile

import (
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/org"
)

const (
	ActionCreate = "profiles:create"
	ActionDelete = "profiles:delete"
	ActionRead   = "profiles:read"
	ActionWrite  = "profiles:write"
	ScopeRoot    = "profiles"
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

	profilesCreatorRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:profiles:creator",
			DisplayName: "Profile & slabs creator",
			Description: "Create, read, write or delete profiles and slabs",
			Group:       "Profiles",
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

	profilesWriterRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:profiles:writer",
			DisplayName: "Profile & slabs writer",
			Description: "Read, write a profile or slab",
			Group:       "Profiles",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead, Scope: ScopeAll},
				{Action: ActionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	profilesReaderRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:profiles:reader",
			DisplayName: "Profile reader",
			Description: "Read profiles or slabs",
			Group:       "Profiles",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	return ac.DeclareFixedRoles(profilesCreatorRole, profilesWriterRole, profilesReaderRole)
}
