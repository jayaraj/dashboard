import { css } from '@emotion/css';
import React, { useEffect, useState, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import {
  Column,
  CellProps,
  DeleteButton,
  FilterInput,
  InteractiveTable,
  Pagination,
  Form,
  LinkButton,
  Stack,
  InlineField,
  Button,
  Input,
  CallToActionCard,
  ConfirmButton,
  TagList,
  Icon,
  useStyles2,
} from '@grafana/ui';
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import config from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { Connection, ConnectionResource, connectionResourcesPageLimit } from 'app/types/billing/connection';

import {
  changeConnectionResourcesPage,
  changeConnectionResourcesQuery,
  cleanResourceData,
  deleteConnectionResource,
  loadConnectionResources,
} from './state/actions';
import {
  getConnectionResourcesSearchPage,
  getConnectionResources,
  getConnectionResourcesCount,
  getConnectionResourcesSearchQuery,
} from './state/selectors';

type Cell<T extends keyof ConnectionResource = keyof ConnectionResource> = CellProps<
  ConnectionResource,
  ConnectionResource[T]
>;
export interface OwnProps {
  connection: Connection;
}
const skeletonData: ConnectionResource[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  resource_id: 0,
  resource_uuid: '',
  resource_name: '',
  resource_type: '',
  resource_tags: '',
  resource_online_status: false,
  resource_last_seen: '',
}));

