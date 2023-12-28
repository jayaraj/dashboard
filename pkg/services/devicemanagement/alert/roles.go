package alert

import (
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/org"
)

const (
	ActionDefinitionCreate = "alerts.definition:create"
	ActionDefinitionDelete = "alerts.definition:delete"
	ActionDefinitionRead   = "alerts.definition:read"
	ActionDefinitionWrite  = "alerts.definition:write"
	ActionRead             = "alerts:read"
	ActionWrite            = "alerts:write"
	ActionNotificationRead = "alerts.notification:read"
	ScopeRoot              = "alerts"
)

var (
	ScopeAll      = accesscontrol.GetResourceAllScope(ScopeRoot)
	ScopeProvider = accesscontrol.NewScopeProvider(ScopeRoot)

	ReadPageAccess = accesscontrol.EvalAll(
		accesscontrol.EvalAny(
			accesscontrol.EvalPermission(ActionDefinitionRead),
			accesscontrol.EvalPermission(ActionDefinitionCreate),
			accesscontrol.EvalPermission(ActionDefinitionDelete),
			accesscontrol.EvalPermission(ActionDefinitionWrite),
		),
	)
	NewPageAccess = accesscontrol.EvalAll(
		accesscontrol.EvalPermission(ActionDefinitionDelete),
		accesscontrol.EvalPermission(ActionDefinitionCreate),
	)
	EditPageAccess = accesscontrol.EvalAll(
		accesscontrol.EvalAny(
			accesscontrol.EvalPermission(ActionDefinitionRead),
			accesscontrol.EvalPermission(ActionDefinitionWrite),
		),
	)
)

func (service *Service) declareFixedRoles(ac accesscontrol.Service) error {

	alertDefinitionsCreatorRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:alerts.definition:creator",
			DisplayName: "Alert Definition creator",
			Description: "Create, read, write or delete alert definitions",
			Group:       "Alerts",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionDefinitionCreate},
				{Action: ActionDefinitionDelete, Scope: ScopeAll},
				{Action: ActionDefinitionRead, Scope: ScopeAll},
				{Action: ActionDefinitionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{accesscontrol.RoleGrafanaAdmin, string(org.RoleSuperAdmin)},
	}

	alertDefinitionsWriterRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:alerts.definition:writer",
			DisplayName: "Alert Definition  writer",
			Description: "Read, write a alert definitions",
			Group:       "Alerts",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionDefinitionRead, Scope: ScopeAll},
				{Action: ActionDefinitionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{accesscontrol.RoleGrafanaAdmin, string(org.RoleSuperAdmin)},
	}

	alertDefinitionsReaderRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:alerts.definition:reader",
			DisplayName: "Alert Definition reader",
			Description: "Read alert definitions",
			Group:       "Alerts",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionDefinitionRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	alertsWriterRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:alerts:writer",
			DisplayName: "Alerts writer",
			Description: "Read, write alerts",
			Group:       "Alerts",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead, Scope: ScopeAll},
				{Action: ActionWrite, Scope: ScopeAll},
			},
		},
		Grants: []string{string(org.RoleEditor)},
	}

	alertsReaderRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:alerts:reader",
			DisplayName: "Alert reader",
			Description: "Read alerts",
			Group:       "Alerts",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	alertNotificationsReaderRole := accesscontrol.RoleRegistration{
		Role: accesscontrol.RoleDTO{
			Name:        "fixed:alerts.notification:reader",
			DisplayName: "Alert Notification reader",
			Description: "Read alert notifications",
			Group:       "Alerts",
			Version:     2,
			Permissions: []accesscontrol.Permission{
				{Action: ActionNotificationRead},
			},
		},
		Grants: []string{accesscontrol.RoleGrafanaAdmin, string(org.RoleSuperAdmin)},
	}
	return ac.DeclareFixedRoles(alertDefinitionsCreatorRole, alertDefinitionsWriterRole, alertDefinitionsReaderRole, alertsWriterRole, alertsReaderRole, alertNotificationsReaderRole)
}
