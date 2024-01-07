import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { NavModelItem } from '@grafana/data';
import { Button, LinkButton, Stack } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { StoreState } from 'app/types';
import { Connection, Invoice } from 'app/types/billing/connection';

import { InvoiceTable } from './InvoiceTable';
import {
  changeInvoiceTransactionsPage,
  loadConnection,
  loadInvoice,
  loadInvoiceTransactions,
  loadOrgConfigurations,
} from './state/actions';
import { setHasInvoiceFetched } from './state/reducers';
import {
  getInvoice,
  getOrgConfiguration,
  getConnection,
  getInvoiceTransactionsCount,
  getInvoiceTransactions,
} from './state/selectors';

interface OwnProps extends GrafanaRouteComponentProps<{ id: string; invoiceId: string }> {}
const pageNav: NavModelItem = {
  icon: 'invoice',
  id: 'invoicep-view',
  text: `Invoice`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

export const InvoicePage = ({
  invoice,
  connection,
  transactions,
  transactionsCount,
  orgConfiguration,
  loadInvoice,
  loadConnection,
  loadInvoiceTransactions,
  loadOrgConfigurations,
  changePage,
  setHasInvoiceFetched,
  hasFetched,
  match,
}: Props) => {
  const invoiceId = parseInt(match.params.invoiceId, 10);
  const connectionId = parseInt(match.params.id, 10);

  useEffect(() => {
    setHasInvoiceFetched(false);
    loadInvoice(invoiceId);
    loadConnection(connectionId);
    loadInvoiceTransactions(invoiceId);
    loadOrgConfigurations('details');
  }, []);

  const generatePDF = () => {
    const current = new Date();
    const element = document.getElementById('invoicepage');
    html2canvas(element!, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), 0);
      pdf.save(`invoice-${current.getDate()}${current.getMonth() + 1}${current.getFullYear()}-${invoiceId}.pdf`);
    });
  };

  return (
    <Page
      navId="billing-connections"
      pageNav={{ ...pageNav, text: `Invoice: ${invoice.invoice_ext}` }}
      actions={
        <Stack gap={1} direction="row">
          <Button onClick={generatePDF}>Download</Button>
          <LinkButton href={`org/connections/edit/${invoice.connection_id}/invoices`}>Back</LinkButton>
        </Stack>
      }
    >
      <Page.Contents isLoading={!hasFetched}>
        <InvoiceTable
          connection={connection ? connection : ({} as Connection)}
          orgConfiguration={orgConfiguration ? orgConfiguration : {}}
          invoice={invoice ? invoice : ({} as Invoice)}
          transactions={transactions}
        />
      </Page.Contents>
    </Page>
  );
};

function mapStateToProps(state: StoreState, props: OwnProps) {
  const invoice = getInvoice(state.invoice, props.match.params.invoiceId);
  const connection = getConnection(state.connection, props.match.params.id);
  const transactions = getInvoiceTransactions(state.invoiceTransactions);
  const transactionsCount = getInvoiceTransactionsCount(state.invoiceTransactions);

  const orgConfiguration = getOrgConfiguration(state.orgConfiguration);

  return {
    invoice: invoice
      ? invoice
      : {
          id: 0,
          updated_at: '',
          connection_id: 0,
          group_path_id: '',
          connection_ext: 0,
          invoice_ext: '',
          old_balance: 0,
          amount: 0,
          total_credits: 0,
          total_payments: 0,
          description: '',
          login: '',
          from: '',
          to: '',
          name: '',
          path: '',
          informations: [],
        },
    connection: connection
      ? connection
      : {
          id: 0,
          updated_at: '',
          org_id: 0,
          group_id: 0,
          group_path_id: '',
          profile: '',
          status: '',
          name: '',
          phone: '',
          email: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          country: '',
          pincode: '',
          connection_ext: 0,
          tags: [],
          latitude: 0,
          longitude: 0,
        },
    transactions: transactions,
    transactionsCount: transactionsCount,
    orgConfiguration: orgConfiguration?.configuration,
    hasFetched: state.invoice.hasFetched,
  };
}

const mapDispatchToProps = {
  loadInvoice,
  loadConnection,
  loadInvoiceTransactions,
  loadOrgConfigurations,
  changePage: changeInvoiceTransactionsPage,
  setHasInvoiceFetched: setHasInvoiceFetched,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(InvoicePage);
