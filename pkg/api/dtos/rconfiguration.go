package dtos

type UpdateOrgConfigurationMsg struct {
	OrgId         int64                  `json:"org_id"`
	Type          string                 `json:"type"`
	Configuration map[string]interface{} `json:"configuration"`
}

type UpdateGroupConfigurationMsg struct {
	Type          string                 `json:"type"`
	GroupId       int64                  `json:"group_id"`
	Configuration map[string]interface{} `json:"configuration"`
}

type UpdateResourceConfigurationMsg struct {
	ResourceId    int64                  `json:"resource_id"`
	Type          string                 `json:"type"`
	Configuration map[string]interface{} `json:"configuration"`
}
