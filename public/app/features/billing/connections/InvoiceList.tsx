import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateTime, DateTime, dateMath } from '@grafana/data';
import {  VerticalGroup, HorizontalGroup, Pagination,  DateTimePicker, InlineField, Button, ConfirmModal} from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, Invoice, QueryRange, invoicesPageLimit, AccessControlAction } from 'app/types';
import { createInvoice, loadInvoices } from './state/actions';
import { setInvoicesSearchRange } from './state/reducers';
import { getDefaultQueryRange, getInvoices, getInvoicesCount, getInvoicesSearchPage, getInvoicesSearchRange } from './state/selectors';


export interface OwnProps {
  invoices: Invoice[];
  invoicesCount: number;
  hasFetched: boolean;
  searchPage: number;
  searchRange: QueryRange;
}

const mapDispatchToProps = {
  loadInvoices: loadInvoices,
  createInvoice: createInvoice,
  setInvoicesSearchRange,
};

function mapStateToProps(state: StoreState) {
  return {
    invoices: getInvoices(state.invoices),
    hasFetched: state.invoices.hasFetched,
    invoicesCount: getInvoicesCount(state.invoices),
    searchRange: getInvoicesSearchRange(state.invoices),
    searchPage: getInvoicesSearchPage(state.invoices),
    defaultRange: getDefaultQueryRange(),
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const InvoiceList: FC<Props> = ({
  invoices, 
  searchPage,
  searchRange,
  defaultRange,
  invoicesCount,
  hasFetched,
  loadInvoices,
  createInvoice,
  setInvoicesSearchRange}) => {
  let [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setInvoicesSearchRange(defaultRange);
    getInvoices(1, defaultRange);
  }, []);

  const getInvoices = async (page: number, range: QueryRange) => {
    await loadInvoices(page, range);
  };

  const create = async () => {
    setInvoicesSearchRange(defaultRange);
    await createInvoice(defaultRange);
  }

  const onFromChange = (from: string) => {
    setInvoicesSearchRange({from: from, to: searchRange.to});
  };

  const onToChange = (to: string) => {
    setInvoicesSearchRange({from: searchRange.from, to: to});
  };

  const onNavigate = async (page: number) => {
    await loadInvoices(page, searchRange);
  };

  const renderInvoice = (invoice: Invoice) => {
    const invoiceUrl = `org/invoices/${invoice.id}`;
    return (
      <tr key={invoice.id}>
        <td className="link-td text-center">
          <a href={invoiceUrl}>{invoice.updated_at.split("T")[0]}</a>
        </td>
        <td className="link-td text-center">
          <a href={invoiceUrl}>{invoice.amount}</a>
        </td>
        <td className="link-td text-center">
          <a href={invoiceUrl}>{invoice.old_balance}</a>
        </td>
        <td className="link-td text-center">
          <a href={invoiceUrl}>{invoice.total_credits}</a>
        </td>
        <td className="link-td text-center">
          <a href={invoiceUrl}>{invoice.total_payments}</a>
        </td>
        <td className="link-td text-center">
          <a href={invoiceUrl}>{invoice.login}</a>
        </td>
      </tr>
    );
  }

  const renderEmptyList = () => {
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionInvoicesCreate, fallback);

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
                date={dateTime(dateMath.parse(searchRange.from))}
                onChange={(dateTime: DateTime) => {
                      dateTime.add(10, 'hours');
                      onFromChange(dateTime.toISOString().split("T")[0]);
                    }}
              />
            </InlineField>
            <InlineField
              label='To'
              labelWidth={8}
              tooltip='Invoices range till date'
            >
              <DateTimePicker
                date={dateTime(dateMath.parse(searchRange.to))}
                onChange={(dateTime: DateTime) => {
                      dateTime.add(10, 'hours');
                      onToChange(dateTime.toISOString().split("T")[0]);
                    }}
              />
            </InlineField>
            <Button onClick={() => {
              getInvoices(1, searchRange);
            }}>
              Search
            </Button>
          </div>
          <Button onClick={() => setModalOpen(true)} disabled={!canCreate}>
            Create Invoice
          </Button>
          <ConfirmModal
            title={'Create Invoice'}
            isOpen={modalOpen}
            body={'Are you sure to create a new Invoice this month?'}
            confirmText={'Yes, create invoice.'}
            onConfirm={() => {
              create();
              setModalOpen(false);
            }}
            onDismiss={() => setModalOpen(false)}
          />
        </div>
      </>
    );
  }

  const  renderInvoiceList = () => {
    const totalPages = Math.ceil(invoicesCount / invoicesPageLimit);
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionInvoicesCreate, fallback);

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
                date={dateTime(dateMath.parse(searchRange.from))}
                onChange={(dateTime: DateTime) => {
                      dateTime.add(10, 'hours');
                      onFromChange(dateTime.toISOString().split("T")[0]);
                    }}
              />
            </InlineField>
            <InlineField
              label='To'
              labelWidth={8}
              tooltip='Invoices range till date'
            >
              <DateTimePicker
                date={dateTime(dateMath.parse(searchRange.to))}
                onChange={(dateTime: DateTime) => {
                      dateTime.add(10, 'hours');
                      onToChange(dateTime.toISOString().split("T")[0]);
                    }}
              />
            </InlineField>
            <Button onClick={() => {
              getInvoices(1, searchRange);
            }}>
              Refresh
            </Button>
          </div>
          <Button onClick={() => setModalOpen(true)} disabled={!canCreate}>
            Create Invoice
          </Button>
          <ConfirmModal
            title={'Create Invoice'}
            isOpen={modalOpen}
            body={'Are you sure to create a new Invoice this month?'}
            confirmText={'Yes, create invoice.'}
            onConfirm={() => {
              createInvoice(searchRange);
              setModalOpen(false);
            }}
            onDismiss={() => setModalOpen(false)}
          />
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
              <tbody>{invoices.map((invoice) => renderInvoice(invoice))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination
                onNavigate={onNavigate}
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

  const renderList = () => {
    if (!hasFetched) {
      return null;
    }
    if (invoicesCount > 0) {
      return renderInvoiceList();
    } else {
      return renderEmptyList();
    }
  }
  return renderList();
}

export default connector(InvoiceList);


