import { NavModelItem, NavModel } from '@grafana/data';
import config from 'app/core/config';
import { Group } from 'app/types';

export function buildNavModel(group: Group): NavModelItem {
  let pages = [];

  pages.push({
    active: false,
    icon: 'sliders-v-alt',
    id: `group-settings-${group.id}`,
    text: 'Settings',
    url: `org/groups/edit/${group.id}/settings`,
  });

  if (group.type === 'billable') {
    pages.push({
      active: false,
      icon: 'invoice',
      id: `group-invoices-${group.id}`,
      text: 'Invoices',
      url: `org/groups/edit/${group.id}/invoices`,
    });
    pages.push({
      active: false,
      icon: 'invoice-transaction',
      id: `group-transactions-${group.id}`,
      text: 'Transactions',
      url: `org/groups/edit/${group.id}/transactions`,
    });
  }
  pages.push({
    active: false,
    icon: 'layer-group',
    id: `group-children-${group.id}`,
    text: 'Groups',
    url: `org/groups/edit/${group.id}/children`,
  },
  {
    active: false,
    icon: 'resource',
    id: `group-resources-${group.id}`,
    text: config.resourceLabel + 's',
    url: `org/groups/edit/${group.id}/resources`,
  },
  {
    active: false,
    icon: 'users-alt',
    id: `group-users-${group.id}`,
    text: 'Users',
    url: `org/groups/edit/${group.id}/users`,
  });

  const navModel = {
    id: 'group-' + group.id,
    subTitle: 'Manage Groups',
    url: '',
    text: group.name,
    breadcrumbs: [{ title: 'Groups', url: 'org/groups' }],
    children: pages,
  } as any;

  return navModel;
}

export function getGroupLoadingNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    name: 'Loading',
    parent: 0,
    child: false,
    path: '',
    type: '',
    level: 0,
    groups: [] as Group[],
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
