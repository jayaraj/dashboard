package api

import (
	"fmt"

	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/plugins"
	ac "github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/dashboards"
	"github.com/grafana/grafana/pkg/services/datasources"
	"github.com/grafana/grafana/pkg/services/org"
	"github.com/grafana/grafana/pkg/services/serviceaccounts"
	"github.com/grafana/grafana/pkg/setting"
	"github.com/grafana/grafana/pkg/tsdb/grafanads"
)

// API related actions
const (
	ActionProvisioningReload = "provisioning:reload"

	ActionOrgsRead             = "orgs:read"
	ActionOrgsPreferencesRead  = "orgs.preferences:read"
	ActionOrgsQuotasRead       = "orgs.quotas:read"
	ActionOrgsWrite            = "orgs:write"
	ActionOrgsPreferencesWrite = "orgs.preferences:write"
	ActionOrgsQuotasWrite      = "orgs.quotas:write"
	ActionOrgsDelete           = "orgs:delete"
	ActionOrgsCreate           = "orgs:create"
)

// API related scopes
var (
	ScopeProvisionersAll           = ac.Scope("provisioners", "*")
	ScopeProvisionersDashboards    = ac.Scope("provisioners", "dashboards")
	ScopeProvisionersPlugins       = ac.Scope("provisioners", "plugins")
	ScopeProvisionersDatasources   = ac.Scope("provisioners", "datasources")
	ScopeProvisionersNotifications = ac.Scope("provisioners", "notifications")
	ScopeProvisionersAlertRules    = ac.Scope("provisioners", "alerting")
)

