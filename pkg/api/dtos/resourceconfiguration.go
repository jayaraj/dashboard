package dtos

type UpdateResourceConfigurationMsg struct {
	ResourceId    int64                  `json:"resource_id"`
	Type          string                 `json:"type"`
	Configuration map[string]interface{} `json:"configuration"`
}

type GetResourceConfigurationMsg struct {
	ResourceId int64  `json:"resource_id"`
	Type       string `json:"type"`
	// swagger:ignore
	Result map[string]interface{} `json:"result"`
}
