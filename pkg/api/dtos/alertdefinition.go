package dtos

import (
	"time"
)

type AlertDefinition struct {
	Id        int64     `json:"id"`
	UpdatedAt time.Time `json:"updated_at"`

	Name           string                 `json:"name"`
	Description    string                 `json:"description"`
	AlertingMsg    string                 `json:"alerting_msg"`
	OkMsg          string                 `json:"ok_msg,omitempty"`
	AssociatedWith string                 `json:"associated_with"`
	Role           string                 `json:"role"`
	Severity       string                 `json:"severity"`
	For            *int64                 `json:"for,omitempty"`
	TicketEnabled  bool                   `json:"ticket_enabled,omitempty"`
	Configuration  map[string]interface{} `json:"configuration,omitempty"`
	Alerting       int64                  `json:"alerting"`
	Pending        int64                  `json:"pending"`
	Normal         int64                  `json:"normal"`
}

type AlertDefinitions struct {
	Count            int64             `json:"count"`
	Alerting         int64             `json:"alerting"`
	Pending          int64             `json:"pending"`
	Normal           int64             `json:"normal"`
	AlertDefinitions []AlertDefinition `json:"alert_definitions"`
	Page             int64             `json:"page"`
	PerPage          int64             `json:"perPage"`
}

type UpdateAlertDefinitionMsg struct {
	Id             int64                  `json:"id" binding:"required"`
	Name           string                 `json:"name" binding:"required"`
	Description    string                 `json:"description,omitempty"`
	AlertingMsg    string                 `json:"alerting_msg" binding:"required"`
	OkMsg          string                 `json:"ok_msg,omitempty"`
	AssociatedWith string                 `json:"associated_with" binding:"required"`
	Role           string                 `json:"role" binding:"required"`
	Severity       string                 `json:"severity" binding:"required"`
	For            *int64                 `json:"for,omitempty"`
	TicketEnabled  bool                   `json:"ticket_enabled"`
	Configuration  map[string]interface{} `json:"configuration,omitempty"`
}

type GetAlertDefinitionByIdMsg struct {
	Id int64 `json:"id"`
	// swagger:ignore
	Result AlertDefinition `json:"result"`
}

type SearchAlertDefinitionMsg struct {
	Query      string  `json:"query"`
	Page       int64   `json:"page"`
	PerPage    int64   `json:"perPage"`
	OrgId      int64   `json:"org_id"`
	ResourceId *int64  `json:"resource_id,omitempty"`
	GroupPath  *string `json:"group_path,omitempty"`
	State      *string `json:"state,omitempty"`
	User       User    `json:"user"`
	// swagger:ignore
	Result AlertDefinitions `json:"result"`
}

type IsAlertDefinitionAccessibleMsg struct {
	Id   int64 `json:"id" binding:"required"`
	User User  `json:"user"`
	// swagger:ignore
	Result bool `json:"result"`
}
