import { css } from '@emotion/css';
import React, { useEffect, useState, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { dateTime, DateTime, dateMath, GrafanaTheme2 } from '@grafana/data';
import {
  Column,
  CellProps,
  InlineField,
  Button,
  Pagination,
  DateTimePicker,
  CallToActionCard,
  useStyles2,
  Stack,
  InteractiveTable,
} from '@grafana/ui';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { Transaction, transactionsPageLimit } from 'app/types/billing/connection';

import CreateTransaction from './CreateTransaction';
import { changeTransactionsPage, changeTransactionsRange, loadTransactions } from './state/actions';
import {
  getTransactionsCount,
  getTransactions,
  getTransactionsSearchPage,
  getTransactionsSearchRange,
} from './state/selectors';

type Cell<T extends keyof Transaction = keyof Transaction> = CellProps<Transaction, Transaction[T]>;
interface OwnProps {
  transactions: Transaction[];
}

const skeletonData: Transaction[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  updated_at: '',
  org_id: 0,
  group_id: 0,
  type: '',
  tax: 0,
  amount: 0,
  balance: 0,
  description: '',
  login: '',
  context: {},
}));

export const TransactionList = ({
  transactions,
  transactionsCount,
  searchPage,
  searchRange,
  hasFetched,
  loadTransactions,
  changeRange,
  changePage,
}: Props) => {
  const styles = useStyles2(getStyles);
  const canCreate = contextSrv.hasPermission('connections:write');
  const totalPages = Math.ceil(transactionsCount / transactionsPageLimit);
  const [noTransactions, setNoTransactions] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    if (transactions.length !== 0 && noTransactions) {
      setNoTransactions(false);
    }
  }, [transactions]);

  const columns: Array<Column<Transaction>> = useMemo(
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
        id: 'type',
        header: 'Type',
        cell: ({ cell: { value } }: Cell<'type'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'description',
        header: 'Description',
        cell: ({ row: { original } }: Cell) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return (
            <>
              <div>{original.description}</div>
              <div>
                {Object.keys(original.context).map((key, index) => {
                  return (
                    <span key={key} className={styles.contextSection}>
                      {key}={original.context[key]}
                      {index !== Object.keys(original.context).length - 1 && ', '}
                    </span>
                  );
                })}
              </div>
            </>
          );
        },
      },
      {
        id: 'tax',
        header: 'Tax',
        cell: ({ cell: { value } }: Cell<'tax'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'number',
      },
      {
        id: 'amount',
        header: 'Amount',
        cell: ({ cell: { value } }: Cell<'amount'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'number',
      },
      {
        id: 'balance',
        header: 'Balance',
        disableGrow: true,
        cell: ({ cell: { value } }: Cell<'balance'>) => {
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
    ],
    [hasFetched, styles]
  );

  if (!hasFetched) {
    return <PageLoader />;
  }

  if (noTransactions) {
    return (
      <>
        <div className="page-action-bar">
          <Stack gap={1} direction="row" alignItems="flex-end" justifyContent="end">
            <InlineField label="From" labelWidth={8} tooltip="Transactions range from date">
              <DateTimePicker
                date={dateTime(dateMath.parse(searchRange.from))}
                onChange={(dateTime: DateTime) => {
                  dateTime.add(10, 'hours');
                  changeRange({ ...searchRange, from: dateTime.toISOString().split('T')[0] });
                }}
              />
            </InlineField>
            <InlineField label="To" labelWidth={8} tooltip="Transactions range till date">
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
            Create Transaction
          </Button>
          <CreateTransaction
            isOpen={modalOpen}
            onCancel={(open: boolean) => {
              setModalOpen(open);
            }}
          />
        </div>
        <CallToActionCard callToActionElement={<div />} message={`No Transactions.`} />
      </>
    );
  }

  return (
    <>
      <div className="page-action-bar">
        <Stack gap={1} direction="row" alignItems="flex-end" justifyContent="end">
          <InlineField label="From" labelWidth={8} tooltip="Transactions range from date">
            <DateTimePicker
              date={dateTime(dateMath.parse(searchRange.from))}
              onChange={(dateTime: DateTime) => {
                dateTime.add(10, 'hours');
                changeRange({ ...searchRange, from: dateTime.toISOString().split('T')[0] });
              }}
            />
          </InlineField>
          <InlineField label="To" labelWidth={8} tooltip="Transactions range till date">
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
          Create Transaction
        </Button>
        <CreateTransaction
          isOpen={modalOpen}
          onCancel={(open: boolean) => {
            setModalOpen(open);
          }}
        />
      </div>
      <Stack direction={'column'} gap={2}>
        <InteractiveTable
          columns={columns}
          data={hasFetched ? transactions : skeletonData}
          getRowId={(transaction) => String(transaction.id)}
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
    transactions: getTransactions(state.transactions),
    transactionsCount: getTransactionsCount(state.transactions),
    searchRange: getTransactionsSearchRange(state.transactions),
    searchPage: getTransactionsSearchPage(state.transactions),
    hasFetched: state.transactions.hasFetched,
  };
}
const mapDispatchToProps = {
  loadTransactions,
  changeRange: changeTransactionsRange,
  changePage: changeTransactionsPage,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(TransactionList);

const getStyles = (theme: GrafanaTheme2) => ({
  contextSection: css({
    fontSize: '12px',
    fontStyle: 'italic',
  }),
});
