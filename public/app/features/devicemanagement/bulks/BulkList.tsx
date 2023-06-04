import React, { PureComponent } from 'react';

import { DeleteButton, Button, FilterInput, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv} from 'app/core/services/context_srv';
import { StoreState, AccessControlAction, Bulk, bulkPageLimit } from 'app/types';

import { connectWithCleanUp } from '../../../core/components/connectWithCleanUp';

import Upload from './Upload';
import { deleteBulk, loadBulks } from './state/actions';
import { setBulksSearchQuery } from './state/reducers';
import { getBulksSearchQuery, getBulks, getBulksCount, getBulksSearchPage } from './state/selectors';

export interface Props {
  bulks: Bulk[];
  searchQuery: string;
  searchPage: number;
  bulksCount: number;
  hasFetched: boolean;
  loadBulks: typeof loadBulks;
  deleteBulk: typeof deleteBulk;
  setBulksSearchQuery: typeof setBulksSearchQuery;
}

export interface State {
  isUploadOpen: boolean;
}

export class BulkList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isUploadOpen: false };
  }

  componentDidMount() {
    this.fetchBulks('', 1);
  }

  async fetchBulks(query: string, page: number) {
    await this.props.loadBulks(query, page);
  }

  setUploadOpen = (open: boolean) => {
    this.setState({ isUploadOpen: open });
  }

  deleteBulk = (bulk: Bulk) => {
    this.props.deleteBulk(bulk.id);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setBulksSearchQuery(value);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchBulks(searchQuery, page);
  };

  renderBulk(bulk: Bulk) {
    const bulkUrl = (bulk.errors > 0) ? `org/bulks/${bulk.id}/errors`: `#`;
    const fallback = contextSrv.hasRole('ServerAdmin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionBulksCreate, fallback);

    return (
      <tr key={bulk.id}>
        <td className="link-td">{canCreate ? <a href={bulkUrl}>{bulk.filename}</a> : <>{bulk.filename}</>}</td>
        <td className="link-td">{canCreate ? <a href={bulkUrl}>{bulk.initiated}</a> : <>{bulk.initiated}</>}</td>
        <td className="link-td">{canCreate ? <a href={bulkUrl}>{bulk.processed}</a> : <>{bulk.processed}</>}</td>
        <td className="link-td">{canCreate ? <a href={bulkUrl}>{bulk.errors}</a> : <>{bulk.errors}</>}</td>
        <td className="link-td">{canCreate ? <a href={bulkUrl}>{bulk.updated_at.split("T")[0]}</a> : <>{bulk.updated_at.split("T")[0]}</>}</td>
        <td className="text-right">
          <DeleteButton aria-label="Delete" size="sm" disabled={!canCreate} onConfirm={() => this.deleteBulk(bulk)}/>
        </td>
      </tr>
    );
  }

  renderBulkList() {
    const { bulks, searchQuery, searchPage, bulksCount } = this.props;
    const fallback = contextSrv.hasRole('ServerAdmin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionBulksCreate, fallback);
    const totalPages = Math.ceil(bulksCount / bulkPageLimit);
    const { isUploadOpen } = this.state;

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>
          <Button onClick={() => this.setUploadOpen(true)} disabled={!canCreate}>
            Create batch processes
          </Button>
          <Upload isOpen={isUploadOpen} onCancel={(open: boolean ) => this.setUploadOpen(open)}/>
        </div>
        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Intiated</th>
                  <th>Processed</th>
                  <th>Errors</th>
                  <th>Date</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{bulks.map((bulk) => this.renderBulk(bulk))}</tbody>
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
    const { hasFetched } = this.props;
    if (!hasFetched) {
      return null;
    }
    return this.renderBulkList();
  }

  render() {
    const { hasFetched } = this.props;
    return (
      <Page navId="bulks">
        <Page.Contents isLoading={!hasFetched}>{this.renderList()}</Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    bulks: getBulks(state.bulks),
    searchQuery: getBulksSearchQuery(state.bulks),
    searchPage: getBulksSearchPage(state.bulks),
    bulksCount: getBulksCount(state.bulks),
    hasFetched: state.bulks.hasFetched,
  };
}

const mapDispatchToProps = {
  loadBulks,
  deleteBulk,
  setBulksSearchQuery,
};

export default connectWithCleanUp( mapStateToProps, mapDispatchToProps, (state) => state.bulks)(BulkList);
