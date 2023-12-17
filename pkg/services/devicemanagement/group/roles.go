package group

import (
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/org"
)

const (
	ActionCreate = "groups:create"
	ActionDelete = "groups:delete"
	ActionRead   = "groups:read"
	ActionWrite  = "groups:write"
	ScopeRoot    = "groups"
)

var (
	ScopeAll      = accesscontrol.GetResourceAllScope(ScopeRoot)
	ScopeProvider = accesscontrol.NewScopeProvider(ScopeRoot)
)

func (service *Service) declareFixedRoles(ac accesscontrol.Service) error {

	groupsCreatorRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:groups:creator",
			DisplayName: "Group creator",
			Description: "Create, read, write or delete groups",
			Group:       "Groups",
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

	groupsWriterRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:groups:writer",
			DisplayName: "Group writer",
			Description: "Read, write a group",
			Group:       "Groups",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead, Scope: ScopeAll},
				{Action: ActionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleEditor)},
	}

	groupsReaderRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:groups:reader",
			DisplayName: "Group reader",
			Description: "Read groups",
			Group:       "Groups",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	return ac.DeclareFixedRoles(groupsCreatorRole, groupsWriterRole, groupsReaderRole)
}
