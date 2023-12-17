package devicemanagementimpl

import (
	"context"
)

func (service *Service) Publish(ctx context.Context, topic string, data []byte) (err error) {
	return service.nats.Publish(ctx, topic, data)
}

func (service *Service) RequestTopic(ctx context.Context, topic string, msg interface{}) (err error) {
	return service.nats.RequestTopic(ctx, topic, msg)
}
