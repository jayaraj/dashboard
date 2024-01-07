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
import { Profile, profilesPageLimit } from 'app/types/billing/profile';

import { changeProfilesPage, changeProfilesQuery, deleteProfile, loadProfiles } from './state/actions';
import { getProfilesSearchQuery, getProfiles, getProfilesCount, getProfilesSearchPage } from './state/selectors';

type Cell<T extends keyof Profile = keyof Profile> = CellProps<Profile, Profile[T]>;
export interface OwnProps {}

const skeletonData: Profile[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  updated_at: '',
  org_id: 0,
  name: '',
  description: '',
}));

export const ProfileList = ({
  profiles,
  profilesCount,
  searchQuery,
  searchPage,
  hasFetched,
  loadProfiles,
  deleteProfile,
  changeQuery,
  changePage,
}: Props) => {
  const styles = useStyles2(getStyles);
  const canCreate = contextSrv.hasPermission('profiles:create');
  const totalPages = Math.ceil(profilesCount / profilesPageLimit);
  const [noProfiles, setNoProfiles] = useState<boolean>(true);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  useEffect(() => {
    if (profiles.length !== 0 && noProfiles) {
      setNoProfiles(false);
    }
  }, [profiles]);

  const columns: Array<Column<Profile>> = useMemo(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: ({ cell: { value } }: Cell<'name'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'string',
      },
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
          const profileUrl = `org/profiles/edit/${original.id}`;
          const canRead = contextSrv.hasPermission('profiles:read');
          const canDelete = contextSrv.hasPermission('profiles:delete');

          return (
            <Stack direction="row" justifyContent="flex-end">
              {canRead && (
                <Tooltip content={`Edit ${original.name}`}>
                  <a href={profileUrl} aria-label={`Edit ${original.name}`}>
                    <Icon name={'pen'} />
                  </a>
                </Tooltip>
              )}
              <DeleteButton
                aria-label={`Delete ${original.name}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteProfile(original.id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteProfile, styles]
  );

  return (
    <Page
      navId="profiles"
      actions={
        <LinkButton href={canCreate ? 'org/profiles/new' : '#'} disabled={!canCreate}>
          {`New Profile`}
        </LinkButton>
      }
    >
      <Page.Contents isLoading={!hasFetched}>
        {noProfiles ? (
          <EmptyListCTA
            title={`No profiles are available.`}
            buttonIcon="invoice"
            buttonLink="org/profiles/new"
            buttonTitle={`New Profile`}
            buttonDisabled={!canCreate}
          />
        ) : (
          <>
            <div className="page-action-bar">
              <InlineField grow>
                <FilterInput placeholder={`Search profiles`} value={searchQuery} onChange={changeQuery} />
              </InlineField>
            </div>
            <Stack direction={'column'} gap={2}>
              <InteractiveTable
                columns={columns}
                data={hasFetched ? profiles : skeletonData}
                getRowId={(profile) => String(profile.id)}
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
    profiles: getProfiles(state.profiles),
    searchQuery: getProfilesSearchQuery(state.profiles),
    searchPage: getProfilesSearchPage(state.profiles),
    profilesCount: getProfilesCount(state.profiles),
    hasFetched: state.profiles.hasFetched,
  };
}

const mapDispatchToProps = {
  loadProfiles: loadProfiles,
  deleteProfile: deleteProfile,
  changeQuery: changeProfilesQuery,
  changePage: changeProfilesPage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(ProfileList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    display: 'flex',
  }),
});
