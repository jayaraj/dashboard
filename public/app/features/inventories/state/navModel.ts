import { NavModelItem, NavModel } from '@grafana/data';
import { Inventory } from 'app/types';

export function buildNavModel(inventory: Inventory): NavModelItem {
  const navModel = {
    id: 'inventory-' + inventory.id,
    subTitle: 'Manage inventory settings',
    url: '',
    text: inventory.uuid,
    breadcrumbs: [{ title: 'Inventories', url: '/org/inventories' }],
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

export function getInventoryLoadingNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    type: '',
    uuid: '',
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
