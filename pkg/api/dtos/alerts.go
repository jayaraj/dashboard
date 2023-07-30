package dtos

import (
	"time"
)

type Alert struct {
	Id                int64                  `json:"id"`
	UpdatedAt         time.Time              `json:"updated_at"`
	AlertDefinitionId int64                  `json:"alert_definition_id"`
	Name              string                 `json:"name"`
	OrgId             int64                  `json:"org_id"`
	GroupPath         *string                `json:"group_path,omitempty"`
	ResourceId        *int64                 `json:"resource_id,omitempty"`
	State             string                 `json:"state"`
	Message           string                 `json:"message"`
	Description       string                 `json:"description"`
	For               int64                  `json:"for"`
	AssociatedWith    string                 `json:"associated_with"`
	Severity          string                 `json:"severity"`
	Role              string                 `json:"role"`
	Enabled           bool                   `json:"enabled"`
	TicketEnabled     bool                   `json:"ticket_enabled"`
	Data              map[string]interface{} `json:"data"`
	Configuration     map[string]interface{} `json:"configuration"`
}

type Alerts struct {
	Count    int64   `json:"count"`
	Alerting int64   `json:"alerting"`
	Pending  int64   `json:"pending"`
	Normal   int64   `json:"normal"`
	Alerts   []Alert `json:"alerts"`
	Page     int64   `json:"page"`
	PerPage  int64   `json:"perPage"`
}

type SearchAlertsMsg struct {
	Query      string  `json:"query"`
	Page       int64   `json:"page"`
	PerPage    int64   `json:"perPage"`
	OrgId      int64   `json:"org_id"`
	GroupPath  *string `json:"group_path,omitempty"`
	ResourceId *int64  `json:"resource_id,omitempty"`
	Name       *string `json:"name,omitempty"`
	State      *string `json:"state,omitempty"`
	User       User    `json:"user"`
	// swagger:ignore
	Result Alerts `json:"result"`
}

type ConfigureAlertMsg struct {
	Name          string                 `json:"name" binding:"required"`
	OrgId         int64                  `json:"org_id"`
	GroupPath     *string                `json:"group_path,omitempty"`
	ResourceId    *int64                 `json:"resource_id,omitempty"`
	Configuration map[string]interface{} `json:"configuration" binding:"required"`
	User          User                   `json:"user"`
}

type EnableAlertMsg struct {
	Name       string  `json:"name" binding:"required"`
	OrgId      int64   `json:"org_id"`
	GroupPath  *string `json:"group_path,omitempty"`
	ResourceId *int64  `json:"resource_id,omitempty"`
	Enabled    bool    `json:"enabled" binding:"required"`
	User       User    `json:"user"`
}

type GetAlertMsg struct {
	Name       string  `json:"name" validate:"required"`
	OrgId      int64   `json:"org_id" validate:"required"`
	GroupPath  *string `json:"group_path,omitempty"`
	ResourceId *int64  `json:"resource_id,omitempty"`
	// swagger:ignore
	Result Alert `json:"result"`
}

type AlertAccessibleMsg struct {
	Name string `json:"name"`
	User User   `json:"user"`
	// swagger:ignore
	Result bool `json:"result"`
}
