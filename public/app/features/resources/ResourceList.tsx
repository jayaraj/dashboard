import React, { PureComponent } from 'react';

import { NavModel } from '@grafana/data';
import { Button, DeleteButton, LinkButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import config from 'app/core/config';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv, User } from 'app/core/services/context_srv';
import { StoreState, Resource, AccessControlAction } from 'app/types';

import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';

import { cloneResource, deleteResource, loadResources } from './state/actions';
import { setSearchQuery, setResourcePage } from './state/reducers';
import { getSearchQuery, getResources, getResourcesCount, getResourcesPage } from './state/selectors';

const pageLimit = 20;

export interface Props {
  navModel: NavModel;
  resources: Resource[];
  resourcesCount: number;
  searchQuery: string;
  page: number;
  hasFetched: boolean;
  loadResources: typeof loadResources;
  deleteResource: typeof deleteResource;
  cloneResource: typeof cloneResource;
  setSearchQuery: typeof setSearchQuery;
  setResourcePage: typeof setResourcePage;
  signedInUser: User;
}

export class ResourceList extends PureComponent<Props> {
  componentDidMount() {
    this.fetchResources('', 1, pageLimit);
  }

  async fetchResources(query: string, page: number, perpage: number) {
    await this.props.loadResources(query, page, perpage);
  }

  deleteResource = (resource: Resource) => {
    this.props.deleteResource(resource.id, pageLimit);
  };

  cloneResource = (resource: Resource) => {
    this.props.cloneResource(resource.id, pageLimit);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setSearchQuery(value);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchResources(searchQuery, page, pageLimit);
  };

  renderResource(resource: Resource) {
    const { signedInUser } = this.props;
    const resourceUrl = `org/resources/edit/${resource.id}`;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin') || contextSrv.hasRole('Editor');
    const canRead = contextSrv.hasAccess(AccessControlAction.ActionResourcesRead, admin);
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, admin);

    return (
      <tr key={resource.id}>
        <td className="link-td">{canRead ? <a href={resourceUrl}>{resource.name}</a> : <>{resource.name}</>}</td>
        <td className="link-td">{canRead ? <a href={resourceUrl}>{resource.uuid}</a> : <>{resource.uuid}</>}</td>
        <td className="link-td">{canRead ? <a href={resourceUrl}>{resource.type}</a> : <>{resource.type}</>}</td>
        <td className="text-left">
          <Button size="sm" disabled={!canWrite} onClick={() => this.cloneResource(resource)}>
            Clone
          </Button>
        </td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canWrite} onConfirm={() => this.deleteResource(resource)} />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const { signedInUser } = this.props;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin') || contextSrv.hasRole('Editor');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, admin);
    const newHref = canWrite ? 'org/resources/new' : '#';
    const buttonTitle = ' New ' + config.resourceLabel.toLowerCase();
    const title = 'No ' + config.resourceLabel.toLowerCase() + 's are created yet.';
    return <EmptyListCTA title={title} buttonIcon="rss" buttonLink={newHref} buttonTitle={buttonTitle} />;
  }

  renderResourceList() {
    const { signedInUser, resourcesCount, page } = this.props;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin') || contextSrv.hasRole('Editor');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, admin);
    const { resources, searchQuery } = this.props;
    const newResourceHref = canWrite ? 'org/resources/new' : '#';
    const totalPages = Math.ceil(resourcesCount / pageLimit);

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>

          <LinkButton disabled={!canWrite} href={newResourceHref}>
            New {config.resourceLabel}
          </LinkButton>
        </div>

        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>UUID</th>
                  <th>Type</th>
                  <th />
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{resources.map((resource) => this.renderResource(resource))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination
                onNavigate={this.onNavigate}
                currentPage={page}
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
    const { resourcesCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }

    if (resourcesCount > 0) {
      return this.renderResourceList();
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
    navModel: getNavModel(state.navIndex, 'resources'),
    resources: getResources(state.resources),
    searchQuery: getSearchQuery(state.resources),
    page: getResourcesPage(state.resources),
    resourcesCount: getResourcesCount(state.resources),
    hasFetched: state.resources.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadResources,
  deleteResource,
  cloneResource,
  setSearchQuery,
  setResourcePage,
};

export default connectWithCleanUp(mapStateToProps, mapDispatchToProps, (state) => state.resources)(ResourceList);
