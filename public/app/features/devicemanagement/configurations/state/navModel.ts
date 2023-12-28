import { NavModelItem, NavModel } from '@grafana/data';
import { IconName } from '@grafana/ui';
import { OrgRole } from 'app/types';
import { ConfigurationType } from 'app/types/devicemanagement/configuration';

export function buildNavModel(configurationType: ConfigurationType): NavModelItem {
  const navModel = {
    id: 'configurationtype-' + configurationType.id,
    text: configurationType.type,
    subTitle: '',
    url: '',
    hideFromBreadcrumbs: true,
    children: [
      {
        active: false,
        icon: 'sliders-v-alt' as IconName,
        id: `configurationtype-settings-${configurationType.id}`,
        text: 'Settings',
        url: `/org/configurationtypes/edit/${configurationType.id}/settings`,
      },
    ],
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
