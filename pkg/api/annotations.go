package api

import (
	"github.com/grafana/grafana/pkg/api/dtos"
	"github.com/grafana/grafana/pkg/middleware"
	"github.com/grafana/grafana/pkg/services/annotations"
)

func GetAnnotations(c *middleware.Context) Response {

	query := &annotations.ItemQuery{
		From:  c.QueryInt64("from") / 1000,
		To:    c.QueryInt64("to") / 1000,
		Type:  annotations.ItemType(c.Query("type")),
		OrgId: c.OrgId,
		Limit: c.QueryInt64("limit"),
	}

	repo := annotations.GetRepository()

	items, err := repo.Find(query)
	if err != nil {
		return ApiError(500, "Failed to get annotations", err)
	}

	result := make([]dtos.Annotation, 0)

	for _, item := range items {
		result = append(result, dtos.Annotation{
			AlertId:   item.AlertId,
			Time:      item.Epoch * 1000,
			Data:      item.Data,
			NewState:  item.NewState,
			PrevState: item.PrevState,
			Text:      item.Text,
			Metric:    item.Metric,
			Title:     item.Title,
		})
	}

	return Json(200, result)
}
