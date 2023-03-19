import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { DeleteButton, FilterInput, LinkButton, VerticalGroup, Icon } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, AccessControlAction, Group } from 'app/types';

import { deleteChild } from './state/actions';
import { setChildrenSearchQuery } from './state/reducers';
import { getChildrenSearchQuery } from './state/selectors';

function mapStateToProps(state: StoreState) {
  return {
    searchChildrenQuery: getChildrenSearchQuery(state.group),
    signedInUser: contextSrv.user,
  };
}

export interface OwnProps {
  groups: Group[];
  group: Group;
}

const mapDispatchToProps = {
  setChildrenSearchQuery,
  deleteChild,
};
export interface State {
  page: number;
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class ChildrenList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { page: 1 };
  }

  onSearchQueryChange = (value: string) => {
    this.props.setChildrenSearchQuery(value);
  };

  deleteGroup = (group: Group) => {
    this.props.deleteChild(group.parent, group.id);
  };

  isAdmin = () => {
    return this.props.signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin') || contextSrv.hasRole('Editor');
  };

  renderChildren(group: Group) {
    const groupUrl = `org/groups/edit/${group.id}`;
    const admin = this.isAdmin();
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, admin);

    return (
      <tr key={group.id}>
        <td className="link-td">
          <a href={groupUrl}>{group.name}</a>
        </td>
        <td className="link-td">
          <a href={groupUrl}>{group.type}</a>
        </td>
        <td className="link-td">
          <a href={groupUrl}>{group.path}</a>
        </td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canWrite} onConfirm={() => this.deleteGroup(group)} />
        </td>
      </tr>
    );
  }

  renderChildrenList() {
    const { group, groups, searchChildrenQuery } = this.props;
    const admin = this.isAdmin();
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, admin);
    const newGroupHref = canWrite ? `org/groups/${group.id}/new` : '#';
    const parentUrl = (group.parent === -1)? `org/groups`:`org/groups/edit/${group.parent}/children`;

    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchChildrenQuery} onChange={this.onSearchQueryChange} />
          </div>
          <LinkButton href={parentUrl}>
            <Icon name="arrow-left" />Back
          </LinkButton>
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
              <tbody>{groups.map((child) => this.renderChildren(child))}</tbody>
            </table>
          </VerticalGroup>
        </div>
      </div>
    );
  }

  render() {
    return this.renderChildrenList();
  }
}

export default connector(ChildrenList);
