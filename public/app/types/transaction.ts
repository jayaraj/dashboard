import { QueryRange } from "./invoice";

export interface TransactionsState {
  transactions: Transaction[];
  page: number;
  count: number;
  hasFetched: boolean;
  range: QueryRange;
}

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