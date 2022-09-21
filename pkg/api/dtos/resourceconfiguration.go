package dtos

type UpdateResourceConfigurationMsg struct {
	OrgId         int64                  `json:"org_id"`
	ResourceId    int64                  `json:"resource_id"`
	Type          string                 `json:"type"`
	GroupId       int64                  `json:"group_id"`
	Configuration map[string]interface{} `json:"configuration"`
}
