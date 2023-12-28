import { css } from '@emotion/css';
import React, { useEffect, useState, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2, SelectableValue } from '@grafana/data';
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
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import { UserPicker } from 'app/core/components/Select/UserPicker';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, OrgUser } from 'app/types';
import { GroupUser, Group, groupUsersPageLimit } from 'app/types/devicemanagement/group';

import {
  changeGroupUsersPage,
  changeGroupUsersQuery,
  deleteGroupUser,
  addGroupUser,
  loadGroupUsers,
} from './state/actions';
import {
  getGroupUsers,
  getGroupUsersCount,
  getGroupUsersSearchPage,
  getGroupUsersSearchQuery,
} from './state/selectors';

type Cell<T extends keyof GroupUser = keyof GroupUser> = CellProps<GroupUser, GroupUser[T]>;
export interface OwnProps {
  group: Group;
  groupUsers: GroupUser[];
}
const skeletonData: GroupUser[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  login: '',
  email: '',
  phone: '',
  name: '',
  role: '',
}));

export const GroupUserList = ({
  group,
  groupUsers,
  groupUsersCount,
  searchPage,
  searchQuery,
  loadGroupUsers,
  deleteGroupUser,
  addGroupUser,
  changeQuery,
  changePage,
  hasFetched,
}: Props) => {
  const styles = useStyles2(getStyles);
  const totalPages = Math.ceil(groupUsersCount / groupUsersPageLimit);
  const [noGroupUsers, setNoGroupUsers] = useState<boolean>(true);
  const [adding, setAdding] = useState<boolean>(false);
  const [userId, setUserId] = useState<number>(0);

  useEffect(() => {
    loadGroupUsers();
  }, [loadGroupUsers]);

  useEffect(() => {
    if (groupUsers.length !== 0 && noGroupUsers) {
      setNoGroupUsers(false);
    }
  }, [groupUsers]);

  const onToggleAdding = () => {
    setAdding(!adding);
  };

  const onAdd = async () => {
    addGroupUser(userId);
    setUserId(0);
  };

  const onUserSelected = (user: SelectableValue<OrgUser['userId']>) => {
    setUserId(user.value ? user.value : 0);
  };

  const columns: Array<Column<GroupUser>> = useMemo(
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
          const canDelete = contextSrv.hasPermission('groups:write');

          return (
            <Stack direction="row" justifyContent="flex-end">
              <DeleteButton
                aria-label={`Delete ${original.name}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteGroupUser(original.id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteGroupUser, styles]
  );

  if (noGroupUsers) {
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
                  disabled={!contextSrv.hasPermission('groups:write')}
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
            {contextSrv.hasPermission('org.users:read') && (
              <>
                <Form name="addUser" maxWidth="none" onSubmit={onAdd}>
                  {() => (
                    <Stack gap={1} direction="row">
                      <InlineField label="User" labelWidth={15}>
                        <UserPicker inputId="user-picker" onSelected={onUserSelected} className="min-width-30" />
                      </InlineField>
                      <Button type="submit" disabled={!contextSrv.hasPermission('groups:write')}>
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
        {contextSrv.hasPermission('org.users:read') && (
          <>
            <Stack gap={1} direction="row">
              <Button onClick={onToggleAdding} disabled={!contextSrv.hasPermission('groups:write')}>
                Add User
              </Button>
            </Stack>
          </>
        )}
      </div>
      <SlideDown in={adding}>
        <div className="cta-form" aria-label="Users slider">
          <CloseButton onClick={onToggleAdding} />
          {contextSrv.hasPermission('org.users:read') && (
            <>
              <Form name="addUser" maxWidth="none" onSubmit={onAdd}>
                {() => (
                  <Stack gap={0.5} direction="row">
                    <InlineField label="User" labelWidth={15}>
                      <UserPicker inputId="user-picker" onSelected={onUserSelected} className="min-width-30" />
                    </InlineField>
                    <Button type="submit" disabled={!contextSrv.hasPermission('groups:write')}>
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
          data={hasFetched ? groupUsers : skeletonData}
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
  changeQuery: changeGroupUsersQuery,
  changePage: changeGroupUsersPage,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(GroupUserList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    // needed for things to align properly in the table
    display: 'flex',
  }),
});