export const ConnectionResourceList = ({
  connection,
  connectionResources,
  connectionResourcesCount,
  searchPage,
  searchQuery,
  hasFetched,
  loadConnectionResources,
  deleteConnectionResource,
  cleanResourceData,
  changeQuery,
  changePage,
}: Props) => {
  const styles = useStyles2(getStyles);
  const totalPages = Math.ceil(connectionResourcesCount / connectionResourcesPageLimit);
  const [noConnectionResources, setNoConnectionResources] = useState<boolean>(true);
  let [isAdding, setIsAdding] = useState<boolean>(false);
  let [uuid, setUuid] = useState<string>('');

  useEffect(() => {
    loadConnectionResources();
  }, []);

  useEffect(() => {
    if (connectionResources.length !== 0 && noConnectionResources) {
      setNoConnectionResources(false);
    }
  }, [connectionResources]);

  const onToggleAdding = () => {
    setIsAdding(!isAdding);
  };

  const onAdd = async () => {
    await getBackendSrv().post(`/api/groups/${connection.group_id}/resources/${uuid}`);
    loadConnectionResources();
  };

  const columns: Array<Column<ConnectionResource>> = useMemo(
    () => [
      {
        id: 'resource_name',
        header: 'Name',
        cell: ({ cell: { value } }: Cell<'resource_name'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'resource_uuid',
        header: 'UUID',
        cell: ({ cell: { value } }: Cell<'resource_uuid'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'resource_type',
        header: 'Type',
        cell: ({ cell: { value } }: Cell<'resource_type'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'resource_tags',
        header: 'Tags',
        cell: ({ cell: { value } }: Cell<'resource_tags'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} height={32} containerClassName={styles.blockSkeleton} />;
          }
          const tags = value
            ? value
                .replace(/^\{+|\"+|\}+$/g, '')
                .split(',')
                .filter(function (str: string) {
                  return str !== 'NULL';
                })
            : [];
          return (
            <TagList
              tags={tags}
              className={css`
                justify-content: flex-start;
              `}
            />
          );
        },
      },
      {
        id: 'resource_online_status',
        header: 'Status',
        cell: ({ cell: { value } }: Cell<'resource_online_status'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return (
            <div className={styles.online}>
              {value ? (
                <Icon name={'rss'} style={{ color: 'green' }} />
              ) : (
                <Icon name={'rss'} style={{ color: 'red' }} />
              )}
            </div>
          );
        },
      },
      {
        id: 'resource_last_seen',
        header: 'Last Seen',
        cell: ({ cell: { value } }: Cell<'resource_last_seen'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return (
            <div className={styles.text}>{value.startsWith('0001') ? '-' : value.slice(0, 19).replace('T', ' ')}</div>
          );
        },
        sortType: (a, b) =>
          new Date(a.original.resource_last_seen!).getTime() - new Date(b.original.resource_last_seen!).getTime(),
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
          const canDelete = contextSrv.hasPermission('connections:write');
          const canCleanData = contextSrv.hasPermission('resources.data:delete');

          return (
            <Stack direction="row" justifyContent="flex-end">
              {canCleanData && (
                <ConfirmButton
                  confirmText="Clean data"
                  confirmVariant="primary"
                  size={'sm'}
                  disabled={!canCleanData}
                  onConfirm={() => cleanResourceData(original.resource_id)}
                >
                  <Button
                    aria-label={`Clean data of ${original.resource_name}`}
                    variant="primary"
                    icon="trash-alt"
                    size={'sm'}
                  />
                </ConfirmButton>
              )}
              <DeleteButton
                aria-label={`Delete ${original.resource_name}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteConnectionResource(original.resource_id, original.resource_uuid)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteConnectionResource, styles]
  );

  if (!hasFetched) {
    return <PageLoader />;
  }
  if (noConnectionResources) {
    return (
      <>
        <div className="page-action-bar">
          <div className="page-action-bar__spacer" />
          <Stack gap={1} direction="row">
            <Button className="pull-right" onClick={onToggleAdding}>
              Add {config.resourceTitle.toLowerCase()}
            </Button>
            <LinkButton
              disabled={
                !(contextSrv.hasPermission('connections:write') && contextSrv.hasPermission('resources:create'))
              }
              href={`org/connections/${connection.id}/resources/new`}
            >
              New {config.resourceTitle.toLowerCase()}
            </LinkButton>
          </Stack>
        </div>
        <SlideDown in={isAdding}>
          <div className="cta-form" aria-label="Resources slider">
            <CloseButton onClick={onToggleAdding} />
            <Form name="addResource" maxWidth="none" onSubmit={onAdd}>
              {() => (
                <Stack gap={1} direction="row">
                  <InlineField label="UUID" labelWidth={15}>
                    <Input
                      id="uuid-input"
                      type="text"
                      width={30}
                      placeholder="uuid"
                      value={uuid}
                      onChange={(event) => setUuid(event.currentTarget.value)}
                    />
                  </InlineField>
                  <Button type="submit" disabled={!contextSrv.hasPermission('connections:write')}>
                    Add
                  </Button>
                </Stack>
              )}
            </Form>
          </div>
        </SlideDown>
        <CallToActionCard
          callToActionElement={<div />}
          message={`No ${config.resourceTitle.toLowerCase()}s are associated.`}
        />
      </>
    );
  }
  return (
    <>
      <div className="page-action-bar">
        <InlineField grow>
          <FilterInput
            placeholder={`Search ${config.resourceTitle.toLowerCase()}`}
            value={searchQuery}
            onChange={changeQuery}
          />
        </InlineField>
        <Stack gap={1} direction="row">
          <Button className="pull-right" onClick={onToggleAdding}>
            Add {config.resourceTitle.toLowerCase()}
          </Button>
          <LinkButton
            disabled={!(contextSrv.hasPermission('connections:write') && contextSrv.hasPermission('resources:create'))}
            href={`org/connections/${connection.id}/resources/new`}
          >
            New {config.resourceTitle.toLowerCase()}
          </LinkButton>
        </Stack>
      </div>
      <SlideDown in={isAdding}>
        <div className="cta-form" aria-label="Resources slider">
          <CloseButton onClick={onToggleAdding} />
          <Form name="addResource" maxWidth="none" onSubmit={onAdd}>
            {() => (
              <Stack gap={1} direction="row">
                <InlineField label="UUID" labelWidth={15}>
                  <Input
                    id="uuid-input"
                    type="text"
                    width={30}
                    placeholder="uuid"
                    value={uuid}
                    onChange={(event) => setUuid(event.currentTarget.value)}
                  />
                </InlineField>
                <Button type="submit" disabled={!contextSrv.hasPermission('connections:write')}>
                  Add
                </Button>
              </Stack>
            )}
          </Form>
        </div>
      </SlideDown>
      <Stack direction={'column'} gap={2}>
        <InteractiveTable
          columns={columns}
          data={hasFetched ? connectionResources : skeletonData}
          getRowId={(resource) => String(resource.resource_id)}
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
    connectionResources: getConnectionResources(state.connectionResources),
    searchQuery: getConnectionResourcesSearchQuery(state.connectionResources),
    searchPage: getConnectionResourcesSearchPage(state.connectionResources),
    connectionResourcesCount: getConnectionResourcesCount(state.connectionResources),
    hasFetched: state.connectionResources.hasFetched,
  };
}
const mapDispatchToProps = {
  loadConnectionResources: loadConnectionResources,
  deleteConnectionResource: deleteConnectionResource,
  cleanResourceData: cleanResourceData,
  changeQuery: changeConnectionResourcesQuery,
  changePage: changeConnectionResourcesPage,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;
export default connector(ConnectionResourceList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    // needed for things to align properly in the table
    display: 'flex',
  }),
  text: css`
    position: relative;
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    flex-shrink: 0;
    gap: 6px;
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.size.sm};
  `,
  online: css`
    margin-left: 10px;
  `,
});
