import { NavModelItem, NavModel } from '@grafana/data';
import { IconName } from '@grafana/ui';
import config from 'app/core/config';
import { Connection } from 'app/types/billing/connection';

export function buildNavModel(connection: Connection): NavModelItem {
  const navModel = {
    id: 'connection-' + connection.id,
    text: `${connection.name} (${connection.connection_ext})`,
    subTitle: '',
    url: '',
    hideFromBreadcrumbs: true,
    children: [
      {
        active: false,
        icon: 'invoice' as IconName,
        id: `connection-invoices-${connection.id}`,
        text: 'Invoices',
        url: `org/connections/edit/${connection.id}/invoices`,
      },
      {
        active: false,
        icon: 'invoice-transaction' as IconName,
        id: `connection-transactions-${connection.id}`,
        text: 'Transactions',
        url: `org/connections/edit/${connection.id}/transactions`,
      },
      {
        active: false,
        icon: 'bell' as IconName,
        id: `connection-alerts-${connection.id}`,
        text: 'Alerts',
        url: `org/connections/edit/${connection.id}/alerts`,
      },
      {
        active: false,
        icon: 'users-alt' as IconName,
        id: `connection-users-${connection.id}`,
        text: 'Users',
        url: `/org/connections/edit/${connection.id}/users`,
      },
      {
        active: false,
        icon: 'rss' as IconName,
        id: `connection-resources-${connection.id}`,
        text: config.resourceTitle + 's',
        url: `/org/connections/edit/${connection.id}/resources`,
      },
      {
        active: false,
        icon: 'gf-logs' as IconName,
        id: `connection-logs-${connection.id}`,
        text: 'Logs',
        url: `/org/connections/edit/${connection.id}/logs`,
      },
      {
        active: false,
        icon: 'sliders-v-alt' as IconName,
        id: `connection-settings-${connection.id}`,
        text: 'Settings',
        url: `/org/connections/edit/${connection.id}/settings`,
      },
    ],
  };
  return navModel;
}

export function getPageNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    updated_at: '',
    org_id: 0,
    group_id: 0,
    group_path_id: '',
    profile: '',
    status: '',
    name: '',
    phone: '',
    email: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    connection_ext: 0,
    tags: [],
    latitude: 0,
    longitude: 0,
  });

  let node: NavModelItem;

  for (const child of main.children!) {
    if (child.id!.indexOf(pageName) > 0) {
      child.active = true;
      node = child;
      break;
    }
  }

  return {
    main: main,
    node: node!,
  };
}
