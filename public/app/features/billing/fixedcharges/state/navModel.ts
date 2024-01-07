import { NavModelItem, NavModel } from '@grafana/data';
import { IconName } from '@grafana/ui';
import { FixedCharge } from 'app/types/billing/fixedcharge';

export function buildNavModel(fixedCharge: FixedCharge): NavModelItem {
  const navModel = {
    id: 'fixedcharge-' + fixedCharge.id,
    text: fixedCharge.description,
    subTitle: '',
    url: '',
    hideFromBreadcrumbs: true,
    children: [
      {
        active: false,
        icon: 'sliders-v-alt' as IconName,
        id: `fixedcharge-settings-${fixedCharge.id}`,
        text: 'Settings',
        url: `/org/fixedcharges/edit/${fixedCharge.id}/settings`,
      },
    ],
  };

  return navModel;
}

export function getPageNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    tax: 0,
    amount: 0,
    description: '',
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
