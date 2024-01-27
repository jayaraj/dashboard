import { css } from '@emotion/css';
import React, { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import {
  Column,
  CellProps,
  DeleteButton,
  LinkButton,
  FilterInput,
  InlineField,
  Pagination,
  TagList,
  useStyles2,
  ConfirmButton,
  Button,
  Stack,
  Tooltip,
  Icon,
  InteractiveTable,
} from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import config from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { Resource, resourcesPageLimit } from 'app/types/devicemanagement/resource';

import {
  changeResourcesPage,
  changeResourcesQuery,
  cleanResourceData,
  deleteResource,
  loadResources,
} from './state/actions';
import { getResources, getResourcesCount, getResourcesSearchPage, getResourcesSearchQuery } from './state/selectors';

type Cell<T extends keyof Resource = keyof Resource> = CellProps<Resource, Resource[T]>;
export interface OwnProps {}

const skeletonData: Resource[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  type: '',
  uuid: '',
  name: '',
  tags: '',
  image_url: '',
  latitude: 0,
  longitude: 0,
  online_status: false,
  last_seen: '',
}));

export const ResourceList = ({
  resources,
  resourcesCount,
  searchQuery,
  searchPage,
  hasFetched,
  loadResources,
  deleteResource,
  cleanResourceData,
  changeQuery,
  changePage,
}: Props) => {
  const styles = useStyles2(getStyles);
  const canCreate = contextSrv.hasPermission('resources:create');
  const canCleanData = contextSrv.hasPermission('resources.data:delete');
  const totalPages = Math.ceil(resourcesCount / resourcesPageLimit);
  const [noResources, setNoResources] = useState<boolean>(true);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  useEffect(() => {
    if (resources.length !== 0 && noResources) {
      setNoResources(false);
    }
  }, [resources]);

  const columns: Array<Column<Resource>> = useMemo(
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
        id: 'uuid',
        header: 'UUID',
        cell: ({ cell: { value } }: Cell<'uuid'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'type',
        header: 'Type',
        cell: ({ cell: { value } }: Cell<'type'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'tags',
        header: 'Tags',
        cell: ({ cell: { value } }: Cell<'tags'>) => {
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
        id: 'online_status',
        header: 'Status',
        cell: ({ cell: { value } }: Cell<'online_status'>) => {
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
        id: 'last_seen',
        header: 'Last Seen',
        cell: ({ cell: { value } }: Cell<'last_seen'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return (
            <div className={styles.text}>{value.startsWith('0001') ? '-' : value.slice(0, 19).replace('T', ' ')}</div>
          );
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
          const resourceUrl = `org/resources/edit/${original.id}`;
          const canRead = contextSrv.hasPermission('resources:read');
          const canDelete = contextSrv.hasPermission('resources:delete');

          return (
            <Stack direction="row" justifyContent="flex-end">
              {canRead && (
                <Tooltip content={`Edit ${original.name}`}>
                  <a href={resourceUrl} aria-label={`Edit ${original.name}`}>
                    <Icon name={'pen'} />
                  </a>
                </Tooltip>
              )}
              {canCleanData && (
                <ConfirmButton
                  confirmText="Clean data"
                  confirmVariant="primary"
                  size={'sm'}
                  disabled={!canCleanData}
                  onConfirm={() => cleanResourceData(original.id)}
                >
                  <Button
                    aria-label={`Clean data of ${original.name}`}
                    variant="primary"
                    icon="trash-alt"
                    size={'sm'}
                  />
                </ConfirmButton>
              )}
              <DeleteButton
                aria-label={`Delete ${original.name}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteResource(original.id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteResource, styles]
  );

  return (
    <Page
      navId="resources"
      actions={
        <LinkButton href={canCreate ? 'org/resources/new' : '#'} disabled={!canCreate}>
          {`New ${config.resourceTitle.toLowerCase()}`}
        </LinkButton>
      }
    >
      <Page.Contents isLoading={!hasFetched}>
        {noResources ? (
          <EmptyListCTA
            title={`No ${config.resourceTitle.toLowerCase()}s are available.`}
            buttonIcon="rss"
            buttonLink="org/resources/new"
            buttonTitle={`New ${config.resourceTitle.toLowerCase()}`}
            buttonDisabled={!contextSrv.hasPermission('resources:create')}
          />
        ) : (
          <>
            <div className="page-action-bar">
              <InlineField grow>
                <FilterInput
                  placeholder={`Search ${config.resourceTitle.toLowerCase()}`}
                  value={searchQuery}
                  onChange={changeQuery}
                />
              </InlineField>
            </div>
            <Stack direction={'column'} gap={2}>
              <InteractiveTable
                columns={columns}
                data={hasFetched ? resources : skeletonData}
                getRowId={(resource) => String(resource.id)}
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
    resources: getResources(state.resources),
    searchQuery: getResourcesSearchQuery(state.resources),
    searchPage: getResourcesSearchPage(state.resources),
    resourcesCount: getResourcesCount(state.resources),
    hasFetched: state.resources.hasFetched,
  };
}

const mapDispatchToProps = {
  loadResources: loadResources,
  deleteResource: deleteResource,
  cleanResourceData: cleanResourceData,
  changeQuery: changeResourcesQuery,
  changePage: changeResourcesPage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(ResourceList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
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
