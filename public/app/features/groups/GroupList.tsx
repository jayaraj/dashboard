import React, { PureComponent } from 'react';

import { NavModel } from '@grafana/data';
import { DeleteButton, LinkButton, FilterInput, VerticalGroup } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv, User } from 'app/core/services/context_srv';
import { StoreState, Group, AccessControlAction } from 'app/types';

import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';

import { deleteGroup, loadGroups } from './state/actions';
import { setSearchQuery, setGroupPage } from './state/reducers';
import { getSearchQuery, getGroups, getGroupsCount, getGroupsPage } from './state/selectors';

export interface Props {
  navModel: NavModel;
  groups: Group[];
  groupsCount: number;
  searchQuery: string;
  page: number;
  hasFetched: boolean;
  loadGroups: typeof loadGroups;
  deleteGroup: typeof deleteGroup;
  setSearchQuery: typeof setSearchQuery;
  setGroupPage: typeof setGroupPage;
  signedInUser: User;
}

export class GroupList extends PureComponent<Props> {
  componentDidMount() {
    this.fetchGroups();
  }

  async fetchGroups() {
    await this.props.loadGroups();
  }

  deleteGroup = (group: Group) => {
    this.props.deleteGroup(group.id);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setSearchQuery(value);
  };

  renderGroup(group: Group) {
    const { signedInUser } = this.props;
    const groupUrl = `org/groups/edit/${group.id}`;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin') || contextSrv.hasRole('Editor');
    const canRead = contextSrv.hasAccess(AccessControlAction.ActionGroupsRead, admin);
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, admin);

    return (
      <tr key={group.id}>
        <td className="link-td">{canRead ? <a href={groupUrl}>{group.name}</a> : <>{group.name}</>}</td>
        <td className="link-td">{canRead ? <a href={groupUrl}>{group.type}</a> : <>{group.type}</>}</td>
        <td className="link-td">{canRead ? <a href={groupUrl}>{group.path}</a> : <>{group.path}</>}</td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canWrite} onConfirm={() => this.deleteGroup(group)} />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const { signedInUser } = this.props;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin') || contextSrv.hasRole('Editor');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, admin);
    const newHref = canWrite ? 'org/groups/new' : '#';
    const title = 'No groups are created yet.';
    return <EmptyListCTA title={title} buttonIcon="layer-group" buttonLink={newHref} buttonTitle="New Group" />;
  }

  renderGroupList() {
    const { signedInUser } = this.props;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin') || contextSrv.hasRole('Editor');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, admin);
    const { groups, searchQuery } = this.props;
    const newGroupHref = canWrite ? 'org/groups/new' : '#';

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>

          <LinkButton disabled={!canWrite} href={newGroupHref}>
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
    const { hasFetched, navModel } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={!hasFetched}>{this.renderList()}</Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    navModel: getNavModel(state.navIndex, 'resourcegroups'),
    groups: getGroups(state.groups),
    searchQuery: getSearchQuery(state.groups),
    page: getGroupsPage(state.groups),
    groupsCount: getGroupsCount(state.groups),
    hasFetched: state.groups.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadGroups,
  deleteGroup,
  setSearchQuery,
  setGroupPage,
};

export default connectWithCleanUp(mapStateToProps, mapDispatchToProps, (state) => state.groups)(GroupList);
