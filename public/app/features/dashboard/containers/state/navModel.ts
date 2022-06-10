import { NavModelItem, NavModel } from '@grafana/data';
import { DashboardNav } from 'app/types';

export function buildNavModel(id: string, folderId: number, results: DashboardNav[]): NavModelItem {
  let children: NavModelItem[] = [];
  children = results.map((result) => {
    const slug = result.title ? result.title.toLowerCase() : '';
    const query = `?folderId=${folderId}`;
    const item: NavModelItem = {
      id: slug,
      text: result.title ? result.title : 'Loading',
      url: result.url ? result.url + query : 'Loading',
      active: id === slug,
      sort: result.sort,
    };
    return item;
  });
  const navModel = {
    id: '1',
    text: 'Loading',
    children: children,
  };
  return navModel;
}

export function getDashboardNav(id: string, folderId: number, results: DashboardNav[]): NavModel {
  let main = buildNavModel(id, folderId, results);
  let node: NavModelItem;

  for (const child of main.children!) {
    if (child.id === id) {
      node = child;
      break;
    }
  }

  return {
    main: main,
    node: node!,
  };
}
