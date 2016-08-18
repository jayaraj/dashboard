// THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT.

package simpledb

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/client"
	"github.com/aws/aws-sdk-go/aws/client/metadata"
	"github.com/aws/aws-sdk-go/aws/corehandlers"
	"github.com/aws/aws-sdk-go/aws/request"
	"github.com/aws/aws-sdk-go/private/protocol/query"
	"github.com/aws/aws-sdk-go/private/signer/v2"
)

// Amazon SimpleDB is a web service providing the core database functions of
// data indexing and querying in the cloud. By offloading the time and effort
// associated with building and operating a web-scale database, SimpleDB provides
// developers the freedom to focus on application development.  A traditional,
// clustered relational database requires a sizable upfront capital outlay,
// is complex to design, and often requires extensive and repetitive database
// administration. Amazon SimpleDB is dramatically simpler, requiring no schema,
// automatically indexing your data and providing a simple API for storage and
// access. This approach eliminates the administrative burden of data modeling,
// index maintenance, and performance tuning. Developers gain access to this
// functionality within Amazon's proven computing environment, are able to scale
// instantly, and pay only for what they use.
//
//  Visit http://aws.amazon.com/simpledb/ (http://aws.amazon.com/simpledb/)
// for more information.
//The service client's operations are safe to be used concurrently.
// It is not safe to mutate any of the client's properties though.
type SimpleDB struct {
	*client.Client
}

// Used for custom client initialization logic
var initClient func(*client.Client)

// Used for custom request initialization logic
var initRequest func(*request.Request)

// A ServiceName is the name of the service the client will make API calls to.
const ServiceName = "sdb"

// New creates a new instance of the SimpleDB client with a session.
// If additional configuration is needed for the client instance use the optional
// aws.Config parameter to add your extra config.
//
// Example:
//     // Create a SimpleDB client from just a session.
//     svc := simpledb.New(mySession)
//
//     // Create a SimpleDB client with additional configuration
//     svc := simpledb.New(mySession, aws.NewConfig().WithRegion("us-west-2"))
func New(p client.ConfigProvider, cfgs ...*aws.Config) *SimpleDB {
	c := p.ClientConfig(ServiceName, cfgs...)
	return newClient(*c.Config, c.Handlers, c.Endpoint, c.SigningRegion)
}

// newClient creates, initializes and returns a new service client instance.
func newClient(cfg aws.Config, handlers request.Handlers, endpoint, signingRegion string) *SimpleDB {
	svc := &SimpleDB{
		Client: client.New(
			cfg,
			metadata.ClientInfo{
				ServiceName:   ServiceName,
				SigningRegion: signingRegion,
				Endpoint:      endpoint,
				APIVersion:    "2009-04-15",
			},
			handlers,
		),
	}

	// Handlers
	svc.Handlers.Sign.PushBackNamed(v2.SignRequestHandler)
	svc.Handlers.Sign.PushBackNamed(corehandlers.BuildContentLengthHandler)
	svc.Handlers.Build.PushBackNamed(query.BuildHandler)
	svc.Handlers.Unmarshal.PushBackNamed(query.UnmarshalHandler)
	svc.Handlers.UnmarshalMeta.PushBackNamed(query.UnmarshalMetaHandler)
	svc.Handlers.UnmarshalError.PushBackNamed(query.UnmarshalErrorHandler)

	// Run custom client initialization if present
	if initClient != nil {
		initClient(svc.Client)
	}

	return svc
}

// newRequest creates a new request for a SimpleDB operation and runs any
// custom request initialization.
func (c *SimpleDB) newRequest(op *request.Operation, params, data interface{}) *request.Request {
	req := c.NewRequest(op, params, data)

	// Run custom request initialization if present
	if initRequest != nil {
		initRequest(req)
	}

	return req
}
