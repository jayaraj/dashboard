package connection

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/web"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/billing"
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

	_, err := service.getInvoiceTransactions(c.Req.Context(), dto.Result.Id, 1, 1000)
	if err != nil {
		return response.Error(http.StatusInternalServerError, "failed to get invoice transactions", err)
	}

	_, err = service.GetConnection(c.Req.Context(), dto.Result.ConnectionId)
	if err != nil {
		return response.Error(http.StatusInternalServerError, "failed to get connection", err)
	}

	return response.JSON(http.StatusOK, dto.Result)
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
