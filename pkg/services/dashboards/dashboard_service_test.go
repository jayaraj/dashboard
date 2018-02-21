package dashboards

import (
	"errors"
	"testing"

	"github.com/grafana/grafana/pkg/services/guardian"

	"github.com/grafana/grafana/pkg/bus"
	"github.com/grafana/grafana/pkg/models"

	. "github.com/smartystreets/goconvey/convey"
)

func TestDashboardService(t *testing.T) {
	Convey("Dashboard service tests", t, func() {
		service := dashboardServiceImpl{}

		origNewDashboardGuardian := guardian.New
		mockDashboardGuardian(&fakeDashboardGuardian{canSave: true})

		Convey("Save dashboard validation", func() {
			dto := &SaveDashboardDTO{}

			Convey("When saving a dashboard with empty title it should return error", func() {
				titles := []string{"", " ", "   \t   "}

				for _, title := range titles {
					dto.Dashboard = models.NewDashboard(title)
					_, err := service.SaveDashboard(dto)
					So(err, ShouldEqual, models.ErrDashboardTitleEmpty)
				}
			})

			Convey("Should return validation error if it's a folder and have a folder id", func() {
				dto.Dashboard = models.NewDashboardFolder("Folder")
				dto.Dashboard.FolderId = 1
				_, err := service.SaveDashboard(dto)
				So(err, ShouldEqual, models.ErrDashboardFolderCannotHaveParent)
			})

			Convey("Should return validation error if folder is named General", func() {
				dto.Dashboard = models.NewDashboardFolder("General")
				_, err := service.SaveDashboard(dto)
				So(err, ShouldEqual, models.ErrDashboardFolderNameExists)
			})

			Convey("When saving a dashboard should validate uid", func() {
				bus.AddHandler("test", func(cmd *models.ValidateDashboardAlertsCommand) error {
					return nil
				})

				bus.AddHandler("test", func(cmd *models.ValidateDashboardBeforeSaveCommand) error {
					return nil
				})

				testCases := []struct {
					Uid   string
					Error error
				}{
					{Uid: "", Error: nil},
					{Uid: "   ", Error: nil},
					{Uid: "  \t  ", Error: nil},
					{Uid: "asdf90_-", Error: nil},
					{Uid: "asdf/90", Error: models.ErrDashboardInvalidUid},
					{Uid: "   asdfghjklqwertyuiopzxcvbnmasdfghjklqwer   ", Error: nil},
					{Uid: "asdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnmasdfghjklqwertyuiopzxcvbnm", Error: models.ErrDashboardUidToLong},
				}

				for _, tc := range testCases {
					dto.Dashboard = models.NewDashboard("title")
					dto.Dashboard.SetUid(tc.Uid)
					dto.User = &models.SignedInUser{}

					_, err := service.buildSaveDashboardCommand(dto)
					So(err, ShouldEqual, tc.Error)
				}
			})

			Convey("Should return validation error if alert data is invalid", func() {
				bus.AddHandler("test", func(cmd *models.ValidateDashboardAlertsCommand) error {
					return errors.New("error")
				})

				dto.Dashboard = models.NewDashboard("Dash")
				_, err := service.SaveDashboard(dto)
				So(err, ShouldEqual, models.ErrDashboardContainsInvalidAlertData)
			})
		})

		Reset(func() {
			guardian.New = origNewDashboardGuardian
		})
	})
}

func mockDashboardGuardian(mock *fakeDashboardGuardian) {
	guardian.New = func(dashId int64, orgId int64, user *models.SignedInUser) guardian.DashboardGuardian {
		mock.orgId = orgId
		mock.dashId = dashId
		mock.user = user
		return mock
	}
}

type fakeDashboardGuardian struct {
	dashId                      int64
	orgId                       int64
	user                        *models.SignedInUser
	canSave                     bool
	canEdit                     bool
	canView                     bool
	canAdmin                    bool
	hasPermission               bool
	checkPermissionBeforeUpdate bool
}

func (g *fakeDashboardGuardian) CanSave() (bool, error) {
	return g.canSave, nil
}

func (g *fakeDashboardGuardian) CanEdit() (bool, error) {
	return g.canEdit, nil
}

func (g *fakeDashboardGuardian) CanView() (bool, error) {
	return g.canView, nil
}

func (g *fakeDashboardGuardian) CanAdmin() (bool, error) {
	return g.canAdmin, nil
}

func (g *fakeDashboardGuardian) HasPermission(permission models.PermissionType) (bool, error) {
	return g.hasPermission, nil
}

func (g *fakeDashboardGuardian) CheckPermissionBeforeUpdate(permission models.PermissionType, updatePermissions []*models.DashboardAcl) (bool, error) {
	return g.checkPermissionBeforeUpdate, nil
}

func (g *fakeDashboardGuardian) GetAcl() ([]*models.DashboardAclInfoDTO, error) {
	return nil, nil
}
