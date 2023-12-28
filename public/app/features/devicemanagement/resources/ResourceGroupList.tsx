import { css } from '@emotion/css';
import React, { useEffect, useState, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import {
  Column,
  CellProps,
  DeleteButton,
  FilterInput,
  InlineField,
  Pagination,
  useStyles2,
  Stack,
  Tooltip,
  Icon,
  InteractiveTable,
  CallToActionCard,
} from '@grafana/ui';
import config from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { ResourceGroup, resourceGroupsPageLimit } from 'app/types/devicemanagement/resource';

import {
  changeResourceGroupsPage,
  changeResourceGroupsQuery,
  deleteResourceGroup,
  loadResourceGroups,
} from './state/actions';
import {
  getResourceGroupsSearchQuery,
  getResourceGroupsCount,
  getResourceGroups,
  getResourceGroupsSearchPage,
} from './state/selectors';

type Cell<T extends keyof ResourceGroup = keyof ResourceGroup> = CellProps<ResourceGroup, ResourceGroup[T]>;
export interface OwnProps {
  resourceGroups: ResourceGroup[];
}
const skeletonData: ResourceGroup[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  group_id: 0,
  group_name: '',
  group_path: '',
}));

export const ResourceGroupList = ({
  resourceGroups,
  searchQuery,
  resourceGroupsCount,
  searchPage,
  loadResourceGroups,
  deleteResourceGroup,
  changeQuery,
  changePage,
  hasFetched,
}: Props) => {
  const styles = useStyles2(getStyles);
  const totalPages = Math.ceil(resourceGroupsCount / resourceGroupsPageLimit);
  const [noResourceGroups, setNoResourceGroups] = useState<boolean>(true);

  useEffect(() => {
    loadResourceGroups();
  }, [loadResourceGroups]);

  useEffect(() => {
    if (resourceGroups.length !== 0 && noResourceGroups) {
      setNoResourceGroups(false);
    }
  }, [resourceGroups]);

  const columns: Array<Column<ResourceGroup>> = useMemo(
    () => [
      {
        id: 'group_name',
        header: 'Name',
        cell: ({ cell: { value } }: Cell<'group_name'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'group_path',
        header: 'Path',
        cell: ({ cell: { value } }: Cell<'group_path'>) => {
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
                <Skeleton containerClassName={styles.blockSkeleton} width={16} height={16} />
                <Skeleton containerClassName={styles.blockSkeleton} width={22} height={24} />
              </Stack>
            );
          }
          const groupUrl = `org/groups/edit/${original.group_id}`;
          const canRead = contextSrv.hasPermission('groups:read');
          //Check write prop for resources
          const canDelete = contextSrv.hasPermission('resources:write');

          return (
            <Stack direction="row" justifyContent="flex-end">
              {canRead && (
                <Tooltip content={`Edit ${original.group_name}`}>
                  <a href={groupUrl} aria-label={`Edit ${original.group_name}`}>
                    <Icon name={'pen'} />
                  </a>
                </Tooltip>
              )}
              <DeleteButton
                aria-label={`Delete ${original.group_name}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteResourceGroup(original.id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteResourceGroup, styles]
  );

  if (noResourceGroups) {
    return (
      <CallToActionCard
        callToActionElement={<div />}
        message={`No ${config.groupTitle.toLowerCase()}s are associated.`}
      />
    );
  }
  return (
    <>
      <div className="page-action-bar">
        <InlineField grow>
          <FilterInput
            placeholder={`Search ${config.groupTitle.toLowerCase()}`}
            value={searchQuery}
            onChange={changeQuery}
          />
        </InlineField>
      </div>
      <Stack direction={'column'} gap={2}>
        <InteractiveTable
          columns={columns}
          data={hasFetched ? resourceGroups : skeletonData}
          getRowId={(group) => String(group.id)}
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
    resourceGroups: getResourceGroups(state.resourceGroups),
    searchQuery: getResourceGroupsSearchQuery(state.resourceGroups),
    resourceGroupsCount: getResourceGroupsCount(state.resourceGroups),
    searchPage: getResourceGroupsSearchPage(state.resourceGroups),
    hasFetched: state.resourceGroups.hasFetched,
  };
}

const mapDispatchToProps = {
  loadResourceGroups: loadResourceGroups,
  deleteResourceGroup: deleteResourceGroup,
  changeQuery: changeResourceGroupsQuery,
  changePage: changeResourceGroupsPage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(ResourceGroupList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    // needed for things to align properly in the table
    display: 'flex',
  }),
});