// declareFixedRoles declares to the AccessControl service fixed roles and their
// grants to organization roles ("Viewer", "Editor", "Admin") or "Grafana Admin"
// that HTTPServer needs
func (hs *HTTPServer) declareFixedRoles() error {
	// Declare plugins roles
	if err := plugins.DeclareRBACRoles(hs.AccessControl); err != nil {
		return err
	}

	provisioningWriterRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:provisioning:writer",
			DisplayName: "Provisioning writer",
			Description: "Reload provisioning.",
			Group:       "Provisioning",
			Permissions: []ac.Permission{
				{
					Action: ActionProvisioningReload,
					Scope:  ScopeProvisionersAll,
				},
			},
		},
		Grants: []string{ac.RoleGrafanaAdmin},
	}

	datasourcesExplorerRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:datasources:explorer",
			DisplayName: "Data source explorer",
			Description: "Enable the Explore feature. Data source permissions still apply; you can only query data sources for which you have query permissions.",
			Group:       "Data sources",
			Permissions: []ac.Permission{
				{
					Action: ac.ActionDatasourcesExplore,
				},
			},
		},
		Grants: []string{string(org.RoleEditor)},
	}

	if setting.ViewersCanEdit {
		datasourcesExplorerRole.Grants = append(datasourcesExplorerRole.Grants, string(org.RoleViewer))
	}

	datasourcesReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:datasources:reader",
			DisplayName: "Data source reader",
			Description: "Read and query all data sources.",
			Group:       "Data sources",
			Permissions: []ac.Permission{
				{
					Action: datasources.ActionRead,
					Scope:  datasources.ScopeAll,
				},
				{
					Action: datasources.ActionQuery,
					Scope:  datasources.ScopeAll,
				},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	builtInDatasourceReader := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:datasources.builtin:reader",
			DisplayName: "Built in data source reader",
			Description: "Read and query Grafana's built in test data sources.",
			Group:       "Data sources",
			Permissions: []ac.Permission{
				{
					Action: datasources.ActionRead,
					Scope:  fmt.Sprintf("%s%s", datasources.ScopePrefix, grafanads.DatasourceUID),
				},
				{
					Action: datasources.ActionQuery,
					Scope:  fmt.Sprintf("%s%s", datasources.ScopePrefix, grafanads.DatasourceUID),
				},
			},
			Hidden: true,
		},
		Grants: []string{string(org.RoleViewer)},
	}

	// when running oss or enterprise without a license all users should be able to query data sources
	if !hs.License.FeatureEnabled("accesscontrol.enforcement") {
		datasourcesReaderRole.Grants = []string{string(org.RoleViewer)}
	}

	datasourcesWriterRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:datasources:writer",
			DisplayName: "Data source writer",
			Description: "Create, update, delete, read, or query data sources.",
			Group:       "Data sources",
			Permissions: ac.ConcatPermissions(datasourcesReaderRole.Role.Permissions, []ac.Permission{
				{
					Action: datasources.ActionWrite,
					Scope:  datasources.ScopeAll,
				},
				{
					Action: datasources.ActionCreate,
				},
				{
					Action: datasources.ActionDelete,
					Scope:  datasources.ScopeAll,
				},
			}),
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	datasourcesIdReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:datasources.id:reader",
			DisplayName: "Data source ID reader",
			Description: "Read the ID of a data source based on its name.",
			Group:       "Infrequently used",
			Permissions: []ac.Permission{
				{
					Action: datasources.ActionIDRead,
					Scope:  datasources.ScopeAll,
				},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	apikeyReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:apikeys:reader",
			DisplayName: "APIKeys reader",
			Description: "Gives access to read api keys.",
			Group:       "API Keys",
			Permissions: []ac.Permission{
				{
					Action: ac.ActionAPIKeyRead,
					Scope:  ac.ScopeAPIKeysAll,
				},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	apikeyWriterRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:apikeys:writer",
			DisplayName: "APIKeys writer",
			Description: "Gives access to add and delete api keys.",
			Group:       "API Keys",
			Permissions: ac.ConcatPermissions(apikeyReaderRole.Role.Permissions, []ac.Permission{
				{
					Action: ac.ActionAPIKeyCreate,
				},
				{
					Action: ac.ActionAPIKeyDelete,
					Scope:  ac.ScopeAPIKeysAll,
				},
			}),
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	orgReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:organization:reader",
			DisplayName: "Organization reader",
			Description: "Read an organization, such as its ID, name, address, or quotas.",
			Group:       "Organizations",
			Permissions: []ac.Permission{
				{Action: ActionOrgsRead},
				{Action: ActionOrgsQuotasRead},
			},
		},
		Grants: []string{string(org.RoleViewer), ac.RoleGrafanaAdmin},
	}

	orgWriterRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:organization:writer",
			DisplayName: "Organization writer",
			Description: "Read an organization, its quotas, or its preferences. Update organization properties, or its preferences.",
			Group:       "Organizations",
			Permissions: ac.ConcatPermissions(orgReaderRole.Role.Permissions, []ac.Permission{
				{Action: ActionOrgsPreferencesRead},
				{Action: ActionOrgsWrite},
				{Action: ActionOrgsPreferencesWrite},
			}),
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	orgMaintainerRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:organization:maintainer",
			DisplayName: "Organization maintainer",
			Description: "Create, read, write, or delete an organization. Read or write an organization's quotas. Needs to be assigned globally.",
			Group:       "Organizations",
			Permissions: ac.ConcatPermissions(orgReaderRole.Role.Permissions, []ac.Permission{
				{Action: ActionOrgsCreate},
				{Action: ActionOrgsWrite},
				{Action: ActionOrgsDelete},
				{Action: ActionOrgsQuotasWrite},
			}),
		},
		Grants: []string{string(ac.RoleGrafanaAdmin)},
	}

	teamCreatorGrants := []string{string(org.RoleAdmin)}
	if hs.Cfg.EditorsCanAdmin {
		teamCreatorGrants = append(teamCreatorGrants, string(org.RoleEditor))
	}
	teamsCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:teams:creator",
			DisplayName: "Team creator",
			Description: "Create teams and read organisation users (required to manage the created teams).",
			Group:       "Teams",
			Permissions: []ac.Permission{
				{Action: ac.ActionTeamsCreate},
				{Action: ac.ActionOrgUsersRead, Scope: ac.ScopeUsersAll},
			},
		},
		Grants: teamCreatorGrants,
	}

	teamsWriterRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:teams:writer",
			DisplayName: "Team writer",
			Description: "Create, read, write, or delete a team as well as controlling team memberships.",
			Group:       "Teams",
			Permissions: []ac.Permission{
				{Action: ac.ActionTeamsCreate},
				{Action: ac.ActionTeamsDelete, Scope: ac.ScopeTeamsAll},
				{Action: ac.ActionTeamsPermissionsRead, Scope: ac.ScopeTeamsAll},
				{Action: ac.ActionTeamsPermissionsWrite, Scope: ac.ScopeTeamsAll},
				{Action: ac.ActionTeamsRead, Scope: ac.ScopeTeamsAll},
				{Action: ac.ActionTeamsWrite, Scope: ac.ScopeTeamsAll},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	/**************Device Management*************/
	resourcesCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:resources:creator",
			DisplayName: "Resource creator",
			Description: "Create, read, write or delete resources",
			Group:       "Resources",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionResourcesCreate, Scope: ac.ScopeResourcesAll},
				{Action: ac.ActionResourcesDelete, Scope: ac.ScopeResourcesAll},
				{Action: ac.ActionResourcesRead, Scope: ac.ScopeResourcesAll},
				{Action: ac.ActionResourcesWrite, Scope: ac.ScopeResourcesAll},
			},
		},
		Grants: []string{string(org.RoleAdmin), string(ac.RoleGrafanaAdmin)},
	}

	resourcesWriterRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:resources:writer",
			DisplayName: "Resource writer",
			Description: "Read, write a resource",
			Group:       "Resources",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionResourcesRead, Scope: ac.ScopeResourcesAll},
				{Action: ac.ActionResourcesWrite, Scope: ac.ScopeResourcesAll},
			},
		},
		Grants: []string{string(org.RoleEditor)},
	}

	resourcesReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:resources:reader",
			DisplayName: "Resource reader",
			Description: "Read resources",
			Group:       "Resources",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionResourcesRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	groupsCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:groups:creator",
			DisplayName: "Group creator",
			Description: "Create, read, write or delete groups",
			Group:       "Groups",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionGroupsCreate, Scope: ac.ScopeGroupsAll},
				{Action: ac.ActionGroupsDelete, Scope: ac.ScopeGroupsAll},
				{Action: ac.ActionGroupsRead, Scope: ac.ScopeGroupsAll},
				{Action: ac.ActionGroupsWrite, Scope: ac.ScopeGroupsAll},
			},
		},
		Grants: []string{string(org.RoleAdmin), string(ac.RoleGrafanaAdmin)},
	}

	groupsWriterRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:groups:writer",
			DisplayName: "Group writer",
			Description: "Read, write a group",
			Group:       "Groups",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionGroupsRead, Scope: ac.ScopeGroupsAll},
				{Action: ac.ActionGroupsWrite, Scope: ac.ScopeGroupsAll},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	groupsReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:groups:reader",
			DisplayName: "Group reader",
			Description: "Read groups",
			Group:       "Groups",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionGroupsRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	inventoriesCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:inventories:creator",
			DisplayName: "Inventory creator",
			Description: "Create, read, write or delete a inventory",
			Group:       "Inventories",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionInventoriesCreate, Scope: ac.ScopeInventoriesAll},
				{Action: ac.ActionInventoriesDelete, Scope: ac.ScopeInventoriesAll},
				{Action: ac.ActionInventoriesRead, Scope: ac.ScopeInventoriesAll},
				{Action: ac.ActionInventoriesWrite, Scope: ac.ScopeInventoriesAll},
			},
		},
		Grants: []string{ac.RoleGrafanaAdmin},
	}

	bulksCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:bulks:creator",
			DisplayName: "Batch process creator",
			Description: "Create, read, write or delete a batch proccess",
			Group:       "Bulks",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionBulksCreate, Scope: ac.ScopeBulksAll},
				{Action: ac.ActionBulksDelete, Scope: ac.ScopeBulksAll},
				{Action: ac.ActionBulksRead, Scope: ac.ScopeBulksAll},
				{Action: ac.ActionBulksWrite, Scope: ac.ScopeBulksAll},
			},
		},
		Grants: []string{ac.RoleGrafanaAdmin},
	}

	typesCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:resourcetypes:creator",
			DisplayName: "Types creator",
			Description: "Create, read, write, or delete types",
			Group:       "Types",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionTypesCreate, Scope: ac.ScopeTypesAll},
				{Action: ac.ActionTypesDelete, Scope: ac.ScopeTypesAll},
				{Action: ac.ActionTypesRead, Scope: ac.ScopeTypesAll},
				{Action: ac.ActionTypesWrite, Scope: ac.ScopeTypesAll},
			},
		},
		Grants: []string{ac.RoleGrafanaAdmin},
	}

	typesReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:resourcetypes:reader",
			DisplayName: "ResourceType reader",
			Description: "Read resourcetypes.",
			Group:       "ResourceTypes",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionTypesRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	/**************Device Management*************/

	/*******************Billing******************/

	profilesCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:profiles:creator",
			DisplayName: "Profiles creator",
			Description: "Create, read, write, or delete profiles",
			Group:       "Profiles",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionProfilesCreate, Scope: ac.ScopeProfilesAll},
				{Action: ac.ActionProfilesDelete, Scope: ac.ScopeProfilesAll},
				{Action: ac.ActionProfilesRead, Scope: ac.ScopeProfilesAll},
				{Action: ac.ActionProfilesWrite, Scope: ac.ScopeProfilesAll},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	profilesReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:profiles:reader",
			DisplayName: "Profiles reader",
			Description: "Read  profiles",
			Group:       "Profiles",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionProfilesRead},
			},
		},
		Grants: []string{string(org.RoleViewer)},
	}

	connectionsCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:connection:creator",
			DisplayName: "Connections creator",
			Description: "Create, read, write, or delete connections",
			Group:       "Connections",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionConnectionsCreate, Scope: ac.ScopeConnectionsAll},
				{Action: ac.ActionConnectionsDelete, Scope: ac.ScopeConnectionsAll},
				{Action: ac.ActionConnectionsRead, Scope: ac.ScopeConnectionsAll},
				{Action: ac.ActionConnectionsWrite, Scope: ac.ScopeConnectionsAll},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	connectionsWriterRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:connections:writer",
			DisplayName: "Connections writer",
			Description: "Read or write connections",
			Group:       "Connections",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionConnectionsRead, Scope: ac.ScopeConnectionsAll},
				{Action: ac.ActionConnectionsWrite, Scope: ac.ScopeConnectionsAll},
			},
		},
		Grants: []string{string(org.RoleEditor), string(org.RoleAdmin)},
	}

	connectionsReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:connections:reader",
			DisplayName: "Connections reader",
			Description: "Read connections",
			Group:       "Connections",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionConnectionsRead},
			},
		},
		Grants: []string{string(org.RoleViewer), string(org.RoleEditor)},
	}

	slabsCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:slab:creator",
			DisplayName: "Slabs creator",
			Description: "Create, read, write, or delete slabs",
			Group:       "Slabs",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionSlabsCreate, Scope: ac.ScopeSlabsAll},
				{Action: ac.ActionSlabsDelete, Scope: ac.ScopeSlabsAll},
				{Action: ac.ActionSlabsRead, Scope: ac.ScopeSlabsAll},
				{Action: ac.ActionSlabsWrite, Scope: ac.ScopeSlabsAll},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	slabsReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:slabs:reader",
			DisplayName: "Slabs reader",
			Description: "Read slabs",
			Group:       "Slab",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionSlabsRead},
			},
		},
		Grants: []string{string(org.RoleViewer), string(org.RoleEditor)},
	}

	invoicesCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:invoices:creator",
			DisplayName: "Invoices creator",
			Description: "Create, read, write, or delete a invoices",
			Group:       "Invoices",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionInvoicesCreate, Scope: ac.ScopeInvoicesAll},
				{Action: ac.ActionInvoicesDelete, Scope: ac.ScopeInvoicesAll},
				{Action: ac.ActionInvoicesRead, Scope: ac.ScopeInvoicesAll},
				{Action: ac.ActionInvoicesWrite, Scope: ac.ScopeInvoicesAll},
			},
		},
		Grants: []string{string(org.RoleAdmin), string(org.RoleEditor)},
	}

	invoicesReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:invoices:reader",
			DisplayName: "Invoices reader",
			Description: "Read invoices.",
			Group:       "Invoices",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionInvoicesRead},
			},
		},
		Grants: []string{string(org.RoleViewer), string(org.RoleEditor)},
	}

	transactionsCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:transactions:creator",
			DisplayName: "Transaction creator",
			Description: "Create, read, write, or delete a transaction",
			Group:       "Transactions",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionTransactionsCreate, Scope: ac.ScopeTransactionsAll},
				{Action: ac.ActionTransactionsDelete, Scope: ac.ScopeTransactionsAll},
				{Action: ac.ActionTransactionsRead, Scope: ac.ScopeTransactionsAll},
				{Action: ac.ActionTransactionsWrite, Scope: ac.ScopeTransactionsAll},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	transactionsReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:transactions:reader",
			DisplayName: "Transaction reader",
			Description: "Read Transactions",
			Group:       "Transactions",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionTransactionsRead},
			},
		},
		Grants: []string{string(org.RoleViewer), string(org.RoleEditor)},
	}

	fixedChargesCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:fixedcharges:creator",
			DisplayName: "FixedCharges creator",
			Description: "Create, read, write, or delete a org charge",
			Group:       "FixedCharges",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionFixedChargesCreate, Scope: ac.ScopeFixedChargesAll},
				{Action: ac.ActionFixedChargesDelete, Scope: ac.ScopeFixedChargesAll},
				{Action: ac.ActionFixedChargesRead, Scope: ac.ScopeFixedChargesAll},
				{Action: ac.ActionFixedChargesWrite, Scope: ac.ScopeFixedChargesAll},
			},
		},
		Grants: []string{string(org.RoleAdmin)},
	}

	fixedChargesReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:fixedcharges:reader",
			DisplayName: "Org Charges reader",
			Description: "Read Org Charges",
			Group:       "FixedCharges",
			Version:     1,
			Permissions: []ac.Permission{
				{Action: ac.ActionFixedChargesRead},
			},
		},
		Grants: []string{string(org.RoleViewer), string(org.RoleEditor)},
	}

	/*******************Billing******************/

	annotationsReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:annotations:reader",
			DisplayName: "Annotation reader",
			Description: "Read annotations and tags",
			Group:       "Annotations",
			Permissions: []ac.Permission{
				{Action: ac.ActionAnnotationsRead, Scope: ac.ScopeAnnotationsAll},
			},
		},
		Grants: []string{string(org.RoleViewer), string(org.RoleEditor), string(org.RoleAdmin)},
	}

	dashboardAnnotationsWriterRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:annotations.dashboard:writer",
			DisplayName: "Dashboard annotation writer",
			Description: "Update annotations associated with dashboards.",
			Group:       "Annotations",
			Permissions: []ac.Permission{
				{Action: ac.ActionAnnotationsCreate, Scope: ac.ScopeAnnotationsTypeDashboard},
				{Action: ac.ActionAnnotationsDelete, Scope: ac.ScopeAnnotationsTypeDashboard},
				{Action: ac.ActionAnnotationsWrite, Scope: ac.ScopeAnnotationsTypeDashboard},
			},
		},
		Grants: []string{string(org.RoleViewer), string(org.RoleEditor), string(org.RoleAdmin)},
	}

	annotationsWriterRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:annotations:writer",
			DisplayName: "Annotation writer",
			Description: "Update all annotations.",
			Group:       "Annotations",
			Permissions: []ac.Permission{
				{Action: ac.ActionAnnotationsCreate, Scope: ac.ScopeAnnotationsAll},
				{Action: ac.ActionAnnotationsDelete, Scope: ac.ScopeAnnotationsAll},
				{Action: ac.ActionAnnotationsWrite, Scope: ac.ScopeAnnotationsAll},
			},
		},
		Grants: []string{string(org.RoleViewer), string(org.RoleEditor), string(org.RoleAdmin)},
	}

	dashboardsCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:dashboards:creator",
			DisplayName: "Dashboard creator",
			Description: "Create dashboard in general folder.",
			Group:       "Dashboards",
			Permissions: []ac.Permission{
				{Action: dashboards.ActionFoldersRead, Scope: dashboards.ScopeFoldersProvider.GetResourceScopeUID(ac.GeneralFolderUID)},
				{Action: dashboards.ActionDashboardsCreate, Scope: dashboards.ScopeFoldersProvider.GetResourceScopeUID(ac.GeneralFolderUID)},
			},
		},
		Grants: []string{ac.RoleGrafanaAdmin},
	}

	dashboardsReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:dashboards:reader",
			DisplayName: "Dashboard reader",
			Description: "Read all dashboards.",
			Group:       "Dashboards",
			Permissions: []ac.Permission{
				{Action: dashboards.ActionDashboardsRead, Scope: dashboards.ScopeDashboardsAll},
			},
		},
		Grants: []string{"Admin"},
	}

	dashboardsWriterRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:dashboards:writer",
			DisplayName: "Dashboard writer",
			Group:       "Dashboards",
			Description: "Create, read, write or delete all dashboards and their permissions.",
			Permissions: ac.ConcatPermissions(dashboardsReaderRole.Role.Permissions, []ac.Permission{
				{Action: dashboards.ActionDashboardsWrite, Scope: dashboards.ScopeDashboardsAll},
				{Action: dashboards.ActionDashboardsDelete, Scope: dashboards.ScopeDashboardsAll},
				{Action: dashboards.ActionDashboardsCreate, Scope: dashboards.ScopeFoldersAll},
				{Action: dashboards.ActionDashboardsPermissionsRead, Scope: dashboards.ScopeDashboardsAll},
				{Action: dashboards.ActionDashboardsPermissionsWrite, Scope: dashboards.ScopeDashboardsAll},
			}),
		},
		Grants: []string{ac.RoleGrafanaAdmin},
	}

	foldersCreatorRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:folders:creator",
			DisplayName: "Folder creator",
			Description: "Create folders.",
			Group:       "Folders",
			Permissions: []ac.Permission{
				{Action: dashboards.ActionFoldersCreate},
			},
		},
		Grants: []string{ac.RoleGrafanaAdmin},
	}

	foldersReaderRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:folders:reader",
			DisplayName: "Folder reader",
			Description: "Read all folders and dashboards.",
			Group:       "Folders",
			Permissions: []ac.Permission{
				{Action: dashboards.ActionFoldersRead, Scope: dashboards.ScopeFoldersAll},
				{Action: dashboards.ActionDashboardsRead, Scope: dashboards.ScopeFoldersAll},
			},
		},
		Grants: []string{"Admin"},
	}

	foldersWriterRole := ac.RoleRegistration{
		Role: ac.RoleDTO{
			Name:        "fixed:folders:writer",
			DisplayName: "Folder writer",
			Description: "Create, read, write or delete all folders and dashboards and their permissions.",
			Group:       "Folders",
			Permissions: ac.ConcatPermissions(
				foldersReaderRole.Role.Permissions,
				[]ac.Permission{
					{Action: dashboards.ActionFoldersCreate},
					{Action: dashboards.ActionFoldersWrite, Scope: dashboards.ScopeFoldersAll},
					{Action: dashboards.ActionFoldersDelete, Scope: dashboards.ScopeFoldersAll},
					{Action: dashboards.ActionDashboardsWrite, Scope: dashboards.ScopeFoldersAll},
					{Action: dashboards.ActionDashboardsDelete, Scope: dashboards.ScopeFoldersAll},
					{Action: dashboards.ActionDashboardsCreate, Scope: dashboards.ScopeFoldersAll},
					{Action: dashboards.ActionDashboardsPermissionsRead, Scope: dashboards.ScopeFoldersAll},
					{Action: dashboards.ActionDashboardsPermissionsWrite, Scope: dashboards.ScopeFoldersAll},
				}),
		},
		Grants: []string{ac.RoleGrafanaAdmin},
	}

	return hs.AccessControl.DeclareFixedRoles(
		provisioningWriterRole, datasourcesReaderRole, builtInDatasourceReader, datasourcesWriterRole,
		datasourcesIdReaderRole, orgReaderRole, orgWriterRole,
		orgMaintainerRole, teamsCreatorRole, teamsWriterRole, datasourcesExplorerRole,
		annotationsReaderRole, dashboardAnnotationsWriterRole, annotationsWriterRole,
		dashboardsCreatorRole, dashboardsReaderRole, dashboardsWriterRole,
		foldersCreatorRole, foldersReaderRole, foldersWriterRole, apikeyReaderRole, apikeyWriterRole,
		resourcesCreatorRole, resourcesWriterRole, resourcesReaderRole, groupsCreatorRole, groupsWriterRole,
		groupsReaderRole, inventoriesCreatorRole, bulksCreatorRole, typesCreatorRole, typesReaderRole,
		profilesCreatorRole, profilesReaderRole, connectionsCreatorRole, connectionsWriterRole, connectionsReaderRole,
		slabsCreatorRole, slabsReaderRole, invoicesCreatorRole, invoicesReaderRole, transactionsCreatorRole,
		transactionsReaderRole, fixedChargesCreatorRole, fixedChargesReaderRole,
	)
}

