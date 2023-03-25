package dtos

import "time"

type GroupType struct {
	Id            int64                  `json:"id"`
	UpdatedAt     time.Time              `json:"updated_at"`
	Type          string                 `json:"type"`
	Configuration map[string]interface{} `json:"configuration"`
}

type GroupTypes struct {
	Count      int64       `json:"count"`
	GroupTypes []GroupType `json:"group_types"`
	Page       int64       `json:"page"`
	PerPage    int64       `json:"perpage"`
}

type SearchGroupTypeMsg struct {
	Query   string     `json:"query"`
	Page    int64      `json:"page" binding:"required"`
	PerPage int64      `json:"perpage" binding:"required"`
	Result  GroupTypes `json:"-"`
}

type GetGroupTypeByIdMsg struct {
	Id     int64     `json:"-" binding:"required"`
	Result GroupType `json:"-"`
}

type GetGroupTypeByTypeMsg struct {
	Type   string    `json:"-" binding:"required"`
	Result GroupType `json:"-"`
}

type UpdateGroupTypeMsg struct {
	Id            int64                  `json:"-"`
	Type          string                 `json:"type" binding:"required"`
	Configuration map[string]interface{} `json:"configuration" binding:"required"`
}

type DeleteGroupTypeMsg struct {
	Id int64 `json:"-" binding:"required"`
}

type CreateGroupTypeMsg struct {
	Type          string                 `json:"type" binding:"required"`
	Configuration map[string]interface{} `json:"configuration" binding:"required"`
	Result        GroupType              `json:"-"`
}
