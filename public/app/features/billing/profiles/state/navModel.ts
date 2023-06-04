import { NavModelItem, NavModel } from '@grafana/data';
import { Profile } from 'app/types';

export function buildNavModel(profile: Profile): NavModelItem {
  const navModel = {
    id: 'profile-' + profile.id,
    subTitle: 'Connection profiles configure slab rates',
    url: '',
    text: profile.name,
    breadcrumbs: [{ title: 'Profiles', url: '/org/profiles' }],
    children: [
      {
        active: false,
        icon: 'tax',
        id: `profile-slab-${profile.id}`,
        text: 'Slabs',
        url: `/org/profiles/edit/${profile.id}/slab`,
      },
      {
        active: false,
        icon: 'sliders-v-alt',
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
    updated_at: '',
    org_id: 0,
    name: '',
    description: ''
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
