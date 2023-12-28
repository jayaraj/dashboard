import { css } from '@emotion/css';
import React, { useEffect, useState, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import {
  Column,
  DeleteButton,
  CellProps,
  FilterInput,
  InlineField,
  LinkButton,
  Icon,
  Pagination,
  TagList,
  useStyles2,
  Stack,
  Tooltip,
  InteractiveTable,
} from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import config from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { Group, groupsPageLimit } from 'app/types/devicemanagement/group';

import { changeGroupsPage, changeGroupsQuery, deleteGroup, loadGroups } from './state/actions';
import { getGroupsSearchQuery, getGroupsSearchPage, getGroups, getGroupsCount } from './state/selectors';

type Cell<T extends keyof Group = keyof Group> = CellProps<Group, Group[T]>;
export interface OwnProps {
  group: Group;
  groups: Group[];
}
const skeletonData: Group[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  name: '',
  path: '',
  type: '',
  level: 0,
  parent: -1,
  child: false,
  tags: '',
  groups: [],
}));

export const SubGroupList = ({
  group,
  groups,
  groupsCount,
  searchQuery,
  searchPage,
  hasFetched,
  loadGroups,
  deleteGroup,
  changeQuery,
  changePage,
}: Props) => {
  const styles = useStyles2(getStyles);
  const canCreate = contextSrv.hasPermission('groups:create');
  const totalPages = Math.ceil(groupsCount / groupsPageLimit);
  const [noGroups, setNoGroups] = useState<boolean>(true);

  useEffect(() => {
    loadGroups(group.id);
  }, [loadGroups]);

  useEffect(() => {
    if (groups.length !== 0 && noGroups) {
      setNoGroups(false);
    }
  }, [groups]);

  const columns: Array<Column<Group>> = useMemo(
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
        id: 'type',
        header: 'Type',
        cell: ({ cell: { value } }: Cell<'type'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'path',
        header: 'Path',
        disableGrow: true,
        cell: ({ cell: { value } }: Cell<'path'>) => {
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
          const groupUrl = `org/groups/edit/${original.id}`;
          const canRead = contextSrv.hasPermission('groups:read');
          const canDelete = contextSrv.hasPermission('groups:delete');

          return (
            <Stack direction="row" justifyContent="flex-end">
              {canRead && (
                <Tooltip content={`Edit ${original.name}`}>
                  <a href={groupUrl} aria-label={`Edit ${original.name}`}>
                    <Icon name={'pen'} />
                  </a>
                </Tooltip>
              )}
              <DeleteButton
                aria-label={`Delete ${original.name}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteGroup(original.id, group.id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteGroup, styles]
  );
  if (noGroups) {
    return (
      <EmptyListCTA
        title={`No ${config.groupTitle.toLowerCase()}s are available.`}
        buttonIcon="layer-group"
        buttonLink={`org/groups/${group.id}/new`}
        buttonTitle={`New ${config.groupTitle.toLowerCase()}`}
        buttonDisabled={!contextSrv.hasPermission('groups:create')}
      />
    );
  }
  return (
    <>
      <div className="page-action-bar">
        <InlineField grow>
          <FilterInput
            placeholder={`Search users`}
            value={searchQuery}
            onChange={(query: string) => {
              changeQuery(query, group.id);
            }}
          />
        </InlineField>
        <Stack gap={1} direction="row">
          <LinkButton href={canCreate ? `org/groups/${group.id}/new` : '#'} disabled={!canCreate}>
            {`New ${config.groupTitle.toLowerCase()}`}
          </LinkButton>
        </Stack>
      </div>
      <Stack direction={'column'} gap={2}>
        <InteractiveTable
          columns={columns}
          data={hasFetched ? groups : skeletonData}
          getRowId={(group) => String(group.id)}
        />
        <Stack justifyContent="flex-end">
          <Pagination
            hideWhenSinglePage
            currentPage={searchPage}
            numberOfPages={totalPages}
            onNavigate={(page: number) => {
              changePage(page, group.id);
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};

const mapDispatchToProps = {
  loadGroups: loadGroups,
  deleteGroup: deleteGroup,
  changeQuery: changeGroupsQuery,
  changePage: changeGroupsPage,
};

function mapStateToProps(state: StoreState) {
  return {
    groups: getGroups(state.groups),
    groupsCount: getGroupsCount(state.groups),
    searchPage: getGroupsSearchPage(state.groups),
    searchQuery: getGroupsSearchQuery(state.groups),
    hasFetched: state.groups.hasFetched,
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(SubGroupList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    display: 'flex',
  }),
});
