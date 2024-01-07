import { css } from '@emotion/css';
import React, { useEffect, useState, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2, SelectableValue } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import {
  Column,
  CellProps,
  DeleteButton,
  FilterInput,
  Button,
  CallToActionCard,
  InteractiveTable,
  Pagination,
  Form,
  Stack,
  InlineField,
  useStyles2,
} from '@grafana/ui';
import { AllUserPicker } from 'app/core/components/AllUserPicker/AllUserPicker';
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, OrgUser, OrgRole } from 'app/types';
import { Connection, ConnectionUser, connectionUsersPageLimit } from 'app/types/billing/connection';

import {
  changeConnectionUsersPage,
  changeConnectionUsersQuery,
  deleteConnectionUser,
  loadConnectionUsers,
} from './state/actions';
import {
  getConnectionUsersSearchPage,
  getConnectionUsers,
  getConnectionUsersCount,
  getConnectionUsersSearchQuery,
} from './state/selectors';

type Cell<T extends keyof ConnectionUser = keyof ConnectionUser> = CellProps<ConnectionUser, ConnectionUser[T]>;
const skeletonData: ConnectionUser[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  user_id: 0,
  login: '',
  email: '',
  phone: '',
  name: '',
  role: OrgRole.None,
}));

export interface OwnProps {
  connection: Connection;
}

export const ConnectionUserList = ({
  connection,
  connectionUsers,
  connectionUsersCount,
  searchQuery,
  searchPage,
  hasFetched,
  loadConnectionUsers,
  deleteConnectionUser,
  changeQuery,
  changePage,
}: Props) => {
  const styles = useStyles2(getStyles);
  const totalPages = Math.ceil(connectionUsersCount / connectionUsersPageLimit);
  const [noConnectionUsers, setNoConnectionUsers] = useState<boolean>(true);
  const [adding, setAdding] = useState<boolean>(false);
  const [userId, setUserId] = useState<number>(0);

  useEffect(() => {
    loadConnectionUsers();
  }, []);

  useEffect(() => {
    if (connectionUsers.length !== 0 && noConnectionUsers) {
      setNoConnectionUsers(false);
    }
  }, [connectionUsers]);

  const onToggleAdding = () => {
    setAdding(!adding);
  };

  const onAdd = async () => {
    await getBackendSrv().post(`/api/connections/${connection.id}/users/${userId}`);
    loadConnectionUsers();
  };

  const onUserSelected = (user: SelectableValue<OrgUser['userId']>) => {
    setUserId(user.value ? user.value : 0);
  };

  const columns: Array<Column<ConnectionUser>> = useMemo(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: ({ cell: { value } }: Cell<'name'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'login',
        header: 'Login',
        cell: ({ cell: { value } }: Cell<'login'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'email',
        header: 'Type',
        cell: ({ cell: { value } }: Cell<'email'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'phone',
        header: 'Phone',
        cell: ({ cell: { value } }: Cell<'phone'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'role',
        header: 'Role',
        cell: ({ cell: { value } }: Cell<'role'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'actions',
        header: '',
        disableGrow: true,
        cell: ({ row: { original } }: Cell) => {
          if (!hasFetched) {
            return (
              <Stack direction="row" justifyContent="flex-end" alignItems="center">
                <Skeleton containerClassName={styles.blockSkeleton} width={22} height={24} />
              </Stack>
            );
          }
          const canDelete = contextSrv.hasPermission('connections:read');

          return (
            <Stack direction="row" justifyContent="flex-end">
              <DeleteButton
                aria-label={`Delete ${original.name}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteConnectionUser(original.user_id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteConnectionUser, styles]
  );

  if (!hasFetched) {
    return <PageLoader />;
  }
  if (noConnectionUsers) {
    return (
      <>
        <div className="page-action-bar">
          <div className="page-action-bar__spacer" />
          {contextSrv.hasPermission('org.users:read') && (
            <>
              <Stack gap={1} direction="row" alignItems="flex-end" justifyContent="end">
                <Button
                  className="pull-right"
                  onClick={onToggleAdding}
                  disabled={!contextSrv.hasPermission('connections:write')}
                >
                  Add User
                </Button>
              </Stack>
            </>
          )}
        </div>
        <SlideDown in={adding}>
          <div className="cta-form" aria-label="Users slider">
            <CloseButton onClick={onToggleAdding} />
            {contextSrv.hasPermission('users:read') && (
              <>
                <Form name="addUser" maxWidth="none" onSubmit={onAdd}>
                  {() => (
                    <Stack gap={1} direction="row">
                      <InlineField label="User" labelWidth={15}>
                        <AllUserPicker inputId="user-picker" onSelected={onUserSelected} className="min-width-20" />
                      </InlineField>
                      <Button type="submit" disabled={!contextSrv.hasPermission('connections:write')}>
                        Add
                      </Button>
                    </Stack>
                  )}
                </Form>
              </>
            )}
          </div>
        </SlideDown>

        <CallToActionCard callToActionElement={<div />} message={`No users are associated.`} />
      </>
    );
  }
  return (
    <>
      <div className="page-action-bar">
        <InlineField grow>
          <FilterInput placeholder={`Search users`} value={searchQuery} onChange={changeQuery} />
        </InlineField>
        {contextSrv.hasPermission('users:read') && (
          <>
            <Stack gap={1} direction="row">
              <Button onClick={onToggleAdding} disabled={!contextSrv.hasPermission('connections:write')}>
                Add User
              </Button>
            </Stack>
          </>
        )}
      </div>
      <SlideDown in={adding}>
        <div className="cta-form" aria-label="Users slider">
          <CloseButton onClick={onToggleAdding} />
          {contextSrv.hasPermission('users:read') && (
            <>
              <Form name="addUser" maxWidth="none" onSubmit={onAdd}>
                {() => (
                  <Stack gap={0.5} direction="row">
                    <InlineField label="User" labelWidth={15}>
                      <AllUserPicker inputId="user-picker" onSelected={onUserSelected} className="min-width-20" />
                    </InlineField>
                    <Button type="submit" disabled={!contextSrv.hasPermission('connections:write')}>
                      Add
                    </Button>
                  </Stack>
                )}
              </Form>
            </>
          )}
        </div>
      </SlideDown>
      <Stack direction={'column'} gap={2}>
        <InteractiveTable
          columns={columns}
          data={hasFetched ? connectionUsers : skeletonData}
          getRowId={(user) => String(user.id)}
        />
        <Stack justifyContent="flex-end">
          <Pagination hideWhenSinglePage currentPage={searchPage} numberOfPages={totalPages} onNavigate={changePage} />
        </Stack>
      </Stack>
    </>
  );
};

function mapStateToProps(state: StoreState) {
  return {
    connectionUsers: getConnectionUsers(state.connectionUsers),
    connectionUsersCount: getConnectionUsersCount(state.connectionUsers),
    searchPage: getConnectionUsersSearchPage(state.connectionUsers),
    searchQuery: getConnectionUsersSearchQuery(state.connectionUsers),
    hasFetched: state.connectionUsers.hasFetched,
  };
}
const mapDispatchToProps = {
  loadConnectionUsers: loadConnectionUsers,
  deleteConnectionUser: deleteConnectionUser,
  changeQuery: changeConnectionUsersQuery,
  changePage: changeConnectionUsersPage,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;
export default connector(ConnectionUserList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    // needed for things to align properly in the table
    display: 'flex',
  }),
});
