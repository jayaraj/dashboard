import { NavModelItem, NavModel } from '@grafana/data';
import config from 'app/core/config';
import { Resource } from 'app/types';

export function buildNavModel(resource: Resource): NavModelItem {
  const navModel = {
    id: 'resource-' + resource.id,
    subTitle: 'Manage ' + config.resourceLabel.toLowerCase(),
    url: '',
    text: resource.name,
    breadcrumbs: [{ title: config.resourceLabel + 's', url: 'org/resources' }],
    children: [
      {
        active: false,
        icon: 'layer-group',
        id: `resource-groups-${resource.id}`,
        text: 'Groups',
        url: `org/resources/edit/${resource.id}/groups`,
      },
      {
        active: false,
        icon: 'bell-edit',
        id: `resource-alerts-${resource.id}`,
        text: 'Alerts',
        url: `org/resources/edit/${resource.id}/alerts`,
      },
      {
        active: false,
        icon: 'sliders-v-alt',
        id: `resource-settings-${resource.id}`,
        text: 'Settings',
        url: `org/resources/edit/${resource.id}/settings`,
      },
    ],
  };

  return navModel;
}

export function getPageNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    type: '',
    name: '',
    uuid: '',
    image_url: '',
    longitude: 0,
    latitude: 0,
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
