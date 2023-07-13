package dtos

import "time"

type Inventory struct {
	Id           int64     `json:"id"`
	UpdatedAt    time.Time `json:"updated_at"`
	UUID         string    `json:"uuid"`
	Type         string    `json:"type"`
	ResourceOrg  int64     `json:"resource_org"`
	ResourceName string    `json:"resource_name"`
	Assigned     bool      `json:"assigned"`
}

type GetInventoryByUUIDMsg struct {
	Uuid string `json:"-"`
	// swagger:ignore
	Result Inventory `json:"result"`
}

type GetInventoryByIdMsg struct {
	Uuid string `json:"-"`
	// swagger:ignore
	Result Inventory `json:"result"`
}

type Inventories struct {
	Count       int64       `json:"count"`
	Inventories []Inventory `json:"inventories"`
	Page        int64       `json:"page"`
	PerPage     int64       `json:"perPage"`
}

type CreateInventoryMsg struct {
	UUID          string                 `json:"uuid" binding:"required"`
	Type          string                 `json:"type" binding:"required"`
	Configuration map[string]interface{} `json:"configuration" binding:"required"`
	// swagger:ignore
	Result Inventory `json:"result"`
}

type DeleteInventoryMsg struct {
	// swagger:ignore
	Id int64 `json:"-"`
	// swagger:ignore
	Result Inventory `json:"result"`
}

type UpdateInventoryMsg struct {
	Id   int64  `json:"-"`
	UUID string `json:"uuid" binding:"required"`
}

type SearchInventoriesMsg struct {
	Query   string `json:"query"`
	Page    int64  `json:"page"`
	PerPage int64  `json:"perPage"`
	// swagger:ignore
	Result Inventories `json:"result"`
}
