import React from 'react';

import { SafeDynamicImport } from 'app/core/components/DynamicImports/SafeDynamicImport';
import { NavLandingPage } from 'app/core/components/NavLandingPage/NavLandingPage';
import { RouteDescriptor } from 'app/core/navigation/types';

import { evaluateAccess } from './utils';

const routes: RouteDescriptor[] = [
  {
    path: '/billing',
    component: () => <NavLandingPage navId="billing" />,
  },
  {
    path: '/org/fixedcharges',
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "FixedChargeList" */ 'app/features/billing/fixedcharges/FixedChargeList')
    ),
  },
  {
    path: '/org/fixedcharges/edit/:id/:page?',
    roles: evaluateAccess(['fixedcharges:read']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "FixedChargePages" */ 'app/features/billing/fixedcharges/FixedChargePages')
    ),
  },
  {
    path: '/org/fixedcharges/new',
    roles: evaluateAccess(['fixedcharges:create']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "CreateFixedCharge" */ 'app/features/billing/fixedcharges/CreateFixedCharge')
    ),
  },
  {
    path: '/org/profiles',
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "ProfileList" */ 'app/features/billing/profiles/ProfileList')
    ),
  },
  {
    path: '/org/profiles/edit/:id/:page?',
    roles: evaluateAccess(['profiles:read']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "ProfilePages" */ 'app/features/billing/profiles/ProfilePages')
    ),
  },
  {
    path: '/org/profiles/new',
    roles: evaluateAccess(['profiles:create']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "CreateProfile" */ 'app/features/billing/profiles/CreateProfile')
    ),
  },
  {
    path: '/org/profiles/:id/slabs/new',
    roles: evaluateAccess(['profiles:create']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "CreateSlab" */ 'app/features/billing/profiles/CreateSlab')
    ),
  },
  {
    path: '/org/profiles/:id/slabs/edit/:slabId',
    roles: evaluateAccess(['profiles:read']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "SlabSettings" */ 'app/features/billing/profiles/SlabSettings')
    ),
  },
  {
    path: '/org/connections',
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "ConnectionList" */ 'app/features/billing/connections/ConnectionList')
    ),
  },
  {
    path: '/org/connections/edit/:id/:page?',
    roles: evaluateAccess(['connections:read']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "ConnectionPages" */ 'app/features/billing/connections/ConnectionPages')
    ),
  },
  {
    path: '/org/connections/new',
    roles: evaluateAccess(['connections:create']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "CreateConnection" */ 'app/features/billing/connections/CreateConnection')
    ),
  },
  {
    path: '/org/connections/:id/resources/new',
    roles: evaluateAccess(['connections:write', 'resources.create']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "CreateResource" */ 'app/features/billing/connections/CreateResource')
    ),
  },
  {
    path: '/org/connections/:id/invoices/:invoiceId',
    roles: evaluateAccess(['connections:read']),
    component: SafeDynamicImport(
      () => import(/* webpackChunkName: "InvoicePage" */ 'app/features/billing/connections/InvoicePage')
    ),
  },
];

export function getBillingRoutes(): RouteDescriptor[] {
  return routes;
}
