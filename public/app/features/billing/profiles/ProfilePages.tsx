import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Themeable2, withTheme2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import ProfileSettings from './ProfileSettings';
import SlabSettings from './SlabSettings';
import { loadProfile } from './state/actions';
import { getPageNav } from './state/navModel';
import { getProfile, getSlab } from './state/selectors';

interface ProfilePageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<ProfilePageRouteParams>, Themeable2 {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Slab = 'slab',
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const profileId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'slab';
  const profileLoadingNav = getPageNav(pageName as string);
  const pageNav = getNavModel(state.navIndex, `profile-${pageName}-${profileId}`, profileLoadingNav).main;
  const profile = getProfile(state.profile, profileId);
  const slab = getSlab(state.slab, profileId)

  return {
    pageNav,
    profileId: profileId,
    pageName: pageName,
    profile,
    slab,
  };
}

const mapDispatchToProps = {
  loadProfile,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class ProfilePages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchProfile();
  }

  async fetchProfile() {
    const { loadProfile, profileId } = this.props;
    this.setState({ 
      isLoading: true,
    });
    const response = await loadProfile(profileId);
    this.setState({ isLoading: false });
    return response;
  }

  getCurrentPage() {
    const pages = ['settings', 'slab'];
    const currentPage = this.props.pageName;
    return includes(pages, currentPage) ? currentPage : pages[0];
  }

  renderPage(): React.ReactNode {
    const currentPage = this.getCurrentPage();
    const { profile, slab } = this.props;
    switch (currentPage) {
      case PageTypes.Slab:
        return <SlabSettings slab={slab!} />;
      case PageTypes.Settings:
        return <ProfileSettings profile={profile!} />;
    }
    return null;
  }

  render() {
    const { profile, pageNav } = this.props;

    return (
      <Page navId="profiles" pageNav={pageNav}>
        <Page.Contents isLoading={this.state.isLoading}>
          {profile && Object.keys(profile).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(withTheme2(ProfilePages));
