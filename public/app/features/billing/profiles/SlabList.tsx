import React, { FC, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { CallToActionCard, VerticalGroup, HorizontalGroup, Pagination, DeleteButton, FilterInput, LinkButton,} from '@grafana/ui';
import { AccessControlAction, Profile, Slab, StoreState, slabPageLimit } from 'app/types';
import { contextSrv } from 'app/core/services/context_srv';
import { deleteSlab, loadSlabs } from './state/actions';
import { getSlabsSearchPage, getSlabs, getSlabsCount, getSlabsSearchQuery } from './state/selectors';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import { setSlabsSearchQuery } from './state/reducers';

export interface OwnProps {
  profile: Profile,
  slabs: Slab[];
  searchQuery: string;
  searchPage: number;
  slabsCount: number;
  hasFetched: boolean;
}

const mapDispatchToProps = {
  loadSlabs: loadSlabs,
  deleteSlab: deleteSlab,
  setSlabsSearchQuery,
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

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;

export const SlabList: FC<Props> = ({ 
  profile,
  slabs,
  searchQuery,
  slabsCount,
  searchPage,
  hasFetched,
  loadSlabs,
  deleteSlab,
  setSlabsSearchQuery}) => {

  useEffect(() => {
    loadSlabs(profile.id, searchQuery, searchPage);
  }, []);

  const onNavigate = async (page: number) => {
    loadSlabs(profile.id, searchQuery, page);
  };

  const onSearchQueryChange = (value: string) => {
    setSlabsSearchQuery(value);
  };

  const renderSlab = (slab: Slab) => {
    const slabUrl = `/org/profiles/${profile.id}/slabs/edit/${slab.id}`;
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionSlabsCreate, fallback);
    return (
      <tr key={slab.id}>
        <td className="link-td"><a href={slabUrl}>{slab.tag}</a></td>
        <td className="link-td"><a href={slabUrl}>{slab.tax}</a></td>
        <td className="link-td"><a href={slabUrl}>{slab.slabs}</a></td>
        <td className="text-right">
          <DeleteButton aria-label="Delete" size="sm" disabled={!canWrite} onConfirm={() => deleteSlab(slab.id)}/>
        </td>
      </tr>
    );
  }

  const renderEmptyList = () => {
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionSlabsCreate, fallback);
    const newSlabHref = canWrite ? `org/profiles/${profile.id}/slabs/new` : '#';
    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={onSearchQueryChange} />
          </div>
          <LinkButton disabled={!canWrite} href={newSlabHref}>
            Create Slab
          </LinkButton>
        </div>
        {!hasFetched ? <PageLoader /> : <CallToActionCard callToActionElement={<div />} message="No slabs are found." />}
      </div>
    );
  }

  const renderSlabList = () => {
    const totalPages = Math.ceil(slabsCount / slabPageLimit);
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionSlabsCreate, fallback);
    const newSlabHref = canWrite ? `org/profiles/${profile.id}/slabs/new` : '#';
    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={onSearchQueryChange} />
          </div>
          <LinkButton disabled={!canWrite} href={newSlabHref}>
            Create Slab
          </LinkButton>
        </div>
        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Tag</th>
                  <th>Tax</th>
                  <th>No Of Slabs</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{slabs.map((slab) => renderSlab(slab))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination onNavigate={onNavigate} currentPage={searchPage} numberOfPages={totalPages} hideWhenSinglePage={true}/>
            </HorizontalGroup>
          </VerticalGroup>
        </div>
      </>
    );
  }

  const renderList = () => {
    if (!hasFetched) {
      return null;
    }
    if (slabsCount > 0) {
      return renderSlabList();
    } else {
      return renderEmptyList();
    }
  }

  return renderList();
};

export default connector(SlabList);
