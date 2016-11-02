package notifiers

import (
	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/log"
	"github.com/grafana/grafana/pkg/metrics"
	m "github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/alerting"
)

func init() {
	alerting.RegisterNotifier("pagerduty", NewPagerdutyNotifier)
}

func NewPagerdutyNotifier(model *m.AlertNotification) (alerting.Notifier, error) {
	key := model.Settings.Get("integrationKey").MustString()
	if key == "" {
		return nil, alerting.ValidationError{Reason: "Could not find integration key property in settings"}
	}

	return &PagerdutyNotifier{
		NotifierBase:     NewNotifierBase(model.Id, model.IsDefault, model.Name, model.Type, model.Settings),
		Key:              key,
		AlertOnExecError: model.Settings.Get("alertOnExecError").MustBool(),
		log:              log.New("alerting.notifier.pagerduty"),
	}, nil
}

type PagerdutyNotifier struct {
	NotifierBase
	Key              string
	AlertOnExecError bool
	log              log.Logger
}

func (this *PagerdutyNotifier) Notify(evalContext *alerting.EvalContext) error {
	this.log.Info("Notifying Pagerduty")
	metrics.M_Alerting_Notification_Sent_PagerDuty.Inc(1)

	if (evalContext.Rule.State == m.AlertStateAlerting) ||
		((this.AlertOnExecError) && (evalContext.Rule.State == m.AlertStateExecError)) {

		// Pagerduty Events API URL
		pgEventsUrl := "https://events.pagerduty.com/generic/2010-04-15/create_event.json"

		bodyJSON := simplejson.New()
		bodyJSON.Set("service_key", this.Key)
		bodyJSON.Set("description", evalContext.Rule.Name+"-"+evalContext.Rule.Message)
		bodyJSON.Set("client", "Grafana")
		bodyJSON.Set("event_type", "trigger")

		ruleUrl, err := evalContext.GetRuleUrl()
		if err != nil {
			this.log.Error("Failed get rule link", "error", err)
			return err
		}
		bodyJSON.Set("client_url", ruleUrl)

		if evalContext.ImagePublicUrl != "" {
			var contexts []interface{}
			imageJSON := simplejson.New()
			imageJSON.Set("type", "image")
			imageJSON.Set("src", evalContext.ImagePublicUrl)
			contexts[0] = imageJSON
			bodyJSON.Set("contexts", contexts)
		}

		body, _ := bodyJSON.MarshalJSON()

		cmd := &m.SendWebhook{
			Url:        pgEventsUrl,
			Body:       string(body),
			HttpMethod: "POST",
		}

		if err := bus.Dispatch(cmd); err != nil {
			this.log.Error("Failed to send notification to Pagerduty", "error", err, "body", string(body))
		}

	} else {
		this.log.Info("Not sending a trigger to Pagerduty", "state", evalContext.Rule.State)
	}

	return nil
}
