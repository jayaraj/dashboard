package connection

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/web"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/billing"
	"github.com/phpdave11/gofpdf"
	"github.com/pkg/errors"
)

func (service *Service) GetInvoices(c *contextmodel.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}
	from := c.Query("from")
	to := c.Query("to")

	url := fmt.Sprintf("%sapi/connections/%d/invoices?page=%d&perPage=%d&from=%s&to=%s", service.cfg.BillingHost, id, page, perPage, from, to)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	dto := billing.GetConnectionInvoicesMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (service *Service) CreateInvoice(c *contextmodel.ReqContext) response.Response {
	connection, access := service.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}

	dto := billing.CreateInvoiceMsg{
		OrgId:         c.OrgID,
		GroupId:       connection.GroupId,
		GroupPathId:   connection.GroupPathId,
		ConnectionExt: connection.ConnectionExt,
		ConnectionId:  connection.Id,
		Login:         &c.Login,
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/invoices", service.cfg.BillingHost)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to create", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.Success("created")
}

func (service *Service) CreateTransaction(c *contextmodel.ReqContext) response.Response {
	_, access := service.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	dto := billing.CreateTransactionMsg{
		ConnectionId: id,
		Login:        &c.Login,
	}
	if err := web.Bind(c.Req, &dto); err != nil {
		return response.Error(http.StatusBadRequest, "bad request data", err)
	}
	body, err := json.Marshal(dto)
	if err != nil {
		return response.Error(500, "failed marshal create", err)
	}
	url := fmt.Sprintf("%sapi/transactions", service.cfg.BillingHost)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    body,
		HttpMethod: http.MethodPost,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to create", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.Success("created")
}

func (service *Service) GetConnectionTransactions(c *contextmodel.ReqContext) response.Response {
	_, access := service.IsConnectionAccessible(c)
	if !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	id, err := strconv.ParseInt(web.Params(c.Req)[":connectionId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}
	from := c.Query("from")
	to := c.Query("to")

	url := fmt.Sprintf("%sapi/connections/%d/transactions?page=%d&perPage=%d&from=%s&to=%s", service.cfg.BillingHost, id, page, perPage, from, to)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	dto := billing.GetConnectionTransactionsMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (service *Service) GetInvoice(c *contextmodel.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":invoiceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "invoice id is invalid", err)
	}
	url := fmt.Sprintf("%sapi/invoices/%d", service.cfg.BillingHost, id)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}

	dto := billing.GetInvoiceByIdMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}

	if _, access := service.IsConnectionAccessibleById(c, dto.Result.ConnectionId); !access {
		return response.Error(http.StatusForbidden, "cannot access", nil)
	}
	return response.JSON(http.StatusOK, dto.Result)
}

