import { css } from '@emotion/css';
import numberToWords from "number-to-words";
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { Connection, Invoice, Transaction } from 'app/types';

interface InvoiceTableProps {
  connection: Connection;
  orgConfiguration: any;
  invoice: Invoice;
  transactions: Transaction[];
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({ connection, orgConfiguration, invoice, transactions }) => {
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
                          <tr><td>Invoice #:</td><td>{invoice?.invoice_ext}</td></tr>
                          <tr><td>Account #:</td><td>{connection?.connection_ext}</td></tr>
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
                      {orgConfiguration.name}<br />
                      <span style={{ fontSize: '14px' }}>{orgConfiguration.address1}</span><br />
                      <span style={{ fontSize: '14px' }}>{orgConfiguration.address2}</span><br />
                      <span style={{ fontSize: '14px' }}>{orgConfiguration.city}-{orgConfiguration.pincode}</span>
                    </td>

                    <td className={styles.information}>
                      {connection.name}<br />
                      <span style={{ fontSize: '14px' }}>{connection.address1}</span><br />
                      <span style={{ fontSize: '14px' }}>{connection.address2}</span><br />
                      <span style={{ fontSize: '14px' }}>{connection.city}-{connection.pincode}</span>
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
                <tr><td>Credits</td><td><span>-</span>{invoice?.total_credits}</td></tr>
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
                  <tr><td>Payments</td><td><span>-</span>{invoice?.total_payments}</td></tr>
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
                  <tr><td>Previous Balance</td><td>{invoice?.old_balance}</td></tr>
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

export default InvoiceTable;

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