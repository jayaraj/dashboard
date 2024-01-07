import { css } from '@emotion/css';
import React, { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { AppEvents, GrafanaTheme2 } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import {
  Column,
  CellProps,
  DeleteButton,
  LinkButton,
  FilterInput,
  InlineField,
  Pagination,
  Button,
  useStyles2,
  Stack,
  Input,
  Tooltip,
  Form,
  Icon,
  Select,
  InteractiveTable,
} from '@grafana/ui';
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { appEvents } from 'app/core/core';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { Connection, connectionsPageLimit, connectionStatusTypes } from 'app/types/billing/connection';

import { changeConnectionsPage, changeConnectionsQuery, deleteConnection, loadConnections } from './state/actions';
import {
  getConnectionsSearchQuery,
  getConnections,
  getConnectionsCount,
  getConnectionsSearchPage,
} from './state/selectors';

type Cell<T extends keyof Connection = keyof Connection> = CellProps<Connection, Connection[T]>;
export interface OwnProps {}

const skeletonData: Connection[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  updated_at: '',
  org_id: 0,
  group_id: 0,
  group_path_id: '',
  profile: '',
  status: '',
  name: '',
  phone: '',
  email: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  connection_ext: 0,
  tags: [],
  latitude: 0,
  longitude: 0,
}));

