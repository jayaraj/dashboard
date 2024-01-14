package fileloader

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/grafana/grafana/pkg/web"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/resource"
)

func (service *Service) UploadCsv(c *contextmodel.ReqContext) response.Response {
	csvPartFile, csvFileHeader, err := c.Req.FormFile("file")
	if err != nil {
		return response.Error(500, "failed to get form file", err)
	}
	object := c.Req.PostFormValue("object")
	operation := c.Req.PostFormValue("operation")
	if object == "" || operation == "" {
		return response.Error(http.StatusBadRequest, "object or operation is not found", nil)
	}

	request := devicemanagement.TriggerCsvProcessMsg{
		FileName: csvFileHeader.Filename,
		OrgId:    c.OrgID,
		Topic:    fmt.Sprintf("%s%s", strings.ToLower(operation), object),
		PartFile: csvPartFile,
	}
	service.fileChan <- request

	return response.Success("uploaded")
}

func (service *Service) DeleteCsv(c *contextmodel.ReqContext) response.Response {

	id, err := strconv.ParseInt(web.Params(c.Req)[":id"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}

	url := fmt.Sprintf("%sapi/csventries/%d", service.cfg.ResourceHost, id)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodDelete,
	}

	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to delete", err)
	}

	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	return response.Success("deleted")
}

func (service *Service) GetCsvById(c *contextmodel.ReqContext) response.Response {

	id, err := strconv.ParseInt(web.Params(c.Req)[":id"], 10, 64)
	if err != nil {
		return response.Error(http.StatusBadRequest, "id is invalid", err)
	}

	url := fmt.Sprintf("%sapi/csventries/%d", service.cfg.ResourceHost, id)
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
	cmd := resource.GetCsvEntryByIdMsg{}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, cmd.Result)
}

func (service *Service) SearchCsv(c *contextmodel.ReqContext) response.Response {
	query := c.Query("query")
	perPage := c.QueryInt("perPage")
	if perPage <= 0 {
		perPage = 20
	}
	page := c.QueryInt("page")
	if page <= 0 {
		page = 1
	}

	cmd := &resource.SearchCsvEntryMsg{
		Query:   query,
		Page:    int64(page),
		PerPage: int64(perPage),
	}
	url := fmt.Sprintf("%sapi/csventries?query=%s&page=%d&perPage=%d", service.cfg.ResourceHost, query, page, perPage)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to search", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, cmd.Result)
}

func (service *Service) GetCsvErrorsById(c *contextmodel.ReqContext) response.Response {
	id, err := strconv.ParseInt(web.Params(c.Req)[":id"], 10, 64)
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

	cmd := &resource.GetCsvErrorsByIdMsg{
		Id:      id,
		Page:    int64(page),
		PerPage: int64(perPage),
	}
	url := fmt.Sprintf("%sapi/csventries/%d/errors?page=%d&perPage=%d", service.cfg.ResourceHost, id, page, perPage)
	req := &devicemanagement.RestRequest{
		Url:        url,
		Request:    nil,
		HttpMethod: http.MethodGet,
	}
	if err := service.devMgmt.RestRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to search", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	if err := json.Unmarshal(req.Response, &cmd.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, cmd.Result)
}
