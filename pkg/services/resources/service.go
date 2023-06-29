package resources

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/setting"
	NATS "github.com/nats-io/nats.go"
	"github.com/pkg/errors"
	"golang.org/x/net/context/ctxhttp"
)

type ResourcesService struct {
	Cfg    *setting.Cfg
	client *NATS.Conn
	log    log.Logger
}

type NatsResponse struct {
	Error string      `json:"error,omitempty"`
	Reply interface{} `json:"reply,omitempty"`
}

type RestRequest struct {
	Url        string
	Request    []byte
	HttpMethod string
	Response   []byte
	StatusCode int
}

type FileRequest struct {
	Url        string
	Filename   string
	FormData   map[string]string
	Content    io.Reader
	Response   []byte
	StatusCode int
}

func ProvideService(cfg *setting.Cfg) (resp *ResourcesService, err error) {
	client, err := NATS.Connect(cfg.NatsUrl)
	if err != nil {
		return nil, errors.Wrapf(err, "failed while connecting nats")
	}
	return &ResourcesService{
		Cfg:    cfg,
		client: client,
		log:    log.New("resourcesservice"),
	}, nil
}

func (service *ResourcesService) GetConfig() *setting.Cfg {
	return service.Cfg
}

func (service *ResourcesService) ResourcesTopic(msg string) string {
	return fmt.Sprintf("resources.%s", msg)
}

func (service *ResourcesService) WriterTopic(msg string) string {
	return fmt.Sprintf("writer.%s", msg)
}

func (service *ResourcesService) ReaderTopic(msg string) string {
	return fmt.Sprintf("reader.%s", msg)
}

func (service *ResourcesService) BillingTopic(msg string) string {
	return fmt.Sprintf("billing.%s", msg)
}

func (service *ResourcesService) RestRequest(ctx context.Context, request *RestRequest) (err error) {
	netClient := &http.Client{
		Timeout: time.Second * 10,
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
	req.Header.Set("token", service.Cfg.ResourceToken)
	resp, err := ctxhttp.Do(ctx, netClient, req)
	if err != nil {
		return errors.Wrapf(err, "resource http request failed")
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return errors.Wrapf(err, "resource http request reading response body failed")
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

func (service *ResourcesService) FileRequest(ctx context.Context, request *FileRequest) (err error) {
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
	req.Header.Set("token", service.Cfg.ResourceToken)
	resp, err := ctxhttp.Do(ctx, netClient, req)
	if err != nil {
		return errors.Wrapf(err, "resource http request failed")
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return errors.Wrapf(err, "resource http request reading response body failed")
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

func (service *ResourcesService) Publish(ctx context.Context, topic string, data []byte) (err error) {
	header := NATS.Header{}
	traceId, ok := ctx.Value("trace-id").(string)
	if !ok || traceId == "" {
		id, _ := uuid.NewRandom()
		traceId = id.String()
	}
	header.Add("trace-id", traceId)
	header.Add("token", service.Cfg.ResourceToken)
	msg := &NATS.Msg{Subject: topic, Data: data, Header: header}

	if err := service.client.PublishMsg(msg); err != nil {
		return err
	}
	return nil
}

func (service *ResourcesService) Request(ctx context.Context, topic string, data []byte) (response interface{}, err error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	header := NATS.Header{}
	traceId, ok := ctx.Value("trace-id").(string)
	if !ok || traceId == "" {
		id, _ := uuid.NewRandom()
		traceId = id.String()
	}
	header.Add("trace-id", traceId)
	header.Add("token", service.Cfg.ResourceToken)
	msg := &NATS.Msg{Subject: topic, Data: data, Header: header}

	var r *NATS.Msg
	if r, err = service.client.RequestMsgWithContext(ctx, msg); err != nil {
		return nil, errors.Wrap(err, "nats request failed")
	}
	decoded := &NatsResponse{}
	if err := json.Unmarshal(r.Data, decoded); err != nil {
		return nil, errors.Wrap(err, "parsing nats response failed")
	}
	if decoded.Error != "" {
		return nil, errors.New(decoded.Error)
	}
	return decoded.Reply, nil
}
