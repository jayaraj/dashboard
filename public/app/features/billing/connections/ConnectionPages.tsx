import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Themeable2, withTheme2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import AlertList from '../../devicemanagement/alerts/components/AlertList';

import ConnectionLogList from './ConnectionLogList';
import ConnectionResourceList from './ConnectionResourceList';
import ConnectionSettings from './ConnectionSettings';
import ConnectionUserList from './ConnectionUserList';
import InvoiceList from './InvoiceList';
import TransactionList from './TransactionList';
import { loadConnection } from './state/actions';
import { getPageNav } from './state/navModel';
import { getConnection } from './state/selectors';

interface ConnectionPageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<ConnectionPageRouteParams>, Themeable2 {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Invoices = 'invoices',
  Transactions = 'transactions',
  Alerts = 'alerts',
  Users = 'users',
  Resources = 'resources',
  Logs = 'logs',
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const connectionId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'invoices';
  const connectionLoadingNav = getPageNav(pageName as string);
  const pageNav = getNavModel(state.navIndex, `connection-${pageName}-${connectionId}`, connectionLoadingNav).main;
  const connection = getConnection(state.connection, connectionId);

  return {
    pageNav,
    connectionId: connectionId,
    pageName: pageName,
    connection,
  };
}

const mapDispatchToProps = {
  loadConnection,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export class ConnectionPages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchConnection();
  }

  async fetchConnection() {
    const { loadConnection, connectionId } = this.props;
    this.setState({
      isLoading: true,
    });
    const response = await loadConnection(connectionId);
    this.setState({ isLoading: false });
    return response;
  }

  getCurrentPage() {
    const pages = ['invoices', 'transactions', 'alerts', 'users', 'resources', 'logs', 'settings'];
    const currentPage = this.props.pageName;
    return includes(pages, currentPage) ? currentPage : pages[0];
  }

  renderPage(): React.ReactNode {
    const currentPage = this.getCurrentPage();
    const { connection } = this.props;
    switch (currentPage) {
      case PageTypes.Invoices:
        return <InvoiceList />;
      case PageTypes.Transactions:
        return <TransactionList />;
      case PageTypes.Alerts:
        return <AlertList association={'group'} associationReference={connection!.group_path_id} />;
      case PageTypes.Users:
        return <ConnectionUserList connection={connection!} />;
      case PageTypes.Resources:
        return <ConnectionResourceList connection={connection!} />;
      case PageTypes.Logs:
        return <ConnectionLogList />;
      case PageTypes.Settings:
        return <ConnectionSettings connection={connection!} />;
    }
    return null;
  }

  render() {
    const { connection, pageNav } = this.props;

    return (
      <Page navId="billing-connections" pageNav={pageNav}>
        <Page.Contents isLoading={this.state.isLoading}>
          {connection && Object.keys(connection).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(withTheme2(ConnectionPages));