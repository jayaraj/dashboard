package configuration

import (
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/org"
)

const (
	ActionCreate   = "configurations:create"
	ActionDelete   = "configurations:delete"
	ActionRead     = "configurations:read"
	ActionWrite    = "configurations:write"
	ActionOrgRead  = "configurations.org:read"
	ActionOrgWrite = "configurations.org:write"
	ScopeRoot      = "configurations"
)

var (
	ScopeAll      = accesscontrol.GetResourceAllScope(ScopeRoot)
	ScopeProvider = accesscontrol.NewScopeProvider(ScopeRoot)
)

func (service *Service) declareFixedRoles(ac accesscontrol.Service) error {

	configurationsCreatorRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:configurations:creator",
			DisplayName: "Configuration creator",
			Description: "Create, read, write or delete configurations",
			Group:       "Configurations",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionCreate},
				{Action: ActionDelete, Scope: ScopeAll},
				{Action: ActionRead, Scope: ScopeAll},
				{Action: ActionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{accesscontrol.RoleGrafanaAdmin, string(org.RoleSuperAdmin)},
	}

	configurationsWriterRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:configurations:writer",
			DisplayName: "Configuration writer",
			Description: "Read, write a configuration types",
			Group:       "Configurations",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead, Scope: ScopeAll},
				{Action: ActionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{accesscontrol.RoleGrafanaAdmin, string(org.RoleSuperAdmin)},
	}

	orgConfigurationsWriterRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:configurations.org:writer",
			DisplayName: "Org Configuration writer",
			Description: "Read, write a org configurations",
			Group:       "Configurations",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionOrgRead, Scope: ScopeAll},
				{Action: ActionOrgWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	configurationsReaderRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:configurations:reader",
			DisplayName: "Configuration reader",
			Description: "Read configurations",
			Group:       "Configurations",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead},
				{Action: ActionOrgRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	return ac.DeclareFixedRoles(configurationsCreatorRole, configurationsWriterRole, configurationsReaderRole, orgConfigurationsWriterRole)
}
