import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { SelectableValue } from '@grafana/data';
import { DeleteButton, FilterInput, Button, Label, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import { GroupPicker } from 'app/core/components/Select/GroupPicker';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, Group, AccessControlAction, ResourceGroup } from 'app/types';

import { deleteGroup, addGroup, loadGroups } from './state/actions';
import { setGroupPage, setGroupSearchQuery } from './state/reducers';
import { getGroupsCount, getGroupsPage, getGroupSearchQuery, getResourceId } from './state/selectors';

const pageLimit = 10;

function mapStateToProps(state: StoreState) {
  return {
    resourceId: getResourceId(state.resource),
    groupSearchQuery: getGroupSearchQuery(state.resource),
    groupsCount: getGroupsCount(state.resource),
    groupsPage: getGroupsPage(state.resource),
    signedInUser: contextSrv.user,
  };
}

export interface OwnProps {
  groups: ResourceGroup[];
}

const mapDispatchToProps = {
  deleteGroup,
  addGroup,
  loadGroups,
  setGroupSearchQuery,
  setGroupPage,
};

export interface State {
  isAdding: boolean;
  newResourceGroup?: SelectableValue<Group['id']> | null;
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class GroupList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isAdding: false, newResourceGroup: null };
  }

  onSearchQueryChange = (value: string) => {
    this.props.setGroupSearchQuery(value);
  };

  addGroup = async () => {
    const selectable: any = this.state.newResourceGroup!;
    const group: Group = selectable.value!;
    this.props.addGroup(group, pageLimit);
    this.setState({ newResourceGroup: null });
  };

  deleteGroup = (group: ResourceGroup) => {
    this.props.deleteGroup(group.id, pageLimit);
  };

  onToggleAdding = () => {
    this.setState({ isAdding: !this.state.isAdding });
  };

  onGroupSelected = (group: SelectableValue<Group['id']>) => {
    this.setState({ newResourceGroup: group });
  };

  isAdmin = () => {
    return this.props.signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin') || contextSrv.hasRole('Editor');
  };

  onNavigate = async (page: number) => {
    const { groupSearchQuery } = this.props;
    this.props.loadGroups(groupSearchQuery, page, pageLimit);
  };

  renderGroup(group: ResourceGroup) {
    const groupUrl = `org/groups/edit/${group.group_id}`;
    const admin = this.isAdmin();
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, admin);

    return (
      <tr key={group.id}>
        <td className="link-td">
          <a href={groupUrl}>{group.group_name}</a>
        </td>
        <td className="link-td">
          <a href={groupUrl}>{group.group_path}</a>
        </td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canWrite} onConfirm={() => this.deleteGroup(group)} />
        </td>
      </tr>
    );
  }

  renderGroupList() {
    const { isAdding } = this.state;
    const { groups, groupSearchQuery, groupsPage, groupsCount } = this.props;
    const admin = this.isAdmin();
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, admin);
    const totalPages = Math.ceil(groupsCount / pageLimit);

    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={groupSearchQuery} onChange={this.onSearchQueryChange} />
          </div>
          <Button className="pull-right" onClick={this.onToggleAdding} disabled={isAdding || !canWrite}>
            Add group
          </Button>
        </div>
        <SlideDown in={isAdding}>
          <div className="cta-form">
            <CloseButton aria-label="Close 'Add group' dialogue" onClick={this.onToggleAdding} />
            <Label htmlFor="group-picker">Add to group</Label>
            <div className="gf-form-inline">
              <GroupPicker
                onSelected={this.onGroupSelected}
                resourceId={this.props.resourceId}
                className="min-width-30"
              />
              <div className="page-action-bar__spacer" />
              {this.state.newResourceGroup && (
                <Button type="submit" onClick={this.addGroup}>
                  Add
                </Button>
              )}
            </div>
          </div>
        </SlideDown>
        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Path</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{groups.map((group) => this.renderGroup(group))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination
                onNavigate={this.onNavigate}
                currentPage={groupsPage}
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
    return this.renderGroupList();
  }
}

export default connector(GroupList);
