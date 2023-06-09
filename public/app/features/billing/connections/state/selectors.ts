import { Connection, ConnectionLogsState, ConnectionsState, ConnectionState, ConnectionUsersState, Invoice, InvoicesState, InvoiceState, OrgConfigurationState, QueryRange, TransactionsState, ConnectionResourcesState} from 'app/types';

export const getConnectionsSearchQuery = (state: ConnectionsState) => state.searchQuery;
export const getConnectionsSearchPage = (state: ConnectionsState) => state.searchPage;
export const getConnectionsCount = (state: ConnectionsState) => state.connectionsCount;
export const getConnectionLogs = (state: ConnectionLogsState) => state.connectionLogs;
export const getConnectionLogsSearchPage = (state: ConnectionLogsState) => state.searchPage;
export const getConnectionLogsCount = (state: ConnectionLogsState) => state.connectionLogsCount;
export const getConnectionUsers = (state: ConnectionUsersState) => state.connectionUsers;
export const getConnectionUsersSearchPage = (state: ConnectionUsersState) => state.searchPage;
export const getConnectionUsersCount = (state: ConnectionUsersState) => state.connectionUsersCount;
export const getConnectionResources = (state: ConnectionResourcesState) => state.connectionResources;
export const getConnectionResourcesSearchQuery = (state: ConnectionResourcesState) => state.searchQuery;
export const getConnectionResourcesSearchPage = (state: ConnectionResourcesState) => state.searchPage;
export const getConnectionResourcesCount = (state: ConnectionResourcesState) => state.connectionResourcesCount;
export const getInvoicesCount = (state: InvoicesState) => state.invoicesCount;
export const getInvoicesSearchPage = (state: InvoicesState) => state.searchPage;
export const getInvoicesSearchRange = (state: InvoicesState) => state.searchRange;
export const getTransactionsCount = (state: TransactionsState) => state.searchPage;
export const getTransactionsSearchPage = (state: TransactionsState) => state.transactionsCount;
export const getTransactionsSearchRange = (state: TransactionsState) => state.searchRange;
export const getInvoices = (state: InvoicesState) => state.invoices;
export const getTransactions = (state: TransactionsState) => state.transactions;
export const getConnections = (state: ConnectionsState) => state.connections;

export const getOrgConfigurations = (state: OrgConfigurationState, currentOrgId: any, currentType: string) => {
  if (state.configuration.org_id === parseInt(currentOrgId, 10) && 
      state.configuration.type === currentType) {
    return state.configuration;
  }
  return null
};

export const getConnection = (state: ConnectionState, currentConnectionId: any): Connection | null => {
  if (state.connection.id === parseInt(currentConnectionId, 10)) {
    return state.connection;
  }
  return null;
};

export const getInvoice = (state: InvoiceState, currentInvoiceId: any): Invoice | null => {
  if (state.invoice.id === parseInt(currentInvoiceId, 10)) {
    return state.invoice;
  }
  return null;
};

export const  getDefaultQueryRange = (): QueryRange => {
  const today = new Date();
  const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1, 10);
  return {from: firstDayOfLastMonth.toISOString().split("T")[0], to: today.toISOString().split("T")[0]};
}