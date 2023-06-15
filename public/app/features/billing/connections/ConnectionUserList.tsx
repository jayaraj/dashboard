import React, { FC, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { CallToActionCard, VerticalGroup, HorizontalGroup, Pagination, DeleteButton} from '@grafana/ui';
import { AccessControlAction, ConnectionUser, StoreState, connectionUserPageLimit } from 'app/types';
import { contextSrv } from 'app/core/services/context_srv';
import { deleteConnectionUser, loadConnectionUsers } from './state/actions';
import { getConnectionUsersSearchPage, getConnectionUsers, getConnectionUsersCount } from './state/selectors';
import { OrgRolePicker } from 'app/features/admin/OrgRolePicker';

export interface OwnProps {
  connectionUsers: ConnectionUser[];
  searchPage: number;
  connectionUsersCount: number;
  hasFetched: boolean;
}

const mapDispatchToProps = {
  loadConnectionUsers: loadConnectionUsers,
  deleteConnectionUser: deleteConnectionUser
};

function mapStateToProps(state: StoreState) {
  return {
    connectionUsers: getConnectionUsers(state.connectionUsers),
    searchPage: getConnectionUsersSearchPage(state.connectionUsers),
    connectionUsersCount: getConnectionUsersCount(state.connectionUsers),
    hasFetched: state.connectionUsers.hasFetched,
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;

export const ConnectionUserList: FC<Props> = ({ 
  connectionUsers,
  connectionUsersCount,
  searchPage,
  hasFetched,
  loadConnectionUsers,
  deleteConnectionUser}) => {

  useEffect(() => {
    loadConnectionUsers(1);
  }, []);

  const onNavigate = async (page: number) => {
    loadConnectionUsers(page);
  };

  const renderUser = (user: ConnectionUser) => {
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionConnectionsWrite, fallback);
    const canDelete = (!canWrite)? contextSrv.user.id === user.user_id: canWrite;
    return (
      <tr key={user.user_id}>
        <td className="link-td">{user.name}</td>
        <td className="link-td">{user.login}</td>
        <td className="link-td">{user.email}</td>
        <td className="link-td"><OrgRolePicker aria-label="Role" value={user.role} disabled={true} onChange={()=>{}}/></td>
        <td className="text-right">
          <DeleteButton aria-label="Delete" size="sm" disabled={!canDelete} onConfirm={() => deleteConnectionUser(user.user_id, contextSrv.user.orgId)}/>
        </td>
      </tr>
    );
  }

  const renderEmptyList = () => {
    return <CallToActionCard callToActionElement={<div />} message="No users are associated." />;
  }

  const renderConnectionUserList = () => {
    const totalPages = Math.ceil(connectionUsersCount / connectionUserPageLimit);
    return (
      <>
        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Login</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{connectionUsers.map((user) => renderUser(user))}</tbody>
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
    if (connectionUsersCount > 0) {
      return renderConnectionUserList();
    } else {
      return renderEmptyList();
    }
  }

  return renderList();
};

export default connector(ConnectionUserList);
