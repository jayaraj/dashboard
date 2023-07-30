import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Themeable2, withTheme2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import { loadAlertDefinition } from './state/actions';
import { getPageNav } from './state/navModel';
import { getAlertDefinition } from './state/selectors';
import AlertDefinitionSettings from './AlertDefinitionSettings';

interface AlertDefinitionPageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<AlertDefinitionPageRouteParams>, Themeable2 {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const alertDefinitionId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'settings';
  const alertDefinitionLoadingNav = getPageNav(pageName as string);
  const pageNav = getNavModel(state.navIndex, `alertdefinition-${pageName}-${alertDefinitionId}`, alertDefinitionLoadingNav).main;
  const alertDefinition = getAlertDefinition(state.alertDefinition, alertDefinitionId);

  return {
    pageNav,
    alertDefinitionId: alertDefinitionId,
    pageName: pageName,
    alertDefinition,
  };
}

const mapDispatchToProps = {
  loadAlertDefinition,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export class AlertDefinitionPages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchAlertDefinition();
  }

  async fetchAlertDefinition() {
    const { loadAlertDefinition, alertDefinitionId } = this.props;
    this.setState({ 
      isLoading: true,
    });
    const response = await loadAlertDefinition(alertDefinitionId);
    this.setState({ isLoading: false });
    return response;
  }

  getCurrentPage() {
    const pages = ['settings'];
    const currentPage = this.props.pageName;
    return includes(pages, currentPage) ? currentPage : pages[0];
  }

  renderPage(): React.ReactNode {
    const currentPage = this.getCurrentPage();
    const { alertDefinition } = this.props;
    switch (currentPage) {
      case PageTypes.Settings:
        return <AlertDefinitionSettings alertDefinition={alertDefinition!} />;
    }

    return null;
  }

  render() {
    const { alertDefinition, pageNav } = this.props;

    return (
      <Page navId="alerts" pageNav={pageNav}>
        <Page.Contents isLoading={this.state.isLoading}>
          {alertDefinition && Object.keys(alertDefinition).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(withTheme2(AlertDefinitionPages));
