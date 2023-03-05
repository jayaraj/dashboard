export interface Invoice {
  id: number;
  updated_at: string;
  old_balance: number;
	amount: number;
	total_credits: number;
  total_payments: number;
  description: string;
  login: string;
}

export interface QueryRange {
  from: string;
  to: string;
}

export interface InvoicesState {
  invoices: Invoice[];
  range: QueryRange;
  page: number;
  count: number;
  hasFetched: boolean;
}

export interface InvoiceState {
  invoice: Invoice;
}