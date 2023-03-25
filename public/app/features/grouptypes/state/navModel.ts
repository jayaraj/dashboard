import { NavModelItem, NavModel } from '@grafana/data';
import { GroupType } from 'app/types';

export function buildNavModel(groupType: GroupType): NavModelItem {
  const navModel = {
    id: 'grouptype-' + groupType.id,
    subTitle: 'Manage group type settings',
    url: '',
    text: groupType.type,
    breadcrumbs: [{ title: 'Group Types', url: '/org/grouptypes' }],
    children: [
      {
        active: false,
        icon: 'sliders-v-alt',
        id: `grouptype-settings-${groupType.id}`,
        text: 'Settings',
        url: `/org/grouptypes/edit/${groupType.id}/settings`,
      },
    ],
  };

  return navModel;
}

export function getGroupTypeLoadingNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    type: 'Loading',
    configuration: {
      elements:[],
      sections:[],
    },
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
