import { NavModelItem, NavModel } from '@grafana/data';
import config from 'app/core/config';
import { Inventory } from 'app/types';

export function buildNavModel(inventory: Inventory): NavModelItem {
  const navModel = {
    id: 'inventory-' + inventory.id,
    subTitle: `Inventory of ${config.resourceLabel.toLowerCase()}s with respective configurations`,
    url: '',
    text: inventory.uuid,
    breadcrumbs: [{ title: 'Inventory', url: '/org/inventories' }],
    children: [
      {
        active: false,
        icon: 'sliders-v-alt',
        id: `inventory-settings-${inventory.id}`,
        text: 'Settings',
        url: `/org/inventories/edit/${inventory.id}/settings`,
      },
    ],
  };

  return navModel;
}

export function getPageNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    type: '',
    uuid: '',
    resource_name: '',
    resource_org: 0,
    assigned: false,
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
