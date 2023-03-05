import { css } from '@emotion/css';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { NavModel, GrafanaTheme2 } from '@grafana/data';
import { Themeable2, withTheme2, useStyles2, LinkButton, Icon } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv } from 'app/core/services/context_srv';
import { Invoice, StoreState, Transaction } from 'app/types';

import { loadInvoice, loadInvoiceTransactions } from './state/actions';
import { getGroupLoadingNav } from './state/navModel';
import { getInvoice, getTransactions } from './state/selectors';



const pageLimit = 30;

interface InvoicePageRouteParams {
  groupId: string;
  invoiceId: string;
}

export interface OwnProps extends GrafanaRouteComponentProps<InvoicePageRouteParams>, Themeable2 {
  match: any;
  navModel: NavModel;
}

interface State {
  isLoading: boolean;
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const groupId = parseInt(props.match.params.groupId, 10);
  const invoiceId = parseInt(props.match.params.invoiceId, 10);
  const invoice = getInvoice(state.invoice, invoiceId);
  const transactions = getTransactions(state.transactions);
  const groupLoadingNav = getGroupLoadingNav('invoices');
  const navModel = getNavModel(state.navIndex, `group-invoices-${groupId}`, groupLoadingNav);

  return {
    navModel: navModel,
    groupId: groupId,
    invoiceId: invoiceId,
    invoice: invoice,
    transactions: transactions,
    signedInUser:  contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadInvoice,
  loadInvoiceTransactions,
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
    const { loadInvoice, loadInvoiceTransactions, invoiceId, groupId } = this.props;
    this.setState({ isLoading: true });
    const invoice = await loadInvoice(groupId, invoiceId);
    await loadInvoiceTransactions(groupId, invoiceId, 1, pageLimit);
    this.setState({ isLoading: false });
    return invoice;
  }

  render() {
    const { navModel, invoice, transactions, signedInUser, groupId } = this.props;
    const invoicesUrl = `org/groups/edit/${groupId}/invoices`;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          <div className="page-action-bar">
            <div className="gf-form gf-form--grow">
            </div>
            <LinkButton href={invoicesUrl}>
              <Icon name="arrow-up" />Invoices
            </LinkButton>
          </div>
          <InvoiceTable orgname={signedInUser.orgName} name={signedInUser.name} email={signedInUser.email}  invoice={invoice!} transactions={transactions}></InvoiceTable>
        </Page.Contents>
      </Page>
    );
  }
}


export default connector(withTheme2(InvoicePage));

