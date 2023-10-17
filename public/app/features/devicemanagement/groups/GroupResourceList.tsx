import { css } from '@emotion/css';
import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { getBackendSrv } from '@grafana/runtime';
import { DeleteButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination, LinkButton, Icon, InlineField, Button, Input, TagList } from '@grafana/ui';
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import config from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, AccessControlAction, GroupResource, Group, groupResourcePageLimit } from 'app/types';

import { deleteGroupResource, loadGroupResources } from './state/actions';
import { setGroupResourcesSearchQuery } from './state/reducers';
import { getGroupResources, getGroupResourcesSearchPage, getGroupResourcesSearchQuery, getGroupResourcesCount } from './state/selectors';

export interface OwnProps {
  group: Group;
  groupResources: GroupResource[];
}

function mapStateToProps(state: StoreState) {
  return {
    groupResources: getGroupResources(state.groupResources),
    groupResourcesCount: getGroupResourcesCount(state.groupResources),
    hasFetched: state.groupResources.hasFetched,
    searchPage: getGroupResourcesSearchPage(state.groupResources),
    searchQuery: getGroupResourcesSearchQuery(state.groupResources),
  };
}

const mapDispatchToProps = {
  loadGroupResources: loadGroupResources,
  deleteGroupResource: deleteGroupResource,
  setGroupResourcesSearchQuery,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const ResourceList: FC<Props> = ({
  group,
  groupResources, 
  groupResourcesCount,
  searchPage,
  searchQuery,
  loadGroupResources,
  deleteGroupResource,
  setGroupResourcesSearchQuery,
  }) => {

  let [isAdding, setIsAdding] = useState<boolean>(false);
  let [uuid, setUuid] = useState<string>('');

  const onToggleAdding = () => {
    setIsAdding(!isAdding);
  }

  useEffect(() => {
    getGroupResources('', 1);
  }, []);

  const onAdd = async () => {
    await getBackendSrv().post(`/api/groups/${group.id}/resources/${uuid}`);
    getGroupResources('', 1);
  }

  const getGroupResources = async (query: string, page: number ) => {
    await loadGroupResources(query, page);
  };
  
  const onSearchQueryChange = (value: string) => {
    setGroupResourcesSearchQuery(value);
  };

  const onNavigate = async (page: number) => {
    loadGroupResources(searchQuery, page);
  };

  const renderResource = (resource: GroupResource) => {
    const resourceUrl = `org/resources/edit/${resource.resource_id}`;
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, fallback);
    const tags = resource.resource_tags? resource.resource_tags.replace(/^\{+|\"+|\}+$/g, '').split(',').filter(function (str: string) {return str !== 'NULL'}) : [];

    return (
      <tr key={resource.id}>
        <td className="link-td">
          <a href={resourceUrl}>{resource.resource_name}</a>
        </td>
        <td className="link-td">
          <a href={resourceUrl}>{resource.resource_uuid}</a>
        </td>
        <td className="link-td">
          <a href={resourceUrl}>{resource.resource_type}</a>
        </td>
        <td className="link-td">
          <a href={resourceUrl}><TagList tags={tags} className={css`justify-content: flex-start;`}/></a>
        </td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canWrite} onConfirm={() => deleteGroupResource(resource.id)} />
        </td>
      </tr>
    );
  }

  const renderResourceList = () => {
    const totalPages = Math.ceil(groupResourcesCount / groupResourcePageLimit);
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, fallback);
    const parentUrl = (group.parent === -1)? `org/groups`:`org/groups/edit/${group.parent}/groups`;
    const newResourceHref = canWrite ? `org/groups/${group.id}/resources/new` : '#';

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
            New {config.resourceLabel}
          </LinkButton>
          <LinkButton href={parentUrl}>
            <Icon name="arrow-left" />Back
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
                  <th>Tags</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{groupResources.map((resource) => renderResource(resource))}</tbody>
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
  return renderResourceList();
}

export default connector(ResourceList);
