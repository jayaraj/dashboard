package dtos

import "time"

type Slab struct {
	Id        int64     `json:"id"`
	UpdatedAt time.Time `json:"updated_at"`
	ProfileId int64     `json:"profile_id"`
	OrgId     int64     `json:"org_id"`
	Tag       string    `json:"tag"`
	Slabs     uint      `json:"slabs"`
	Tax       float64   `json:"tax"`
	Rates     []Rate    `json:"rates"`
}

type Slabs struct {
	Count   int64  `json:"count"`
	Slabs   []Slab `json:"slabs"`
	Page    int64  `json:"page"`
	PerPage int64  `json:"perPage"`
}

type Rates []Rate
type Rate struct {
	Id          string  `json:"id"`
	From        float64 `json:"from"`
	To          float64 `json:"to"`
	Final       bool    `json:"final"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
}

type GetSlabsByProfileMsg struct {
	Profile int64 `json:"-"`
	Result  Slabs `json:"-"`
}

type GetSlabByIdMsg struct {
	Id     int64 `json:"id"`
	Result Slab  `json:"result"`
}

type GetSlabByProfileTagMsg struct {
	ProfileId int64  `json:"-"`
	Tag       string `json:"-"`
	Result    Slab   `json:"-"`
}

type UpdateSlabMsg struct {
	Id    int64   `json:"-"`
	Tag   string  `json:"tag" binding:"required"`
	Tax   float64 `json:"tax" binding:"required"`
	Slabs uint    `json:"slabs" binding:"required"`
	Rates []Rate  `json:"rates" binding:"required"`
}

type DeleteSlabMsg struct {
	Id int64 `json:"-" binding:"required"`
}

type CreateSlabMsg struct {
	OrgId     int64   `json:"org_id"`
	ProfileId int64   `json:"profile_id" binding:"required"`
	Tag       string  `json:"tag" binding:"required"`
	Tax       float64 `json:"tax"`
	Slabs     uint    `json:"slabs" binding:"required"`
	Rates     []Rate  `json:"rates" binding:"required"`
	Result    Slab    `json:"-"`
}
