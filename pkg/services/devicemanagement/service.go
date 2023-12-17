package devicemanagement

import (
	"context"
	"io"

	"github.com/grafana/grafana/pkg/models/roletype"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/jayaraj/messages/client/resource"
)

type RestRequest struct {
	Url        string
	Request    []byte
	HttpMethod string
	Response   []byte
	StatusCode int
}

type FileRequest struct {
	Url        string
	Filename   string
	FormData   map[string]string
	Content    io.Reader
	Response   []byte
	StatusCode int
}

type DeviceManagementService interface {
	RestRequest(ctx context.Context, request *RestRequest) (err error)
	FileRequest(ctx context.Context, request *FileRequest) (err error)
	Publish(ctx context.Context, topic string, data []byte) (err error)
	RequestTopic(ctx context.Context, topic string, msg interface{}) (err error)
	SetCache(ctx context.Context, key string, value interface{}) (err error)
	GetCache(ctx context.Context, key string, value interface{}) (err error)
	GetResource() ResourceService
	GetGroup() GroupService
}

type GroupService interface {
	IsGroupAccessible(c *contextmodel.ReqContext) (bool, int64)
}

type ResourceService interface {
	IsResourceAccessible(c *contextmodel.ReqContext) bool
	IsResourceAccessibleById(c *contextmodel.ReqContext, id int64) bool
	GetResourceByUUID(ctx context.Context, uuid string) (resource.Resource, error)
}

func ConvertRoleToString(c *contextmodel.ReqContext) string {
	if c.IsGrafanaAdmin {
		return "ROLE_SUPERADMIN"
	}
	return map[roletype.RoleType]string{
		roletype.RoleViewer:     "ROLE_VIEWER",
		roletype.RoleEditor:     "ROLE_EDITOR",
		roletype.RoleAdmin:      "ROLE_ADMIN",
		roletype.RoleSuperAdmin: "ROLE_SUPERADMIN",
	}[c.OrgRole]
}

func ConvertStringToRole(role string) roletype.RoleType {
	return map[string]roletype.RoleType{
		"ROLE_VIEWER":     roletype.RoleViewer,
		"ROLE_EDITOR":     roletype.RoleEditor,
		"ROLE_ADMIN":      roletype.RoleAdmin,
		"ROLE_SUPERADMIN": roletype.RoleSuperAdmin,
	}[role]
}
