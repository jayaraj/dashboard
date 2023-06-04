package dtos

type AssociationType string

const (
	TYPE_ORG      AssociationType = "org"
	TYPE_GROUP    AssociationType = "group"
	TYPE_RESOURCE AssociationType = "resource"
)

type UpdateOrgConfigurationMsg struct {
	OrgId         int64                  `json:"org_id"`
	Type          string                 `json:"type"`
	Configuration map[string]interface{} `json:"configuration"`
}

type GetOrgConfigurationMsg struct {
	User  User   `json:"user"`
	OrgId int64  `json:"org_id"`
	Type  string `json:"type"`
}

type UpdateGroupConfigurationMsg struct {
	Type          string                 `json:"type"`
	GroupId       int64                  `json:"group_id"`
	Configuration map[string]interface{} `json:"configuration"`
}

type GetGroupConfigurationMsg struct {
	User    User   `json:"user"`
	Type    string `json:"type"`
	GroupId int64  `json:"group_id"`
}

type UpdateResourceConfigurationMsg struct {
	ResourceId    int64                  `json:"resource_id"`
	Type          string                 `json:"type"`
	Configuration map[string]interface{} `json:"configuration"`
}

type GetResourceConfigurationMsg struct {
	User       User   `json:"user"`
	ResourceId int64  `json:"resource_id"`
	Type       string `json:"type"`
}

type UpdateInventoryConfigurationMsg struct {
	InventoryId   int64                  `json:"inventory_id"`
	Type          string                 `json:"type"`
	Configuration map[string]interface{} `json:"configuration"`
}

type GetInventoryConfigurationMsg struct {
	User        User   `json:"user"`
	InventoryId int64  `json:"inventory_id"`
	Type        string `json:"type"`
}
