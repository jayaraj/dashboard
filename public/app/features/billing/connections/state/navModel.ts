import { NavModelItem, NavModel } from '@grafana/data';
import { Connection } from 'app/types';

export function buildNavModel(connection: Connection): NavModelItem {
  const navModel = {
    id: 'connection-' + connection.id,
    subTitle: 'Connections group of resources under a node',
    url: '',
    text: `${connection.name} (${connection.connection_ext})`,
    breadcrumbs: [{ title: 'Connections', url: '/org/connections' }],
    children: [
      {
        active: false,
        icon: 'invoice',
        id: `connection-invoices-${connection.id}`,
        text: 'Invoices',
        url: `org/connections/edit/${connection.id}/invoices`,
      },
      {
        active: false,
        icon: 'invoice-transaction',
        id: `connection-transactions-${connection.id}`,
        text: 'Transactions',
        url: `org/connections/edit/${connection.id}/transactions`,
      },
      {
        active: false,
        icon: 'bell-edit',
        id: `connection-alerts-${connection.id}`,
        text: 'Alerts',
        url: `org/connections/edit/${connection.id}/alerts`,
      },
      {
        active: false,
        icon: 'gf-logs',
        id: `connection-logs-${connection.id}`,
        text: 'Logs',
        url: `/org/connections/edit/${connection.id}/logs`,
      },
      {
        active: false,
        icon: 'rss',
        id: `connection-resources-${connection.id}`,
        text: 'Resources',
        url: `/org/connections/edit/${connection.id}/resources`,
      },
      {
        active: false,
        icon: 'users-alt',
        id: `connection-users-${connection.id}`,
        text: 'Users',
        url: `/org/connections/edit/${connection.id}/users`,
      },
      {
        active: false,
        icon: 'sliders-v-alt',
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
    group_path_id: 0,
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
    connection_ext: 0
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
