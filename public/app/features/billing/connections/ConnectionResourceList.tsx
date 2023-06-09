import React, { FC, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { CallToActionCard, VerticalGroup, HorizontalGroup, Pagination, DeleteButton, FilterInput, LinkButton} from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { AccessControlAction, Connection, ConnectionResource, StoreState, connectionResourcePageLimit } from 'app/types';
import { deleteConnectionResource, loadConnectionResources } from './state/actions';
import { getConnectionResourcesSearchPage, getConnectionResources, getConnectionResourcesCount, getConnectionResourcesSearchQuery } from './state/selectors';
import { setConnectionResourcesSearchQuery } from './state/reducers';
import config from 'app/core/config';
import PageLoader from 'app/core/components/PageLoader/PageLoader';

export interface OwnProps {
  connection: Connection,
  connectionResources: ConnectionResource[];
  searchPage: number;
  searchQuery: string;
  connectionResourcesCount: number;
  hasFetched: boolean;
}

const mapDispatchToProps = {
  loadConnectionResources: loadConnectionResources,
  deleteConnectionResource: deleteConnectionResource,
  setConnectionResourcesSearchQuery,
};

function mapStateToProps(state: StoreState) {
  return {
    connectionResources: getConnectionResources(state.connectionResources),
    searchQuery: getConnectionResourcesSearchQuery(state.connectionResources),
    searchPage: getConnectionResourcesSearchPage(state.connectionResources),
    connectionResourcesCount: getConnectionResourcesCount(state.connectionResources),
    hasFetched: state.connectionResources.hasFetched,
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;

export const ConnectionResourceList: FC<Props> = ({ 
  connection,
  connectionResources,
  connectionResourcesCount,
  searchPage,
  searchQuery,
  hasFetched,
  loadConnectionResources,
  deleteConnectionResource,
  setConnectionResourcesSearchQuery}) => {

  useEffect(() => {
    loadConnectionResources(1);
  }, []);

  const onNavigate = async (page: number) => {
    loadConnectionResources(page);
  };

  const onSearchQueryChange = (value: string) => {
    setConnectionResourcesSearchQuery(value);
  };

  const renderResource = (resource: ConnectionResource) => {
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canDelete = contextSrv.hasAccess(AccessControlAction.ActionConnectionsWrite, fallback);
    return (
      <tr key={resource.resource_id}>
        <td className="link-td">{resource.resource_name}</td>
        <td className="link-td">{resource.resource_uuid}</td>
        <td className="link-td">{resource.resource_type}</td>
        <td className="text-right">
          <DeleteButton aria-label="Delete" size="sm" disabled={!canDelete} onConfirm={() => deleteConnectionResource(resource.resource_id, resource.resource_uuid)}/>
        </td>
      </tr>
    );
  }

  const renderEmptyList = () => {
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, fallback);
    const newResourceHref = canWrite ? `org/connections/${connection.id}/resources/new` : '#';

    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={onSearchQueryChange} />
          </div>
          <LinkButton disabled={!canWrite} href={newResourceHref}>
            Create {config.resourceLabel}
          </LinkButton>
        </div>
        {!hasFetched ? <PageLoader /> : <CallToActionCard callToActionElement={<div />} message="No Resources found." />}
      </div>
    );
  }

  const renderConnectionResourceList = () => {
    const totalPages = Math.ceil(connectionResourcesCount / connectionResourcePageLimit);
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, fallback);
    const newResourceHref = canWrite ? `org/connections/${connection.id}/resources/new` : '#';
    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={onSearchQueryChange} />
          </div>
          <LinkButton disabled={!canWrite} href={newResourceHref}>
            Create {config.resourceLabel}
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
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{connectionResources.map((resource) => renderResource(resource))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination onNavigate={onNavigate} currentPage={searchPage} numberOfPages={totalPages} hideWhenSinglePage={true}/>
            </HorizontalGroup>
          </VerticalGroup>
        </div>
      </>
    );
  }

  const renderList = () => {
    if (!hasFetched) {
      return null;
    }
    if (connectionResourcesCount > 0) {
      return renderConnectionResourceList();
    } else {
      return renderEmptyList();
    }
  }

  return renderList();
};

export default connector(ConnectionResourceList);
