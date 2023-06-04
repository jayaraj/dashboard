package dtos

import "time"

type Resource struct {
	Id           int64     `json:"id"`
	UpdatedAt    time.Time `json:"updated_at"`
	OrgId        int64     `json:"org_id"`
	UUID         string    `json:"uuid"`
	Name         string    `json:"name"`
	Type         string    `json:"type"`
	ImageUrl     string    `json:"image_url"`
	Latitude     *float64  `json:"latitude,omitempty"`
	Longitude    *float64  `json:"longitude,omitempty"`
	OnlineStatus *bool     `json:"online_status,omitempty"`
}

type User struct {
	UserId int64  `json:"user_id" binding:"required"`
	OrgId  int64  `json:"org_id" binding:"required"`
	Role   string `json:"role" binding:"required"`
}

type CreateResourceMsg struct {
	OrgId         int64                  `json:"org_id"`
	UUID          string                 `json:"uuid" binding:"Required"`
	Name          string                 `json:"name" binding:"Required"`
	Type          string                 `json:"type" binding:"Required"`
	ImageUrl      string                 `json:"image_url,omitempty"`
	Latitude      *float64               `json:"latitude,omitempty"`
	Longitude     *float64               `json:"longitude,omitempty"`
	Configuration map[string]interface{} `json:"configuration" binding:"Required"`
	Result        Resource               `json:"-"`
}

type UpdateResourceMsg struct {
	Id        int64    `json:"-"`
	UUID      string   `json:"uuid" binding:"required"`
	Name      string   `json:"name" binding:"required"`
	ImageUrl  string   `json:"image_url,omitempty"`
	Latitude  *float64 `json:"latitude,omitempty"`
	Longitude *float64 `json:"longitude,omitempty"`
}

type CloneResourceMsg struct {
	Id     int64    `json:"-"`
	Result Resource `json:"-"`
}

type GetResourceByIdMsg struct {
	Id     int64    `json:"-"`
	Result Resource `json:"-"`
}

type SearchResourceMsg struct {
	Query   string    `json:"query"`
	User    User      `json:"user" binding:"required"`
	Page    int64     `json:"page" binding:"required"`
	PerPage int64     `json:"perPage" binding:"required"`
	Result  Resources `json:"-"`
}

type IsResourceAccessibleMsg struct {
	ResourceId int64 `json:"-"`
	User       User  `json:"user" binding:"required"`
	Result     bool  `json:"-"`
}

type Resources struct {
	Count     int64      `json:"count"`
	Resources []Resource `json:"resources"`
	Page      int64      `json:"page"`
	PerPage   int64      `json:"perPage"`
}

type GetResourceGroupsMsg struct {
	ResourceId int64          `json:"-"`
	Query      string         `json:"query"`
	Page       int64          `json:"page"`
	PerPage    int64          `json:"perPage"`
	Result     ResourceGroups `json:"-"`
}

type ResourceGroups struct {
	Count          int64           `json:"count"`
	ResourceGroups []ResourceGroup `json:"resource_groups"`
	Page           int64           `json:"page"`
	PerPage        int64           `json:"perPage"`
}

type ResourceGroup struct {
	Id        int64     `json:"id"`
	UpdatedAt time.Time `json:"updated_at"`
	GroupId   int64     `json:"group_id"`
	GroupName string    `json:"group_name"`
	GroupPath string    `json:"group_path"`
}

type GetResourceGroupLeafsMsg struct {
	Query      string `json:"query"`
	ResourceId int64  `json:"resource_id"`
	User       User   `json:"user" binding:"required"`
	Result     Groups `json:"-"`
}
