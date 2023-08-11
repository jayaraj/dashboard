package dtos

import "time"

type Notification struct {
	Id                int64                  `json:"id"`
	UpdatedAt         time.Time              `json:"updated_at"`
	AlertDefinitionId int64                  `json:"alert_definition_id"`
	Name              string                 `json:"name"`
	OrgId             int64                  `json:"org_id"`
	UserId            int64                  `json:"user_id"`
	Configuration     map[string]interface{} `json:"configuration"`
}

type UpdateOrCreateAlertNotificationMsg struct {
	AlertDefinitionId int64                  `json:"alert_definition_id" binding:"required"`
	OrgId             int64                  `json:"org_id"`
	UserId            int64                  `json:"user_id"`
	Configuration     map[string]interface{} `json:"configuration" binding:"required"`
}

type GetAlertNotificationMsg struct {
	Name   string `json:"name"`
	OrgId  int64  `json:"org_id"`
	UserId int64  `json:"user_id"`
	// swagger:ignore
	Result Notification `json:"result"`
}

// swagger:model WhatsappResponse
type WhatsappQR struct {
	LoggedIn bool          `json:"logged_in"`
	QRCode   string        `json:"qr_code"`
	Timeout  time.Duration `json:"timeout"`
}