export const ConnectionList = ({
  connections,
  connectionsCount,
  searchPage,
  searchQuery,
  loadConnections,
  deleteConnection,
  changeQuery,
  changePage,
  hasFetched,
}: Props) => {
  const styles = useStyles2(getStyles);
  const canCreate = contextSrv.hasPermission('connections:create');
  const totalPages = Math.ceil(connectionsCount / connectionsPageLimit);
  const [adding, setAdding] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [connectionExt, setConnectionExt] = useState<number>(0);
  const [noConnections, setNoConnections] = useState<boolean>(true);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  useEffect(() => {
    if (connections.length !== 0 && noConnections) {
      setNoConnections(false);
    }
  }, [connections]);

  const columns: Array<Column<Connection>> = useMemo(
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
        id: 'connection_ext',
        header: 'Connection No',
        cell: ({ cell: { value } }: Cell<'connection_ext'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'number',
      },
      {
        id: 'email',
        header: 'Email',
        cell: ({ cell: { value } }: Cell<'email'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
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
            return <Skeleton width={40} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'profile',
        header: 'Profile',
        cell: ({ cell: { value } }: Cell<'profile'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ cell: { value } }: Cell<'status'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return <Select value={value} options={connectionStatusTypes} disabled={true} onChange={() => {}} />;
        },
      },
      {
        id: 'actions',
        header: '',
        disableGrow: true,
        cell: ({ row: { original } }: Cell) => {
          if (!hasFetched) {
            return (
              <Stack direction="row" justifyContent="flex-end" alignItems="center">
                <Skeleton containerClassName={styles.blockSkeleton} width={16} height={16} />
                <Skeleton containerClassName={styles.blockSkeleton} width={22} height={24} />
              </Stack>
            );
          }
          const connectionUrl = `org/connections/edit/${original.id}`;
          const canRead = contextSrv.hasPermission('connections:read');
          const canDelete = contextSrv.hasPermission('connections:delete');

          return (
            <Stack direction="row" justifyContent="flex-end">
              {canRead && (
                <Tooltip content={`Edit ${original.name}`}>
                  <a href={connectionUrl} aria-label={`Edit ${original.name}`}>
                    <Icon name={'pen'} />
                  </a>
                </Tooltip>
              )}
              <DeleteButton
                aria-label={`Delete ${original.name}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteConnection(original.id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteConnection, styles]
  );

  const onToggleAdding = () => {
    setAdding(!adding);
  };

  const sendOtp = async () => {
    await getBackendSrv().post(`/api/connections/number/${connectionExt}/otp`);
  };

  const onSubmit = async () => {
    await getBackendSrv()
      .post(`/api/connections/number/${connectionExt}/users`, { otp: otp })
      .then((data) => {
        appEvents.emit(AppEvents.alertSuccess, ['added']);
        if (data.org_id !== 0) {
          locationService.push(`/?orgId=${data.org_id}`);
          window.location.reload();
        }
        return {};
      });
    loadConnections();
  };

  return (
    <Page
      navId="billing-connections"
      actions={
        <LinkButton href={canCreate ? 'org/connections/new' : '#'} disabled={!canCreate}>
          {`New Connection`}
        </LinkButton>
      }
    >
      <Page.Contents isLoading={!hasFetched}>
        {noConnections ? (
          <>
            <div className="page-action-bar">
              <div className="page-action-bar__spacer" />
              <Button className="pull-right" onClick={onToggleAdding}>
                Add Connection
              </Button>
            </div>
            <SlideDown in={adding}>
              <div className="cta-form">
                <CloseButton onClick={onToggleAdding} />
                <>
                  <Form name="addConnection" maxWidth="none" onSubmit={onSubmit}>
                    {() => (
                      <Stack direction="column">
                        <Stack gap={1} direction="row">
                          <InlineField label="Connection No" labelWidth={20}>
                            <Input
                              id="connect-ext-input"
                              width={30}
                              type="number"
                              value={connectionExt}
                              onChange={(event) => setConnectionExt(Number(event.currentTarget.value))}
                            />
                          </InlineField>
                        </Stack>
                        <Stack gap={1} direction="row">
                          <InlineField label="OTP" labelWidth={20}>
                            <Input
                              id="connect-ext-input"
                              width={30}
                              type="text"
                              value={otp}
                              onChange={(event) => setOtp(event.currentTarget.value)}
                            />
                          </InlineField>
                          <Button className="pull-right" onClick={sendOtp} disabled={connectionExt === 0}>
                            Send OTP
                          </Button>
                        </Stack>
                        <Stack gap={1} direction="row">
                          <Button type="submit">Add</Button>
                        </Stack>
                      </Stack>
                    )}
                  </Form>
                </>
              </div>
            </SlideDown>
            <EmptyListCTA
              title={`No connections are available.`}
              buttonIcon="group-type"
              buttonLink="org/connections/new"
              buttonTitle={`New Connection`}
              buttonDisabled={!canCreate}
            />
          </>
        ) : (
          <>
            <div className="page-action-bar">
              <InlineField grow>
                <FilterInput placeholder={`Search connections`} value={searchQuery} onChange={changeQuery} />
              </InlineField>
              <Button className="pull-right" onClick={onToggleAdding}>
                Add Connection
              </Button>
            </div>
            <SlideDown in={adding}>
              <div className="cta-form">
                <CloseButton onClick={onToggleAdding} />
                <>
                  <Form name="addConnection" maxWidth="none" onSubmit={onSubmit}>
                    {() => (
                      <Stack direction="column">
                        <Stack gap={1} direction="row">
                          <InlineField label="Connection No" labelWidth={20}>
                            <Input
                              id="connect-ext-input"
                              width={30}
                              type="number"
                              value={connectionExt}
                              onChange={(event) => setConnectionExt(Number(event.currentTarget.value))}
                            />
                          </InlineField>
                        </Stack>
                        <Stack gap={1} direction="row">
                          <InlineField label="OTP" labelWidth={20}>
                            <Input
                              id="connect-ext-input"
                              width={30}
                              type="text"
                              value={otp}
                              onChange={(event) => setOtp(event.currentTarget.value)}
                            />
                          </InlineField>
                          <Button className="pull-right" onClick={sendOtp} disabled={connectionExt === 0}>
                            Send OTP
                          </Button>
                        </Stack>
                        <Stack gap={1} direction="row">
                          <Button type="submit">Add</Button>
                        </Stack>
                      </Stack>
                    )}
                  </Form>
                </>
              </div>
            </SlideDown>
            <Stack direction={'column'} gap={2}>
              <InteractiveTable
                columns={columns}
                data={hasFetched ? connections : skeletonData}
                getRowId={(connection) => String(connection.id)}
              />
              <Stack justifyContent="flex-end">
                <Pagination
                  hideWhenSinglePage
                  currentPage={searchPage}
                  numberOfPages={totalPages}
                  onNavigate={changePage}
                />
              </Stack>
            </Stack>
          </>
        )}
      </Page.Contents>
    </Page>
  );
};

function mapStateToProps(state: StoreState) {
  return {
    connections: getConnections(state.connections),
    searchQuery: getConnectionsSearchQuery(state.connections),
    searchPage: getConnectionsSearchPage(state.connections),
    connectionsCount: getConnectionsCount(state.connections),
    hasFetched: state.connections.hasFetched,
  };
}

const mapDispatchToProps = {
  loadConnections: loadConnections,
  deleteConnection: deleteConnection,
  changeQuery: changeConnectionsQuery,
  changePage: changeConnectionsPage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(ConnectionList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    display: 'flex',
  }),
});
