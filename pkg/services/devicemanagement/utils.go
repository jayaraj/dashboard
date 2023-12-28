package devicemanagement

import (
	"github.com/grafana/grafana/pkg/models/roletype"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
)

func ConvertRoleToStringFromCtx(c *contextmodel.ReqContext) string {
	if c.IsGrafanaAdmin {
		return "ROLE_SUPERADMIN"
	}
	return ConvertRoleToString(c.OrgRole)
}

func ConvertRoleToString(role roletype.RoleType) string {
	return map[roletype.RoleType]string{
		roletype.RoleViewer:     "ROLE_VIEWER",
		roletype.RoleEditor:     "ROLE_EDITOR",
		roletype.RoleAdmin:      "ROLE_ADMIN",
		roletype.RoleSuperAdmin: "ROLE_SUPERADMIN",
	}[role]
}

func ConvertStringToRole(role string) roletype.RoleType {
	return map[string]roletype.RoleType{
		"ROLE_VIEWER":     roletype.RoleViewer,
		"ROLE_EDITOR":     roletype.RoleEditor,
		"ROLE_ADMIN":      roletype.RoleAdmin,
		"ROLE_SUPERADMIN": roletype.RoleSuperAdmin,
	}[role]
}
