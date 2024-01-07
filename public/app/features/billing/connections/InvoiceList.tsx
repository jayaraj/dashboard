import { css } from '@emotion/css';
import React, { useEffect, useState, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { dateTime, DateTime, dateMath, GrafanaTheme2 } from '@grafana/data';
import {
  Column,
  ConfirmModal,
  CellProps,
  InlineField,
  Button,
  Pagination,
  DateTimePicker,
  CallToActionCard,
  useStyles2,
  Stack,
  Icon,
  Tooltip,
  InteractiveTable,
} from '@grafana/ui';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { Invoice, invoicesPageLimit } from 'app/types/billing/connection';

import { changeInvoicesPage, changeInvoicesRange, createInvoice, loadInvoices } from './state/actions';
import { getInvoices, getInvoicesCount, getInvoicesSearchPage, getInvoicesSearchRange } from './state/selectors';

type Cell<T extends keyof Invoice = keyof Invoice> = CellProps<Invoice, Invoice[T]>;

const skeletonData: Invoice[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
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
}));

export const InvoiceList = ({
  invoices,
  invoicesCount,
  searchPage,
  searchRange,
  hasFetched,
  loadInvoices,
  createInvoice,
  changeRange,
  changePage,
}: Props) => {
  let [modalOpen, setModalOpen] = useState(false);
  const styles = useStyles2(getStyles);
  const canCreate = contextSrv.hasPermission('connections:write');
  const totalPages = Math.ceil(invoicesCount / invoicesPageLimit);
  const [noInvoices, setNoInvoices] = useState<boolean>(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    if (invoices.length !== 0 && noInvoices) {
      setNoInvoices(false);
    }
  }, [invoices]);

  const create = async () => {
    await createInvoice();
  };

  const columns: Array<Column<Invoice>> = useMemo(
    () => [
      {
        id: 'updated_at',
        header: 'Date',
        cell: ({ cell: { value } }: Cell<'updated_at'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value.split('T')[0];
        },
        sortType: 'string',
      },
      {
        id: 'invoice_ext',
        header: 'Invoice No',
        cell: ({ cell: { value } }: Cell<'invoice_ext'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'amount',
        header: 'Amount to be Paid',
        cell: ({ cell: { value } }: Cell<'amount'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'number',
      },
      {
        id: 'old_balance',
        header: 'Old Balance',
        disableGrow: true,
        cell: ({ cell: { value } }: Cell<'old_balance'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return value;
        },
        sortType: 'number',
      },
      {
        id: 'total_payments',
        header: 'Payments',
        disableGrow: true,
        cell: ({ cell: { value } }: Cell<'total_payments'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return value;
        },
        sortType: 'number',
      },
      {
        id: 'total_credits',
        header: 'Credits',
        disableGrow: true,
        cell: ({ cell: { value } }: Cell<'total_credits'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return value;
        },
        sortType: 'number',
      },
      {
        id: 'login',
        header: 'Login',
        cell: ({ cell: { value } }: Cell<'login'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'actions',
        header: '',
        disableGrow: true,
        cell: ({ row: { original } }: Cell) => {
          if (!hasFetched) {
            return (
              <Stack direction="row" justifyContent="flex-end" alignItems="center">
                <Skeleton containerClassName={styles.blockSkeleton} width={16} height={16} />
              </Stack>
            );
          }
          const canRead = contextSrv.hasPermission('connections:read');
          const invoiceUrl = `/org/connections/${original.connection_id}/invoices/${original.id}`;

          return (
            <Stack direction="row" justifyContent="flex-end">
              {canRead && (
                <Tooltip content={`View Invoice ${original.invoice_ext}`}>
                  <a href={invoiceUrl} aria-label={`View Invoice ${original.invoice_ext}`}>
                    <Icon name={'eye'} />
                  </a>
                </Tooltip>
              )}
            </Stack>
          );
        },
      },
    ],
    [hasFetched, styles]
  );

  if (!hasFetched) {
    return <PageLoader />;
  }
  if (noInvoices) {
    return (
      <>
        <div className="page-action-bar">
          <Stack gap={1} direction="row" alignItems="flex-end" justifyContent="end">
            <InlineField label="From" labelWidth={8} tooltip="Invoices range from date">
              <DateTimePicker
                date={dateTime(dateMath.parse(searchRange.from))}
                onChange={(dateTime: DateTime) => {
                  dateTime.add(10, 'hours');
                  changeRange({ ...searchRange, from: dateTime.toISOString().split('T')[0] });
                }}
              />
            </InlineField>
            <InlineField label="To" labelWidth={8} tooltip="Invoices range till date">
              <DateTimePicker
                date={dateTime(dateMath.parse(searchRange.to))}
                onChange={(dateTime: DateTime) => {
                  dateTime.add(10, 'hours');
                  changeRange({ ...searchRange, to: dateTime.toISOString().split('T')[0] });
                }}
              />
            </InlineField>
          </Stack>
          <div className="page-action-bar__spacer" />
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
        <CallToActionCard callToActionElement={<div />} message={`No Invoices.`} />
      </>
    );
  }
  return (
    <>
      <div className="page-action-bar">
        <Stack gap={1} direction="row" alignItems="flex-end" justifyContent="end">
          <InlineField label="From" labelWidth={8} tooltip="Invoices range from date">
            <DateTimePicker
              date={dateTime(dateMath.parse(searchRange.from))}
              onChange={(dateTime: DateTime) => {
                dateTime.add(10, 'hours');
                changeRange({ ...searchRange, from: dateTime.toISOString().split('T')[0] });
              }}
            />
          </InlineField>
          <InlineField label="To" labelWidth={8} tooltip="Invoices range till date">
            <DateTimePicker
              date={dateTime(dateMath.parse(searchRange.to))}
              onChange={(dateTime: DateTime) => {
                dateTime.add(10, 'hours');
                changeRange({ ...searchRange, to: dateTime.toISOString().split('T')[0] });
              }}
            />
          </InlineField>
        </Stack>
        <div className="page-action-bar__spacer" />
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
      <Stack direction={'column'} gap={2}>
        <InteractiveTable
          columns={columns}
          data={hasFetched ? invoices : skeletonData}
          getRowId={(invoice) => String(invoice.id)}
        />
        <Stack justifyContent="flex-end">
          <Pagination hideWhenSinglePage currentPage={searchPage} numberOfPages={totalPages} onNavigate={changePage} />
        </Stack>
      </Stack>
    </>
  );
};

function mapStateToProps(state: StoreState) {
  return {
    invoices: getInvoices(state.invoices),
    invoicesCount: getInvoicesCount(state.invoices),
    searchRange: getInvoicesSearchRange(state.invoices),
    searchPage: getInvoicesSearchPage(state.invoices),
    hasFetched: state.invoices.hasFetched,
  };
}
const mapDispatchToProps = {
  loadInvoices: loadInvoices,
  createInvoice: createInvoice,
  changeRange: changeInvoicesRange,
  changePage: changeInvoicesPage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector>;
export default connector(InvoiceList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    display: 'flex',
  }),
  pillCloseButton: css`
    vertical-align: text-bottom;
    margin: ${theme.spacing(0, 0.5)};
  `,
});