func (service *Service) GetInvoiceByExt(c *contextmodel.ReqContext) response.Response {
	number := web.Params(c.Req)[":number"]
	if number == "" {
		return response.Error(http.StatusBadRequest, "invoice number is required", nil)
	}
	url := fmt.Sprintf("%sapi/invoices/number/%s", service.cfg.BillingHost, number)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to get", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}

	dto := billing.GetInvoiceByExtMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}

	transactions, err := service.getInvoiceTransactions(c.Req.Context(), dto.Result.Id, 1, 1000)
	if err != nil {
		return response.Error(http.StatusInternalServerError, "failed to get invoice transactions", err)
	}

	connection, err := service.GetConnection(c.Req.Context(), dto.Result.ConnectionId)
	if err != nil {
		return response.Error(http.StatusInternalServerError, "failed to get connection", err)
	}

	configService := service.devMgmt.GetConfiguration()
	if configService == nil {
		return response.Error(http.StatusInternalServerError, "failed to get configuration service", nil)
	}
	orgConfig, err := configService.GetOrgConfigurations(c.Req.Context(), connection.OrgId, "details")
	if err != nil {
		return response.Error(http.StatusInternalServerError, "failed to get org configuration", err)
	}
	infos := make([]Info, len(dto.Result.Informations))
	for i, info := range dto.Result.Informations {
		infos[i] = Info{
			Name:            info.Name,
			UUID:            info.UUID,
			Type:            info.Type,
			PreviousReading: fmt.Sprintf("%.0f", info.PreviousReading),
			CurrentReading:  fmt.Sprintf("%.0f", info.CurrentReading),
		}
	}

	invoiceTransactions := make([]Transaction, len(transactions.Transactions))
	for i, tx := range transactions.Transactions {
		invoiceTransactions[i] = Transaction{
			UpdatedAt: tx.UpdatedAt.Format("02/01/2006"),
			Context:   tx.Context,
			Tax:       tx.Tax,
			Type:      string(tx.Type),
			Amount:    tx.Amount,
		}
		if tx.Description != nil {
			invoiceTransactions[i].Description = *tx.Description
		}
	}

	orgDetails := OrgDetails{}
	if name, ok := orgConfig.Configuration["name"].(string); ok {
		orgDetails.Name = name
	}
	if address, ok := orgConfig.Configuration["address1"].(string); ok {
		orgDetails.Address1 = service.truncateWithEllipsis(address, 40)
	}
	if address, ok := orgConfig.Configuration["address2"].(string); ok {
		orgDetails.Address2 = service.truncateWithEllipsis(address, 40)
	}
	city := ""
	zip := ""
	if c, ok := orgConfig.Configuration["city"].(string); ok {
		city = c
	}
	if z, ok := orgConfig.Configuration["pincode"].(string); ok {
		zip = z
	}
	if city != "" && zip != "" {
		orgDetails.CityZip = city + "-" + zip
	}

	connectionDetails := ConnectionDetails{
		Name: connection.Name,
	}
	if connection.Address1 != "" {
		connectionDetails.Address1 = service.truncateWithEllipsis(connection.Address1, 40)
	}
	if connection.Address2 != "" {
		connectionDetails.Address2 = service.truncateWithEllipsis(connection.Address2, 40)
	}
	city = ""
	zip = ""
	if connection.City != "" {
		city = connection.City
	}
	if connection.Pincode != "" {
		zip = connection.Pincode
	}
	if city != "" && zip != "" {
		connectionDetails.CityZip = city + "-" + zip
	}

	invoice := &Invoice{
		InvoiceExt:        dto.Result.InvoiceExt,
		ConnectionExt:     fmt.Sprintf("%d", dto.Result.ConnectionExt),
		Created:           dto.Result.UpdatedAt.Format("02/01/2006"),
		DueDate:           dto.Result.UpdatedAt.AddDate(0, 1, -dto.Result.UpdatedAt.Day()).Format("02/01/2006"),
		Informations:      infos,
		Transactions:      invoiceTransactions,
		TotalCredits:      dto.Result.TotalCredits,
		TotalPayments:     dto.Result.TotalPayments,
		OldBalance:        dto.Result.OldBalance,
		Amount:            dto.Result.Amount,
		From:              dto.Result.From.Format("02/01/2006"),
		To:                dto.Result.To.Format("02/01/2006"),
		OrgDetails:        orgDetails,
		ConnectionDetails: connectionDetails,
	}

	pdfBytes, err := service.buildInvoicePDF(invoice)
	if err != nil {
		return response.Error(http.StatusInternalServerError, "failed to build pdf", err)
	}

	return response.JSONDownload(http.StatusOK, pdfBytes, fmt.Sprintf("invoice-%s.pdf", dto.Result.InvoiceExt))
}
func (service *Service) truncateWithEllipsis(s string, max int) string {
	if len(s) <= max {
		return s
	}
	if max <= 3 {
		return s[:max]
	}
	return s[:max-3] + "..."
}

