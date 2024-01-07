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
  CallToActionCard,
  InteractiveTable,
} from '@grafana/ui';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { Profile, Slab, slabsPageLimit } from 'app/types/billing/profile';

import { changeSlabsPage, changeSlabsQuery, deleteSlab, loadSlabs } from './state/actions';
import { getSlabs, getSlabsCount, getSlabsSearchPage, getSlabsSearchQuery } from './state/selectors';

type Cell<T extends keyof Slab = keyof Slab> = CellProps<Slab, Slab[T]>;
export interface OwnProps {
  profile: Profile;
}

const skeletonData: Slab[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  profile_id: 0,
  tax: 0,
  slabs: 0,
  tag: '',
  rates: [],
}));

export const SlabList = ({
  profile,
  slabs,
  searchQuery,
  searchPage,
  slabsCount,
  loadSlabs,
  deleteSlab,
  changeQuery,
  changePage,
  hasFetched,
}: Props) => {
  const styles = useStyles2(getStyles);
  const totalPages = Math.ceil(slabsCount / slabsPageLimit);
  const [noSlabs, setNoSlabs] = useState<boolean>(true);
  const canCreate = contextSrv.hasPermission('profiles:create');

  useEffect(() => {
    loadSlabs();
  }, [loadSlabs]);

  useEffect(() => {
    if (slabs.length !== 0 && noSlabs) {
      setNoSlabs(false);
    }
  }, [slabs]);

  const columns: Array<Column<Slab>> = useMemo(
    () => [
      {
        id: 'tag',
        header: 'Tag',
        cell: ({ cell: { value } }: Cell<'tag'>) => {
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
        id: 'slabs',
        header: 'No of Slabs',
        cell: ({ cell: { value } }: Cell<'slabs'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'number',
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
          const slabUrl = `org/profiles/${profile.id}/slabs/edit/${original.id}`;
          const canRead = contextSrv.hasPermission('profiles:read');
          const canDelete = contextSrv.hasPermission('profiles:delete');

          return (
            <Stack direction="row" justifyContent="flex-end">
              {canRead && (
                <Tooltip content={`Edit ${original.tag}`}>
                  <a href={slabUrl} aria-label={`Edit ${original.tag}`}>
                    <Icon name={'pen'} />
                  </a>
                </Tooltip>
              )}
              <DeleteButton
                aria-label={`Delete ${original.tag}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteSlab(original.id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteSlab, styles]
  );

  if (!hasFetched) {
    return <PageLoader />;
  }

  if (noSlabs) {
    return (
      <>
        <div className="page-action-bar">
          <div className="page-action-bar__spacer" />
          <LinkButton disabled={!canCreate} href={`org/profiles/${profile.id}/slabs/new`}>
            Create Slab
          </LinkButton>
        </div>
        <CallToActionCard callToActionElement={<div />} message={`No slabs are available.`} />
      </>
    );
  }

  return (
    <>
      <div className="page-action-bar">
        <InlineField grow>
          <FilterInput placeholder={`Search profiles`} value={searchQuery} onChange={changeQuery} />
        </InlineField>
        <LinkButton disabled={!canCreate} href={`org/profiles/${profile.id}/slabs/new`}>
          Create Slab
        </LinkButton>
      </div>
      <Stack direction={'column'} gap={2}>
        <InteractiveTable
          columns={columns}
          data={hasFetched ? slabs : skeletonData}
          getRowId={(slab) => String(slab.id)}
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
    slabs: getSlabs(state.slabs),
    searchQuery: getSlabsSearchQuery(state.slabs),
    searchPage: getSlabsSearchPage(state.slabs),
    slabsCount: getSlabsCount(state.slabs),
    hasFetched: state.slabs.hasFetched,
  };
}
const mapDispatchToProps = {
  loadSlabs: loadSlabs,
  deleteSlab: deleteSlab,
  changeQuery: changeSlabsQuery,
  changePage: changeSlabsPage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;
export default connector(SlabList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    // needed for things to align properly in the table
    display: 'flex',
  }),
});
