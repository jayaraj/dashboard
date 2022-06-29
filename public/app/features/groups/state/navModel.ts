import { NavModelItem, NavModel } from '@grafana/data';
import { Group } from 'app/types';

export function buildNavModel(group: Group): NavModelItem {
  const navModel = {
    id: 'group-' + group.id,
    subTitle: 'Manage Groups',
    url: '',
    text: group.name,
    breadcrumbs: [{ title: 'Groups', url: 'org/groups' }],
    children: [
      {
        active: false,
        icon: 'layer-group',
        id: `group-children-${group.id}`,
        text: 'Children',
        url: `org/groups/edit/${group.id}/children`,
      },
      {
        active: false,
        icon: 'rss',
        id: `group-resources-${group.id}`,
        text: 'Resources',
        url: `org/groups/edit/${group.id}/resources`,
      },
      {
        active: false,
        icon: 'users-alt',
        id: `group-users-${group.id}`,
        text: 'Users',
        url: `org/groups/edit/${group.id}/users`,
      },
      {
        active: false,
        icon: 'sliders-v-alt',
        id: `group-settings-${group.id}`,
        text: 'Settings',
        url: `org/groups/edit/${group.id}/settings`,
      },
    ],
  };

  return navModel;
}

export function getGroupLoadingNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    name: 'Loading',
    parent: 0,
    child: false,
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
