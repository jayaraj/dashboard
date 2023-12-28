import { NavModelItem, NavModel } from '@grafana/data';
import { IconName } from '@grafana/ui';
import { Resource } from 'app/types/devicemanagement/resource';

export function buildNavModel(resource: Resource): NavModelItem {
  const navModel = {
    id: 'resource-' + resource.id,
    text: resource.name,
    subTitle: '',
    url: '',
    hideFromBreadcrumbs: true,
    children: [
      {
        active: false,
        icon: 'layer-group' as IconName,
        id: `resource-groups-${resource.id}`,
        text: 'Groups',
        url: `org/resources/edit/${resource.id}/groups`,
      },
      {
        active: false,
        icon: 'bell' as IconName,
        id: `resource-alerts-${resource.id}`,
        text: 'Alerts',
        url: `org/resources/edit/${resource.id}/alerts`,
      },
      {
        active: false,
        icon: 'sliders-v-alt' as IconName,
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
    tags: '',
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
