import { NavModelItem, NavModel } from '@grafana/data';
import { ConfigurationType, OrgRole } from 'app/types';

export function buildNavModel(configurationType: ConfigurationType): NavModelItem {
  let pages = [];
  if (configurationType.associated_with === 'org') {
    pages.push({
      active: false,
      icon: 'info-circle',
      id: `configurationtype-configurations-${configurationType.id}`,
      text: 'Org configurations',
      url: `/org/configurationtypes/edit/${configurationType.id}/configurations`,
    });
  }
  pages.push({
    active: false,
    icon: 'sliders-v-alt',
    id: `configurationtype-settings-${configurationType.id}`,
    text: 'Settings',
    url: `/org/configurationtypes/edit/${configurationType.id}/settings`,
  });

  const navModel = {
    id: 'configurationtype-' + configurationType.id,
    subTitle: 'Configuration types for Org, Group & Resources',
    url: '',
    text: configurationType.type,
    breadcrumbs: [{ title: 'Configuration Types', url: '/org/configurationtypes' }],
    children: pages,
  };

  return navModel;
}

export function getPageNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    type: '',
    configuration: {
      elements: [],
      sections: [],
    },
    updated_at: '',
    associated_with: '',
    measurement: false,
    role: OrgRole.Viewer,
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
