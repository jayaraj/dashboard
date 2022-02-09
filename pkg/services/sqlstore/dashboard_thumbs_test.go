//go:build integration
// +build integration

package sqlstore

import (
	"context"
	"testing"

	"github.com/grafana/grafana/pkg/models"
	"github.com/stretchr/testify/require"
)

func TestSqlStorage(t *testing.T) {

	var sqlStore *SQLStore
	var savedFolder *models.Dashboard

	setup := func() {
		sqlStore = InitTestDB(t)
		savedFolder = insertTestDashboard(t, sqlStore, "1 test dash folder", 1, 0, true, "prod", "webapp")
	}

	t.Run("Should insert dashboard in default state", func(t *testing.T) {
		setup()
		dash := insertTestDashboard(t, sqlStore, "test dash 23", 1, savedFolder.Id, false, "prod", "webapp")
		upsertTestDashboardThumbnail(t, sqlStore, dash.Uid, dash.OrgId, dash.Version)
		thumb := getThumbnail(t, sqlStore, dash.Uid, dash.OrgId)

		require.Positive(t, thumb.Id)
		require.Equal(t, models.ThumbnailStateDefault, thumb.State)
		require.Equal(t, dash.Version, thumb.DashboardVersion)
	})

	t.Run("Should be able to update the thumbnail", func(t *testing.T) {
		setup()
		dash := insertTestDashboard(t, sqlStore, "test dash 23", 1, savedFolder.Id, false, "prod", "webapp")
		upsertTestDashboardThumbnail(t, sqlStore, dash.Uid, dash.OrgId, dash.Version)
		thumb := getThumbnail(t, sqlStore, dash.Uid, dash.OrgId)

		insertedThumbnailId := thumb.Id
		upsertTestDashboardThumbnail(t, sqlStore, dash.Uid, dash.OrgId, dash.Version+1)

		updatedThumb := getThumbnail(t, sqlStore, dash.Uid, dash.OrgId)
		require.Equal(t, insertedThumbnailId, updatedThumb.Id)
		require.Equal(t, dash.Version+1, updatedThumb.DashboardVersion)
	})

	t.Run("Should return empty array if all dashboards have thumbnails", func(t *testing.T) {
		setup()
		dash := insertTestDashboard(t, sqlStore, "test dash 23", 1, savedFolder.Id, false, "prod", "webapp")

		upsertTestDashboardThumbnail(t, sqlStore, dash.Uid, dash.OrgId, dash.Version)

		cmd := models.FindDashboardsWithStaleThumbnailsCommand{}
		res, err := sqlStore.FindDashboardsWithStaleThumbnails(context.Background(), &cmd)
		require.NoError(t, err)
		require.Len(t, res, 0)
	})

	t.Run("Should return dashboards with thumbnails marked as stale", func(t *testing.T) {
		setup()
		dash := insertTestDashboard(t, sqlStore, "test dash 23", 1, savedFolder.Id, false, "prod", "webapp")
		upsertTestDashboardThumbnail(t, sqlStore, dash.Uid, dash.OrgId, dash.Version)
		updateThumbnailState(t, sqlStore, dash.Uid, dash.OrgId, models.ThumbnailStateStale)

		cmd := models.FindDashboardsWithStaleThumbnailsCommand{}
		res, err := sqlStore.FindDashboardsWithStaleThumbnails(context.Background(), &cmd)
		require.NoError(t, err)
		require.Len(t, res, 1)
		require.Equal(t, dash.Id, res[0].Id)
	})

	t.Run("Should not return dashboards with updated thumbnails that had been marked as stale", func(t *testing.T) {
		setup()
		dash := insertTestDashboard(t, sqlStore, "test dash 23", 1, savedFolder.Id, false, "prod", "webapp")
		upsertTestDashboardThumbnail(t, sqlStore, dash.Uid, dash.OrgId, dash.Version)
		updateThumbnailState(t, sqlStore, dash.Uid, dash.OrgId, models.ThumbnailStateStale)
		upsertTestDashboardThumbnail(t, sqlStore, dash.Uid, dash.OrgId, dash.Version)

		cmd := models.FindDashboardsWithStaleThumbnailsCommand{}
		res, err := sqlStore.FindDashboardsWithStaleThumbnails(context.Background(), &cmd)
		require.NoError(t, err)
		require.Len(t, res, 0)
	})

	t.Run("Should find dashboards without thumbnails", func(t *testing.T) {
		setup()
		dash := insertTestDashboard(t, sqlStore, "test dash 23", 1, savedFolder.Id, false, "prod", "webapp")

		cmd := models.FindDashboardsWithStaleThumbnailsCommand{}
		res, err := sqlStore.FindDashboardsWithStaleThumbnails(context.Background(), &cmd)
		require.NoError(t, err)
		require.Len(t, res, 1)
		require.Equal(t, dash.Id, res[0].Id)
	})

	t.Run("Should find dashboards with outdated thumbnails", func(t *testing.T) {
		setup()
		dash := insertTestDashboard(t, sqlStore, "test dash 23", 1, savedFolder.Id, false, "prod", "webapp")
		upsertTestDashboardThumbnail(t, sqlStore, dash.Uid, dash.OrgId, dash.Version)

		updateTestDashboard(t, sqlStore, dash, map[string]interface{}{
			"tags": "different-tag",
		})

		cmd := models.FindDashboardsWithStaleThumbnailsCommand{}
		res, err := sqlStore.FindDashboardsWithStaleThumbnails(context.Background(), &cmd)
		require.NoError(t, err)
		require.Len(t, res, 1)
		require.Equal(t, dash.Id, res[0].Id)
	})

	t.Run("Should not return dashboards with locked thumbnails even if they are outdated", func(t *testing.T) {
		setup()
		dash := insertTestDashboard(t, sqlStore, "test dash 23", 1, savedFolder.Id, false, "prod", "webapp")
		upsertTestDashboardThumbnail(t, sqlStore, dash.Uid, dash.OrgId, dash.Version)
		updateThumbnailState(t, sqlStore, dash.Uid, dash.OrgId, models.ThumbnailStateLocked)

		updateTestDashboard(t, sqlStore, dash, map[string]interface{}{
			"tags": "different-tag",
		})

		cmd := models.FindDashboardsWithStaleThumbnailsCommand{}
		res, err := sqlStore.FindDashboardsWithStaleThumbnails(context.Background(), &cmd)
		require.NoError(t, err)
		require.Len(t, res, 0)
	})

	t.Run("Should not return dashboards with manually uploaded thumbnails by default", func(t *testing.T) {
		setup()
		dash := insertTestDashboard(t, sqlStore, "test dash 23", 1, savedFolder.Id, false, "prod", "webapp")
		upsertTestDashboardThumbnail(t, sqlStore, dash.Uid, dash.OrgId, models.DashboardVersionForManualThumbnailUpload)

		updateTestDashboard(t, sqlStore, dash, map[string]interface{}{
			"tags": "different-tag",
		})

		cmd := models.FindDashboardsWithStaleThumbnailsCommand{}
		res, err := sqlStore.FindDashboardsWithStaleThumbnails(context.Background(), &cmd)
		require.NoError(t, err)
		require.Len(t, res, 0)
	})

	t.Run("Should return dashboards with manually uploaded thumbnails if requested", func(t *testing.T) {
		setup()
		dash := insertTestDashboard(t, sqlStore, "test dash 23", 1, savedFolder.Id, false, "prod", "webapp")
		upsertTestDashboardThumbnail(t, sqlStore, dash.Uid, dash.OrgId, models.DashboardVersionForManualThumbnailUpload)

		updateTestDashboard(t, sqlStore, dash, map[string]interface{}{
			"tags": "different-tag",
		})

		cmd := models.FindDashboardsWithStaleThumbnailsCommand{
			IncludeManuallyUploadedThumbnails: true,
		}
		res, err := sqlStore.FindDashboardsWithStaleThumbnails(context.Background(), &cmd)
		require.NoError(t, err)
		require.Len(t, res, 1)
		require.Equal(t, dash.Id, res[0].Id)
	})
}

