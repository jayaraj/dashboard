import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateTime, DateTime, dateMath } from '@grafana/data';
import { LinkButton, VerticalGroup, HorizontalGroup, Pagination, Icon, DateTimePicker, InlineField, Button, ConfirmModal} from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, Invoice, AccessControlAction, Group, QueryRange } from 'app/types';

import { loadInvoices, createInvoice } from './state/actions';
import { setInvoicesRange, setInvoicesPage } from './state/reducers';
import { getInvoicesCount, getInvoices, getInvoicesPage, getInvoicesRange, getDefaultQueryRange } from './state/selectors';

const pageLimit = 10;

function mapStateToProps(state: StoreState) {
  return {
    invoices: getInvoices(state.invoices),
    hasFetched: state.invoices.hasFetched,
    invoicesRange: getInvoicesRange(state.invoices),
    invoicesPage: getInvoicesPage(state.invoices),
    invoicesCount: getInvoicesCount(state.invoices),
    defaultRange: getDefaultQueryRange(),
    signedInUser:  contextSrv.user,
  };
}

interface OwnProps {
  invoices: Invoice[];
  group: Group;
}

const mapDispatchToProps = {
  loadInvoices,
  createInvoice,
  setInvoicesRange,
  setInvoicesPage,
};

export interface State {
  isCreateInvoiceModalOpen: boolean;
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export class InvoiceList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isCreateInvoiceModalOpen: false};
  }

  componentDidMount() {
    this.props.setInvoicesRange(this.props.defaultRange);
    this.fetchInvoices(1, this.props.defaultRange);
  }

  async fetchInvoices(page: number, range: QueryRange) {
    await this.props.loadInvoices(page, pageLimit, range);
  }

  async createInvoice() {
    this.props.setInvoicesRange(this.props.defaultRange);
    await this.props.createInvoice(pageLimit, this.props.defaultRange);
  }

  setIsCreateInvoiceModalOpen = (open: boolean) => {
    this.setState({ isCreateInvoiceModalOpen: open });
  }

  onFromChange = (from: string) => {
    const { invoicesRange } = this.props;
    this.props.setInvoicesRange({from: from, to: invoicesRange.to});
  };

  onToChange = (to: string) => {
    const { invoicesRange } = this.props;
    this.props.setInvoicesRange({from: invoicesRange.from, to: to});
  };

  onNavigate = async (page: number) => {
    const { invoicesRange } = this.props;
    this.props.loadInvoices(page, pageLimit, invoicesRange);
  };

  renderInvoice(invoice: Invoice) {
    const { signedInUser, group } = this.props;
    const invoiceUrl = `org/groups/${group.id}/invoices/${invoice.id}`;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canRead = contextSrv.hasAccess(AccessControlAction.ActionInvoicesRead, admin);
   
    return (
      <tr key={invoice.id}>
        <td className="link-td text-center">
          {canRead ? <a href={invoiceUrl}>{invoice.updated_at.split("T")[0]}</a> : <>{invoice.updated_at.split("T")[0]}</>}
        </td>
        <td className="link-td text-center">
          {canRead ? <a href={invoiceUrl}>{invoice.amount}</a> : <>{invoice.amount}</>}
        </td>
        <td className="link-td text-center">
          {canRead ? <a href={invoiceUrl}>{invoice.old_balance}</a> : <>{invoice.old_balance}</>}
        </td>
        <td className="link-td text-center">
          {canRead ? <a href={invoiceUrl}>{invoice.total_credits}</a> : <>{invoice.total_credits}</>}
        </td>
        <td className="link-td text-center">
          {canRead ? <a href={invoiceUrl}>{invoice.total_payments}</a> : <>{invoice.total_payments}</>}
        </td>
        <td className="link-td text-center">
          {canRead ? <a href={invoiceUrl}>{invoice.login}</a> : <>{invoice.login}</>}
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const { group, invoicesRange, signedInUser } = this.props;
    const parentUrl = (group.parent === -1)? `org/groups`:`org/groups/edit/${group.parent}/children`;
    const {isCreateInvoiceModalOpen} = this.state;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionInvoicesWrite, admin);

    return(
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <InlineField
              label='From'
              labelWidth={8}
              tooltip='Invoices range from date'
            >
              <DateTimePicker
                date={dateTime(dateMath.parse(invoicesRange.from))}
                onChange={(dateTime: DateTime) => {
                      dateTime.add(10, 'hours');
                      this.onFromChange(dateTime.toISOString().split("T")[0]);
                    }}
              />
            </InlineField>
            <InlineField
              label='To'
              labelWidth={8}
              tooltip='Invoices range till date'
            >
              <DateTimePicker
                date={dateTime(dateMath.parse(invoicesRange.to))}
                onChange={(dateTime: DateTime) => {
                      dateTime.add(10, 'hours');
                      this.onToChange(dateTime.toISOString().split("T")[0]);
                    }}
              />
            </InlineField>
            <Button onClick={() => {
              this.fetchInvoices(1, invoicesRange);
            }}>
              Refresh
            </Button>
          </div>
          <Button onClick={() => this.setIsCreateInvoiceModalOpen(true)} disabled={!canWrite}>
            Create Invoice
          </Button>
          <ConfirmModal
            title={'Create Invoice'}
            isOpen={isCreateInvoiceModalOpen}
            body={'Are you sure to create a new Invoice this month?'}
            confirmText={'Yes, create invoice.'}
            onConfirm={() => {
              this.createInvoice();
              this.setIsCreateInvoiceModalOpen(false);
            }}
            onDismiss={() => this.setIsCreateInvoiceModalOpen(false)}
          />
          <LinkButton href={parentUrl}>
            <Icon name="arrow-left" />Back
          </LinkButton>
        </div>
      </>
    );
  }

  renderInvoiceList() {
    const { invoices, invoicesPage, invoicesCount, group, invoicesRange, signedInUser } = this.props;
    const totalPages = Math.ceil(invoicesCount / pageLimit);
    const parentUrl = (group.parent === -1)? `org/groups`:`org/groups/edit/${group.parent}/children`;
    const {isCreateInvoiceModalOpen} = this.state;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionInvoicesWrite, admin);

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <InlineField
              label='From'
              labelWidth={8}
              tooltip='Invoices range from date'
            >
              <DateTimePicker
                date={dateTime(dateMath.parse(invoicesRange.from))}
                onChange={(dateTime: DateTime) => {
                      dateTime.add(10, 'hours');
                      this.onFromChange(dateTime.toISOString().split("T")[0]);
                    }}
              />
            </InlineField>
            <InlineField
              label='To'
              labelWidth={8}
              tooltip='Invoices range till date'
            >
              <DateTimePicker
                date={dateTime(dateMath.parse(invoicesRange.to))}
                onChange={(dateTime: DateTime) => {
                      dateTime.add(10, 'hours');
                      this.onToChange(dateTime.toISOString().split("T")[0]);
                    }}
              />
            </InlineField>
            <Button onClick={() => {
              this.fetchInvoices(1, invoicesRange);
            }}>
              Refresh
            </Button>
          </div>
          <Button onClick={() => this.setIsCreateInvoiceModalOpen(true)} disabled={!canWrite}>
            Create Invoice
          </Button>
          <ConfirmModal
            title={'Create Invoice'}
            isOpen={isCreateInvoiceModalOpen}
            body={'Are you sure to create a new Invoice this month?'}
            confirmText={'Yes, create invoice.'}
            onConfirm={() => {
              this.createInvoice();
              this.setIsCreateInvoiceModalOpen(false);
            }}
            onDismiss={() => this.setIsCreateInvoiceModalOpen(false)}
          />
          <LinkButton href={parentUrl}>
            <Icon name="arrow-left" />Back
          </LinkButton>
        </div>

        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Date</th>
                  <th style={{ textAlign: 'center' }}>Amount to be Paid</th>
                  <th style={{ textAlign: 'center' }}>Previous Balance</th>
                  <th style={{ textAlign: 'center' }}>Credits</th>
                  <th style={{ textAlign: 'center' }}>Payments</th>
                  <th style={{ textAlign: 'center' }}>Created By</th>
                </tr>
              </thead>
              <tbody>{invoices.map((invoice) => this.renderInvoice(invoice))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination
                onNavigate={this.onNavigate}
                currentPage={invoicesPage}
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
    const { invoicesCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }
    if (invoicesCount > 0) {
      return this.renderInvoiceList();
    } else {
      return this.renderEmptyList();
    }
  }

  render() {
    return this.renderList();
  }
}

export default connector(InvoiceList);


