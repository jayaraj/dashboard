package dtos

import "time"

type OrgType struct {
	Id            int64                  `json:"id"`
	UpdatedAt     time.Time              `json:"updated_at"`
	Type          string                 `json:"type"`
	Configuration map[string]interface{} `json:"configuration"`
}

type OrgTypes struct {
	Count    int64     `json:"count"`
	OrgTypes []OrgType `json:"org_types"`
	Page     int64     `json:"page"`
	PerPage  int64     `json:"perpage"`
}

type SearchOrgTypeMsg struct {
	Query   string   `json:"query"`
	Page    int64    `json:"page" binding:"required"`
	PerPage int64    `json:"perpage" binding:"required"`
	Result  OrgTypes `json:"-"`
}

type GetOrgTypeByIdMsg struct {
	Id     int64   `json:"-" binding:"required"`
	Result OrgType `json:"-"`
}

type UpdateOrgTypeMsg struct {
	Id            int64                  `json:"-"`
	Type          string                 `json:"type" binding:"required"`
	Configuration map[string]interface{} `json:"configuration"`
}

type DeleteOrgTypeMsg struct {
	Id int64 `json:"-" binding:"required"`
}

type CreateOrgTypeMsg struct {
	Type          string                 `json:"type" binding:"required"`
	Configuration map[string]interface{} `json:"configuration"`
	Result        OrgType                `json:"-"`
}
