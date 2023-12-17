package devicemanagementimpl

import (
	"bytes"
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"mime/multipart"
	"net"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/grafana/grafana/pkg/services/devicemanagement"
	"github.com/pkg/errors"
	"golang.org/x/net/context/ctxhttp"
)

func (service *Service) RestRequest(ctx context.Context, request *devicemanagement.RestRequest) (err error) {
	netClient := &http.Client{
		Timeout: time.Second * 30,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				Renegotiation: tls.RenegotiateFreelyAsClient,
			},
			Proxy: http.ProxyFromEnvironment,
			Dial: (&net.Dialer{
				Timeout: 10 * time.Second,
			}).Dial,
			TLSHandshakeTimeout: 5 * time.Second,
		},
	}
	traceId, ok := ctx.Value("trace-id").(string)
	if !ok || traceId == "" {
		id, _ := uuid.NewRandom()
		traceId = id.String()
	}
	if request.HttpMethod == "" {
		request.HttpMethod = http.MethodPost
	}

	if request.Request == nil {
		request.Request = []byte{}
	}

	req, err := http.NewRequest(request.HttpMethod, request.Url, bytes.NewReader(request.Request))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("trace-id", traceId)
	req.Header.Set("token", service.cfg.ServiceToken)
	resp, err := ctxhttp.Do(ctx, netClient, req)
	if err != nil {
		return errors.Wrapf(err, "http request failed")
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return errors.Wrapf(err, "http request reading response body failed")
	}
	switch resp.StatusCode {
	case http.StatusOK, http.StatusForbidden, http.StatusNotFound, http.StatusBadRequest, http.StatusUnauthorized, http.StatusInternalServerError:
		request.StatusCode = resp.StatusCode
		request.Response = body
		return nil
	default:
		return fmt.Errorf("unknown error status : %d, ", resp.StatusCode)
	}
}

func (service *Service) FileRequest(ctx context.Context, request *devicemanagement.FileRequest) (err error) {
	netClient := &http.Client{
		Timeout: time.Minute * 5,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				Renegotiation: tls.RenegotiateFreelyAsClient,
			},
			Proxy: http.ProxyFromEnvironment,
			Dial: (&net.Dialer{
				Timeout: 10 * time.Second,
			}).Dial,
			TLSHandshakeTimeout: 5 * time.Second,
		},
	}
	traceId, ok := ctx.Value("trace-id").(string)
	if !ok || traceId == "" {
		id, _ := uuid.NewRandom()
		traceId = id.String()
	}

	var buffer bytes.Buffer
	writer := multipart.NewWriter(&buffer)
	formWriter, err := writer.CreateFormFile("file", request.Filename)
	if err != nil {
		return errors.Wrapf(err, "failed create form file")
	}
	if _, err = io.Copy(formWriter, request.Content); err != nil {
		return errors.Wrapf(err, "failed to copy the file to the form file")
	}

	for key, value := range request.FormData {
		if err := writer.WriteField(key, value); err != nil {
			return errors.Wrapf(err, "failed create form field %s", key)
		}
	}

	if err := writer.Close(); err != nil {
		return errors.Wrapf(err, "failed close writer")
	}

	req, err := http.NewRequest(http.MethodPost, request.Url, bytes.NewReader(buffer.Bytes()))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.Header.Set("trace-id", traceId)
	req.Header.Set("token", service.cfg.ServiceToken)
	resp, err := ctxhttp.Do(ctx, netClient, req)
	if err != nil {
		return errors.Wrapf(err, "http request failed")
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return errors.Wrapf(err, "http request reading response body failed")
	}
	switch resp.StatusCode {
	case http.StatusOK, http.StatusForbidden, http.StatusNotFound, http.StatusBadRequest, http.StatusUnauthorized, http.StatusInternalServerError:
		request.StatusCode = resp.StatusCode
		request.Response = body
		return nil
	default:
		return fmt.Errorf("unknown error status : %d, ", resp.StatusCode)
	}
}
