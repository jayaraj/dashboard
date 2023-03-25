import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import OrgTypeConfiguration from './OrgTypeConfiguration';
import OrgTypeSettings from './OrgTypeSettings';
import { loadOrgType } from './state/actions';
import { getOrgTypeLoadingNav } from './state/navModel';
import { getOrgType, getOrgConfiguration } from './state/selectors';

interface OrgTypePageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<OrgTypePageRouteParams> {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Settings = 'settings',
  Configuration = 'configuration'
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const orgTypeId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'configuration';
  const orgTypeLoadingNav = getOrgTypeLoadingNav(pageName as string);
  const navModel = getNavModel(state.navIndex, `orgtype-${pageName}-${orgTypeId}`, orgTypeLoadingNav);
  const orgType = getOrgType(state.orgType, orgTypeId);
  const data = getOrgConfiguration(state.orgType);

  return {
    navModel,
    orgTypeId: orgTypeId,
    pageName: pageName,
    orgType,
    data,
  };
}

const mapDispatchToProps = {
  loadOrgType,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class OrgTypePages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchOrgType();
  }

  async fetchOrgType() {
    const { loadOrgType, orgTypeId } = this.props;
    this.setState({ 
      isLoading: true,
    });
    const response = await loadOrgType(orgTypeId);
    this.setState({ isLoading: false });
    return response;
  }

  getCurrentPage() {
    const pages = ['configuration','settings'];
    const currentPage = this.props.pageName;
    return includes(pages, currentPage) ? currentPage : pages[0];
  }

  textsAreEqual = (text1: string, text2: string) => {
    if (!text1 && !text2) {
      return true;
    }

    if (!text1 || !text2) {
      return false;
    }

    return text1.toLocaleLowerCase() === text2.toLocaleLowerCase();
  };

  renderPage(): React.ReactNode {
    const currentPage = this.getCurrentPage();
    const { orgType, data } = this.props;
    switch (currentPage) {
      case PageTypes.Settings:
        return <OrgTypeSettings orgType={orgType!} />;
      case PageTypes.Configuration:
        return <OrgTypeConfiguration orgType={orgType!} data={data!}/>;  
    }

    return null;
  }

  render() {
    const { orgType, navModel } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          {orgType && Object.keys(orgType).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(OrgTypePages);
