import React, { PureComponent } from 'react';

import { DeleteButton, LinkButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, Group, AccessControlAction, groupPageLimit } from 'app/types';

import { connectWithCleanUp } from '../../../core/components/connectWithCleanUp';

import { deleteGroup, loadGroups } from './state/actions';
import { setGroupsSearchQuery } from './state/reducers';
import { getGroupsSearchQuery, getGroups, getGroupsCount, getGroupsSearchPage } from './state/selectors';

export interface Props {
  groups: Group[];
  groupsCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
  loadGroups: typeof loadGroups;
  deleteGroup: typeof deleteGroup;
  setGroupsSearchQuery: typeof setGroupsSearchQuery;
}

export class GroupList extends PureComponent<Props> {
  componentDidMount() {
    this.fetchGroups(-1, '', 1);
  }

  async fetchGroups(parent: number, query: string, page: number) {
    await this.props.loadGroups(parent, query, page);
  }

  deleteGroup = (group: Group) => {
    this.props.deleteGroup(-1, group.id);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setGroupsSearchQuery(value);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchGroups(-1, searchQuery, page);
  };

  renderGroup(group: Group) {
    const groupUrl = `org/groups/edit/${group.id}`;
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canRead = contextSrv.hasAccess(AccessControlAction.ActionGroupsRead, fallback);
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionGroupsCreate, fallback);

    return (
      <tr key={group.id}>
        <td className="link-td">{canRead ? <a href={groupUrl}>{group.name}</a> : <>{group.name}</>}</td>
        <td className="link-td">{canRead ? <a href={groupUrl}>{group.type}</a> : <>{group.type}</>}</td>
        <td className="link-td">{canRead ? <a href={groupUrl}>{group.path}</a> : <>{group.path}</>}</td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canCreate} onConfirm={() => this.deleteGroup(group)} />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionGroupsCreate, fallback);
    const newHref = canCreate ? 'org/groups/new' : '#';
    return <EmptyListCTA title="No groups are available." buttonIcon="layer-group" buttonDisabled={!canCreate} buttonLink={newHref} buttonTitle="Create group" />;
  }

  renderGroupList() {
    const { groups, searchQuery, searchPage, groupsCount } = this.props;
    const totalPages = Math.ceil(groupsCount / groupPageLimit);
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionGroupsCreate, fallback);
    const newGroupHref = canCreate ? 'org/groups/new' : '#';

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>
          <LinkButton disabled={!canCreate} href={newGroupHref}>
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
              <tbody>{groups.map((group) => this.renderGroup(group))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination
                onNavigate={this.onNavigate}
                currentPage={searchPage}
                numberOfPages={totalPages}
                hideWhenSinglePage={true}
              />
            </HorizontalGroup>
          </VerticalGroup>
        </div>
      </>
    );
  }

  renderList() {
    const { groupsCount, hasFetched } = this.props;
    if (!hasFetched) {
      return null;
    }
    if (groupsCount > 0) {
      return this.renderGroupList();
    } else {
      return this.renderEmptyList();
    }
  }

  render() {
    const { hasFetched } = this.props;

    return (
      <Page navId="resourcegroups">
        <Page.Contents isLoading={!hasFetched}>{this.renderList()}</Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    groups: getGroups(state.groups),
    searchQuery: getGroupsSearchQuery(state.groups),
    searchPage: getGroupsSearchPage(state.groups),
    groupsCount: getGroupsCount(state.groups),
    hasFetched: state.groups.hasFetched,
  };
}

const mapDispatchToProps = {
  loadGroups: loadGroups,
  deleteGroup: deleteGroup,
  setGroupsSearchQuery,
};

export default connectWithCleanUp(mapStateToProps, mapDispatchToProps, (state) => state.groups)(GroupList);
