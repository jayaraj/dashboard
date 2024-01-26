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
  Tooltip,
  InteractiveTable,
  Pagination,
  Form,
  LinkButton,
  Stack,
  Icon,
  InlineField,
  Button,
  Input,
  CallToActionCard,
  TagList,
  useStyles2,
} from '@grafana/ui';
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import config from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { GroupResource, Group, groupResourcesPageLimit } from 'app/types/devicemanagement/group';

import {
  changeGroupResourcesPage,
  changeGroupResourcesQuery,
  deleteGroupResource,
  loadGroupResources,
} from './state/actions';
import {
  getGroupResources,
  getGroupResourcesSearchPage,
  getGroupResourcesSearchQuery,
  getGroupResourcesCount,
} from './state/selectors';

type Cell<T extends keyof GroupResource = keyof GroupResource> = CellProps<GroupResource, GroupResource[T]>;
export interface OwnProps {
  group: Group;
  groupResources: GroupResource[];
}
const skeletonData: GroupResource[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  resource_id: 0,
  resource_uuid: '',
  resource_name: '',
  resource_type: '',
  resource_tags: '',
  resource_online_status: false,
  resource_last_seen: '',
}));

export const GroupResourceList = ({
  group,
  groupResources,
  groupResourcesCount,
  searchPage,
  searchQuery,
  loadGroupResources,
  deleteGroupResource,
  changeQuery,
  changePage,
  hasFetched,
}: Props) => {
  const styles = useStyles2(getStyles);
  const totalPages = Math.ceil(groupResourcesCount / groupResourcesPageLimit);
  const [noGroupResources, setNoGroupResources] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [uuid, setUuid] = useState<string>('');

  useEffect(() => {
    loadGroupResources();
  }, [loadGroupResources]);

  useEffect(() => {
    if (groupResources.length !== 0 && noGroupResources) {
      setNoGroupResources(false);
    }
  }, [groupResources]);

  const onToggleAdding = () => {
    setIsAdding(!isAdding);
  };

  const onAdd = async () => {
    await getBackendSrv().post(`/api/groups/${group.id}/resources/${uuid}`);
    loadGroupResources();
  };

  const columns: Array<Column<GroupResource>> = useMemo(
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
          const resourceUrl = `org/resources/edit/${original.resource_id}`;
          const canRead = contextSrv.hasPermission('resources:read');
          const canDelete = contextSrv.hasPermission('groups:write');

          return (
            <Stack direction="row" justifyContent="flex-end">
              {canRead && (
                <Tooltip content={`Edit ${original.resource_name}`}>
                  <a href={resourceUrl} aria-label={`Edit ${original.resource_name}`}>
                    <Icon name={'pen'} />
                  </a>
                </Tooltip>
              )}
              <DeleteButton
                aria-label={`Delete ${original.resource_name}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteGroupResource(original.id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteGroupResource, styles]
  );
  if (!hasFetched) {
    return <PageLoader />;
  }
  if (noGroupResources) {
    return (
      <>
        <div className="page-action-bar">
          <div className="page-action-bar__spacer" />
          <Stack gap={1} direction="row">
            <Button className="pull-right" onClick={onToggleAdding}>
              Add {config.resourceTitle.toLowerCase()}
            </Button>
            <LinkButton
              disabled={!(contextSrv.hasPermission('groups:write') && contextSrv.hasPermission('resources:create'))}
              href={`org/groups/${group.id}/resources/new`}
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
                  <Button type="submit" disabled={!contextSrv.hasPermission('groups:write')}>
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
            disabled={!(contextSrv.hasPermission('groups:write') && contextSrv.hasPermission('resources:create'))}
            href={`org/groups/${group.id}/resources/new`}
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
                <Button type="submit" disabled={!contextSrv.hasPermission('groups:write')}>
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
          data={hasFetched ? groupResources : skeletonData}
          getRowId={(resource) => String(resource.id)}
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
    groupResources: getGroupResources(state.groupResources),
    groupResourcesCount: getGroupResourcesCount(state.groupResources),
    hasFetched: state.groupResources.hasFetched,
    searchPage: getGroupResourcesSearchPage(state.groupResources),
    searchQuery: getGroupResourcesSearchQuery(state.groupResources),
  };
}

const mapDispatchToProps = {
  loadGroupResources: loadGroupResources,
  deleteGroupResource: deleteGroupResource,
  changeQuery: changeGroupResourcesQuery,
  changePage: changeGroupResourcesPage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(GroupResourceList);

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
