import { NavModelItem, NavModel } from '@grafana/data';
import { OrgType } from 'app/types';

export function buildNavModel(orgType: OrgType): NavModelItem {
  const navModel = {
    id: 'orgtype-' + orgType.id,
    subTitle: 'Manage org settings',
    url: '',
    text: orgType.type,
    breadcrumbs: [{ title: 'Org Configurations', url: '/org/orgtypes' }],
    children: [
      {
        active: false,
        icon: 'sliders-v-alt',
        id: `orgtype-settings-${orgType.id}`,
        text: 'Settings',
        url: `/org/orgtypes/edit/${orgType.id}/settings`,
      },
      {
        active: false,
        icon: 'info-circle',
        id: `orgtype-configuration-${orgType.id}`,
        text: 'Configurations',
        url: `/org/orgtypes/edit/${orgType.id}/configuration`,
      },
    ],
  };

  return navModel;
}

export function getOrgTypeLoadingNav(pageName: string): NavModel {
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
