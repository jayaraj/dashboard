import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateTime, DateTime, dateMath } from '@grafana/data';
import { LinkButton, VerticalGroup, HorizontalGroup, Pagination, Icon, Button, DateTimePicker, InlineField} from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, AccessControlAction, Group, Transaction, QueryRange } from 'app/types';

import CreateTransaction from './CreateTransaction';
import { loadTransactions } from './state/actions';
import { setTransactionsPage, setTransactionsRange } from './state/reducers';
import { getTransactionsCount, getTransactions, getTransactionsPage, getDefaultQueryRange, getTransactionsRange } from './state/selectors';

const pageLimit = 10;

function mapStateToProps(state: StoreState) {
  return {
    transactions: getTransactions(state.transactions),
    hasFetched: state.transactions.hasFetched,
    transactionsRange: getTransactionsRange(state.transactions),
    transactionsPage: getTransactionsPage(state.transactions),
    transactionsCount: getTransactionsCount(state.transactions),
    defaultRange: getDefaultQueryRange(),
    signedInUser:  contextSrv.user,
  };
}

interface OwnProps {
  transactions: Transaction[];
  group: Group;
}

const mapDispatchToProps = {
  loadTransactions,
  setTransactionsRange,
  setTransactionsPage,
};

export interface State {
  isCreateTransactionModalOpen: boolean;
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export class TransactionList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isCreateTransactionModalOpen: false };
  }

  componentDidMount() {
    this.props.setTransactionsRange(this.props.defaultRange);
    this.fetchTransactions(1,this.props.defaultRange);
  }

  async fetchTransactions(page: number, range: QueryRange) {
    await this.props.loadTransactions(page, pageLimit, range);
  }

  setIsCreateTransactionModalOpen = (open: boolean) => {
    this.setState({ isCreateTransactionModalOpen: open });
  }

  onFromChange = (from: string) => {
    const { transactionsRange } = this.props;
    this.props.setTransactionsRange({from: from, to: transactionsRange.to});
  };

  onToChange = (to: string) => {
    const { transactionsRange } = this.props;
    this.props.setTransactionsRange({from: transactionsRange.from, to: to});
  };

  onNavigate = async (page: number) => {
    const { transactionsRange } = this.props;
    this.props.loadTransactions(page, pageLimit, transactionsRange);
  };

  renderTransaction(transaction: Transaction) {
    return (
      <tr key={transaction.id}>
        <td className="link-td text-center">
          {transaction.updated_at.split("T")[0]}
        </td>
        <td className="link-td text-left">
          <div style={{ 
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: 1.5
          }}>{transaction.description}</div>
          <div>
            {
              Object.keys(transaction.context).map((key) => {
                return (
                  <span key="{key}" style={{ 
                    fontSize: '12px',
                    fontStyle: 'italic'
                  }}>
                    {key}={transaction.context[key] }
                  </span>
                );
              })
            }
          </div>
        </td>
        <td className="link-td text-center">
          {transaction.type}
        </td>
        <td className="link-td text-center">
          {transaction.tax}
        </td>
        <td className="link-td text-center">
          {transaction.amount}
        </td>
        <td className="link-td text-center">
          {transaction.balance}
        </td>
        <td className="link-td text-center">
          {transaction.login}
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const { group, signedInUser, transactionsRange } = this.props;
    const parentUrl = (group.parent === -1)? `org/groups`:`org/groups/edit/${group.parent}/children`;
    const {isCreateTransactionModalOpen} = this.state;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionInvoicesWrite, admin);

    return(
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <InlineField
              label='From'
              labelWidth={8}
              tooltip='Transactions range from date'
            >
              <DateTimePicker
                date={dateTime(dateMath.parse(transactionsRange.from))}
                onChange={(dateTime: DateTime) => {
                      dateTime.add(10, 'hours');
                      this.onFromChange(dateTime.toISOString().split("T")[0]);
                    }}
              />
            </InlineField>
            <InlineField
              label='To'
              labelWidth={8}
              tooltip='Transactions range till date'
            >
              <DateTimePicker
                date={dateTime(dateMath.parse(transactionsRange.to))}
                onChange={(dateTime: DateTime) => {
                      dateTime.add(10, 'hours');
                      this.onToChange(dateTime.toISOString().split("T")[0]);
                    }}
              />
            </InlineField>
            <Button onClick={() => {
              this.fetchTransactions(1, transactionsRange);
            }}>
              Refresh
            </Button>
          </div>
          <Button onClick={() => this.setIsCreateTransactionModalOpen(true)} disabled={!canWrite}>
            Create Transaction
          </Button>
          <CreateTransaction
            isOpen={isCreateTransactionModalOpen}
            onCancel={(open: boolean ) => {
              this.setIsCreateTransactionModalOpen(open);
            }}
          />
          <LinkButton href={parentUrl}>
            <Icon name="arrow-up" />Parent
          </LinkButton>
        </div>
      </>
    );
  }

  renderTransactionList() {
    const { transactions, transactionsPage, transactionsCount, group, signedInUser, transactionsRange } = this.props;
    const totalPages = Math.ceil(transactionsCount / pageLimit);
    const parentUrl = (group.parent === -1)? `org/groups`:`org/groups/edit/${group.parent}/children`;
    const {isCreateTransactionModalOpen} = this.state;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionInvoicesWrite, admin);

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <InlineField
              label='From'
              labelWidth={8}
              tooltip='Transactions range from date'
            >
              <DateTimePicker
                date={dateTime(dateMath.parse(transactionsRange.from))}
                onChange={(dateTime: DateTime) => {
                      dateTime.add(10, 'hours');
                      this.onFromChange(dateTime.toISOString().split("T")[0]);
                    }}
              />
            </InlineField>
            <InlineField
              label='To'
              labelWidth={8}
              tooltip='Transactions range till date'
            >
              <DateTimePicker
                date={dateTime(dateMath.parse(transactionsRange.to))}
                onChange={(dateTime: DateTime) => {
                      dateTime.add(10, 'hours');
                      this.onToChange(dateTime.toISOString().split("T")[0]);
                    }}
              />
            </InlineField>
            <Button onClick={() => {
              this.fetchTransactions(1, transactionsRange);
            }}>
              Refresh
            </Button>
          </div>
          <Button onClick={() => this.setIsCreateTransactionModalOpen(true)} disabled={!canWrite}>
            Create Transaction
          </Button>
          <CreateTransaction
            isOpen={isCreateTransactionModalOpen}
            onCancel={(open: boolean ) => {
              this.setIsCreateTransactionModalOpen(open);
            }}
          />
          <LinkButton href={parentUrl}>
            <Icon name="arrow-up" />Parent
          </LinkButton>
        </div>

        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Date</th>
                  <th style={{ textAlign: 'center' }}>Description</th>
                  <th style={{ textAlign: 'center' }}>Type</th>
                  <th style={{ textAlign: 'center' }}>Tax</th>
                  <th style={{ textAlign: 'center' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Balance</th>
                  <th style={{ textAlign: 'center' }}>Created By</th>
                </tr>
              </thead>
              <tbody>{transactions.map((transaction) => this.renderTransaction(transaction))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination
                onNavigate={setTransactionsPage}
                currentPage={transactionsPage}
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
    const { transactionsCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }
    if (transactionsCount > 0) {
      return this.renderTransactionList();
    } else {
      return this.renderEmptyList();
    }
  }

  render() {
    return this.renderList();
  }
}
export default connector(TransactionList);


