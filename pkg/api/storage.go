package api

import (
	"encoding/json"
	"fmt"
	"mime"
	"net/http"
	"path"
	"strings"

	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/api/response"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/resources"
)

func (hs *HTTPServer) UploadImage(c *models.ReqContext) response.Response {
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
	url := fmt.Sprintf("%sapi/image", hs.ResourceService.GetConfig().ResourceUrl)
	req := &resources.FileRequest{
		Url:      url,
		Filename: header.Filename,
		FormData: data,
		Content:  file,
	}
	if err := hs.ResourceService.FileRequest(c.Req.Context(), req); err != nil {
		return response.Error(500, "failed to upload", err)
	}
	if req.StatusCode != http.StatusOK {
		var errResponse dtos.ErrorResponse
		if err := json.Unmarshal(req.Response, &errResponse); err != nil {
			return response.Error(req.StatusCode, "failed unmarshal error ", err)
		}
		return response.Error(req.StatusCode, errResponse.Message, nil)
	}
	fileLocation := struct {
		Location string `json:"location"`
	}{}
	if err := json.Unmarshal(req.Response, &fileLocation); err != nil {
		return response.Error(req.StatusCode, "failed unmarshal error ", err)
	}
	return response.JSON(http.StatusOK, fileLocation)
}
