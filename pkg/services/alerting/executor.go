package alerting

import (
	"github.com/grafana/grafana/pkg/log"
	m "github.com/grafana/grafana/pkg/models"
	"time"
)

type Executor interface {
	Execute(rule m.AlertRule, responseQueue chan *AlertResult)
}

type DummieExecutor struct{}

func (this DummieExecutor) Execute(rule m.AlertRule, responseQueue chan *AlertResult) {
	//if rule.Id == 6 {
	//	time.Sleep(time.Second * 60)
	//}
	time.Sleep(time.Second)
	log.Info("Finnished executing: %d", rule.Id)
	responseQueue <- &AlertResult{state: "OK", id: rule.Id}
	//return nil,
}
