import React, { PureComponent } from 'react';

import { DeleteButton, LinkButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import config from 'app/core/config';
import { contextSrv, User } from 'app/core/services/context_srv';
import { StoreState, AccessControlAction, Inventory, inventoryPageLimit } from 'app/types';

import { connectWithCleanUp } from '../../../core/components/connectWithCleanUp';

import { deleteInventory, loadInventories } from './state/actions';
import { setInventoriesSearchQuery } from './state/reducers';
import { getInventoriesSearchQuery, getInventories, getInventoriesCount, getInventoriesSearchPage } from './state/selectors';

export interface Props {
  inventories: Inventory[];
  inventoriesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
  loadInventories: typeof loadInventories;
  deleteInventory: typeof deleteInventory;
  setInventoriesSearchQuery: typeof setInventoriesSearchQuery;
  signedInUser: User;
}

export class InventoryList extends PureComponent<Props> {
  componentDidMount() {
    this.fetchInventories('', 1);
  }

  async fetchInventories(query: string, page: number) {
    await this.props.loadInventories(query, page);
  }

  deleteInventory = (inventory: Inventory) => {
    this.props.deleteInventory(inventory.id);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setInventoriesSearchQuery(value);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchInventories(searchQuery, page);
  };

  renderInventory(inventory: Inventory) {
    const inventoryUrl = `org/inventories/edit/${inventory.id}`;
    const fallback = contextSrv.hasRole('ServerAdmin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionInventoriesCreate, fallback);

    return (
      <tr key={inventory.id}>
        <td className="link-td">{canCreate ? <a href={inventoryUrl}>{inventory.uuid}</a> : <>{inventory.uuid}</>}</td>
        <td className="link-td">{canCreate ? <a href={inventoryUrl}>{inventory.type}</a> : <>{inventory.type}</>}</td>
        <td className="text-right">
          <DeleteButton
            aria-label="Delete"
            size="sm"
            disabled={!canCreate}
            onConfirm={() => this.deleteInventory(inventory)}
          />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, fallback);
    const newHref = canCreate ? '/org/inventories/new' : '#';
    const buttonTitle = 'Create  ' + config.resourceLabel.toLowerCase();
    const title = 'No ' + config.resourceLabel.toLowerCase() + 's are available.';
    return <EmptyListCTA title={title} buttonIcon="rss" buttonLink={newHref}  buttonDisabled={!canCreate} buttonTitle={buttonTitle} />;
  }

  renderInventoryList() {
    const { inventories, searchQuery, searchPage, inventoriesCount } = this.props;
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionInventoriesCreate, fallback);
    const disabledClass = canCreate ? '' : ' disabled';
    const newInventoryHref = canCreate ? '/org/inventories/new' : '#';
    const totalPages = Math.ceil(inventoriesCount / inventoryPageLimit);
    const buttonTitle = 'Create  ' + config.resourceLabel.toLowerCase();

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>
          <LinkButton className={disabledClass} href={newInventoryHref}>{buttonTitle}</LinkButton>
        </div>

        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>UUID</th>
                  <th>Type</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{inventories.map((inventory) => this.renderInventory(inventory))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination
                onNavigate={this.onNavigate}
                currentPage={searchPage}
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
    const { inventoriesCount, hasFetched } = this.props;
    if (!hasFetched) {
      return null;
    }
    if (inventoriesCount > 0) {
      return this.renderInventoryList();
    } else {
      return this.renderEmptyList();
    }
  }

  render() {
    const { hasFetched } = this.props;
    return (
      <Page navId="inventories">
        <Page.Contents isLoading={!hasFetched}>{this.renderList()}</Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    inventories: getInventories(state.inventories),
    searchQuery: getInventoriesSearchQuery(state.inventories),
    searchPage: getInventoriesSearchPage(state.inventories),
    inventoriesCount: getInventoriesCount(state.inventories),
    hasFetched: state.inventories.hasFetched,
  };
}

const mapDispatchToProps = {
  loadInventories: loadInventories,
  deleteInventory: deleteInventory,
  setInventoriesSearchQuery,
};

export default connectWithCleanUp(mapStateToProps, mapDispatchToProps, (state) => state.inventories)(InventoryList);
