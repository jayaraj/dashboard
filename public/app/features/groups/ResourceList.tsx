import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { DeleteButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination, LinkButton, Icon } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, AccessControlAction, GroupResource, Group } from 'app/types';

import { deleteResource, loadResources } from './state/actions';
import { setResourcePage, setResourceSearchQuery } from './state/reducers';
import { getResourcesCount, getResourcesPage, getResourceSearchQuery } from './state/selectors';

const pageLimit = 10;

function mapStateToProps(state: StoreState) {
  return {
    resourceSearchQuery: getResourceSearchQuery(state.group),
    resourcesCount: getResourcesCount(state.group),
    resourcesPage: getResourcesPage(state.group),
    signedInUser: contextSrv.user,
  };
}

export interface OwnProps {
  resources: GroupResource[];
  group: Group;
}

const mapDispatchToProps = {
  deleteResource,
  loadResources,
  setResourceSearchQuery,
  setResourcePage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export class ResourceList extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  onSearchQueryChange = (value: string) => {
    this.props.setResourceSearchQuery(value);
  };

  deleteResource = (resource: GroupResource) => {
    this.props.deleteResource(resource.id, pageLimit);
  };

  isAdmin = () => {
    return this.props.signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin') || contextSrv.hasRole('Editor');
  };

  onNavigate = async (page: number) => {
    const { resourceSearchQuery } = this.props;
    this.props.loadResources(resourceSearchQuery, page, pageLimit);
  };

  renderResource(resource: GroupResource) {
    const resourceUrl = `org/resources/edit/${resource.resource_id}`;
    const admin = this.isAdmin();
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, admin);

    return (
      <tr key={resource.id}>
        <td className="link-td">
          <a href={resourceUrl}>{resource.resource_name}</a>
        </td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canWrite} onConfirm={() => this.deleteResource(resource)} />
        </td>
      </tr>
    );
  }

  renderResourceList() {
    const { resources, resourceSearchQuery, resourcesPage, resourcesCount, group } = this.props;
    const totalPages = Math.ceil(resourcesCount / pageLimit);
    const parentUrl = (group.parent === -1)? `org/groups`:`org/groups/edit/${group.parent}/children`;

    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={resourceSearchQuery} onChange={this.onSearchQueryChange} />
          </div>
          <LinkButton href={parentUrl}>
            <Icon name="arrow-up" />Parent
          </LinkButton>
        </div>
        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Name</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{resources.map((resource) => this.renderResource(resource))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination
                onNavigate={this.onNavigate}
                currentPage={resourcesPage}
                numberOfPages={totalPages}
                hideWhenSinglePage={true}
              />
            </HorizontalGroup>
          </VerticalGroup>
        </div>
      </div>
    );
  }

  render() {
    return this.renderResourceList();
  }
}

export default connector(ResourceList);
