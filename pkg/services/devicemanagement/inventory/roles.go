package inventory

import (
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/org"
)

const (
	ActionCreate = "inventories:create"
	ActionDelete = "inventories:delete"
	ActionRead   = "inventories:read"
	ActionWrite  = "inventories:write"
	ScopeRoot    = "inventories"
)

var (
	ScopeAll      = accesscontrol.GetResourceAllScope(ScopeRoot)
	ScopeProvider = accesscontrol.NewScopeProvider(ScopeRoot)
)

func (service *Service) declareFixedRoles(ac accesscontrol.Service) error {

	inventoriesCreatorRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:inventories:creator",
			DisplayName: "Inventory creator",
			Description: "Create, read, write or delete inventories",
			Group:       "Inventories",
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

	inventoriesWriterRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:inventories:writer",
			DisplayName: "Inventory writer",
			Description: "Read, write a inventory",
			Group:       "Inventories",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead, Scope: ScopeAll},
				{Action: ActionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleEditor)},
	}

	inventoriesReaderRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:inventories:reader",
			DisplayName: "Inventory reader",
			Description: "Read inventories",
			Group:       "Inventories",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	return ac.DeclareFixedRoles(inventoriesCreatorRole, inventoriesWriterRole, inventoriesReaderRole)
}
