import React, { FC, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { DeleteButton, FilterInput, LinkButton, VerticalGroup, Icon, HorizontalGroup, Pagination, CallToActionCard} from '@grafana/ui';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, AccessControlAction, Group, groupPageLimit } from 'app/types';

import { deleteGroup, loadGroups } from './state/actions';
import { setGroupsSearchQuery } from './state/reducers';
import { getGroupsSearchQuery, getGroupsSearchPage, getGroups, getGroupsCount } from './state/selectors';

export interface OwnProps {
  group: Group;
  groups: Group[];
  searchQuery: string;
  searchPage: number;
  groupsCount: number;
  hasFetched: boolean;
}

const mapDispatchToProps = {
  loadGroups: loadGroups,
  deleteGroup: deleteGroup,
  setGroupsSearchQuery,
};

function mapStateToProps(state: StoreState) {
  return {
    groups: getGroups(state.groups),
    groupsCount: getGroupsCount(state.groups),
    searchPage: getGroupsSearchPage(state.groups),
    searchQuery: getGroupsSearchQuery(state.groups),
    hasFetched: state.groups.hasFetched,
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const SubGroupList: FC<Props> = ({
  group,
  groups, 
  searchQuery,
  searchPage,
  groupsCount,
  hasFetched,
  loadGroups,
  deleteGroup,
  setGroupsSearchQuery}) => {

  useEffect(() => {
    getGroups(group.id, '', 1);
  }, []);

  const getGroups = async (parent: number, query: string, page: number ) => {
    await loadGroups(parent, query, page);
  };

  const onSearchQueryChange = (value: string) => {
    setGroupsSearchQuery(value);
  };

  const onNavigate = async (page: number) => {
    getGroups(group.id, searchQuery, page);
  };

  const renderChildren = (group: Group) => {
    const groupUrl = `org/groups/edit/${group.id}`;
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, fallback);

    return (
      <tr key={group.id}>
        <td className="link-td">
          <a href={groupUrl}>{group.name}</a>
        </td>
        <td className="link-td">
          <a href={groupUrl}>{group.type}</a>
        </td>
        <td className="link-td">
          <a href={groupUrl}>{group.path}</a>
        </td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canWrite} onConfirm={() => deleteGroup(group.parent, group.id)} />
        </td>
      </tr>
    );
  }

  const renderSubGroupList = () => {
    const totalPages = Math.ceil(groupsCount / groupPageLimit);
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, fallback);
    const url = canWrite ? `org/groups/${group.id}/new` : '#';
    const parentUrl = (group.parent === -1)? `org/groups`:`org/groups/edit/${group.parent}/groups`;

    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={onSearchQueryChange} />
          </div>
          <LinkButton href={parentUrl}>
            <Icon name="arrow-left" />Back
          </LinkButton>
          <LinkButton disabled={!canWrite} href={url}>
            New Group
          </LinkButton>
        </div>
        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Path</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{groups.map((child) => renderChildren(child))}</tbody>
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

  const renderEmptyList = () => {
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, fallback);
    const url = canWrite ? `org/groups/${group.id}/new` : '#';
    const parentUrl = (group.parent === -1)? `org/groups`:`org/groups/edit/${group.parent}/groups`;

    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={onSearchQueryChange} />
          </div>
          <LinkButton href={parentUrl}>
            <Icon name="arrow-left" />Back
          </LinkButton>
          <LinkButton disabled={!canWrite} href={url}>
            New Group
          </LinkButton>
        </div>
        {!hasFetched ? <PageLoader /> : <CallToActionCard callToActionElement={<div />} message="No Groups found." />}
      </div>
    );
  }

  const renderList = () => {
    if (!hasFetched) {
      return renderEmptyList();
    }
    if (groupsCount > 0) {
      return renderSubGroupList();
    } else {
      return renderEmptyList();
    }
  }

  return renderList();
}

export default connector(SubGroupList);