func (service *Service) buildInvoicePDF(inv *Invoice) ([]byte, error) {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.SetAutoPageBreak(true, 20)
	pdf.AddPage()

	// Fonts: use built-in fonts for portability
	pdf.SetFont("Arial", "B", 22)
	pdf.CellFormat(0, 10, "Invoice", "", 1, "L", false, 0, "")

	// Right-side invoice meta (Invoice #, Account #, Created, Due)
	pdf.SetFont("Arial", "", 10)
	rightStartX := 120.0
	startY := 20.0
	pdf.SetXY(rightStartX, startY)
	pdf.CellFormat(40, 5, "Invoice #:", "", 0, "R", false, 0, "")
	pdf.SetX(rightStartX + 42)
	pdf.CellFormat(40, 5, inv.InvoiceExt, "", 1, "L", false, 0, "")

	pdf.SetX(rightStartX)
	pdf.CellFormat(40, 5, "Account #:", "", 0, "R", false, 0, "")
	pdf.SetX(rightStartX + 42)
	pdf.CellFormat(40, 5, inv.ConnectionExt, "", 1, "L", false, 0, "")

	pdf.SetX(rightStartX)
	pdf.CellFormat(40, 5, "Created:", "", 0, "R", false, 0, "")
	pdf.SetX(rightStartX + 42)
	pdf.CellFormat(40, 5, inv.Created, "", 1, "L", false, 0, "")

	pdf.SetX(rightStartX)
	pdf.CellFormat(40, 5, "Due:", "", 0, "R", false, 0, "")
	pdf.SetX(rightStartX + 42)
	pdf.CellFormat(40, 5, inv.DueDate, "", 1, "L", false, 0, "")

	pdf.Ln(8)

	// Print names on a single line: left name in fixed left column, right name right-aligned on the same line
	pdf.SetFont("Arial", "B", 11)
	leftColW := 90.0 // width for left column (tune as needed)

	// Left name
	pdf.CellFormat(leftColW, 6, inv.OrgDetails.Name, "", 0, "L", false, 0, "")
	// Right name uses the rest of the line; make it right aligned
	pdf.CellFormat(0, 6, inv.ConnectionDetails.Name, "", 1, "R", false, 0, "")

	pdf.SetFont("Arial", "", 10)
	// Row: Address1
	pdf.CellFormat(leftColW, 5, inv.OrgDetails.Address1, "", 0, "L", false, 0, "")
	pdf.CellFormat(0, 5, inv.ConnectionDetails.Address1, "", 1, "R", false, 0, "")

	// Row: Address2
	pdf.CellFormat(leftColW, 5, inv.OrgDetails.Address2, "", 0, "L", false, 0, "")
	pdf.CellFormat(0, 5, inv.ConnectionDetails.Address2, "", 1, "R", false, 0, "")

	// Row: City + Zip
	pdf.CellFormat(leftColW, 5, inv.OrgDetails.CityZip, "", 0, "L", false, 0, "")
	pdf.CellFormat(0, 5, inv.ConnectionDetails.CityZip, "", 1, "R", false, 0, "")

	pdf.Ln(6)
	pdf.SetFont("Arial", "B", 11)
	pdf.CellFormat(0, 6, "Consumption Details:", "", 1, "L", false, 0, "")
	pdf.Ln(2)
	pdf.SetFont("Arial", "", 10)
	for _, info := range inv.Informations {
		line := fmt.Sprintf("%s   %s", info.Name, info.UUID)
		pdf.CellFormat(100, 5, line, "", 0, "L", false, 0, "")
		readings := fmt.Sprintf("Prev: %s  Cur: %s", info.PreviousReading, info.CurrentReading)
		pdf.CellFormat(0, 5, readings, "", 1, "R", false, 0, "")
	}

	pdf.Ln(6)
	pdf.SetFont("Arial", "B", 10)
	pdf.SetFillColor(230, 230, 230)
	pdf.CellFormat(35, 8, "Date", "1", 0, "L", true, 0, "")
	pdf.CellFormat(85, 8, "Item", "1", 0, "L", true, 0, "")
	pdf.CellFormat(20, 8, "Tax", "1", 0, "C", true, 0, "")
	pdf.CellFormat(0, 8, "Price", "1", 1, "R", true, 0, "")

	pdf.SetFont("Arial", "", 10)
	for _, t := range inv.Transactions {
		date := t.UpdatedAt
		if date == "" {
			date = time.Now().Format("02/01/2006")
		} else if len(date) > 10 {
			date = date[:10]
		}
		pdf.CellFormat(35, 7, date, "1", 0, "L", false, 0, "")

		itemBuf := t.Description
		if len(t.Context) > 0 {
			first := true
			itemBuf += " ("
			for k, v := range t.Context {
				if !first {
					itemBuf += ", "
				}
				itemBuf += fmt.Sprintf("%s=%v", k, v)
				first = false
			}
			itemBuf += ")"
		}
		x := pdf.GetX()
		y := pdf.GetY()
		pdf.MultiCell(85, 7, itemBuf, "1", "L", false)
		pdf.SetXY(x+85, y)
		pdf.CellFormat(20, 7, fmt.Sprintf("%.0f", t.Tax), "1", 0, "C", false, 0, "")
		priceStr := fmt.Sprintf("%.2f", t.Amount)
		if t.Type != "debit" && t.Amount > 0 {
			priceStr = "-" + priceStr
		}
		pdf.CellFormat(0, 7, priceStr, "1", 1, "R", false, 0, "")
	}

	// Totals, Credits, Payments, Previous Balance
	pdf.Ln(4)
	printKeyValue := func(key string, value float64, bold bool) {
		if bold {
			pdf.SetFont("Arial", "B", 10)
		} else {
			pdf.SetFont("Arial", "", 10)
		}
		pdf.CellFormat(40, 6, key, "", 0, "L", false, 0, "")
		valStr := fmt.Sprintf("%.2f", value)
		pdf.CellFormat(0, 6, valStr, "", 1, "R", false, 0, "")
	}

	printKeyValue("Credits", inv.TotalCredits, false)
	printKeyValue("Payments", inv.TotalPayments, false)
	printKeyValue("Previous Balance", inv.OldBalance, false)
	printKeyValue("Total", inv.Amount, true)

	pdf.Ln(6)

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

func (service *Service) getInvoiceTransactions(ctx context.Context, id int64, page int, perPage int) (billing.Transactions, error) {
	url := fmt.Sprintf("%sapi/invoices/%d/transactions?page=%d&perPage=%d", service.cfg.BillingHost, id, page, perPage)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(ctx, req); err != nil {
		return billing.Transactions{}, err
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return billing.Transactions{}, errors.Wrap(err, "failed to unmarshal error response")
		}
		return billing.Transactions{}, errors.New(errResponse.Message)
	}
	dto := billing.GetInvoiceTransactionsMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return billing.Transactions{}, errors.Wrap(err, "failed to unmarshal invoice transactions")
	}
	return dto.Result, nil
}

func (service *Service) GetInvoiceTransactions(c *contextmodel.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":invoiceId"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "invoice id is invalid", err)
	}
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}

	transactions, err := service.getInvoiceTransactions(c.Req.Context(), id, page, perPage)
	if err != nil {
		return response.Error(http.StatusInternalServerError, "failed to get invoice transactions", err)
	}
	return response.JSON(http.StatusOK, transactions)
}