// Evaluators
// here is the list of complex evaluators we use in this package

// orgPreferencesAccessEvaluator is used to protect the "Configure > Preferences" page access
var orgPreferencesAccessEvaluator = ac.EvalAny(
	ac.EvalAll(
		ac.EvalPermission(ActionOrgsRead),
		ac.EvalPermission(ActionOrgsWrite),
	),
	ac.EvalAll(
		ac.EvalPermission(ActionOrgsPreferencesRead),
		ac.EvalPermission(ActionOrgsPreferencesWrite),
	),
)

// orgsAccessEvaluator is used to protect the "Server Admin > Orgs" page access
// (you need to have read access to update or delete orgs; read is the minimum)
var orgsAccessEvaluator = ac.EvalPermission(ActionOrgsRead)

// orgsCreateAccessEvaluator is used to protect the "Server Admin > Orgs > New Org" page access
var orgsCreateAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ActionOrgsRead),
	ac.EvalPermission(ActionOrgsCreate),
)

// teamsAccessEvaluator is used to protect the "Configuration > Teams" page access
// grants access to a user when they can either create teams or can read and update a team
var teamsAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(ac.ActionTeamsCreate),
	ac.EvalAll(
		ac.EvalPermission(ac.ActionTeamsRead),
		ac.EvalAny(
			ac.EvalPermission(ac.ActionTeamsWrite),
			ac.EvalPermission(ac.ActionTeamsPermissionsWrite),
		),
	),
)

