package dtos

type AppPlugin struct {
	Type     string                 `json:"type"`
	Enabled  bool                   `json:"enabled"`
	Pinned   bool                   `json:"pinned"`
	Module   string                 `json:"module"`
	JsonData map[string]interface{} `json:"jsonData"`
}
