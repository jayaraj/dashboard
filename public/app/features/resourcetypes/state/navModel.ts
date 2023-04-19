import { NavModelItem, NavModel } from '@grafana/data';
import config from 'app/core/config';
import { ResourceType } from 'app/types';

export function buildNavModel(resourceType: ResourceType): NavModelItem {
  const navModel = {
    id: 'resourcetype-' + resourceType.id,
    subTitle: 'Manage ' + config.resourceLabel.toLowerCase() + 'type settings',
    url: '',
    text: resourceType.type,
    breadcrumbs: [{ title: config.resourceLabel + ' Types', url: '/org/resourcetypes' }],
    children: [
      {
        active: false,
        icon: 'sliders-v-alt',
        id: `resourcetype-settings-${resourceType.id}`,
        text: 'Settings',
        url: `/org/resourcetypes/edit/${resourceType.id}/settings`,
      },
      {
        active: false,
        icon: 'tax',
        id: `resourcetype-slab-${resourceType.id}`,
        text: 'Slabs',
        url: `/org/resourcetypes/edit/${resourceType.id}/slab`,
      },
    ],
  };

  return navModel;
}

export function getResourceTypeLoadingNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    type: 'Loading',
    other_configurations:false, 
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
