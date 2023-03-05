package dtos

import "time"

type FixedCharge struct {
	Id          int64     `json:"id"`
	UpdatedAt   time.Time `json:"updated_at"`
	OrgId       int64     `json:"org_id"`
	Amount      float64   `json:"amount"`
	Tax         float64   `json:"tax"`
	Description string    `json:"description"`
}

type GetFixedChargeByIdMsg struct {
	Id     int64       `json:"id"`
	Result FixedCharge `json:"-"`
}

type UpdateFixedChargeMsg struct {
	Id          int64   `json:"-"`
	Amount      float64 `json:"amount" binding:"required"`
	Tax         float64 `json:"tax" binding:"required"`
	Description string  `json:"description" binding:"required"`
}

type DeleteFixedChargeMsg struct {
	Id int64 `json:"-" binding:"required"`
}

type CreateFixedChargeMsg struct {
	OrgId       int64       `json:"org_id"`
	Amount      float64     `json:"amount" binding:"required"`
	Tax         float64     `json:"tax" binding:"required"`
	Description string      `json:"description" binding:"required"`
	Result      FixedCharge `json:"-"`
}

type GetFixedChargesMsg struct {
	OrgId int64 `json:"-"`
	// swagger:ignore
	Result []FixedCharge `json:"result"`
}
