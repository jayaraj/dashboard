package dtos

import "time"

type Slab struct {
	Id        int64     `json:"id"`
	UpdatedAt time.Time `json:"updated_at"`
	Type      string    `json:"type"`
	OrgId     int64     `json:"org_id"`
	Slabs     uint      `json:"slabs"`
	Tax       float64   `json:"tax"`
	Rates     []Rate    `json:"rates"`
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

type GetSlabByTypeMsg struct {
	Type   string `json:"-" binding:"required"`
	Result Slab   `json:"-"`
}

type UpdateSlabMsg struct {
	Id    int64   `json:"-"`
	Type  string  `json:"type" binding:"required"`
	Tax   float64 `json:"tax" binding:"required"`
	Slabs uint    `json:"slabs" binding:"required"`
	Rates []Rate  `json:"rates" binding:"required"`
}

type DeleteSlabMsg struct {
	Id int64 `json:"-" binding:"required"`
}

type CreateSlabMsg struct {
	OrgId  int64   `json:"org_id"`
	Type   string  `json:"type" binding:"required"`
	Tax    float64 `json:"tax"`
	Slabs  uint    `json:"slabs" binding:"required"`
	Rates  []Rate  `json:"rates" binding:"required"`
	Result Slab    `json:"-"`
}
