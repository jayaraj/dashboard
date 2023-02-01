import { NavModelItem, NavModel, UrlQueryMap } from '@grafana/data';
import { DashboardNav } from 'app/types';

export function buildNavModel(id: string, queryMap: UrlQueryMap, results: DashboardNav[]): NavModelItem {
  const folderId: number = queryMap.folderId ? Number(queryMap.folderId) : Number(0);
  let children: NavModelItem[] = [];
  let variables = ``;
  for (const key of Object.keys(queryMap)) {
    if (key.lastIndexOf('var-', 0) === 0) {
      variables = variables + `&${key}=${queryMap[key]}`;
    }
  }
  children = results.map((result) => {
    const slug = result.title ? result.title.toLowerCase().replace(' ', '-') : '';
    const query = `?folderId=${folderId}` + variables;
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

export function getDashboardNav(id: string, queryMap: UrlQueryMap, results: DashboardNav[]): NavModel {
  let main = buildNavModel(id, queryMap, results);
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
