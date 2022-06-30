import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { SelectableValue } from '@grafana/data';
import { DeleteButton, FilterInput, Button, Label, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import { UserPicker } from 'app/core/components/Select/UserPicker';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, AccessControlAction, GroupUser, OrgUser } from 'app/types';

import { deleteUser, addUser, loadUsers } from './state/actions';
import { setUserPage, setUserSearchQuery } from './state/reducers';
import { getGroupId, getUserSearchQuery, getUsersCount, getUsersPage } from './state/selectors';

const pageLimit = 20;

function mapStateToProps(state: StoreState) {
  return {
    groupId: getGroupId(state.group),
    userSearchQuery: getUserSearchQuery(state.group),
    usersCount: getUsersCount(state.group),
    usersPage: getUsersPage(state.group),
    signedInUser: contextSrv.user,
  };
}

export interface OwnProps {
  users: GroupUser[];
}

const mapDispatchToProps = {
  deleteUser,
  addUser,
  loadUsers,
  setUserSearchQuery,
  setUserPage,
};

export interface State {
  isAdding: boolean;
  newGroupUser?: SelectableValue<OrgUser['userId']> | null;
}

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class UserList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isAdding: false, newGroupUser: null };
  }

  onSearchQueryChange = (value: string) => {
    this.props.setUserSearchQuery(value);
  };

  addUser = async () => {
    const selectable: any = this.state.newGroupUser!;
    const user: number = selectable.value!;
    this.props.addUser(user, pageLimit);
    this.setState({ newGroupUser: null });
  };

  deleteUser = (user: GroupUser) => {
    this.props.deleteUser(user.id, pageLimit);
  };

  onToggleAdding = () => {
    this.setState({ isAdding: !this.state.isAdding });
  };

  onUserSelected = (user: SelectableValue<OrgUser['userId']>) => {
    this.setState({ newGroupUser: user });
  };

  isAdmin = () => {
    return this.props.signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin') || contextSrv.hasRole('Editor');
  };

  onNavigate = async (page: number) => {
    const { userSearchQuery } = this.props;
    this.props.loadUsers(userSearchQuery, page, pageLimit);
  };

  renderUser(user: GroupUser) {
    const admin = this.isAdmin();
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, admin);

    return (
      <tr key={user.id}>
        <td className="link-td">{user.login}</td>
        <td className="link-td">{user.name}</td>
        <td className="link-td">{user.email}</td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canWrite} onConfirm={() => this.deleteUser(user)} />
        </td>
      </tr>
    );
  }

  renderUserList() {
    const { isAdding } = this.state;
    const { users, userSearchQuery, usersPage, usersCount } = this.props;
    const admin = this.isAdmin();
    const canWrite =
      contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, admin) &&
      contextSrv.hasAccess(AccessControlAction.OrgUsersRead, admin);
    const totalPages = Math.ceil(usersCount / pageLimit);

    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={userSearchQuery} onChange={this.onSearchQueryChange} />
          </div>
          <Button className="pull-right" onClick={this.onToggleAdding} disabled={isAdding || !canWrite}>
            Add user
          </Button>
        </div>
        {canWrite && (
          <SlideDown in={isAdding}>
            <div className="cta-form">
              <CloseButton aria-label="Close 'Add user' dialogue" onClick={this.onToggleAdding} />
              <Label htmlFor="user-picker">Add user</Label>
              <div className="gf-form-inline">
                <UserPicker inputId="user-picker" onSelected={this.onUserSelected} className="min-width-30" />
                <div className="page-action-bar__spacer" />
                {this.state.newGroupUser && (
                  <Button type="submit" onClick={this.addUser}>
                    Add
                  </Button>
                )}
              </div>
            </div>
          </SlideDown>
        )}
        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Login</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{users.map((user) => this.renderUser(user))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination
                onNavigate={this.onNavigate}
                currentPage={usersPage}
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
    return this.renderUserList();
  }
}

export default connector(UserList);
