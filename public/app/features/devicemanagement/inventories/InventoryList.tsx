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
  useStyles2,
  Stack,
  Tooltip,
  Icon,
  InteractiveTable,
  Checkbox,
} from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import config from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { Inventory, inventoriesPageLimit } from 'app/types/devicemanagement/inventory';

import { changeInventoriesPage, changeInventoriesQuery, deleteInventory, loadInventories } from './state/actions';
import {
  getInventoriesSearchQuery,
  getInventories,
  getInventoriesCount,
  getInventoriesSearchPage,
} from './state/selectors';

type Cell<T extends keyof Inventory = keyof Inventory> = CellProps<Inventory, Inventory[T]>;
export interface OwnProps {}

const skeletonData: Inventory[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  type: '',
  uuid: '',
  resource_name: '',
  resource_org: 0,
  assigned: false,
}));

export const InventoryList = ({
  inventories,
  inventoriesCount,
  searchQuery,
  searchPage,
  hasFetched,
  loadInventories,
  deleteInventory,
  changeQuery,
  changePage,
}: Props) => {
  const styles = useStyles2(getStyles);
  const canCreate = contextSrv.hasPermission('inventories:create');
  const totalPages = Math.ceil(inventoriesCount / inventoriesPageLimit);
  const [noInventories, setNoInventories] = useState<boolean>(true);

  useEffect(() => {
    loadInventories();
  }, [loadInventories]);

  useEffect(() => {
    if (inventories.length !== 0 && noInventories) {
      setNoInventories(false);
    }
  }, [inventories]);

  const columns: Array<Column<Inventory>> = useMemo(
    () => [
      {
        id: 'uuid',
        header: 'UUID',
        cell: ({ cell: { value } }: Cell<'uuid'>) => {
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
        id: 'resource_name',
        header: 'Resource Name',
        disableGrow: true,
        cell: ({ cell: { value } }: Cell<'resource_name'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'resource_org',
        header: 'Associated Org',
        disableGrow: true,
        cell: ({ cell: { value } }: Cell<'resource_org'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'assigned',
        header: 'Assigned',
        cell: ({ cell: { value } }: Cell<'assigned'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} height={32} containerClassName={styles.blockSkeleton} />;
          }
          return <Checkbox value={value} />;
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
          const inventoryUrl = `org/inventories/edit/${original.id}`;
          const canRead = contextSrv.hasPermission('inventories:read');
          const canDelete = contextSrv.hasPermission('inventories:delete');

          return (
            <Stack direction="row" justifyContent="flex-end">
              {canRead && (
                <Tooltip content={`Edit ${original.uuid}`}>
                  <a href={inventoryUrl} aria-label={`Edit ${original.uuid}`}>
                    <Icon name={'pen'} />
                  </a>
                </Tooltip>
              )}
              <DeleteButton
                aria-label={`Delete ${original.uuid}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteInventory(original.id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteInventory, styles]
  );

  return (
    <Page
      navId="inventories"
      actions={
        <LinkButton href={canCreate ? 'org/inventories/new' : '#'} disabled={!canCreate}>
          {`New ${config.resourceTitle.toLowerCase()}`}
        </LinkButton>
      }
    >
      <Page.Contents isLoading={!hasFetched}>
        {noInventories ? (
          <EmptyListCTA
            title={`No ${config.resourceTitle.toLowerCase()}s are available.`}
            buttonIcon="rss"
            buttonLink="org/inventories/new"
            buttonTitle={`New ${config.resourceTitle.toLowerCase()}`}
            buttonDisabled={!contextSrv.hasPermission('inventories:create')}
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
                data={hasFetched ? inventories : skeletonData}
                getRowId={(inventory) => String(inventory.id)}
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
    inventories: getInventories(state.inventories),
    searchQuery: getInventoriesSearchQuery(state.inventories),
    searchPage: getInventoriesSearchPage(state.inventories),
    inventoriesCount: getInventoriesCount(state.inventories),
    hasFetched: state.inventories.hasFetched,
  };
}

const mapDispatchToProps = {
  loadInventories: loadInventories,
  deleteInventory: deleteInventory,
  changeQuery: changeInventoriesQuery,
  changePage: changeInventoriesPage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(InventoryList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    display: 'flex',
  }),
});
