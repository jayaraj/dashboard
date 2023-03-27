import React, { PureComponent } from 'react';

import { NavModel } from '@grafana/data';
import { VerticalGroup, HorizontalGroup, Pagination, Button, FilterInput } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv, User } from 'app/core/services/context_srv';
import { StoreState, Invoice, AccessControlAction, QueryRange } from 'app/types';

import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';
import { setInvoicesRange, setInvoicesPage, setInvoiceQuery } from '../groups/state/reducers';
import { getInvoicesCount, getInvoices, getInvoicesPage, getInvoicesRange, getDefaultQueryRange, getInvoiceQuery } from '../groups/state/selectors';

import { loadInvoices } from './state/actions';

const pageLimit = 20;

export interface Props {
  navModel: NavModel;
  invoices: Invoice[];
  hasFetched: boolean;
  invoicesRange: QueryRange;
  invoicesPage: number;
  invoicesCount: number;
  invoicesQuery: string;
  defaultRange: QueryRange;
  signedInUser:  User;
  loadInvoices: typeof loadInvoices;
  setInvoicesRange: typeof setInvoicesRange;
  setInvoicesPage: typeof setInvoicesPage;
  setInvoiceQuery: typeof setInvoiceQuery;
}

export class Invoices extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  componentDidMount() {
    this.props.setInvoicesRange(this.props.defaultRange);
    this.fetchInvoices(1, '');
  }

  async fetchInvoices(page: number, query: string) {
    await this.props.loadInvoices(query, page, pageLimit);
  }

  onSearchQueryChange = (value: string) => {
    this.props.setInvoiceQuery(value);
  };

  onNavigate = async (page: number) => {
    const { invoicesQuery } = this.props;
    this.props.loadInvoices(invoicesQuery, page, pageLimit );
  };

  renderInvoice(invoice: Invoice) {
    const { signedInUser } = this.props;
    const invoiceUrl = `org/invoices/${invoice.id}`;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canRead = contextSrv.hasAccess(AccessControlAction.ActionInvoicesRead, admin);
   
    return (
      <tr key={invoice.id}>
        <td className="link-td text-center">
          {canRead ? <a href={invoiceUrl}>{invoice.updated_at.split("T")[0]}</a> : <>{invoice.updated_at.split("T")[0]}</>}
        </td>
        <td className="link-td text-center">
          {canRead ? <a href={invoiceUrl}>{invoice.name}</a> : <>{invoice.name}</>}
        </td>
        <td className="link-td text-center">
          {canRead ? <a href={invoiceUrl}>{invoice.path}</a> : <>{invoice.path}</>}
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
    const { invoicesQuery } = this.props;

    return(
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={invoicesQuery} onChange={this.onSearchQueryChange} />
          </div>
          <Button onClick={() => {
              this.fetchInvoices(1, invoicesQuery);
            }}>
            Refresh
          </Button>
        </div>
      </>
    );
  }

  renderInvoiceList() {
    const { invoices, invoicesPage, invoicesCount, invoicesQuery } = this.props;
    const totalPages = Math.ceil(invoicesCount / pageLimit);

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={invoicesQuery} onChange={this.onSearchQueryChange} />
            <Button onClick={() => {
              this.fetchInvoices(1, invoicesQuery);
            }} style={{ marginLeft: 20 }}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Date</th>
                  <th style={{ textAlign: 'center' }}>Unit</th>
                  <th style={{ textAlign: 'center' }}>Unit Detail</th>
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
    const { hasFetched, navModel } = this.props;
    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={!hasFetched}>{this.renderList()}</Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    navModel: getNavModel(state.navIndex, 'invoices'),
    invoices: getInvoices(state.invoices),
    hasFetched: state.invoices.hasFetched,
    invoicesRange: getInvoicesRange(state.invoices),
    invoicesPage: getInvoicesPage(state.invoices),
    invoicesCount: getInvoicesCount(state.invoices),
    invoicesQuery: getInvoiceQuery(state.invoices),
    defaultRange: getDefaultQueryRange(),
    signedInUser:  contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadInvoices,
  setInvoicesRange,
  setInvoicesPage,
  setInvoiceQuery,
};

export default connectWithCleanUp(
  mapStateToProps,
  mapDispatchToProps,
  (state) => state.invoices
)(Invoices);



