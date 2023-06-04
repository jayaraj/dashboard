import React, { PureComponent } from 'react';

import { DeleteButton, LinkButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv, User } from 'app/core/services/context_srv';
import { StoreState, Profile, profilePageLimit } from 'app/types';

import { connectWithCleanUp } from '../../../core/components/connectWithCleanUp';

import { deleteProfile, loadProfiles } from './state/actions';
import { setSearchQuery, setProfileSearchPage } from './state/reducers';
import { getSearchQuery, getProfiles, getProfilesCount, getProfileSearchPage } from './state/selectors';


export interface Props {
  profiles: Profile[];
  searchQuery: string;
  searchPage: number;
  profilesCount: number;
  hasFetched: boolean;
  loadProfiles: typeof loadProfiles;
  deleteProfile: typeof deleteProfile;
  setSearchQuery: typeof setSearchQuery;
  setProfileSearchPage: typeof setProfileSearchPage;
  signedInUser: User;
}

export class ProfileList extends PureComponent<Props> {
  componentDidMount() {
    this.fetchProfiles('', 1);
  }

  async fetchProfiles(query: string, page: number) {
    await this.props.loadProfiles(query, page);
  }

  deleteProfile = (profile: Profile) => {
    this.props.deleteProfile(profile.id);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setSearchQuery(value);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchProfiles(searchQuery, page);
  };

  renderProfile(profile: Profile) {
    const { signedInUser } = this.props;
    const url = `org/profiles/edit/${profile.id}`;
    const canRead = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canWrite = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');

    return (
      <tr key={profile.id}>
        <td className="link-td">
          {canRead ? <a href={url}>{profile.name}</a> : <>{profile.name}</>}
        </td>
        <td className="link-td">
          {canRead ? <a href={url}>{profile.description}</a> : <>{profile.description}</>}
        </td>
        <td className="text-right">
          <DeleteButton
            aria-label="Delete"
            size="sm"
            disabled={!canWrite}
            onConfirm={() => this.deleteProfile(profile)}
          />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const { signedInUser } = this.props;
    const canWrite = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const newHref = canWrite ? '/org/profiles/new' : '#';
    const buttonTitle = ' New Type';
    const title = 'No types are available';
    return <EmptyListCTA title={title} buttonIcon="rss" buttonLink={newHref} buttonTitle={buttonTitle} />;
  }

  renderProfileList() {
    const { profiles, searchQuery, searchPage, profilesCount, signedInUser } = this.props;
    const canWrite = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const disabledClass = canWrite ? '' : ' disabled';
    const url = canWrite ? '/org/profiles/new' : '#';
    const totalPages = Math.ceil(profilesCount / profilePageLimit);

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>

          <LinkButton className={disabledClass} href={url}>
            New Type
          </LinkButton>
        </div>
        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{profiles.map((profile) => this.renderProfile(profile))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination
                onNavigate={this.onNavigate}
                currentPage={searchPage}
                numberOfPages={totalPages}
                hideWhenSinglePage={true}
              />
            </HorizontalGroup>
          </VerticalGroup>
        </div>
      </>
    );
  }

  renderList() {
    const { profilesCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }

    if (profilesCount > 0) {
      return this.renderProfileList();
    } else {
      return this.renderEmptyList();
    }
  }

  render() {
    const { hasFetched } = this.props;

    return (
      <Page navId="profiles">
        <Page.Contents isLoading={!hasFetched}>{this.renderList()}</Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    profiles: getProfiles(state.profiles),
    searchQuery: getSearchQuery(state.profiles),
    searchPage: getProfileSearchPage(state.profiles),
    profilesCount: getProfilesCount(state.profiles),
    hasFetched: state.profiles.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadProfiles: loadProfiles,
  deleteProfile,
  setSearchQuery,
  setProfileSearchPage,
};

export default connectWithCleanUp( mapStateToProps, mapDispatchToProps, (state) => state.profiles)(ProfileList);
