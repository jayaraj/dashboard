package connection

import (
	"time"

	"github.com/jayaraj/messages/client/billing"
	"github.com/jayaraj/messages/client/watermeter"
)

type SubscribeConnectionMsg struct {
	Number float64 `json:"number" validate:"required" binding:"required"`
}

type Invoice struct {
	InvoiceExt        string            `json:"invoice_ext"`
	ConnectionExt     string            `json:"connection_ext"`
	Created           string            `json:"created"`
	DueDate           string            `json:"due_date"`
	Informations      []Info            `json:"informations"`
	Transactions      []Transaction     `json:"transactions"`
	TotalCredits      float64           `json:"total_credits"`
	TotalPayments     float64           `json:"total_payments"`
	OldBalance        float64           `json:"old_balance"`
	Amount            float64           `json:"amount"`
	From              string            `json:"from"`
	To                string            `json:"to"`
	Name              string            `json:"name"`
	OrgDetails        OrgDetails        `json:"orgDetails"`
	ConnectionDetails ConnectionDetails `json:"connection"`
}

type Info struct {
	Name            string `json:"name"`
	UUID            string `json:"uuid"`
	Type            string `json:"type"`
	PreviousReading string `json:"previous_reading"`
	CurrentReading  string `json:"current_reading"`
}

type Transaction struct {
	UpdatedAt   string                 `json:"updated_at"`
	Description string                 `json:"description"`
	Context     map[string]interface{} `json:"context"`
	Tax         float64                `json:"tax"`
	Type        string                 `json:"type"` // debit/credit
	Amount      float64                `json:"amount"`
}

type OrgDetails struct {
	Name     string `json:"name"`
	Address1 string `json:"address1"`
	Address2 string `json:"address2"`
	CityZip  string `json:"city_zip"`
}

type ConnectionDetails struct {
	OrgId         int64  `json:"org_id"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	Phone         string `json:"phone"`
	ConnectionExt string `json:"connection_ext"`
	Status        string `json:"status"`
	Address1      string `json:"address1"`
	Address2      string `json:"address2"`
	City          string `json:"city"`
	Pincode       string `json:"pincode"`
	CityZip       string `json:"city_zip"`
}

type Report struct {
	Connection       billing.Connection                             `json:"connection"`
	Alerts           watermeter.AlertStatsResponse                  `json:"alerts"`
	BillDetails      watermeter.BillDetailsResponse                 `json:"bill_details"`
	WeeklyComparison watermeter.WeeklyConsumptionComparisonResponse `json:"weekly_comparison"`
	DailyUsage       ChartData                                      `json:"daily_usage"`
	MonthlyBills     ChartData                                      `json:"monthly_bills"`
	MonthlyUsage     ChartData                                      `json:"monthly_usage"`
	GroupComparison  watermeter.GroupComparisonResponse             `json:"group_comparison"`
	Assets           watermeter.Series                              `json:"assets"`
}

type GroupComparison struct {
	Precent          float64 `json:"percent"`
	ConnectionsCount int64   `json:"connections_count"`
	Usage            float64 `json:"usage"`
	GroupUsage       float64 `json:"group_usage"`
	UsageUp          bool    `json:"usage_up"`
}

type BillDetails struct {
	BillPlan        string    `json:"bill_plan"`
	BillDate        time.Time `json:"bill_date"`     // report.Billing.BillDate.Format("Jan 2, 2006")
	BilledAmount    float64   `json:"billed_amount"` // fmt.Sprintf("Rs. %0.0f", report.Billing.Amount)
	PreviousBalance string    `json:"previous_balance"`
}

type ChartData struct {
	Labels     []string    `json:"labels"`
	Categories []string    `json:"categories"`
	Data       [][]float64 `json:"data"`
}

type Alerts struct {
	Count  int64            `json:"count"`
	Alerts map[string]int64 `json:"alerts"`
}

type Header struct {
	Text  string
	Index int64
}
