import { NavModelItem, NavModel, IconName } from '@grafana/data';
import { Inventory } from 'app/types/devicemanagement/inventory';

export function buildNavModel(inventory: Inventory): NavModelItem {
  const navModel = {
    id: 'inventory-' + inventory.id,
    subTitle: '',
    text: inventory.uuid,
    url: '',
    hideFromBreadcrumbs: true,
    children: [
      {
        active: false,
        icon: 'sliders-v-alt' as IconName,
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
