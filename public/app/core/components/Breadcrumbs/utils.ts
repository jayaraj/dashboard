import { NavModelItem } from '@grafana/data';
import { config } from '@grafana/runtime';

import { Breadcrumb } from './types';

export function buildBreadcrumbs(sectionNav: NavModelItem, pageNav?: NavModelItem, homeNav?: NavModelItem) {
  const crumbs: Breadcrumb[] = [];
  let foundHome = false;
  let lastPath: string | undefined = undefined;

  function addCrumbs(node: NavModelItem, shouldDedupe = false) {
    if (foundHome) {
      return;
    }

    // construct the URL to match
    const urlParts = node.url?.split('?') ?? ['', ''];
    let urlToMatch = urlParts[0];

    if (config.featureToggles.dockedMegaMenu) {
      const urlSearchParams = new URLSearchParams(urlParts[1]);
      if (urlSearchParams.has('editview')) {
        urlToMatch += `?editview=${urlSearchParams.get('editview')}`;
      }
    }

    // Check if we found home/root if if so return early
    if (homeNav && urlToMatch === homeNav.url) {
      crumbs.unshift({ text: homeNav.text, href: node.url ?? '' });
      foundHome = true;
      return;
    }

    const isSamePathAsLastBreadcrumb = urlToMatch.length > 0 && lastPath === urlToMatch;

    // Remember this path for the next breadcrumb
    lastPath = urlToMatch;

    const shouldAddCrumb = !node.hideFromBreadcrumbs && !(shouldDedupe && isSamePathAsLastBreadcrumb);

    if (shouldAddCrumb) {
      crumbs.unshift({ text: node.text, href: node.url ?? '' });
    }
  }

  if (pageNav) {
    addCrumbs(pageNav);
  }

  return crumbs;
}
