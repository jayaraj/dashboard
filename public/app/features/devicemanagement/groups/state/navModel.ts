import { NavModelItem, NavModel } from '@grafana/data';
import config from 'app/core/config';
import { Group } from 'app/types/devicemanagement/group';

export function buildNavModel(group: Group): NavModelItem {
  let pages = [];
  pages.push(
    {
      active: false,
      icon: 'layer-group',
      id: `group-groups-${group.id}`,
      text: 'Groups',
      url: `org/groups/edit/${group.id}/groups`,
    },
    {
      active: false,
      icon: 'users-alt',
      id: `group-users-${group.id}`,
      text: 'Users',
      url: `org/groups/edit/${group.id}/users`,
    }
  );
  if (!group.child) {
    pages.push({
      active: false,
      icon: 'resource',
      id: `group-resources-${group.id}`,
      text: config.resourceTitle + 's',
      url: `org/groups/edit/${group.id}/resources`,
    });
  }
  pages.push(
    {
      active: false,
      icon: 'bell',
      id: `group-alerts-${group.id}`,
      text: 'Alerts',
      url: `org/groups/edit/${group.id}/alerts`,
    },
    {
      active: false,
      icon: 'sliders-v-alt',
      id: `group-settings-${group.id}`,
      text: 'Settings',
      url: `org/groups/edit/${group.id}/settings`,
    }
  );

  const navModel = {
    id: 'group-' + group.id,
    subTitle: '',
    url: '',
    hideFromBreadcrumbs: true,
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
    tags: '',
    groups: [] as Group[],
    pathname: '',
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
