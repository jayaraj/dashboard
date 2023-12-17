package fileloader

import (
	"encoding/json"
	"fmt"
	"mime"
	"net/http"
	"path"
	"strings"

	"github.com/grafana/grafana/pkg/api/response"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/jayaraj/messages/client"
	"github.com/jayaraj/messages/client/resource"
)

func (service *Service) UploadFile(c *contextmodel.ReqContext) response.Response {
	file, header, err := c.Req.FormFile("file")
	if err != nil {
		return response.Error(500, "failed to get form file", err)
	}
	defer file.Close()
	extension := strings.ToLower(path.Ext(header.Filename))
	contentType := mime.TypeByExtension(extension)
	data := map[string]string{
		"org":          fmt.Sprintf("%d", c.OrgID),
		"content-type": contentType,
		"folder":       c.Req.PostFormValue("folder"),
	}
	url := fmt.Sprintf("%sapi/storage", service.cfg.ResourceHost)
	req := &devicemanagement.FileRequest{
		Url:      url,
		Filename: header.Filename,
		FormData: data,
		Content:  file,
	}
	if err := service.devMgmt.FileRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to upload", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse client.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	dto := resource.UploadFileMsg{}
	if err := json.Unmarshal(req.Response, &dto.Result); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, dto.Result)
}
