package navtreeimpl

import (
	ac "github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/billing/connection"
	"github.com/grafana/grafana/pkg/services/billing/fixedcharge"
	"github.com/grafana/grafana/pkg/services/billing/profile"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/navtree"
)

func (s *ServiceImpl) buildBillingNavLinks(c *contextmodel.ReqContext) *navtree.NavLink {
	hasAccess := ac.HasAccess(s.accessControl, c)
	var billingChildNavs []*navtree.NavLink

	if hasAccess(connection.ReadPageAccess) {
		billingChildNavs = append(billingChildNavs, &navtree.NavLink{
			SortWeight: 1, Text: "Connections", SubTitle: "Manage org connections",
			Id: "billing-connections", Url: s.cfg.AppSubURL + "/org/connections", Icon: "tax",
		})
	}
	if hasAccess(profile.ReadPageAccess) {
		billingChildNavs = append(billingChildNavs, &navtree.NavLink{
			SortWeight: 2, Text: "Profiles", SubTitle: "Manage org profiles",
			Id: "profiles", Url: s.cfg.AppSubURL + "/org/profiles", Icon: "tax",
		})
	}

	if hasAccess(fixedcharge.ReadPageAccess) {
		billingChildNavs = append(billingChildNavs, &navtree.NavLink{
			SortWeight: 3, Text: "Fixed Charges", SubTitle: "Manage org wide charges",
			Id: "fixedcharges", Url: s.cfg.AppSubURL + "/org/fixedcharges", Icon: "fixed-charge",
		})
	}

	if len(billingChildNavs) > 0 {
		var billingNav = navtree.NavLink{
			Text:       "Accounts",
			SubTitle:   "Manage your connections",
			Id:         navtree.NavIDBilling,
			Icon:       "billing-management",
			Children:   billingChildNavs,
			SortWeight: navtree.WeightBilling,
			Url:        s.cfg.AppSubURL + "/billing",
		}
		return &billingNav
	}
	return nil
}
