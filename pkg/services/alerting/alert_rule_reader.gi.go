package alerting

import (
	m "github.com/grafana/grafana/pkg/models"
)

type RuleReader interface {
	Fetch() []m.AlertRule
}

type AlertRuleReader struct{}

func (this AlertRuleReader) Fetch() []m.AlertRule {
	return []m.AlertRule{
		{Id: 1, Title: "alert rule 1", Interval: "10s", Frequency: 10},
		{Id: 2, Title: "alert rule 2", Interval: "10s", Frequency: 10},
		{Id: 3, Title: "alert rule 3", Interval: "10s", Frequency: 10},
		{Id: 4, Title: "alert rule 4", Interval: "10s", Frequency: 5},
		{Id: 5, Title: "alert rule 5", Interval: "10s", Frequency: 5},
		{Id: 6, Title: "alert rule 6", Interval: "10s", Frequency: 1},
	}
}
