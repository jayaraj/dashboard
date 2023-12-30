package devicemanagement

import (
	"context"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	USER "github.com/grafana/grafana/pkg/services/user"
	"github.com/jayaraj/messages/client/resource"
	"github.com/jayaraj/messages/client/user"
)

type DeviceManagementService interface {
	RestRequest(ctx context.Context, request *RestRequest) (err error)
	FileRequest(ctx context.Context, request *FileRequest) (err error)
	Publish(ctx context.Context, topic string, data []byte) (err error)
	RequestTopic(ctx context.Context, topic string, msg interface{}) (err error)
	SetCache(ctx context.Context, key string, value interface{}) (err error)
	GetCache(ctx context.Context, key string, value interface{}) (err error)
	GetResource() ResourceService
	GetGroup() GroupService
	GetUser() UserService
	GetConfiguration() ConfigurationService
}

type GroupService interface {
	IsGroupAccessible(c *contextmodel.ReqContext) (bool, int64)
	IsGroupAccessibleById(c *contextmodel.ReqContext, id int64) bool
	IsGroupPathAccessible(c *contextmodel.ReqContext, groupPath string) bool
}

type ResourceService interface {
	IsResourceAccessible(c *contextmodel.ReqContext) bool
	IsResourceAccessibleById(c *contextmodel.ReqContext, id int64) bool
	GetResourceByUUID(ctx context.Context, uuid string) (resource.Resource, error)
}

type UserService interface {
	GetOrgUser(ctx context.Context, msg *user.GetOrgUserMsg) error
	SearchOrgUsers(ctx context.Context, msg *user.SearchOrgUsersMsg) error
	SearchUsersByOrgUsers(ctx context.Context, msg *user.SearchUsersByOrgUsersMsg) error
	GetUser(ctx context.Context, userId int64) (USER.UserProfileDTO, error)
}

type ConfigurationService interface {
	IsConfigurationAccessible(c *contextmodel.ReqContext, association string, config string) bool
}
