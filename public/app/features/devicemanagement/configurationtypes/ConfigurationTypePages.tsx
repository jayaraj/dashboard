import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Themeable2, withTheme2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import ConfigurationTypeSettings from './ConfigurationTypeSettings';
import { loadConfigurationType } from './state/actions';
import { getPageNav } from './state/navModel';
import { getConfigurationType } from './state/selectors';
import OrgConfigurationSettings from './OrgConfigurationSettings';

interface ConfigurationTypePageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<ConfigurationTypePageRouteParams>, Themeable2 {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Configurations = 'configurations',
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const configurationTypeId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'settings';
  const configurationTypeLoadingNav = getPageNav(pageName as string);
  const pageNav = getNavModel(state.navIndex, `configurationtype-${pageName}-${configurationTypeId}`, configurationTypeLoadingNav).main;
  const configurationType = getConfigurationType(state.configurationType, configurationTypeId);

  return {
    pageNav,
    configurationTypeId: configurationTypeId,
    pageName: pageName,
    configurationType,
  };
}

const mapDispatchToProps = {
  loadConfigurationType,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export class ConfigurationTypePages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchConfigurationType();
  }

  async fetchConfigurationType() {
    const { loadConfigurationType, configurationTypeId } = this.props;
    this.setState({ 
      isLoading: true,
    });
    const response = await loadConfigurationType(configurationTypeId);
    this.setState({ isLoading: false });
    return response;
  }

  getCurrentPage() {
    const pages = ['configurations','settings'];
    const currentPage = this.props.pageName;
    return includes(pages, currentPage) ? currentPage : pages[0];
  }

  renderPage(): React.ReactNode {
    const currentPage = this.getCurrentPage();
    const { configurationType } = this.props;
    switch (currentPage) {
      case PageTypes.Settings:
        return <ConfigurationTypeSettings configurationType={configurationType!} />;
      case PageTypes.Configurations:
        return <OrgConfigurationSettings configurationType={configurationType!}/>;
    }

    return null;
  }

  render() {
    const { configurationType, pageNav } = this.props;

    return (
      <Page navId="configurationtypes" pageNav={pageNav}>
        <Page.Contents isLoading={this.state.isLoading}>
          {configurationType && Object.keys(configurationType).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(withTheme2(ConfigurationTypePages));
