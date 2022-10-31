import { UrlQueryMap } from '@grafana/data';
import { updateNavIndex } from 'app/core/actions';
import { SearchSrv } from 'app/core/services/search_srv';
import { DashboardNav, ThunkResult } from 'app/types';

import { buildNavModel } from './navModel';
import { dashboardNavsLoaded } from './reducers';

const searchSrv = new SearchSrv();
export function loadDashboards(queryMap: UrlQueryMap,): ThunkResult<void> {
  const folderId: number = queryMap.folderId ? Number(queryMap.folderId) : Number(0);
  let folderIds: number[] = [folderId];
  return async (dispatch) => {
    const skipRecent = true;
    const skipStarred = true;
    const response = await searchSrv.search({ skipRecent, skipStarred, folderIds }).then((results) => {
      let dashNavs: DashboardNav[] = [];
      results.map((result) => {
        if (result.type === 'dash-folder' && folderId === result.id) {
          result.items.map((item: { id: any; sort: any; title: any; url: any; type: any }) => {
            dashNavs.push({
              id: item.id,
              sort: item.sort,
              title: item.title,
              url: item.url,
              type: item.type,
            });
          });
        }
      });
      return dashNavs;
    });
    dispatch(dashboardNavsLoaded(response));
    dispatch(updateNavIndex(buildNavModel('', queryMap, response)));
  };
}
