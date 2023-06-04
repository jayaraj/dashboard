package dtos

import (
	"time"

	"github.com/grafana/grafana/pkg/services/org"
)

func ConvertRoleToString(role org.RoleType) string {
	return map[org.RoleType]string{
		org.RoleViewer:     "ROLE_VIEWER",
		org.RoleEditor:     "ROLE_EDITOR",
		org.RoleAdmin:      "ROLE_ADMIN",
		org.RoleSuperAdmin: "ROLE_SUPERADMIN",
	}[role]
}

func ConvertStringToRole(role string) org.RoleType {
	return map[string]org.RoleType{
		"ROLE_VIEWER":     org.RoleViewer,
		"ROLE_EDITOR":     org.RoleEditor,
		"ROLE_ADMIN":      org.RoleAdmin,
		"ROLE_SUPERADMIN": org.RoleSuperAdmin,
	}[role]
}

type Groups struct {
	Count   int64   `json:"count"`
	Groups  []Group `json:"groups"`
	Page    int64   `json:"page"`
	PerPage int64   `json:"perPage"`
}

type Group struct {
	Id        int64     `json:"id"`
	UpdatedAt time.Time `json:"updated_at"`
	Name      string    `json:"name"`
	Type      string    `json:"type"`
	Path      string    `json:"path"`
	OrgId     int64     `json:"org_id"`
	Parent    *int64    `json:"parent,omitempty"`
	Child     *bool     `json:"child,omitempty"`
	Level     int64     `json:"level"`
	Groups    []Group   `json:"groups,omitempty"`
}

type IsGroupAccessibleMsg struct {
	GroupId int64 `json:"-"`
	User    User  `json:"user" binding:"required"`
	Result  bool  `json:"-"`
}

type UpdateUserMsg struct {
	Login string `json:"login"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
}

type AddGroupResourceMsg struct {
	User       User  `json:"user,omitempty"`
	GroupId    int64 `json:"group_id,omitempty"`
	ResourceId int64 `json:"resource_id,omitempty"`
}

type CreateGroupMsg struct {
	Name          string                 `json:"name" binding:"required"`
	Type          string                 `json:"type"`
	OrgId         int64                  `json:"org_id"`
	Parent        *int64                 `json:"parent,omitempty"`
	Configuration map[string]interface{} `json:"configuration" binding:"Required"`
	Result        Group                  `json:"-"`
}

type UpdateGroupMsg struct {
	Id   int64  `json:"-"`
	Name string `json:"name" binding:"required"`
	Type string `json:"type"`
}

type GetGroupByIdMsg struct {
	Id     int64 `json:"-"`
	Result Group `json:"-"`
}

type GetGroupsMsg struct {
	User    User   `json:"user"`
	Parent  int64  `json:"parent"`
	Page    int64  `json:"page"`
	PerPage int64  `json:"perPage"`
	Result  Groups `json:"-"`
}

type GetParentGroupsMsg struct {
	GroupId int64 `json:"-"`
	User    User  `json:"user"`
	Result  Group `json:"-"`
}

type GroupResources struct {
	Count          int64           `json:"count"`
	GroupResources []GroupResource `json:"group_resources"`
	Page           int64           `json:"page"`
	PerPage        int64           `json:"perPage"`
}

type GroupResource struct {
	Id           int64     `json:"id"`
	UpdatedAt    time.Time `json:"updated_at"`
	ResourceId   int64     `json:"resource_id"`
	ResourceUUID string    `json:"resource_uuid"`
	ResourceName string    `json:"resource_name"`
	ResourceType string    `json:"resource_type"`
}

type CreateGroupResourceMsg struct {
	GroupId       int64                  `json:"group_id"`
	OrgId         int64                  `json:"org_id"`
	UUID          string                 `json:"uuid" binding:"Required"`
	Name          string                 `json:"name" binding:"Required"`
	Type          string                 `json:"type" binding:"Required"`
	ImageUrl      string                 `json:"image_url"`
	Configuration map[string]interface{} `json:"configuration" binding:"Required"`
	Latitude      *float64               `json:"latitude,omitempty"`
	Longitude     *float64               `json:"longitude,omitempty"`
	Result        Resource               `json:"-"`
}

type GetGroupResourcesMsg struct {
	GroupId int64          `json:"group_id"`
	Query   string         `json:"query"`
	Page    int64          `json:"page"`
	PerPage int64          `json:"perPage"`
	Result  GroupResources `json:"-"`
}

type GetGroupUsersMsg struct {
	GroupId int64      `json:"group_id"`
	Query   string     `json:"query"`
	Page    int64      `json:"page"`
	PerPage int64      `json:"perPage"`
	Result  Groupusers `json:"-"`
}

type Groupusers struct {
	Count      int64       `json:"count"`
	Groupusers []GroupUser `json:"group_users"`
	Page       int64       `json:"page"`
	PerPage    int64       `json:"perPage"`
}

type GroupUser struct {
	Id        int64     `json:"id"`
	UpdatedAt time.Time `json:"updated_at"`
	UserId    int64     `json:"user_id"`
	Login     string    `json:"login"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Role      string    `json:"role"`
}

type AddGroupUserMsg struct {
	GroupId   int64  `json:"group_id"`
	GroupPath string `json:"group_path"`
	User      User   `json:"user"`
	UserId    int64  `json:"user_id"`
	Login     string `json:"login"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	Role      string `json:"role"`
}
