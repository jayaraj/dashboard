package dtos

import "time"

type Profile struct {
	Id          int64     `json:"id"`
	UpdatedAt   time.Time `json:"updated_at"`
	OrgId       int64     `json:"org_id"`
	Name        string    `json:"name,omitempty"`
	Description string    `json:"description,omitempty"`
}

type Profiles struct {
	Count    int64     `json:"count"`
	Profiles []Profile `json:"profiles"`
	Page     int64     `json:"page"`
	PerPage  int64     `json:"perPage"`
}

type CreateProfileMsg struct {
	OrgId       int64   `json:"org_id"`
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description,omitempty"`
	Result      Profile `json:"result"`
}

type UpdateProfileMsg struct {
	Id          int64  `json:"id"`
	Name        string `json:"name" binding:"required"`
	Description string `json:"description,omitempty"`
}

type GetProfileByIdMsg struct {
	Id     int64   `json:"id"`
	Result Profile `json:"result"`
}

type GetProfileByNameMsg struct {
	Name   string  `json:"name"`
	OrgId  int64   `json:"org_id" binding:"required"`
	Result Profile `json:"result"`
}

type SearchProfilesMsg struct {
	OrgId   int64    `json:"org_id"`
	Query   string   `json:"query"`
	Page    int64    `json:"page" binding:"required"`
	PerPage int64    `json:"perPage" binding:"required"`
	Result  Profiles `json:"result"`
}

type DeleteProfileMsg struct {
	Id int64 `json:"id"`
}
