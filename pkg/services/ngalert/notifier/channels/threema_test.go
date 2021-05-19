package channels

import (
	"context"
	"net/url"
	"testing"

	"github.com/prometheus/alertmanager/notify"
	"github.com/prometheus/alertmanager/types"
	"github.com/prometheus/common/model"
	"github.com/stretchr/testify/require"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/components/simplejson"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/alerting"
)

func TestThreemaNotifier(t *testing.T) {
	tmpl := templateForTests(t)

	externalURL, err := url.Parse("http://localhost")
	require.NoError(t, err)
	tmpl.ExternalURL = externalURL

	cases := []struct {
		name         string
		settings     string
		alerts       []*types.Alert
		expMsg       string
		expInitError error
		expMsgError  error
	}{
		{
			name: "One alert",
			settings: `{
				"gateway_id": "*1234567",
				"recipient_id": "87654321",
				"api_secret": "supersecret"
			}`,
			alerts: []*types.Alert{
				{
					Alert: model.Alert{
						Labels:      model.LabelSet{"alertname": "alert1", "lbl1": "val1"},
						Annotations: model.LabelSet{"ann1": "annv1"},
					},
				},
			},
			expMsg:       "from=%2A1234567&secret=supersecret&text=%E2%9A%A0%EF%B8%8F+%5BFIRING%3A1%5D++%28val1%29%0A%0A%2AMessage%3A%2A%0A%0A%2A%2AFiring%2A%2A%0ALabels%3A%0A+-+alertname+%3D+alert1%0A+-+lbl1+%3D+val1%0AAnnotations%3A%0A+-+ann1+%3D+annv1%0ASource%3A+%0A%0A%0A%0A%0A%0A%2AURL%3A%2A+http%3A%2Flocalhost%2Falerting%2Flist%0A&to=87654321",
			expInitError: nil,
			expMsgError:  nil,
		}, {
			name: "Multiple alerts",
			settings: `{
				"gateway_id": "*1234567",
				"recipient_id": "87654321",
				"api_secret": "supersecret"
			}`,
			alerts: []*types.Alert{
				{
					Alert: model.Alert{
						Labels:      model.LabelSet{"alertname": "alert1", "lbl1": "val1"},
						Annotations: model.LabelSet{"ann1": "annv1"},
					},
				}, {
					Alert: model.Alert{
						Labels:      model.LabelSet{"alertname": "alert1", "lbl1": "val2"},
						Annotations: model.LabelSet{"ann1": "annv2"},
					},
				},
			},
			expMsg:       "from=%2A1234567&secret=supersecret&text=%E2%9A%A0%EF%B8%8F+%5BFIRING%3A2%5D++%0A%0A%2AMessage%3A%2A%0A%0A%2A%2AFiring%2A%2A%0ALabels%3A%0A+-+alertname+%3D+alert1%0A+-+lbl1+%3D+val1%0AAnnotations%3A%0A+-+ann1+%3D+annv1%0ASource%3A+%0ALabels%3A%0A+-+alertname+%3D+alert1%0A+-+lbl1+%3D+val2%0AAnnotations%3A%0A+-+ann1+%3D+annv2%0ASource%3A+%0A%0A%0A%0A%0A%0A%2AURL%3A%2A+http%3A%2Flocalhost%2Falerting%2Flist%0A&to=87654321",
			expInitError: nil,
			expMsgError:  nil,
		}, {
			name: "Invalid gateway id",
			settings: `{
				"gateway_id": "12345678",
				"recipient_id": "87654321",
				"api_secret": "supersecret"
			}`,
			expInitError: alerting.ValidationError{Reason: "Invalid Threema Gateway ID: Must start with a *"},
		}, {
			name: "Invalid receipent id",
			settings: `{
				"gateway_id": "*1234567",
				"recipient_id": "8765432",
				"api_secret": "supersecret"
			}`,
			expInitError: alerting.ValidationError{Reason: "Invalid Threema Recipient ID: Must be 8 characters long"},
		}, {
			name: "No API secret",
			settings: `{
				"gateway_id": "*1234567",
				"recipient_id": "87654321"
			}`,
			expInitError: alerting.ValidationError{Reason: "Could not find Threema API secret in settings"},
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			settingsJSON, err := simplejson.NewJson([]byte(c.settings))
			require.NoError(t, err)

			m := &NotificationChannelConfig{
				Name:     "threema_testing",
				Type:     "threema",
				Settings: settingsJSON,
			}

			pn, err := NewThreemaNotifier(m, tmpl)
			if c.expInitError != nil {
				require.Error(t, err)
				require.Equal(t, c.expInitError.Error(), err.Error())
				return
			}
			require.NoError(t, err)

			body := ""
			bus.AddHandlerCtx("test", func(ctx context.Context, webhook *models.SendWebhookSync) error {
				body = webhook.Body
				return nil
			})

			ctx := notify.WithGroupKey(context.Background(), "alertname")
			ctx = notify.WithGroupLabels(ctx, model.LabelSet{"alertname": ""})
			ok, err := pn.Notify(ctx, c.alerts...)
			if c.expMsgError != nil {
				require.False(t, ok)
				require.Error(t, err)
				require.Equal(t, c.expMsgError.Error(), err.Error())
				return
			}
			require.NoError(t, err)
			require.True(t, ok)

			require.Equal(t, c.expMsg, body)
		})
	}
}
