package navtreeimpl

import (
	"fmt"
	"strings"

	ac "github.com/grafana/grafana/pkg/services/accesscontrol"
	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
	"github.com/grafana/grafana/pkg/services/devicemanagement/alert"
	"github.com/grafana/grafana/pkg/services/devicemanagement/configuration"
	"github.com/grafana/grafana/pkg/services/devicemanagement/fileloader"
	"github.com/grafana/grafana/pkg/services/devicemanagement/group"
	"github.com/grafana/grafana/pkg/services/devicemanagement/inventory"
	"github.com/grafana/grafana/pkg/services/devicemanagement/resource"
	"github.com/grafana/grafana/pkg/services/navtree"
)

func (s *ServiceImpl) buildDeviceManagementNavLinks(c *contextmodel.ReqContext) *navtree.NavLink {
	hasAccess := ac.HasAccess(s.accessControl, c)
	var devicemanagementChildNavs []*navtree.NavLink

	if hasAccess(resource.ReadPageAccess) {
		devicemanagementChildNavs = append(devicemanagementChildNavs, &navtree.NavLink{
			SortWeight: 1, Text: s.cfg.ResourceTitle + "s", SubTitle: "Manage " + strings.ToLower(s.cfg.ResourceTitle) + "s",
			Id: "resources", Url: s.cfg.AppSubURL + "/org/resources", Icon: "resource",
		})
	}

	if hasAccess(group.ReadPageAccess) {
		devicemanagementChildNavs = append(devicemanagementChildNavs, &navtree.NavLink{
			SortWeight: 2, Text: s.cfg.GroupTitle + "s", SubTitle: "Manage " + strings.ToLower(s.cfg.GroupTitle) + "s",
			Id: "devicemanagement-groups", Url: s.cfg.AppSubURL + "/org/groups", Icon: "layer-group",
		})
	}

	if hasAccess(inventory.ReadPageAccess) {
		devicemanagementChildNavs = append(devicemanagementChildNavs, &navtree.NavLink{
			SortWeight: 3, Text: "Inventory", SubTitle: fmt.Sprintf("Manage %s's inventory", strings.ToLower(s.cfg.ResourceTitle)),
			Id: "inventories", Url: s.cfg.AppSubURL + "/inventories", Icon: "inventory",
		})
	}

	if hasAccess(fileloader.ReadPageAccess) {
		devicemanagementChildNavs = append(devicemanagementChildNavs, &navtree.NavLink{
			SortWeight: 4, Text: "CSV Processor", SubTitle: "Process  csv files",
			Id: "csventries", Url: s.cfg.AppSubURL + "/csventries", Icon: "upload-files",
		})
	}

	if hasAccess(configuration.ReadPageAccess) {
		devicemanagementChildNavs = append(devicemanagementChildNavs, &navtree.NavLink{
			SortWeight: 5, Text: "Configuration", SubTitle: fmt.Sprintf("Manage configurations for org or %s or %s", strings.ToLower(s.cfg.ResourceTitle), strings.ToLower(s.cfg.GroupTitle)),
			Id: "configurationtypes", Url: s.cfg.AppSubURL + "/configurationtypes", Icon: "resource-type",
		})
	}

	if len(devicemanagementChildNavs) > 0 {
		var devMgmtNav = navtree.NavLink{
			Text:       fmt.Sprintf("%s Management", s.cfg.ResourceTitle),
			SubTitle:   fmt.Sprintf("Manage your %ss and %ss", strings.ToLower(s.cfg.ResourceTitle), strings.ToLower(s.cfg.GroupTitle)),
			Id:         navtree.NavIDDeviceManagement,
			Icon:       "resource-management",
			Children:   devicemanagementChildNavs,
			SortWeight: navtree.WeightDevicemanagement,
			Url:        s.cfg.AppSubURL + "/devicemanagement",
		}
		return &devMgmtNav
	}
	return nil
}

func (s *ServiceImpl) buildGrafoAlertNavLinks(c *contextmodel.ReqContext) *navtree.NavLink {
	hasAccess := ac.HasAccess(s.accessControl, c)
	var alertsChildNavs []*navtree.NavLink

	if hasAccess(resource.ReadPageAccess) {
		alertsChildNavs = append(alertsChildNavs, &navtree.NavLink{
			SortWeight: 1, Text: "Alert Definitions", SubTitle: "Manage your alert definitions & alerts at org level",
			Id: "alerts", Url: s.cfg.AppSubURL + "/org/alertdefinitions", Icon: "bell",
		})
	}
	if hasAccess(alert.ReadPageAccess) {
		var alertNav = navtree.NavLink{
			Text:       fmt.Sprintf("%s Alerts", s.cfg.ResourceTitle),
			SubTitle:   "Manage your alerts",
			Id:         navtree.NavIDGrafoAlerting,
			Icon:       "bell-edit",
			Children:   alertsChildNavs,
			SortWeight: navtree.WeightGrafoAlerts,
			Url:        s.cfg.AppSubURL + "/devicemanagementalerts",
		}
		return &alertNav
	}
	return nil
}
