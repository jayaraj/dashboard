package sqlstore

import (
	"fmt"
	"testing"

	"github.com/grafana/grafana/pkg/components/simplejson"
	m "github.com/grafana/grafana/pkg/models"
	. "github.com/smartystreets/goconvey/convey"
)

func TestAlertNotificationSQLAccess(t *testing.T) {
	Convey("Testing Alert notification sql access", t, func() {
		InitTestDB(t)
		var err error

		Convey("Alert notifications should be empty", func() {
			cmd := &m.GetAlertNotificationsQuery{
				OrgId: 2,
				Name:  "email",
			}

			err := GetAlertNotifications(cmd)
			fmt.Printf("errror %v", err)
			So(err, ShouldBeNil)
			So(len(cmd.Result), ShouldEqual, 0)
		})

		Convey("Can save Alert Notification", func() {
			cmd := &m.CreateAlertNotificationCommand{
				Name:     "ops",
				Type:     "email",
				OrgId:    1,
				Settings: simplejson.New(),
			}

			err = CreateAlertNotificationCommand(cmd)
			So(err, ShouldBeNil)
			So(cmd.Result.Id, ShouldNotEqual, 0)
			So(cmd.Result.OrgId, ShouldNotEqual, 0)
			So(cmd.Result.Type, ShouldEqual, "email")

			Convey("Cannot save Alert Notification with the same name", func() {
				err = CreateAlertNotificationCommand(cmd)
				So(err, ShouldNotBeNil)
			})

			Convey("Can update alert notification", func() {
				newCmd := &m.UpdateAlertNotificationCommand{
					Name:     "NewName",
					Type:     "webhook",
					OrgId:    cmd.Result.OrgId,
					Settings: simplejson.New(),
					Id:       cmd.Result.Id,
				}
				err := UpdateAlertNotification(newCmd)
				So(err, ShouldBeNil)
				So(newCmd.Result.Name, ShouldEqual, "NewName")
			})
		})

		Convey("Can search using an array of ids", func() {
			cmd1 := m.CreateAlertNotificationCommand{Name: "nagios", Type: "webhook", OrgId: 1, Settings: simplejson.New()}
			cmd2 := m.CreateAlertNotificationCommand{Name: "slack", Type: "webhook", OrgId: 1, Settings: simplejson.New()}
			cmd3 := m.CreateAlertNotificationCommand{Name: "ops2", Type: "email", OrgId: 1, Settings: simplejson.New()}

			So(CreateAlertNotificationCommand(&cmd1), ShouldBeNil)
			So(CreateAlertNotificationCommand(&cmd2), ShouldBeNil)
			So(CreateAlertNotificationCommand(&cmd3), ShouldBeNil)

			Convey("search", func() {
				query := &m.GetAlertNotificationsQuery{
					Ids:   []int64{cmd1.Result.Id, cmd2.Result.Id, 112341231},
					OrgId: 1,
				}

				err := GetAlertNotifications(query)
				So(err, ShouldBeNil)
				So(len(query.Result), ShouldEqual, 2)
			})
		})
	})
}
