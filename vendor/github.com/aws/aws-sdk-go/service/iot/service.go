// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT.

package iot

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/client"
	"github.com/aws/aws-sdk-go/aws/client/metadata"
	"github.com/aws/aws-sdk-go/aws/request"
	"github.com/aws/aws-sdk-go/aws/signer/v4"
	"github.com/aws/aws-sdk-go/private/protocol/restjson"
)

// AWS IoT provides secure, bi-directional communication between Internet-connected
// things (such as sensors, actuators, embedded devices, or smart appliances)
// and the AWS cloud. You can discover your custom IoT-Data endpoint to communicate
// with, configure rules for data processing and integration with other services,
// organize resources associated with each thing (Thing Registry), configure
// logging, and create and manage policies and credentials to authenticate things.
//
// For more information about how AWS IoT works, see the Developer Guide (http://docs.aws.amazon.com/iot/latest/developerguide/aws-iot-how-it-works.html).
//The service client's operations are safe to be used concurrently.
// It is not safe to mutate any of the client's properties though.
type IoT struct {
	*client.Client
}

// Used for custom client initialization logic
var initClient func(*client.Client)

// Used for custom request initialization logic
var initRequest func(*request.Request)

// A ServiceName is the name of the service the client will make API calls to.
const ServiceName = "iot"

// New creates a new instance of the IoT client with a session.
// If additional configuration is needed for the client instance use the optional
// aws.Config parameter to add your extra config.
//
// Example:
//     // Create a IoT client from just a session.
//     svc := iot.New(mySession)
//
//     // Create a IoT client with additional configuration
//     svc := iot.New(mySession, aws.NewConfig().WithRegion("us-west-2"))
func New(p client.ConfigProvider, cfgs ...*aws.Config) *IoT {
	c := p.ClientConfig(ServiceName, cfgs...)
	return newClient(*c.Config, c.Handlers, c.Endpoint, c.SigningRegion)
}

// newClient creates, initializes and returns a new service client instance.
func newClient(cfg aws.Config, handlers request.Handlers, endpoint, signingRegion string) *IoT {
	svc := &IoT{
		Client: client.New(
			cfg,
			metadata.ClientInfo{
				ServiceName:   ServiceName,
				SigningName:   "execute-api",
				SigningRegion: signingRegion,
				Endpoint:      endpoint,
				APIVersion:    "2015-05-28",
			},
			handlers,
		),
	}

	// Handlers
	svc.Handlers.Sign.PushBackNamed(v4.SignRequestHandler)
	svc.Handlers.Build.PushBackNamed(restjson.BuildHandler)
	svc.Handlers.Unmarshal.PushBackNamed(restjson.UnmarshalHandler)
	svc.Handlers.UnmarshalMeta.PushBackNamed(restjson.UnmarshalMetaHandler)
	svc.Handlers.UnmarshalError.PushBackNamed(restjson.UnmarshalErrorHandler)

	// Run custom client initialization if present
	if initClient != nil {
		initClient(svc.Client)
	}

	return svc
}

// newRequest creates a new request for a IoT operation and runs any
// custom request initialization.
func (c *IoT) newRequest(op *request.Operation, params, data interface{}) *request.Request {
	req := c.NewRequest(op, params, data)

	// Run custom request initialization if present
	if initRequest != nil {
		initRequest(req)
	}

	return req
}
