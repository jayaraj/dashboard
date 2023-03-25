import { Group, GroupsState, GroupState, Invoice, InvoicesState, InvoiceState, QueryRange, TransactionsState } from 'app/types';

export const getSearchQuery = (state: GroupsState) => state.searchQuery;
export const getGroupsPage = (state: GroupsState) => state.page;
export const getGroupsCount = (state: GroupsState) => state.count;
export const getResourceSearchQuery = (state: GroupState) => state.resourceSearchQuery;
export const getResourcesCount = (state: GroupState) => state.resourcesCount;
export const getResourcesPage = (state: GroupState) => state.resourcesPage;
export const getUserSearchQuery = (state: GroupState) => state.userSearchQuery;
export const getUsersCount = (state: GroupState) => state.usersCount;
export const getUsersPage = (state: GroupState) => state.usersPage;
export const getGroupId = (state: GroupState) => state.group.id;
export const getGroupConfiguration = (state: GroupState) => state.data;
export const getGroupType = (state: GroupState) => state.type;
export const getChildrenSearchQuery = (state: GroupState) => state.searchChildrenQuery;
export const getInvoicesCount = (state: InvoicesState) => state.count;
export const getInvoicesPage = (state: InvoicesState) => state.page;
export const getInvoicesRange = (state: InvoicesState) => state.range;
export const getTransactionsCount = (state: TransactionsState) => state.page;
export const getTransactionsPage = (state: TransactionsState) => state.count;
export const getTransactionsRange = (state: TransactionsState) => state.range;

export const getGroup = (state: GroupState, currentGroupId: any): Group | null => {
  if (state.group.id === parseInt(currentGroupId, 10)) {
    return state.group;
  }
  return null;
};

export const getInvoice = (state: InvoiceState, currentInvoiceId: any): Invoice | null => {
  if (state.invoice.id === parseInt(currentInvoiceId, 10)) {
    return state.invoice;
  }
  return null;
};


export const getGroups = (state: GroupsState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.groups.filter((group) => {
    return regex.test(group.name);
  });
};

export const getResources = (state: GroupState) => {
  const regex = RegExp(state.resourceSearchQuery, 'i');

  return state.resources.filter((resource) => {
    return regex.test(resource.resource_name);
  });
};

export const getUsers = (state: GroupState) => {
  const regex = RegExp(state.userSearchQuery, 'i');

  return state.users.filter((user) => {
    return regex.test(user.name);
  });
};

export const getChildren = (state: GroupState, currentGroupId: any): Group[] => {
  const regex = RegExp(state.searchChildrenQuery, 'i');

  if (state.group.id === parseInt(currentGroupId, 10) && state.group.groups) {
    return state.group.groups.filter((group) => {
      return regex.test(group.name);
    });
  } else {
    return [];
  }
};

export const getInvoices = (state: InvoicesState) => {
  return state.invoices;
};

export const getTransactions = (state: TransactionsState) => {
  return state.transactions;
};


export const  getDefaultQueryRange = (): QueryRange => {
  const today = new Date();
  const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1, 10);
  return {from: firstDayOfLastMonth.toISOString().split("T")[0], to: today.toISOString().split("T")[0]};
}
