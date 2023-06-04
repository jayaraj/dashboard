import React, { FC, useEffect }  from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { DeleteButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, AccessControlAction, ResourceGroup, resourceGroupPageLimit } from 'app/types';

import { deleteResourceGroup, loadResourceGroups } from './state/actions';
import { setResourceGroupsSearchQuery } from './state/reducers';
import { getResourceGroupsSearchQuery, getResourceGroupsCount, getResourceGroups, getResourceGroupsSearchPage } from './state/selectors';


export interface OwnProps {
  resourceGroups: ResourceGroup[];
}

function mapStateToProps(state: StoreState) {
  return {
    resourceGroups: getResourceGroups(state.resourceGroups),
    searchQuery: getResourceGroupsSearchQuery(state.resourceGroups),
    resourceGroupsCount: getResourceGroupsCount(state.resourceGroups),
    searchPage: getResourceGroupsSearchPage(state.resourceGroups),
    hasFetched: state.resourceGroups.hasFetched,
  };
}

const mapDispatchToProps = {
  loadResourceGroups: loadResourceGroups,
  deleteResourceGroup: deleteResourceGroup,
  setResourceGroupsSearchQuery,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const ResourceGroupList: FC<Props> = ({
  resourceGroups, 
  searchQuery,
  resourceGroupsCount,
  searchPage,
  loadResourceGroups,
  deleteResourceGroup,
  setResourceGroupsSearchQuery,
  }) => {

  useEffect(() => {
    getResourceGroups('', 1);
  }, []);

  const getResourceGroups = async (query: string, page: number ) => {
    await loadResourceGroups(query, page);
  };

  const onSearchQueryChange = (value: string) => {
    setResourceGroupsSearchQuery(value);
  };

  const onNavigate = async (page: number) => {
    loadResourceGroups(searchQuery, page);
  };

  const renderGroup = (group: ResourceGroup)=> {

    const groupUrl = `org/groups/edit/${group.group_id}`;
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, fallback);
    return (
      <tr key={group.id}>
        <td className="link-td">
          <a href={groupUrl}>{group.group_name}</a>
        </td>
        <td className="link-td">
          <a href={groupUrl}>{group.group_path}</a>
        </td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canWrite} onConfirm={() => deleteResourceGroup(group.id)} />
        </td>
      </tr>
    );
  }

  const renderGroupList = () => {
    const totalPages = Math.ceil(resourceGroupsCount / resourceGroupPageLimit);
    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={onSearchQueryChange} />
          </div>
        </div>
        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Path</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{resourceGroups.map((group) => renderGroup(group))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination
                onNavigate={onNavigate}
                currentPage={searchPage}
                numberOfPages={totalPages}
                hideWhenSinglePage={true}
              />
            </HorizontalGroup>
          </VerticalGroup>
        </div>
      </div>
    );
  }

  return renderGroupList();
}

export default connector(ResourceGroupList);
