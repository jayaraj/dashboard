import { NavModelItem, NavModel } from '@grafana/data';
import { AlertDefinition, OrgRole } from 'app/types';

export function buildNavModel(alertDefinition: AlertDefinition): NavModelItem {
  let pages = [];
  pages.push({
    active: false,
    icon: 'sliders-v-alt',
    id: `alertdefinition-settings-${alertDefinition.id}`,
    text: 'Settings',
    url: `/org/alertdefinitions/edit/${alertDefinition.id}/settings`,
  });

  const navModel = {
    id: 'alertdefinition-' + alertDefinition.id,
    subTitle: 'Alert Definitions for Org, Group & Resources',
    url: '',
    text: alertDefinition.name,
    breadcrumbs: [{ title: 'Alert Definitions', url: '/org/alertdefinitions' }],
    children: pages,
  };

  return navModel;
}

export function getPageNav(pageName: string): NavModel {
  const main = buildNavModel({
    id: 1,
    updated_at: '',
    name: '',
    description: '',
    alerting_msg: '',
    ok_msg: '',
    associated_with: '',
    role: OrgRole.Viewer,
    severity: '',
    for: 0,
    ticket_enabled: false,
    configuration: {
      elements: [],
      sections: [],
    },
    alerting: 0,
    pending: 0,
    normal: 0
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
