import React, { PureComponent } from 'react';

import { NavModel } from '@grafana/data';
import { DeleteButton, LinkButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv, User } from 'app/core/services/context_srv';
import { StoreState, OrgType, AccessControlAction } from 'app/types';

import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';

import { deleteOrgType, loadOrgTypes } from './state/actions';
import { setSearchQuery, setOrgTypeSearchPage } from './state/reducers';
import { getSearchQuery, getOrgTypes, getOrgTypesCount, getOrgTypeSearchPage } from './state/selectors';

const pageLimit = 10;

export interface Props {
  navModel: NavModel;
  orgTypes: OrgType[];
  searchQuery: string;
  searchPage: number;
  orgTypesCount: number;
  hasFetched: boolean;
  loadOrgTypes: typeof loadOrgTypes;
  deleteOrgType: typeof deleteOrgType;
  setSearchQuery: typeof setSearchQuery;
  setOrgTypeSearchPage: typeof setOrgTypeSearchPage;
  signedInUser: User;
}

export class OrgTypeList extends PureComponent<Props> {
  componentDidMount() {
    this.fetchOrgTypes('', 1, pageLimit);
  }

  async fetchOrgTypes(query: string, page: number, perpage: number) {
    await this.props.loadOrgTypes(query, page, perpage);
  }

  deleteOrgType = (orgType: OrgType) => {
    this.props.deleteOrgType(orgType.id, pageLimit);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setSearchQuery(value);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchOrgTypes(searchQuery, page, pageLimit);
  };

  renderOrgType(orgType: OrgType) {
    const { signedInUser } = this.props;
    const orgTypeUrl = `org/orgtypes/edit/${orgType.id}`;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canRead = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesRead, admin);
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, admin);

    return (
      <tr key={orgType.id}>
        <td className="link-td">
          {canRead ? <a href={orgTypeUrl}>{orgType.type}</a> : <>{orgType.type}</>}
        </td>
        <td className="text-right">
          <DeleteButton
            aria-label="Delete"
            size="sm"
            disabled={!canWrite}
            onConfirm={() => this.deleteOrgType(orgType)}
          />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const admin = this.props.signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, admin);
    const newHref = canWrite ? '/org/orgtypes/new' : '#';
    const buttonTitle = ' New Org Type';
    const title = 'No org types are created yet.';
    return <EmptyListCTA title={title} buttonIcon="rss" buttonLink={newHref} buttonTitle={buttonTitle} />;
  }

  renderOrgTypeList() {
    const { orgTypes, searchQuery, signedInUser, searchPage, orgTypesCount } = this.props;
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, signedInUser.isGrafanaAdmin);
    const disabledClass = canWrite ? '' : ' disabled';
    const newOrgTypeHref = canWrite ? '/org/orgtypes/new' : '#';
    const totalPages = Math.ceil(orgTypesCount / pageLimit);

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>

          <LinkButton className={disabledClass} href={newOrgTypeHref}>
            New Org Type
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
              <tbody>{orgTypes.map((orgType) => this.renderOrgType(orgType))}</tbody>
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
    const { orgTypesCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }

    if (orgTypesCount > 0) {
      return this.renderOrgTypeList();
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
    navModel: getNavModel(state.navIndex, 'orgtypes'),
    orgTypes: getOrgTypes(state.orgTypes),
    searchQuery: getSearchQuery(state.orgTypes),
    searchPage: getOrgTypeSearchPage(state.orgTypes),
    orgTypesCount: getOrgTypesCount(state.orgTypes),
    hasFetched: state.orgTypes.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadOrgTypes,
  deleteOrgType,
  setSearchQuery,
  setOrgTypeSearchPage,
};

export default connectWithCleanUp(
  mapStateToProps,
  mapDispatchToProps,
  (state) => state.orgTypes
)(OrgTypeList);
