import React, { PureComponent } from 'react';

import { NavModel } from '@grafana/data';
import { DeleteButton, LinkButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import config from 'app/core/config';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv, User } from 'app/core/services/context_srv';
import { StoreState, ResourceType, AccessControlAction } from 'app/types';

import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';

import { deleteResourceType, loadResourceTypes } from './state/actions';
import { setSearchQuery, setResourceTypeSearchPage } from './state/reducers';
import { getSearchQuery, getResourceTypes, getResourceTypesCount, getResourceTypeSearchPage } from './state/selectors';

const pageLimit = 10;

export interface Props {
  navModel: NavModel;
  resourceTypes: ResourceType[];
  searchQuery: string;
  searchPage: number;
  resourceTypesCount: number;
  hasFetched: boolean;
  loadResourceTypes: typeof loadResourceTypes;
  deleteResourceType: typeof deleteResourceType;
  setSearchQuery: typeof setSearchQuery;
  setResourceTypeSearchPage: typeof setResourceTypeSearchPage;
  signedInUser: User;
}

export class ResourceTypeList extends PureComponent<Props> {
  componentDidMount() {
    this.fetchResourceTypes('', 1, pageLimit);
  }

  async fetchResourceTypes(query: string, page: number, perpage: number) {
    await this.props.loadResourceTypes(query, page, perpage);
  }

  deleteResourceType = (resourceType: ResourceType) => {
    this.props.deleteResourceType(resourceType.id, pageLimit);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setSearchQuery(value);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchResourceTypes(searchQuery, page, pageLimit);
  };

  renderResourceType(resourceType: ResourceType) {
    const { signedInUser } = this.props;
    const resourceTypeUrl = `org/resourcetypes/edit/${resourceType.id}`;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canRead = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesRead, admin);
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, admin);

    return (
      <tr key={resourceType.id}>
        <td className="link-td">
          {canRead ? <a href={resourceTypeUrl}>{resourceType.type}</a> : <>{resourceType.type}</>}
        </td>
        <td className="text-right">
          <DeleteButton
            aria-label="Delete"
            size="sm"
            disabled={!canWrite}
            onConfirm={() => this.deleteResourceType(resourceType)}
          />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const admin = this.props.signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, admin);
    const newHref = canWrite ? '/org/resourcetypes/new' : '#';
    const buttonTitle = ' New ' + config.resourceLabel.toLowerCase() + 'type';
    const title = 'No ' + config.resourceLabel.toLowerCase() + 'types are created yet.';
    return <EmptyListCTA title={title} buttonIcon="rss" buttonLink={newHref} buttonTitle={buttonTitle} />;
  }

  renderResourceTypeList() {
    const { resourceTypes, searchQuery, signedInUser, searchPage, resourceTypesCount } = this.props;
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, signedInUser.isGrafanaAdmin);
    const disabledClass = canWrite ? '' : ' disabled';
    const newResourceTypeHref = canWrite ? '/org/resourcetypes/new' : '#';
    const totalPages = Math.ceil(resourceTypesCount / pageLimit);

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>

          <LinkButton className={disabledClass} href={newResourceTypeHref}>
            New {config.resourceLabel}Type
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
              <tbody>{resourceTypes.map((resourceType) => this.renderResourceType(resourceType))}</tbody>
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
    const { resourceTypesCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }

    if (resourceTypesCount > 0) {
      return this.renderResourceTypeList();
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
    navModel: getNavModel(state.navIndex, 'resourcetypes'),
    resourceTypes: getResourceTypes(state.resourceTypes),
    searchQuery: getSearchQuery(state.resourceTypes),
    searchPage: getResourceTypeSearchPage(state.resourceTypes),
    resourceTypesCount: getResourceTypesCount(state.resourceTypes),
    hasFetched: state.resourceTypes.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadResourceTypes,
  deleteResourceType,
  setSearchQuery,
  setResourceTypeSearchPage,
};

export default connectWithCleanUp(
  mapStateToProps,
  mapDispatchToProps,
  (state) => state.resourceTypes
)(ResourceTypeList);
