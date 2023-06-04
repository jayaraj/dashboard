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
  },
  {
    active: false,
    icon: 'layer-group',
    id: `group-groups-${group.id}`,
    text: 'Sub-Groups',
    url: `org/groups/edit/${group.id}/groups`,
  });
  if (!group.child) {
    pages.push({
      active: false,
      icon: 'resource',
      id: `group-resources-${group.id}`,
      text: config.resourceLabel + 's',
      url: `org/groups/edit/${group.id}/resources`,
    });
  }
  pages.push({
    active: false,
    icon: 'users-alt',
    id: `group-users-${group.id}`,
    text: 'Users',
    url: `org/groups/edit/${group.id}/users`,
  });

  const navModel = {
    id: 'group-' + group.id,
    subTitle: 'Groups of resources & users',
    url: '',
    text: group.name,
    breadcrumbs: [{ title: 'Groups', url: 'org/groups' }],
    children: pages,
  } as any;

  return navModel;
}

export function getPageNav(pageName: string): NavModel {
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
