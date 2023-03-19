package dtos

import (
	"time"
)

type Invoice struct {
	Id            int64                `json:"id"`
	UpdatedAt     time.Time            `json:"updated_at"`
	OrgId         int64                `json:"org_id"`
	GroupId       int64                `json:"group_id"`
	OldBalance    float64              `json:"old_balance"`
	Amount        float64              `json:"amount"`
	TotalCredits  float64              `json:"total_credits"`
	TotalPayments float64              `json:"total_payments"`
	Description   *string              `json:"description,omitempty"`
	Login         *string              `json:"login,omitempty"`
	From          time.Time            `json:"from"`
	To            time.Time            `json:"to"`
	Informations  []InvoiceInformation `json:"informations"`
}

type InvoiceInformation struct {
	Id              int64     `json:"id"`
	UpdatedAt       time.Time `json:"updated_at"`
	InvoiceId       int64     `json:"invoice_id"`
	UUID            string    `json:"uuid"`
	Name            string    `json:"name"`
	Type            string    `json:"type"`
	Constant        float64   `json:"constant"`
	PreviousReading float64   `json:"previous_reading"`
	CurrentReading  float64   `json:"current_reading"`
}

type GetInvoicesMsg struct {
	OrgId   int64     `json:"org_id"`
	GroupId int64     `json:"group_id"`
	From    time.Time `json:"from"`
	To      time.Time `json:"to"`
	Page    int64     `json:"page"`
	PerPage int64     `json:"perPage"`

	// swagger:ignore
	Result Invoices `json:"result"`
}

type Invoices struct {
	Count    int64     `json:"count"`
	Invoices []Invoice `json:"invoices"`
	Page     int64     `json:"page"`
	PerPage  int64     `json:"perPage"`
}

type GetInvoiceTransactionsMsg struct {
	InvoiceId int64 `json:"invoice_id"`
	Page      int64 `json:"page"`
	PerPage   int64 `json:"perPage"`
	// swagger:ignore
	Result Transactions `json:"result"`
}

type GetInvoiceByIdMsg struct {
	Id int64 `json:"id" `
	// swagger:ignore
	Result Invoice `json:"result"`
}

type GetGroupTransactionsMsg struct {
	OrgId   int64 `json:"org_id"`
	GroupId int64 `json:"group_id"`

	Page    int64 `json:"page"`
	PerPage int64 `json:"perPage"`

	// swagger:ignore
	Result Transactions `json:"result"`
}

type CreateInvoiceMsg struct {
	OrgId   int64   `json:"org_id"`
	GroupId int64   `json:"group_id"`
	Login   *string `json:"login,omitempty"`

	// swagger:ignore
	Result Invoice `json:"result" validate:"-"`
}

type CreateTransactionMsg struct {
	OrgId       int64                  `json:"org_id"`
	GroupId     int64                  `json:"group_id"`
	Type        string                 `json:"type"`
	Tax         float64                `json:"tax"`
	Amount      float64                `json:"amount"`
	Description *string                `json:"description,omitempty"`
	Login       *string                `json:"login,omitempty"`
	Context     map[string]interface{} `json:"context"`

	// swagger:ignore
	Result Transaction `json:"result"`
}

type Transactions struct {
	Count        int64         `json:"count"`
	Transactions []Transaction `json:"transactions"`
	Page         int64         `json:"page"`
	PerPage      int64         `json:"perPage"`
}

type Transaction struct {
	Id          int64                  `json:"id"`
	UpdatedAt   time.Time              `json:"updated_at"`
	OrgId       int64                  `json:"org_id"`
	GroupId     int64                  `json:"group_id"`
	Type        string                 `json:"type"`
	Tax         float64                `json:"tax"`
	Amount      float64                `json:"amount"`
	Balance     float64                `json:"balance"`
	Previous    string                 `json:"previous"`
	Description *string                `json:"description,omitempty"`
	Login       *string                `json:"login,omitempty"`
	Context     map[string]interface{} `json:"context"`
}
