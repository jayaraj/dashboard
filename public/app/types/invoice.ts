export interface Invoice {
  id: number;
  group_id: number;
  updated_at: string;
  old_balance: number;
	amount: number;
	total_credits: number;
  total_payments: number;
  description: string;
  login: string;
  from: string;
  to: string;
  name: string;
  path: string;
  informations: InvoiceInformation[];
}

export interface InvoiceInformation {
  id: number;
  updated_at: string;
  invoice_id: number;
  uuid: string;
  name: string;
  type: string;
  constant: number;
  previous_reading: number;
  current_reading: number;
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
  query: string;
}

export interface InvoiceState {
  invoice: Invoice;
}
