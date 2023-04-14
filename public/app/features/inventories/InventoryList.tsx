import React, { PureComponent } from 'react';

import { NavModel } from '@grafana/data';
import { DeleteButton, LinkButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv, User } from 'app/core/services/context_srv';
import { StoreState, AccessControlAction, Inventory } from 'app/types';

import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';

import { deleteInventory, loadInventories } from './state/actions';
import { setSearchQuery, setInventorySearchPage } from './state/reducers';
import { getSearchQuery, getInventories, getInventoriesCount, getInventorySearchPage } from './state/selectors';


const pageLimit = 10;

export interface Props {
  navModel: NavModel;
  inventories: Inventory[];
  searchQuery: string;
  searchPage: number;
  inventoriesCount: number;
  hasFetched: boolean;
  loadInventories: typeof loadInventories;
  deleteInventory: typeof deleteInventory;
  setSearchQuery: typeof setSearchQuery;
  setInventorySearchPage: typeof setInventorySearchPage;
  signedInUser: User;
}

export class InventoryList extends PureComponent<Props> {
  componentDidMount() {
    this.fetchInventories('', 1, pageLimit);
  }

  async fetchInventories(query: string, page: number, perpage: number) {
    await this.props.loadInventories(query, page, perpage);
  }

  deleteInventory = (inventory: Inventory) => {
    this.props.deleteInventory(inventory.id, pageLimit);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setSearchQuery(value);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchInventories(searchQuery, page, pageLimit);
  };

  renderInventory(inventory: Inventory) {
    const { signedInUser } = this.props;
    const inventoryUrl = `org/inventories/edit/${inventory.id}`;
    const admin = signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canRead = contextSrv.hasAccess(AccessControlAction.ActionInventoriesRead, admin);
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionInventoriesWrite, admin);

    return (
      <tr key={inventory.id}>
        <td className="link-td">{canRead ? <a href={inventoryUrl}>{inventory.uuid}</a> : <>{inventory.uuid}</>}</td>
        <td className="link-td">{canRead ? <a href={inventoryUrl}>{inventory.type}</a> : <>{inventory.type}</>}</td>
        <td className="text-right">
          <DeleteButton
            aria-label="Delete"
            size="sm"
            disabled={!canWrite}
            onConfirm={() => this.deleteInventory(inventory)}
          />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const admin = this.props.signedInUser.isGrafanaAdmin || contextSrv.hasRole('Admin');
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionInventoriesWrite, admin);
    const newHref = canWrite ? '/org/inventories/new' : '#';
    const buttonTitle = ' New Inventory';
    const title = 'No inventories are created yet.';
    return <EmptyListCTA title={title} buttonIcon="rss" buttonLink={newHref} buttonTitle={buttonTitle} />;
  }

  renderInventoryList() {
    const { inventories, searchQuery, signedInUser, searchPage, inventoriesCount } = this.props;
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionInventoriesWrite, signedInUser.isGrafanaAdmin);
    const disabledClass = canWrite ? '' : ' disabled';
    const newInventoryHref = canWrite ? '/org/inventories/new' : '#';
    const totalPages = Math.ceil(inventoriesCount / pageLimit);

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>

          <LinkButton className={disabledClass} href={newInventoryHref}>
            New Inventory
          </LinkButton>
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
    const { hasFetched, navModel } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={!hasFetched}>{this.renderList()}</Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    navModel: getNavModel(state.navIndex, 'inventories'),
    inventories: getInventories(state.inventories),
    searchQuery: getSearchQuery(state.inventories),
    searchPage: getInventorySearchPage(state.inventories),
    inventoriesCount: getInventoriesCount(state.inventories),
    hasFetched: state.inventories.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadInventories,
  deleteInventory,
  setSearchQuery,
  setInventorySearchPage,
};

export default connectWithCleanUp(
  mapStateToProps,
  mapDispatchToProps,
  (state) => state.inventories
)(InventoryList);
