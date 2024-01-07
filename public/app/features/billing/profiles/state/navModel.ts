import { NavModelItem, NavModel } from '@grafana/data';
import { IconName } from '@grafana/ui';
import { Profile } from 'app/types/billing/profile';

export function buildNavModel(profile: Profile): NavModelItem {
  const navModel = {
    id: 'profile-' + profile.id,
    text: profile.name,
    subTitle: '',
    url: '',
    hideFromBreadcrumbs: true,
    children: [
      {
        active: false,
        icon: 'tax' as IconName,
        id: `profile-slabs-${profile.id}`,
        text: 'Slabs',
        url: `/org/profiles/edit/${profile.id}/slabs`,
      },
      {
        active: false,
        icon: 'sliders-v-alt' as IconName,
        id: `profile-settings-${profile.id}`,
        text: 'Settings',
        url: `/org/profiles/edit/${profile.id}/settings`,
      },
    ],
  };

  return navModel;
}

export function getPageNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    org_id: 0,
    updated_at: '',
    name: '',
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
