package dtos

import (
	"time"
)

// swagger:model TagResponse
type Tag struct {
	Id        int64     `json:"id"`
	UpdatedAt time.Time `json:"updated_at"`
	Tag       string    `json:"tag"`
}

// swagger:model TagsResponse
type Tags struct {
	Count   int64 `json:"count"`
	Tags    []Tag `json:"tags"`
	Page    int64 `json:"page"`
	PerPage int64 `json:"perPage"`
}

type GetTagsMsg struct {
	Query   string `json:"query,omitempty"`
	Page    int64  `json:"page"`
	PerPage int64  `json:"perPage"`
	// swagger:ignore
	Result Tags `json:"result"`
}

type GetGroupTagsMsg struct {
	Query   string `json:"query,omitempty"`
	Page    int64  `json:"page"`
	PerPage int64  `json:"perPage"`
	// swagger:ignore
	GroupId int64 `json:"group_id"`
	// swagger:ignore
	Result Tags `json:"result"`
}

// swagger:model UpdateGroupTagsRequest
type UpdateGroupTagsMsg struct {
	Tags []string `json:"tags" binding:"required"`
	// swagger:ignore
	GroupId int64 `json:"group_id"`
}
