package connection

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
	Name     string `json:"name"`
	Address1 string `json:"address1"`
	Address2 string `json:"address2"`
	CityZip  string `json:"city_zip"`
}
