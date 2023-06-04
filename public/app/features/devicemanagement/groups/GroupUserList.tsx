import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { SelectableValue } from '@grafana/data';
import { DeleteButton, FilterInput, Button, Label, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import { UserPicker } from 'app/core/components/Select/UserPicker';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, AccessControlAction, GroupUser, OrgUser, Group, groupUserPageLimit } from 'app/types';

import { deleteGroupUser, addGroupUser, loadGroupUsers } from './state/actions';
import { setGroupUsersSearchQuery } from './state/reducers';
import { getGroupUsers, getGroupUsersCount, getGroupUsersSearchPage, getGroupUsersSearchQuery } from './state/selectors';

export interface OwnProps {
  group: Group;
  groupUsers: GroupUser[];
}

function mapStateToProps(state: StoreState) {
  return {
    groupUsers: getGroupUsers(state.groupUsers),
    groupUsersCount: getGroupUsersCount(state.groupUsers),
    hasFetched: state.groupUsers.hasFetched,
    searchPage: getGroupUsersSearchPage(state.groupUsers),
    searchQuery: getGroupUsersSearchQuery(state.groupUsers),
  };
}

const mapDispatchToProps = {
  loadGroupUsers: loadGroupUsers,
  deleteGroupUser: deleteGroupUser,
  addGroupUser: addGroupUser,
  setGroupUsersSearchQuery,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const GroupUserList: FC<Props> = ({
  group,
  groupUsers, 
  groupUsersCount,
  hasFetched,
  searchPage,
  searchQuery,
  loadGroupUsers,
  deleteGroupUser,
  addGroupUser,
  setGroupUsersSearchQuery,
  }) => {
  let [adding, setAdding] = useState<boolean>(false);
  let [userId, setUserId] = useState<number>(0);

  useEffect(() => {
    getGroupUsers('', 1);
  }, []);

  const getGroupUsers = async (query: string, page: number ) => {
    await loadGroupUsers(query, page);
  };

  const onSearchQueryChange = (value: string) => {
    setGroupUsersSearchQuery(value);
  };

  const onAddGroupUser = async () => {
    addGroupUser(userId);
    setUserId(0);
  };

  const onToggleAdding = () => {
    setAdding(!adding);
  };

  const onUserSelected = (user: SelectableValue<OrgUser['userId']>) => {
    setUserId(user.value? user.value: 0)
  };

  const onNavigate = async (page: number) => {
    loadGroupUsers(searchQuery, page);
  };

  const renderUser = (user: GroupUser) => {
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, fallback);

    return (
      <tr key={user.id}>
        <td className="link-td">{user.login}</td>
        <td className="link-td">{user.name}</td>
        <td className="link-td">{user.email}</td>
        <td className="link-td">{user.role}</td>
        <td className="text-right">
          <DeleteButton size="sm" disabled={!canWrite} onConfirm={() => deleteGroupUser(user.id)} />
        </td>
      </tr>
    );
  }

  const renderUserList = () => {
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, fallback);
    const totalPages = Math.ceil(groupUsersCount / groupUserPageLimit);

    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={onSearchQueryChange} />
          </div>
          <Button className="pull-right" onClick={onToggleAdding} disabled={adding || !canWrite}>
            Add user
          </Button>
        </div>
        {canWrite && (
          <SlideDown in={adding}>
            <div className="cta-form">
              <CloseButton aria-label="Close 'Add user' dialogue" onClick={onToggleAdding} />
              <Label htmlFor="user-picker">Add user</Label>
              <div className="gf-form-inline">
                <UserPicker inputId="user-picker" onSelected={onUserSelected} className="min-width-30" />
                <div className="page-action-bar__spacer" />
                { (userId !== 0) && (
                  <Button type="submit" onClick={onAddGroupUser}>
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
                  <th>Role</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{groupUsers.map((user) => renderUser(user))}</tbody>
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
  return renderUserList();
}

export default connector(GroupUserList);
