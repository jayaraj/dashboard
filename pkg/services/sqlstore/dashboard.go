package sqlstore

import (
	"context"
	"fmt"

	"github.com/grafana/grafana/pkg/models"
)

func (ss *SQLStore) GetDashboardsBySlug(ctx context.Context, query *models.GetDashboardsBySlugQuery) error {
	return ss.WithDbSession(ctx, func(dbSession *DBSession) error {
		dashboards := make([]*models.Dashboard, 0)

		sql := `SELECT * FROM dashboard WHERE dashboard.org_id=? AND dashboard.slug=?`
		sess := dbSession.SQL(sql, query.OrgId, query.Slug)
		if err := sess.Find(&dashboards); err != nil {
			return err
		}
		if len(dashboards) < 1 {
			return fmt.Errorf("dashboard not found")
		}
		sql = `SELECT * FROM dashboard WHERE folder_id IN (?)`
		sess = dbSession.SQL(sql, dashboards[0].Id)
		query.Result = make([]*models.Dashboard, 0)
		if err := sess.Find(&query.Result); err != nil {
			return err
		}
		return nil
	})
}
