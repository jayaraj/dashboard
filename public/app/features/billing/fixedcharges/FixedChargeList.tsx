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
} from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { FixedCharge, fixedChargesPageLimit } from 'app/types/billing/fixedcharge';

import { changeFixedChargesPage, changeFixedChargesQuery, deleteFixedCharge, loadFixedCharges } from './state/actions';
import {
  getFixedCharges,
  getFixedChargesCount,
  getFixedChargesSearchPage,
  getFixedChargesSearchQuery,
} from './state/selectors';

type Cell<T extends keyof FixedCharge = keyof FixedCharge> = CellProps<FixedCharge, FixedCharge[T]>;
export interface OwnProps {}

const skeletonData: FixedCharge[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  tax: 0,
  amount: 0,
  description: '',
}));

export const FixedChargeList = ({
  fixedCharges,
  fixedChargesCount,
  searchQuery,
  searchPage,
  hasFetched,
  loadFixedCharges,
  deleteFixedCharge,
  changeQuery,
  changePage,
}: Props) => {
  const styles = useStyles2(getStyles);
  const canCreate = contextSrv.hasPermission('fixedcharges:create');
  const totalPages = Math.ceil(fixedChargesCount / fixedChargesPageLimit);
  const [noFixedCharges, setNoFixedCharges] = useState<boolean>(true);

  useEffect(() => {
    loadFixedCharges();
  }, [loadFixedCharges]);

  useEffect(() => {
    if (fixedCharges.length !== 0 && noFixedCharges) {
      setNoFixedCharges(false);
    }
  }, [fixedCharges]);

  const columns: Array<Column<FixedCharge>> = useMemo(
    () => [
      {
        id: 'description',
        header: 'Description',
        cell: ({ cell: { value } }: Cell<'description'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'tax',
        header: 'Tax',
        cell: ({ cell: { value } }: Cell<'tax'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'number',
      },
      {
        id: 'amount',
        header: 'Amount',
        disableGrow: true,
        cell: ({ cell: { value } }: Cell<'amount'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
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
          const fixedChargeUrl = `org/fixedcharges/edit/${original.id}`;
          const canRead = contextSrv.hasPermission('fixedcharges:read');
          const canDelete = contextSrv.hasPermission('fixedcharges:delete');

          return (
            <Stack direction="row" justifyContent="flex-end">
              {canRead && (
                <Tooltip content={`Edit ${original.description}`}>
                  <a href={fixedChargeUrl} aria-label={`Edit ${original.description}`}>
                    <Icon name={'pen'} />
                  </a>
                </Tooltip>
              )}
              <DeleteButton
                aria-label={`Delete ${original.description}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteFixedCharge(original.id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteFixedCharge, styles]
  );

  return (
    <Page
      navId="fixedcharges"
      actions={
        <LinkButton href={canCreate ? 'org/fixedcharges/new' : '#'} disabled={!canCreate}>
          {`New Charge`}
        </LinkButton>
      }
    >
      <Page.Contents isLoading={!hasFetched}>
        {noFixedCharges ? (
          <EmptyListCTA
            title={`No charges are available.`}
            buttonIcon="fixed-charge"
            buttonLink="org/fixedcharges/new"
            buttonTitle={`New Charge`}
            buttonDisabled={!contextSrv.hasPermission('fixedcharges:create')}
          />
        ) : (
          <>
            <div className="page-action-bar">
              <InlineField grow>
                <FilterInput placeholder={`Search charges`} value={searchQuery} onChange={changeQuery} />
              </InlineField>
            </div>
            <Stack direction={'column'} gap={2}>
              <InteractiveTable
                columns={columns}
                data={hasFetched ? fixedCharges : skeletonData}
                getRowId={(fixedCharge) => String(fixedCharge.id)}
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
    fixedCharges: getFixedCharges(state.fixedCharges),
    searchQuery: getFixedChargesSearchQuery(state.fixedCharges),
    searchPage: getFixedChargesSearchPage(state.fixedCharges),
    fixedChargesCount: getFixedChargesCount(state.fixedCharges),
    hasFetched: state.fixedCharges.hasFetched,
  };
}

const mapDispatchToProps = {
  loadFixedCharges: loadFixedCharges,
  deleteFixedCharge: deleteFixedCharge,
  changeQuery: changeFixedChargesQuery,
  changePage: changeFixedChargesPage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(FixedChargeList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    display: 'flex',
  }),
});