// teamsEditAccessEvaluator is used to protect the "Configuration > Teams > edit" page access
var teamsEditAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionTeamsRead),
	ac.EvalAny(
		ac.EvalPermission(ac.ActionTeamsCreate),
		ac.EvalPermission(ac.ActionTeamsWrite),
		ac.EvalPermission(ac.ActionTeamsPermissionsWrite),
	),
)

/**************Device Management*************/

var resourcesReadAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(ac.ActionResourcesRead),
	ac.EvalPermission(ac.ActionResourcesWrite),
	ac.EvalPermission(ac.ActionResourcesCreate),
	ac.EvalPermission(ac.ActionResourcesDelete),
)

var resourcesWriteAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionResourcesRead),
	ac.EvalPermission(ac.ActionResourcesWrite),
)

var resourcesCreateAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionResourcesRead),
	ac.EvalPermission(ac.ActionResourcesWrite),
	ac.EvalPermission(ac.ActionResourcesCreate),
	ac.EvalPermission(ac.ActionResourcesDelete),
)

var groupsReadAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(ac.ActionGroupsRead),
	ac.EvalPermission(ac.ActionGroupsWrite),
	ac.EvalPermission(ac.ActionGroupsCreate),
	ac.EvalPermission(ac.ActionGroupsDelete),
)

var groupsWriteAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionGroupsRead),
	ac.EvalPermission(ac.ActionGroupsWrite),
)

var groupsCreateAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionGroupsRead),
	ac.EvalPermission(ac.ActionGroupsWrite),
	ac.EvalPermission(ac.ActionGroupsCreate),
	ac.EvalPermission(ac.ActionGroupsDelete),
)

var inventoriesReadAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(ac.ActionInventoriesCreate),
	ac.EvalPermission(ac.ActionInventoriesDelete),
	ac.EvalPermission(ac.ActionInventoriesRead),
	ac.EvalPermission(ac.ActionInventoriesWrite),
)

var inventoriesWriteAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionInventoriesRead),
	ac.EvalPermission(ac.ActionInventoriesWrite),
)

var inventoriesCreateAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionInventoriesCreate),
	ac.EvalPermission(ac.ActionInventoriesDelete),
	ac.EvalPermission(ac.ActionInventoriesRead),
	ac.EvalPermission(ac.ActionInventoriesWrite),
)

var bulksReadAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(ac.ActionBulksCreate),
	ac.EvalPermission(ac.ActionBulksDelete),
	ac.EvalPermission(ac.ActionBulksRead),
	ac.EvalPermission(ac.ActionBulksWrite),
)

var bulksWriteAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionBulksRead),
	ac.EvalPermission(ac.ActionBulksWrite),
)

var bulksCreateAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionBulksCreate),
	ac.EvalPermission(ac.ActionBulksDelete),
	ac.EvalPermission(ac.ActionBulksRead),
	ac.EvalPermission(ac.ActionBulksWrite),
)

var typesReadAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(ac.ActionTypesRead),
	ac.EvalPermission(ac.ActionTypesWrite),
	ac.EvalPermission(ac.ActionTypesCreate),
	ac.EvalPermission(ac.ActionTypesDelete),
)

var typesWriteAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionTypesRead),
	ac.EvalPermission(ac.ActionTypesWrite),
)

var typesCreateAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionTypesRead),
	ac.EvalPermission(ac.ActionTypesWrite),
	ac.EvalPermission(ac.ActionTypesCreate),
	ac.EvalPermission(ac.ActionTypesDelete),
)

/**************Device Management*************/
/*******************Billing******************/

var profilesReadAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(ac.ActionProfilesCreate),
	ac.EvalPermission(ac.ActionProfilesDelete),
	ac.EvalPermission(ac.ActionProfilesRead),
	ac.EvalPermission(ac.ActionProfilesWrite),
)

var profilesWriteAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionProfilesRead),
	ac.EvalPermission(ac.ActionProfilesWrite),
)

var profilesCreateAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionProfilesCreate),
	ac.EvalPermission(ac.ActionProfilesDelete),
	ac.EvalPermission(ac.ActionProfilesRead),
	ac.EvalPermission(ac.ActionProfilesWrite),
)

var slabsReadAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(ac.ActionSlabsCreate),
	ac.EvalPermission(ac.ActionSlabsDelete),
	ac.EvalPermission(ac.ActionSlabsRead),
	ac.EvalPermission(ac.ActionSlabsWrite),
)

var slabsWriteAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionSlabsRead),
	ac.EvalPermission(ac.ActionSlabsWrite),
)

var slabsCreateAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionSlabsCreate),
	ac.EvalPermission(ac.ActionSlabsDelete),
	ac.EvalPermission(ac.ActionSlabsRead),
	ac.EvalPermission(ac.ActionSlabsWrite),
)

var connectionsReadAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(ac.ActionConnectionsCreate),
	ac.EvalPermission(ac.ActionConnectionsDelete),
	ac.EvalPermission(ac.ActionConnectionsRead),
	ac.EvalPermission(ac.ActionConnectionsWrite),
)

var connectionsWriteAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionConnectionsRead),
	ac.EvalPermission(ac.ActionConnectionsWrite),
)

var connectionsCreateAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionConnectionsCreate),
	ac.EvalPermission(ac.ActionConnectionsDelete),
	ac.EvalPermission(ac.ActionConnectionsRead),
	ac.EvalPermission(ac.ActionConnectionsWrite),
)

var fixedChargesReadAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(ac.ActionFixedChargesCreate),
	ac.EvalPermission(ac.ActionFixedChargesDelete),
	ac.EvalPermission(ac.ActionFixedChargesRead),
	ac.EvalPermission(ac.ActionFixedChargesWrite),
)

var fixedChargesWriteAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionFixedChargesRead),
	ac.EvalPermission(ac.ActionFixedChargesWrite),
)

var fixedChargesCreateAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionFixedChargesCreate),
	ac.EvalPermission(ac.ActionFixedChargesDelete),
	ac.EvalPermission(ac.ActionFixedChargesRead),
	ac.EvalPermission(ac.ActionFixedChargesWrite),
)

var invoicesReadAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(ac.ActionInvoicesCreate),
	ac.EvalPermission(ac.ActionInvoicesDelete),
	ac.EvalPermission(ac.ActionInvoicesRead),
	ac.EvalPermission(ac.ActionInvoicesWrite),
)

var invoicesWriteAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionInvoicesRead),
	ac.EvalPermission(ac.ActionInvoicesWrite),
)

var invoicesCreateAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionInvoicesCreate),
	ac.EvalPermission(ac.ActionInvoicesDelete),
	ac.EvalPermission(ac.ActionInvoicesRead),
	ac.EvalPermission(ac.ActionInvoicesWrite),
)

var transactionsReadAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(ac.ActionInvoicesCreate),
	ac.EvalPermission(ac.ActionInvoicesDelete),
	ac.EvalPermission(ac.ActionInvoicesRead),
	ac.EvalPermission(ac.ActionInvoicesWrite),
)

var transactionsCreateAccessEvaluator = ac.EvalAll(
	ac.EvalPermission(ac.ActionInvoicesCreate),
	ac.EvalPermission(ac.ActionInvoicesDelete),
	ac.EvalPermission(ac.ActionInvoicesRead),
	ac.EvalPermission(ac.ActionInvoicesWrite),
)

/*******************Billing******************/

// apiKeyAccessEvaluator is used to protect the "Configuration > API keys" page access
var apiKeyAccessEvaluator = ac.EvalPermission(ac.ActionAPIKeyRead)

// serviceAccountAccessEvaluator is used to protect the "Configuration > Service accounts" page access
var serviceAccountAccessEvaluator = ac.EvalAny(
	ac.EvalPermission(serviceaccounts.ActionRead),
	ac.EvalPermission(serviceaccounts.ActionCreate),
)

// Metadata helpers
// getAccessControlMetadata returns the accesscontrol metadata associated with a given resource
func (hs *HTTPServer) getAccessControlMetadata(c *models.ReqContext,
	orgID int64, prefix string, resourceID string) ac.Metadata {
	ids := map[string]bool{resourceID: true}
	return hs.getMultiAccessControlMetadata(c, orgID, prefix, ids)[resourceID]
}

// getMultiAccessControlMetadata returns the accesscontrol metadata associated with a given set of resources
// Context must contain permissions in the given org (see LoadPermissionsMiddleware or AuthorizeInOrgMiddleware)
func (hs *HTTPServer) getMultiAccessControlMetadata(c *models.ReqContext,
	orgID int64, prefix string, resourceIDs map[string]bool) map[string]ac.Metadata {
	if hs.AccessControl.IsDisabled() || !c.QueryBool("accesscontrol") {
		return map[string]ac.Metadata{}
	}

	if c.SignedInUser.Permissions == nil {
		return map[string]ac.Metadata{}
	}

	permissions, ok := c.SignedInUser.Permissions[orgID]
	if !ok {
		return map[string]ac.Metadata{}
	}

	return ac.GetResourcesMetadata(c.Req.Context(), permissions, prefix, resourceIDs)
}
