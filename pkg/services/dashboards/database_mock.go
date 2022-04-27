// Code generated by mockery v2.12.1. DO NOT EDIT.

package dashboards

import (
	context "context"

	models "github.com/grafana/grafana/pkg/models"
	mock "github.com/stretchr/testify/mock"

	testing "testing"
)

// FakeDashboardStore is an autogenerated mock type for the Store type
type FakeDashboardStore struct {
	mock.Mock
}

// DeleteDashboard provides a mock function with given fields: ctx, cmd
func (_m *FakeDashboardStore) DeleteDashboard(ctx context.Context, cmd *models.DeleteDashboardCommand) error {
	ret := _m.Called(ctx, cmd)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, *models.DeleteDashboardCommand) error); ok {
		r0 = rf(ctx, cmd)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// DeleteOrphanedProvisionedDashboards provides a mock function with given fields: ctx, cmd
func (_m *FakeDashboardStore) DeleteOrphanedProvisionedDashboards(ctx context.Context, cmd *models.DeleteOrphanedProvisionedDashboardsCommand) error {
	ret := _m.Called(ctx, cmd)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, *models.DeleteOrphanedProvisionedDashboardsCommand) error); ok {
		r0 = rf(ctx, cmd)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// GetDashboardsByPluginID provides a mock function with given fields: ctx, query
func (_m *FakeDashboardStore) GetDashboardsByPluginID(ctx context.Context, query *models.GetDashboardsByPluginIdQuery) error {
	ret := _m.Called(ctx, query)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, *models.GetDashboardsByPluginIdQuery) error); ok {
		r0 = rf(ctx, query)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// GetFolderByID provides a mock function with given fields: ctx, orgID, id
func (_m *FakeDashboardStore) GetFolderByID(ctx context.Context, orgID int64, id int64) (*models.Folder, error) {
	ret := _m.Called(ctx, orgID, id)

	var r0 *models.Folder
	if rf, ok := ret.Get(0).(func(context.Context, int64, int64) *models.Folder); ok {
		r0 = rf(ctx, orgID, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.Folder)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, int64, int64) error); ok {
		r1 = rf(ctx, orgID, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetFolderByTitle provides a mock function with given fields: ctx, orgID, title
func (_m *FakeDashboardStore) GetFolderByTitle(ctx context.Context, orgID int64, title string) (*models.Folder, error) {
	ret := _m.Called(ctx, orgID, title)

	var r0 *models.Folder
	if rf, ok := ret.Get(0).(func(context.Context, int64, string) *models.Folder); ok {
		r0 = rf(ctx, orgID, title)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.Folder)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, int64, string) error); ok {
		r1 = rf(ctx, orgID, title)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetFolderByUID provides a mock function with given fields: ctx, orgID, uid
func (_m *FakeDashboardStore) GetFolderByUID(ctx context.Context, orgID int64, uid string) (*models.Folder, error) {
	ret := _m.Called(ctx, orgID, uid)

	var r0 *models.Folder
	if rf, ok := ret.Get(0).(func(context.Context, int64, string) *models.Folder); ok {
		r0 = rf(ctx, orgID, uid)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.Folder)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, int64, string) error); ok {
		r1 = rf(ctx, orgID, uid)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetProvisionedDashboardData provides a mock function with given fields: name
func (_m *FakeDashboardStore) GetProvisionedDashboardData(name string) ([]*models.DashboardProvisioning, error) {
	ret := _m.Called(name)

	var r0 []*models.DashboardProvisioning
	if rf, ok := ret.Get(0).(func(string) []*models.DashboardProvisioning); ok {
		r0 = rf(name)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*models.DashboardProvisioning)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(name)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetProvisionedDataByDashboardID provides a mock function with given fields: dashboardID
func (_m *FakeDashboardStore) GetProvisionedDataByDashboardID(dashboardID int64) (*models.DashboardProvisioning, error) {
	ret := _m.Called(dashboardID)

	var r0 *models.DashboardProvisioning
	if rf, ok := ret.Get(0).(func(int64) *models.DashboardProvisioning); ok {
		r0 = rf(dashboardID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.DashboardProvisioning)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(int64) error); ok {
		r1 = rf(dashboardID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetProvisionedDataByDashboardUID provides a mock function with given fields: orgID, dashboardUID
func (_m *FakeDashboardStore) GetProvisionedDataByDashboardUID(orgID int64, dashboardUID string) (*models.DashboardProvisioning, error) {
	ret := _m.Called(orgID, dashboardUID)

	var r0 *models.DashboardProvisioning
	if rf, ok := ret.Get(0).(func(int64, string) *models.DashboardProvisioning); ok {
		r0 = rf(orgID, dashboardUID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.DashboardProvisioning)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(int64, string) error); ok {
		r1 = rf(orgID, dashboardUID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SaveAlerts provides a mock function with given fields: ctx, dashID, alerts
func (_m *FakeDashboardStore) SaveAlerts(ctx context.Context, dashID int64, alerts []*models.Alert) error {
	ret := _m.Called(ctx, dashID, alerts)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, int64, []*models.Alert) error); ok {
		r0 = rf(ctx, dashID, alerts)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SaveDashboard provides a mock function with given fields: cmd
func (_m *FakeDashboardStore) SaveDashboard(cmd models.SaveDashboardCommand) (*models.Dashboard, error) {
	ret := _m.Called(cmd)

	var r0 *models.Dashboard
	if rf, ok := ret.Get(0).(func(models.SaveDashboardCommand) *models.Dashboard); ok {
		r0 = rf(cmd)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.Dashboard)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(models.SaveDashboardCommand) error); ok {
		r1 = rf(cmd)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SaveDashboardSharingConfig provides a mock function with given fields: cmd
func (_m *FakeDashboardStore) SaveDashboardSharingConfig(cmd models.SaveDashboardSharingConfigCommand) (*models.DashboardSharingConfig, error) {
	ret := _m.Called(cmd)

	var r0 *models.DashboardSharingConfig
	if rf, ok := ret.Get(0).(func(models.SaveDashboardSharingConfigCommand) *models.DashboardSharingConfig); ok {
		r0 = rf(cmd)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.DashboardSharingConfig)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(models.SaveDashboardSharingConfigCommand) error); ok {
		r1 = rf(cmd)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SaveProvisionedDashboard provides a mock function with given fields: cmd, provisioning
func (_m *FakeDashboardStore) SaveProvisionedDashboard(cmd models.SaveDashboardCommand, provisioning *models.DashboardProvisioning) (*models.Dashboard, error) {
	ret := _m.Called(cmd, provisioning)

	var r0 *models.Dashboard
	if rf, ok := ret.Get(0).(func(models.SaveDashboardCommand, *models.DashboardProvisioning) *models.Dashboard); ok {
		r0 = rf(cmd, provisioning)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*models.Dashboard)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(models.SaveDashboardCommand, *models.DashboardProvisioning) error); ok {
		r1 = rf(cmd, provisioning)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// UnprovisionDashboard provides a mock function with given fields: ctx, id
func (_m *FakeDashboardStore) UnprovisionDashboard(ctx context.Context, id int64) error {
	ret := _m.Called(ctx, id)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, int64) error); ok {
		r0 = rf(ctx, id)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// UpdateDashboardACL provides a mock function with given fields: ctx, uid, items
func (_m *FakeDashboardStore) UpdateDashboardACL(ctx context.Context, uid int64, items []*models.DashboardAcl) error {
	ret := _m.Called(ctx, uid, items)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, int64, []*models.DashboardAcl) error); ok {
		r0 = rf(ctx, uid, items)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// ValidateDashboardBeforeSave provides a mock function with given fields: dashboard, overwrite
func (_m *FakeDashboardStore) ValidateDashboardBeforeSave(dashboard *models.Dashboard, overwrite bool) (bool, error) {
	ret := _m.Called(dashboard, overwrite)

	var r0 bool
	if rf, ok := ret.Get(0).(func(*models.Dashboard, bool) bool); ok {
		r0 = rf(dashboard, overwrite)
	} else {
		r0 = ret.Get(0).(bool)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(*models.Dashboard, bool) error); ok {
		r1 = rf(dashboard, overwrite)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// NewFakeDashboardStore creates a new instance of FakeDashboardStore. It also registers the testing.TB interface on the mock and a cleanup function to assert the mocks expectations.
func NewFakeDashboardStore(t testing.TB) *FakeDashboardStore {
	mock := &FakeDashboardStore{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