interface InvoiceTableProps {
  orgname: string;
  name: string;
  email: string;
  invoice: Invoice;
  transactions: Transaction[];
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ orgname, name, email, invoice, transactions }) => {
  const styles = useStyles2(getStyles);
  const date = new Date( invoice?.updated_at );
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return (
    <div className={styles.container}>
      <table className={styles.outertable}>
        <tbody>
          <tr>
            <td colSpan={3}>
              <table className={styles.innertable}>
                <tbody>
                  <tr>
                    <td className={styles.title}>
                      <h2>Invoice</h2>
                    </td>
                    <td>
                      <table className={styles.invoice}>
                        <tbody>
                          <tr><td>Invoice #:</td><td>{invoice?.id}</td></tr>
                          <tr><td>Created:</td><td>{date.toLocaleDateString('en-GB')}</td></tr>
                          <tr><td>Due:</td><td>{lastDay.toLocaleDateString('en-GB')}</td></tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td colSpan={3}>
              <table className={styles.innertable}>
                <tbody>
                  <tr>
                    <td className={styles.information}>
                      {orgname}.<br />
                    </td>

                    <td className={styles.information}>
                      {name}<br />
                      {email}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <tr className={styles.heading}>
            <td>Item</td>
            <td className="tax">Tax</td>
            <td>Price</td>
          </tr>

          {
            transactions?.map((transaction, index) => {return (
              <>
                {(index < transactions?.length-1) && (
                  <tr className={styles.item}>
                    <td>
                      <div className={styles.description}>{transaction.description}</div>
                      <div className={styles.context}>
                        {
                          Object.keys(transaction.context).map((key) => {
                            return (
                              <span key="{key}">
                                {key}={transaction.context[key]} 
                              </span>
                            );
                          })
                        }
                      </div>
                    </td>
                    <td className="tax">{transaction.tax}</td>
                    <td>{(transaction.type !== 'debit')&&(<span>-</span>)}{transaction.amount}</td>
                  </tr>
                )} 
                {(index === transactions?.length-1) && (
                  <tr className={styles.lastitem}>
                    <td>
                      <div>{transaction.description}</div>
                      <div className={styles.context}>
                        {
                          Object.keys(transaction.context).map((key) => {
                            return (
                              <span key="{key}">
                                {key}={transaction.context[key]} 
                              </span>
                            );
                          })
                        }
                      </div>
                    </td>
                    <td className="tax">{transaction.tax}</td>
                    <td>{(transaction.type !== 'debit')&&(<span>-</span>)}{transaction.amount}</td>
                  </tr>
                )}
              </>
            )})
          }
          <tr className={styles.creditspayments}>
            <td></td>
            <td></td>
            <td className="value">
            <table>
              <tbody>
                <tr><td>Credits</td><td>{invoice?.total_credits}</td></tr>
              </tbody>
            </table>
            </td>
          </tr>
          <tr className={styles.creditspayments}>
            <td></td>
            <td></td>
            <td className="value">
              <table>
                <tbody>
                  <tr><td>Payments</td><td>{invoice?.total_payments}</td></tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr className={styles.total}>
            <td></td>
            <td></td>
            <td className="value">
              <table>
                <tbody>
                  <tr><td>Total</td><td>{invoice?.amount}</td></tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
			</table>
    </div>
  );
};

InvoiceTable.displayName = 'InvoiceTable';

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      background-size: cover;
      align-items: center;
      flex-direction: column;
      max-width: 800px;
      margin: auto;
      padding: 30px;
      border: 1px solid #eee;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
      font-size: 16px;
      line-height: 24px;
      font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
      color: #555;
    `,
    outertable: css`
      width: 100%;
      line-height: inherit;
      text-align: left;
      border-collapse: collapse;
        
      td {
        padding: 5px;
        vertical-align: top;
      }

      .tax {
        text-align: center;
        vertical-align: top;
      }

      td:nth-child(3) {
        text-align: right;
        vertical-align: top;
      }
  `,
    description: css`
      font-weight: 500;
      font-size: 14px;
      line-height: 1.5;
    `,
    context: css`
      font-size: 12px;
      font-style: italic;
    `,
    title: css`
      font-size: 45px;
      line-height: 45px;
      color: #333;
    `,
    invoice: css`
      width: 100%;
      line-height: inherit;
      text-align: right;
      tr td {
        width: 70%;
        padding: 0px;
        vertical-align: middle;
      }
    `,
    innertable: css`
      width: 100%;
      line-height: inherit;
      text-align: left;
      border-collapse: collapse;

      td {
        padding-bottom: 20px;
        vertical-align: middle;
      }

      h2 {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      tr td:nth-child(2) {
        text-align: right;
        vertical-align: top;
      }
    `,
    information: css`
      padding-bottom: 40px;
    `,
    heading: css`
      td {
        background: #eee;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
      }
    `,
    item: css`
      td {
        border-bottom: 1px solid #eee;
      }
    `,
    lastitem: css`
      td {
        border-bottom: none;
      }
    `,
    creditspayments: css`
      .value {
        border-top: 1px solid #eee;
        font-weight: bold;
        table {
          width: 100%;
          text-align: right;
          vertical-align: top;
          td:nth-child(1) {
            text-align: left;
          }
        }
      }
    `,
    total: css`
      .value {
        border-top: 2px solid #eee;
        font-weight: bold;
        table {
          width: 100%;
          text-align: right;
          vertical-align: top;
          td:nth-child(1) {
            text-align: left;
          }
        }
      }
    `,
  };
};

