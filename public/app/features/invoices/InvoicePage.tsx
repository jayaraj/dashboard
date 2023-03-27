import { css } from '@emotion/css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import numberToWords from "number-to-words";
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { NavModel, GrafanaTheme2 } from '@grafana/data';
import { Themeable2, withTheme2, useStyles2, LinkButton, Icon, Button } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv } from 'app/core/services/context_srv';
import { Invoice, StoreState, Transaction } from 'app/types';

import { loadInvoiceTransactions } from '../groups/state/actions';
import { getInvoice, getTransactions } from '../groups/state/selectors';

import { loadInvoice } from './state/actions';

const pageLimit = 30;

interface InvoicePageRouteParams {
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
  const invoiceId = parseInt(props.match.params.invoiceId, 10);
  const invoice = getInvoice(state.invoice, invoiceId);
  const transactions = getTransactions(state.transactions);
  const navModel = getNavModel(state.navIndex, 'invoices');

  return {
    navModel: navModel,
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
    const { invoice, invoiceId } = this.props;
    const { isLoading } = this.state;
    if ((!isLoading) && (invoice === null || (invoice && invoice!.id !== invoiceId))) {
      await this.fetchInvoice();
    }
  }

  async fetchInvoice() {
    const { loadInvoice, loadInvoiceTransactions, invoiceId } = this.props;
    this.setState({ isLoading: true });
    const response = await loadInvoice( invoiceId);
    const { invoice } = this.props;
    await loadInvoiceTransactions(invoice!.group_id, invoiceId, 1, pageLimit);
    this.setState({ isLoading: false });
    return response;
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
    const { navModel, invoice, transactions, signedInUser } = this.props;
    const invoicesUrl = `org/invoices`;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          <div className="page-action-bar">
            <div className="gf-form gf-form--grow">
            </div>
            <Button onClick={this.generatePDF}>
              Download
            </Button>
            <LinkButton href={invoicesUrl}>
              <Icon name="arrow-left" />Back
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
  const capitalizeWords = (str: string) => {
    return str
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const styles = useStyles2(getStyles);
  const date = new Date( invoice?.updated_at );
  const from = new Date( invoice?.from );
  const to = new Date( invoice?.to );
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const words = capitalizeWords(numberToWords.toWords(invoice?invoice.amount:0));
  return (
    <div id="invoicepage" className={styles.container}>
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
              <table className={styles.invoiceinfotable}>
                <tbody>
                  <tr>
                    <td className={styles.information}>
                      Billing Period:<br />
                    </td>
                    <td className={styles.details}>
                      {from.toLocaleDateString('en-GB')} - {to.toLocaleDateString('en-GB')}<br />
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.information}>
                      Consumption Details:<br />
                    </td>
                  </tr>
                  {
                    invoice?.informations.map((info, index) => {return (
                      <tr key={index}>
                        <td className={styles.detailsleft}>
                          {info.name}<br />
                          {info.uuid}<br />
                        </td>
                        <td className={styles.details}>
                          {info.type}<br />
                        </td>
                        <td className={styles.details}>
                          <table className={styles.invoice}>
                            <tbody>
                              <tr><td>Constant:</td><td>{info.constant}</td></tr>
                              <tr><td>Previous Reading:</td><td>{info.previous_reading}</td></tr>
                              <tr><td>Current Reading:</td><td>{info.current_reading}</td></tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )})
                  }
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
                  <tr className={styles.item} key={index}>
                    <td>
                      <div className={styles.description}>{transaction.description}</div>
                      <div className={styles.context}>
                        {
                          Object.keys(transaction.context).map((key, index) => {
                            return (
                              <span key={key}>
                                {key}={transaction.context[key]}{(index !== Object.keys(transaction.context).length-1)&&(', ')} 
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
                  <tr className={styles.lastitem} key={index}>
                    <td>
                      <div className={styles.description}>{transaction.description}</div>
                      <div className={styles.context}>
                        {
                          Object.keys(transaction.context).map((key, index) => {
                            return (
                              <span key={index}>
                                {key}={transaction.context[key]}{(index !== Object.keys(transaction.context).length-1)&&(', ')}
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
                  <tr><td></td><td className={styles.words}>{words}</td></tr>
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
      font-size: 14px;
      line-height: 1.5;
    `,
    context: css`
      font-size: 12px;
      font-style: italic;
      margin-right: 5px;
      font-weight: 400;
    `,
    words: css`
    font-size: 12px;
    font-weight: 400;
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
    invoiceinfotable: css`
      width: 100%;
      line-height: inherit;
      text-align: left;
      border-collapse: collapse;
      td {
        vertical-align: middle;
      }
    `,
    details: css `
      font-size: 14px;
      line-height: 1.5;
      text-align: center;
    `,
    detailsleft: css `
      font-size: 14px;
      line-height: 1.5;
      text-align: left;
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

