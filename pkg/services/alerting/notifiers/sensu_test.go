package notifiers

import (
	"testing"

	"github.com/grafana/grafana/pkg/components/simplejson"
	m "github.com/grafana/grafana/pkg/models"
	. "github.com/smartystreets/goconvey/convey"
)

func TestSensuNotifier(t *testing.T) {
	Convey("Sensu notifier tests", t, func() {

		Convey("Parsing alert notification from settings", func() {
			Convey("empty settings should return error", func() {
				json := `{ }`

				settingsJSON, _ := simplejson.NewJson([]byte(json))
				model := &m.AlertNotification{
					Name:     "sensu",
					Type:     "sensu",
					Settings: settingsJSON,
				}

				_, err := NewSensuNotifier(model)
				So(err, ShouldNotBeNil)
			})

			Convey("from settings", func() {
				json := `
				{
					"url": "http://sensu-api.example.com:4567/results"
				}`

				settingsJSON, _ := simplejson.NewJson([]byte(json))
				model := &m.AlertNotification{
					Name:     "sensu",
					Type:     "sensu",
					Settings: settingsJSON,
				}

				not, err := NewSensuNotifier(model)
				sensuNotifier := not.(*SensuNotifier)

				So(err, ShouldBeNil)
				So(sensuNotifier.Name, ShouldEqual, "sensu")
				So(sensuNotifier.Type, ShouldEqual, "sensu")
				So(sensuNotifier.Url, ShouldEqual, "http://sensu-api.example.com:4567/results")
			})
		})
	})
}
