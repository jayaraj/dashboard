import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Themeable2, withTheme2, LinkButton, Icon, Button } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import InvoiceTable from './InvoiceTable';
import { loadConnection, loadInvoice,  loadInvoiceTransactions, loadOrgConfigurations } from './state/actions';
import { getPageNav } from './state/navModel';
import { getInvoice, getTransactions, getOrgConfigurations, getConnection } from './state/selectors';

export interface OwnProps extends GrafanaRouteComponentProps<{id: string}>, Themeable2 {
  match: any;
}

interface State {
  isLoading: boolean;
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const connectionId = parseInt(props.match.params.id, 10);
  const invoiceId = parseInt(props.match.params.invoiceId, 10);
  const invoice = getInvoice(state.invoice, invoiceId);
  const connection = getConnection(state.connection, connectionId);
  const transactions = getTransactions(state.transactions);
  const groupLoadingNav = getPageNav('invoices');
  const pageNav = getNavModel(state.navIndex, `connection-invoices-${invoiceId}`, groupLoadingNav).main;
  const orgConfiguration = getOrgConfigurations(state.orgConfiguration, connection?.org_id, 'details');

  return {
    pageNav: pageNav,
    invoiceId: invoiceId,
    connectionId: connectionId,
    invoice: invoice,
    connection: connection,
    transactions: transactions,
    orgConfiguration: orgConfiguration?.configuration,
  };
}

const mapDispatchToProps = {
  loadInvoice,
  loadConnection,
  loadInvoiceTransactions,
  loadOrgConfigurations,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export class InvoicePage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchInvoice();
  }

  async componentDidUpdate() {
    const { invoice, invoiceId } = this.props;
    const { isLoading } = this.state;
    if ((!isLoading) && (invoice === null || (invoice && invoice!.id !== invoiceId))) {
      await this.fetchInvoice();
    }
  }

  async fetchInvoice() {
    const { loadInvoice, loadConnection, loadInvoiceTransactions, invoiceId, connectionId } = this.props;
    this.setState({ isLoading: true });
    const invoice = await loadInvoice(invoiceId);
    await loadConnection(connectionId);
    await loadInvoiceTransactions(1);
    await loadOrgConfigurations('details');
    this.setState({ isLoading: false });
    return invoice;
  }
  
  generatePDF = () => {
    const { invoiceId } = this.props;
    const current = new Date();
    const element = document.getElementById('invoicepage');
    html2canvas(element!, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), 0);
      pdf.save(`invoice-${current.getDate()}${current.getMonth()+1}${current.getFullYear()}-${invoiceId}.pdf`);
    });
  }

  render() {
    const { pageNav, invoice, transactions, connection, orgConfiguration, connectionId} = this.props;
    const invoicesUrl = `org/connections/edit/${connectionId}/invoices`;

    return (
      <Page navId="connections" pageNav={pageNav}>
        <Page.Contents isLoading={this.state.isLoading}>
          <div className="page-action-bar">
            <div className="gf-form gf-form--grow">
            </div>
            <Button onClick={this.generatePDF}>
              Download
            </Button>
            <LinkButton href={invoicesUrl}>
              <Icon name="arrow-up" />Invoices
            </LinkButton>
          </div>
          <InvoiceTable connection={connection!} orgConfiguration={orgConfiguration}  invoice={invoice!} transactions={transactions}></InvoiceTable>
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(withTheme2(InvoicePage));

