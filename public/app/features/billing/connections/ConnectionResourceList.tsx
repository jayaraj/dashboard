import { css } from '@emotion/css';
import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { getBackendSrv } from '@grafana/runtime';
import { CallToActionCard, VerticalGroup, HorizontalGroup, Pagination, DeleteButton, FilterInput, LinkButton, InlineField, Button, Input, TagList, Select} from '@grafana/ui';
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import config from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';
import { AccessControlAction, Connection, ConnectionResource, Profile, StoreState, connectionResourcePageLimit } from 'app/types';

import { stringToSelectableValue, stringsToSelectableValues } from '../../alerting/unified/utils/amroutes';

import { deleteConnectionResource, loadConnectionResources } from './state/actions';
import { setConnectionResourcesSearchQuery } from './state/reducers';
import { getConnectionResourcesSearchPage, getConnectionResources, getConnectionResourcesCount, getConnectionResourcesSearchQuery } from './state/selectors';

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
    
  let [profiles, setProfiles] = useState(stringsToSelectableValues([]as string[]));
  let [isAdding, setIsAdding] = useState<boolean>(false);
  let [uuid, setUuid] = useState<string>('');

  const onToggleAdding = () => {
    setIsAdding(!isAdding);
  }

  const profilesRequest = async () => {
    const response = await getBackendSrv().get('/api/orgs/profiles', { query: '', page: 1, perPage: 1000 });
    response.profiles.map((profile: Profile) => setProfiles((opts) => [...opts, stringToSelectableValue(profile.name)]))
  };

  useEffect(() => {
    profilesRequest();
    loadConnectionResources(1);
  }, []);

  const onAdd = async () => {
    await getBackendSrv().post(`/api/groups/${connection.group_id}/resources/${uuid}`);
    loadConnectionResources(1);
  }

  const onNavigate = async (page: number) => {
    loadConnectionResources(page);
  };

  const onSearchQueryChange = (value: string) => {
    setConnectionResourcesSearchQuery(value);
  };

  const onProfileChange = async (value: string, resourceId: number) => {
    await getBackendSrv().put(`/api/connections/${connection.id}/resources/${resourceId}`, {profile_name: value});
    loadConnectionResources(searchPage);
  };

  const renderResource = (resource: ConnectionResource) => {
    const resourceUrl = `org/resources/edit/${resource.resource_id}`;
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionConnectionsWrite, fallback);
    const tags = resource.resource_tags? resource.resource_tags.replace(/^\{+|\"+|\}+$/g, '').split(',').filter(function (str: string) {return str !== 'NULL'}) : [];

    return (
      <tr key={resource.resource_id}>
        <td className="link-td"><a href={resourceUrl}>{resource.resource_name}</a></td>
        <td className="link-td"><a href={resourceUrl}>{resource.resource_uuid}</a></td>
        <td className="link-td"><a href={resourceUrl}>{resource.resource_type}</a></td>
        <td className="link-td">
          <a href={resourceUrl}>
            <Select value={resource.resource_profile} onChange={(value) => onProfileChange(value.value!, resource.resource_id)} options={profiles} placeholder="Choose profile..."  width={30}/>
          </a>
        </td>
        <td className="link-td">
          <a href={resourceUrl}><TagList tags={tags} className={css`justify-content: flex-start;`}/></a>
        </td>
        <td className="text-right">
          <DeleteButton aria-label="Delete" size="sm" disabled={!canWrite} onConfirm={() => deleteConnectionResource(resource.resource_id, resource.resource_uuid)}/>
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
          <Button className="pull-right" onClick={onToggleAdding}>
            Add {config.resourceLabel}
          </Button>
          <LinkButton disabled={!canWrite} href={newResourceHref}>
            Create {config.resourceLabel}
          </LinkButton>
        </div>
        <SlideDown in={isAdding}>
          <div className="cta-form">
            <CloseButton aria-label="Close dialogue" onClick={onToggleAdding} />
            <InlineField  label="UUID" labelWidth={20}>
              <Input id="uuid-input" type="text" width={30} placeholder="uuid" value={uuid} onChange={(event) => (setUuid(event.currentTarget.value))}/>
            </InlineField>
            <Button onClick={onAdd}>
              Add
            </Button>
          </div>
        </SlideDown>
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
          <Button className="pull-right" onClick={onToggleAdding}>
            Add {config.resourceLabel}
          </Button>
          <LinkButton disabled={!canWrite} href={newResourceHref}>
            Create {config.resourceLabel}
          </LinkButton>
        </div>
        <SlideDown in={isAdding}>
          <div className="cta-form">
            <CloseButton aria-label="Close dialogue" onClick={onToggleAdding} />
            <InlineField  label="UUID" labelWidth={20}>
              <Input id="uuid-input" type="text" width={30} placeholder="uuid" value={uuid} onChange={(event) => (setUuid(event.currentTarget.value))}/>
            </InlineField>
            <Button onClick={onAdd}>
              Add
            </Button>
          </div>
        </SlideDown>
        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>UUID</th>
                  <th>Type</th>
                  <th>Profile</th>
                  <th>Tags</th>
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
