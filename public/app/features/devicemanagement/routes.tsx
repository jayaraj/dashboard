import React from 'react';

import { SafeDynamicImport } from 'app/core/components/DynamicImports/SafeDynamicImport';
import { NavLandingPage } from 'app/core/components/NavLandingPage/NavLandingPage';
import { RouteDescriptor } from 'app/core/navigation/types';

import { evaluateAccess } from './utils';

const routes: RouteDescriptor[] = [
  {
    path: '/devicemanagement',
    component: () => <NavLandingPage navId="devicemanagement" />,
  },
  {
    path: '/org/resources',
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "ResourceList" */ 'app/features/devicemanagement/resources/ResourceList')
    ),
  },
  {
    path: '/org/resources/edit/:id/:page?',
    roles: evaluateAccess(['resources:read']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "ResourcePages" */ 'app/features/devicemanagement/resources/ResourcePages')
    ),
  },
  {
    path: '/org/resources/new',
    roles: evaluateAccess(['resources:create']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "CreateResource" */ 'app/features/devicemanagement/resources/CreateResource')
    ),
  },
  {
    path: '/org/groups',
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "GroupList" */ 'app/features/devicemanagement/groups/GroupList')
    ),
  },
  {
    path: '/org/groups/edit/:id/:page?',
    roles: evaluateAccess(['groups:read']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "GroupPages" */ 'app/features/devicemanagement/groups/GroupPages')
    ),
  },
  {
    path: '/org/groups/new',
    roles: evaluateAccess(['groups:create']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "CreateGroup" */ 'app/features/devicemanagement/groups/CreateGroup')
    ),
  },
  {
    path: '/org/groups/:id/new',
    roles: evaluateAccess(['groups:create']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "CreateGroup" */ 'app/features/devicemanagement/groups/CreateGroup')
    ),
  },
  {
    path: '/org/groups/:id/resources/new',
    roles: evaluateAccess(['resources:create', 'groups:write']),
    component: SafeDynamicImport(
      () =>
        import(/* webpackChunkName: "CreateGroupResource" */ 'app/features/devicemanagement/groups/CreateGroupResource')
    ),
  },
  {
    path: '/inventories',
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "InventoryList" */ 'app/features/devicemanagement/inventories/InventoryList')
    ),
  },
  {
    path: '/org/inventories/edit/:id/:page?',
    roles: evaluateAccess(['inventories:read']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "InventoryPages" */ 'app/features/devicemanagement/inventories/InventoryPages')
    ),
  },
  {
    path: '/org/inventories/new',
    roles: evaluateAccess(['inventories:create']),
    component: SafeDynamicImport(
      () =>
        import(/* webpackChunkName: "CreateInventory" */ 'app/features/devicemanagement/inventories/CreateInventory')
    ),
  },
  {
    path: '/csventries',
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "CsvEntryList" */ 'app/features/devicemanagement/fileloader/CsvEntryList')
    ),
  },
  {
    path: '/csventries/:id/errors',
    roles: evaluateAccess(['fileloaders.csv:read']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "CsvErrorList" */ 'app/features/devicemanagement/fileloader/CsvErrorList')
    ),
  },
  {
    path: '/configurationtypes',
    component: SafeDynamicImport(
      () =>
        import(
          /* webpackChunkName: "ConfigurationPage" */ 'app/features/devicemanagement/configurations/ConfigurationPage'
        )
    ),
  },
  {
    path: '/configurationtypes/edit/:id/:page?',
    roles: evaluateAccess(['configurations:read']),
    component: SafeDynamicImport(
      () =>
        import(
          /* webpackChunkName: "ConfigurationTypePages" */ 'app/features/devicemanagement/configurations/ConfigurationTypePages'
        )
    ),
  },
  {
    path: '/configurationtypes/new',
    roles: evaluateAccess(['configurations:create']),
    component: SafeDynamicImport(
      () =>
        import(
          /* webpackChunkName: "CreateConfigurationType" */ 'app/features/devicemanagement/configurations/CreateConfigurationType'
        )
    ),
  },
  {
    path: '/devicemanagementalerts',
    component: () => <NavLandingPage navId="grafo-alerts" />,
  },
  {
    path: '/org/alertdefinitions',
    component: SafeDynamicImport(
      () =>
        import(/* webpackChunkName: "AlertDefinitionList" */ 'app/features/devicemanagement/alerts/AlertDefinitionList')
    ),
  },
  {
    path: '/org/alertdefinitions/edit/:id/:page?',
    roles: evaluateAccess(['alerts.definition:read']),
    component: SafeDynamicImport(
      () =>
        import(
          /* webpackChunkName: "AlertDefinitionList" */ 'app/features/devicemanagement/alerts/AlertDefinitionPages'
        )
    ),
  },
  {
    path: '/org/alertdefinitions/new',
    component: SafeDynamicImport(
      () =>
        import(
          /* webpackChunkName: "CreateAlertDefinition" */ 'app/features/devicemanagement/alerts/CreateAlertDefinition'
        )
    ),
  },
];

export function getDevicemanagementRoutes(): RouteDescriptor[] {
  return routes;
}
