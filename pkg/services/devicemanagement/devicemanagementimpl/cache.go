package devicemanagementimpl

import (
	"context"
	"time"

	"github.com/jayaraj/infra/cache"
)

func (service *Service) SetCache(ctx context.Context, key string, value interface{}) (err error) {
	b, err := cache.Serialize(value)
	if err != nil {
		return err
	}
	return service.cache.Set(ctx, key, b, time.Hour)
}

func (service *Service) GetCache(ctx context.Context, key string, value interface{}) (err error) {
	body, err := service.cache.Get(ctx, key)
	if err != nil {
		return err
	}
	return cache.Deserialize(body, value)
}
