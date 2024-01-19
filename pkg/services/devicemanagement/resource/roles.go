package resource

import (
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/org"
)

const (
	ActionCreate     = "resources:create"
	ActionDelete     = "resources:delete"
	ActionRead       = "resources:read"
	ActionWrite      = "resources:write"
	ActionDeleteData = "resources.data:delete"
	ScopeRoot        = "resources"
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
	resourcesDataRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:resources.data:writer",
			DisplayName: "Resource data writer",
			Description: "Write or delete resources data",
			Group:       "Resources",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionDeleteData, Scope: ScopeAll},
			},
		},
		Grants: []string{accesscontrol.RoleGrafanaAdmin, string(org.RoleSuperAdmin)},
	}

	resourcesCreatorRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:resources:creator",
			DisplayName: "Resource creator",
			Description: "Create, read, write or delete resources",
			Group:       "Resources",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionCreate},
				{Action: ActionDelete, Scope: ScopeAll},
				{Action: ActionRead, Scope: ScopeAll},
				{Action: ActionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleEditor), string(org.RoleAdmin)},
	}

	resourcesWriterRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:resources:writer",
			DisplayName: "Resource writer",
			Description: "Read, write a resource",
			Group:       "Resources",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead, Scope: ScopeAll},
				{Action: ActionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleEditor)},
	}

	resourcesReaderRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:resources:reader",
			DisplayName: "Resource reader",
			Description: "Read resources",
			Group:       "Resources",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	return ac.DeclareFixedRoles(resourcesCreatorRole, resourcesWriterRole, resourcesReaderRole, resourcesDataRole)
}
