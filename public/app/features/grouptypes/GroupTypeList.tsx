import React, { PureComponent } from 'react';

import { NavModel } from '@grafana/data';
import { DeleteButton, LinkButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv, User } from 'app/core/services/context_srv';
import { StoreState, GroupType, AccessControlAction } from 'app/types';

import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';

import { deleteGroupType, loadGroupTypes } from './state/actions';
import { setSearchQuery, setGroupTypeSearchPage } from './state/reducers';
import { getSearchQuery, getGroupTypes, getGroupTypesCount, getGroupTypeSearchPage } from './state/selectors';

const pageLimit = 10;

export interface Props {
  navModel: NavModel;
  groupTypes: GroupType[];
  searchQuery: string;
  searchPage: number;
  groupTypesCount: number;
  hasFetched: boolean;
  loadGroupTypes: typeof loadGroupTypes;
  deleteGroupType: typeof deleteGroupType;
  setSearchQuery: typeof setSearchQuery;
  setGroupTypeSearchPage: typeof setGroupTypeSearchPage;
  signedInUser: User;
}

export class GroupTypeList extends PureComponent<Props> {
  componentDidMount() {
    this.fetchGroupTypes('', 1, pageLimit);
  }

  async fetchGroupTypes(query: string, page: number, perpage: number) {
    await this.props.loadGroupTypes(query, page, perpage);
  }

  deleteGroupType = (groupType: GroupType) => {
    this.props.deleteGroupType(groupType.id, pageLimit);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setSearchQuery(value);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchGroupTypes(searchQuery, page, pageLimit);
  };

  renderGroupType(groupType: GroupType) {
    const { signedInUser } = this.props;
    const groupTypeUrl = `org/grouptypes/edit/${groupType.id}`;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canRead = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesRead, admin);
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, admin);

    return (
      <tr key={groupType.id}>
        <td className="link-td">
          {canRead ? <a href={groupTypeUrl}>{groupType.type}</a> : <>{groupType.type}</>}
        </td>
        <td className="text-right">
          <DeleteButton
            aria-label="Delete"
            size="sm"
            disabled={!canWrite}
            onConfirm={() => this.deleteGroupType(groupType)}
          />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const admin = this.props.signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, admin);
    const newHref = canWrite ? '/org/grouptypes/new' : '#';
    const buttonTitle = ' New Group Type';
    const title = 'No group types are created yet.';
    return <EmptyListCTA title={title} buttonIcon="rss" buttonLink={newHref} buttonTitle={buttonTitle} />;
  }

  renderGroupTypeList() {
    const { groupTypes, searchQuery, signedInUser, searchPage, groupTypesCount } = this.props;
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, signedInUser.isGrafanaAdmin);
    const disabledClass = canWrite ? '' : ' disabled';
    const newGroupTypeHref = canWrite ? '/org/grouptypes/new' : '#';
    const totalPages = Math.ceil(groupTypesCount / pageLimit);

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>

          <LinkButton className={disabledClass} href={newGroupTypeHref}>
            New Group Type
          </LinkButton>
        </div>

        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Type</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{groupTypes.map((groupType) => this.renderGroupType(groupType))}</tbody>
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
    const { groupTypesCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }

    if (groupTypesCount > 0) {
      return this.renderGroupTypeList();
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
    navModel: getNavModel(state.navIndex, 'grouptypes'),
    groupTypes: getGroupTypes(state.groupTypes),
    searchQuery: getSearchQuery(state.groupTypes),
    searchPage: getGroupTypeSearchPage(state.groupTypes),
    groupTypesCount: getGroupTypesCount(state.groupTypes),
    hasFetched: state.groupTypes.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadGroupTypes,
  deleteGroupType,
  setSearchQuery,
  setGroupTypeSearchPage,
};

export default connectWithCleanUp(
  mapStateToProps,
  mapDispatchToProps,
  (state) => state.groupTypes
)(GroupTypeList);