func getThumbnail(t *testing.T, sqlStore *SQLStore, dashboardUID string, orgId int64) *models.DashboardThumbnail {
	t.Helper()
	cmd := models.GetDashboardThumbnailCommand{
		DashboardThumbnailMeta: models.DashboardThumbnailMeta{
			DashboardUID: dashboardUID,
			OrgId:        orgId,
			PanelID:      0,
			Kind:         models.ThumbnailKindDefault,
			Theme:        models.ThemeDark,
		},
	}

	thumb, err := sqlStore.GetThumbnail(context.Background(), &cmd)
	require.NoError(t, err)
	return thumb
}

func upsertTestDashboardThumbnail(t *testing.T, sqlStore *SQLStore, dashboardUID string, orgId int64, dashboardVersion int) *models.DashboardThumbnail {
	t.Helper()
	cmd := models.SaveDashboardThumbnailCommand{
		DashboardThumbnailMeta: models.DashboardThumbnailMeta{
			DashboardUID: dashboardUID,
			OrgId:        orgId,
			PanelID:      0,
			Kind:         models.ThumbnailKindDefault,
			Theme:        models.ThemeDark,
		},
		DashboardVersion: dashboardVersion,
		Image:            make([]byte, 0),
		MimeType:         "image/png",
	}
	dash, err := sqlStore.SaveThumbnail(context.Background(), &cmd)
	require.NoError(t, err)
	require.NotNil(t, dash)

	return dash
}

func updateThumbnailState(t *testing.T, sqlStore *SQLStore, dashboardUID string, orgId int64, state models.ThumbnailState) {
	t.Helper()
	cmd := models.UpdateThumbnailStateCommand{
		DashboardThumbnailMeta: models.DashboardThumbnailMeta{
			DashboardUID: dashboardUID,
			OrgId:        orgId,
			PanelID:      0,
			Kind:         models.ThumbnailKindDefault,
			Theme:        models.ThemeDark,
		},
		State: state,
	}
	err := sqlStore.UpdateThumbnailState(context.Background(), &cmd)
	require.NoError(t, err)
}
