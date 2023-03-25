package dtos

import "time"

type ErrorResponse struct {
	Message string `json:"message"`
}

type ResourceType struct {
	Id            int64                  `json:"id"`
	UpdatedAt     time.Time              `json:"updated_at"`
	Type          string                 `json:"type"`
	Configuration map[string]interface{} `json:"configuration"`
}

type ResourceTypes struct {
	Count         int64          `json:"count"`
	ResourceTypes []ResourceType `json:"resource_types"`
	Page          int64          `json:"page"`
	PerPage       int64          `json:"perpage"`
}

type SearchResourceTypeMsg struct {
	Query   string        `json:"query"`
	Page    int64         `json:"page" binding:"required"`
	PerPage int64         `json:"perpage" binding:"required"`
	Result  ResourceTypes `json:"-"`
}

type GetResourceTypeByIdMsg struct {
	Id     int64        `json:"-" binding:"required"`
	Result ResourceType `json:"-"`
}

type GetResourceTypeByTypeMsg struct {
	Type   string       `json:"-" binding:"required"`
	Result ResourceType `json:"-"`
}

type UpdateResourceTypeMsg struct {
	Id            int64                  `json:"-"`
	Type          string                 `json:"type" binding:"required"`
	Configuration map[string]interface{} `json:"configuration" binding:"required"`
}

type DeleteResourceTypeMsg struct {
	Id int64 `json:"-" binding:"required"`
}

type CreateResourceTypeMsg struct {
	Type          string                 `json:"type" binding:"required"`
	Configuration map[string]interface{} `json:"configuration" binding:"required"`
	Result        ResourceType           `json:"-"`
}
