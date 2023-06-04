import React, { PureComponent } from 'react';

import {  DeleteButton, LinkButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import config from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, Resource, AccessControlAction, resourcePageLimit } from 'app/types';

import { connectWithCleanUp } from '../../../core/components/connectWithCleanUp';

import { deleteResource, loadResources } from './state/actions';
import { setResourcesSearchPage, setResourcesSearchQuery } from './state/reducers';
import { getResources, getResourcesCount, getResourcesSearchPage, getResourcesSearchQuery } from './state/selectors';

export interface Props {
  resources: Resource[];
  resourcesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
  loadResources: typeof loadResources;
  deleteResource: typeof deleteResource;
  setResourcesSearchQuery: typeof setResourcesSearchQuery;
}

export class ResourceList extends PureComponent<Props> {
  componentDidMount() {
    this.fetchResources('', 1);
  }

  async fetchResources(query: string, page: number) {
    await this.props.loadResources(query, page);
  }

  deleteResource = (resource: Resource) => {
    this.props.deleteResource(resource.id);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setResourcesSearchQuery(value);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchResources(searchQuery, page);
  };

  renderResource(resource: Resource) {
    const resourceUrl = `org/resources/edit/${resource.id}`;
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canRead = contextSrv.hasAccess(AccessControlAction.ActionResourcesRead, fallback);
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, fallback);

    return (
      <tr key={resource.id}>
        <td className="link-td">{canRead ? <a href={resourceUrl}>{resource.name}</a> : <>{resource.name}</>}</td>
        <td className="link-td">{canRead ? <a href={resourceUrl}>{resource.uuid}</a> : <>{resource.uuid}</>}</td>
        <td className="link-td">{canRead ? <a href={resourceUrl}>{resource.type}</a> : <>{resource.type}</>}</td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canWrite} onConfirm={() => this.deleteResource(resource)} />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionResourcesCreate, fallback);
    const newHref = canCreate ? 'org/resources/new' : '#';
    const buttonTitle = 'Create ' + config.resourceLabel.toLowerCase();
    const title = 'No ' + config.resourceLabel.toLowerCase() + 's are available.';
    return <EmptyListCTA title={title} buttonIcon="rss" buttonDisabled={!canCreate}  buttonLink={newHref} buttonTitle={buttonTitle} />;
  }

  renderResourceList() {
    const { resources, searchQuery, resourcesCount, searchPage } = this.props;
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionResourcesCreate, fallback);
    const newResourceHref = canCreate ? 'org/resources/new' : '#';
    const totalPages = Math.ceil(resourcesCount / resourcePageLimit);

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>

          <LinkButton disabled={!canCreate} href={newResourceHref}>
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
    const { hasFetched} = this.props;
    return (
      <Page navId="resources">
        <Page.Contents isLoading={!hasFetched}>{this.renderList()}</Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    resources: getResources(state.resources),
    searchQuery: getResourcesSearchQuery(state.resources),
    searchPage: getResourcesSearchPage(state.resources),
    resourcesCount: getResourcesCount(state.resources),
    hasFetched: state.resources.hasFetched,
  };
}

const mapDispatchToProps = {
  loadResources: loadResources,
  deleteResource: deleteResource,
  setResourcesSearchQuery,
  setResourcesSearchPage,
};

export default connectWithCleanUp(mapStateToProps, mapDispatchToProps, (state) => state.resources)(ResourceList);
