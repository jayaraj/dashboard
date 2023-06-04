import { SelectableValue } from '@grafana/data';
import { QueryRange } from "./invoice";

export const transactionsPageLimit = 50;
export const TRANSACTION_TYPES: Array<SelectableValue<string>> = [
  {
    label: 'Debit',
    value: 'debit',
    description: `transactions to charge`,
  },
  {
    label: 'Credit',
    value: 'credit',
    description: `transactions like refunds, discounts and etc`,
  },
  {
    label: 'Payment',
    value: 'payment',
    description: `transactions like payments and etc`,
  },
];

export interface Transaction {
  id: number;
  updated_at: string;
  org_id: number;
  group_id: number;
  type: string;
  tax: number;
  amount: number;
  balance: number;
  description: string;
  login: string;
  context: any;
}

export interface ContextDTO {
  key: string;
  value: string;
}

export interface CreateTransactionDTO {
  tax: number;
  type: string;
  amount: number;
  description: string;
  contexts: any;
}

export interface TransactionsState {
  transactions: Transaction[];
  transactionsCount: number;
  searchPage: number;
  hasFetched: boolean;
  searchRange: QueryRange;
}