import React, { PureComponent } from 'react';

import { NavModel } from '@grafana/data';
import { DeleteButton, Button, FilterInput, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { contextSrv, User } from 'app/core/services/context_srv';
import { StoreState, AccessControlAction, Bulk } from 'app/types';

import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';

import Upload from './Upload';
import { deleteBulk, loadBulks } from './state/actions';
import { setBulksSearchQuery, setBulksSearchPage } from './state/reducers';
import { getSearchQuery, getBulks, getBulksCount, getBulksSearchPage } from './state/selectors';


const pageLimit = 30;

export interface Props {
  navModel: NavModel;
  bulks: Bulk[];
  searchQuery: string;
  searchPage: number;
  bulksCount: number;
  hasFetched: boolean;
  loadBulks: typeof loadBulks;
  deleteBulk: typeof deleteBulk;
  setBulksSearchQuery: typeof setBulksSearchQuery;
  setBulkSearchPage: typeof setBulksSearchPage;
  signedInUser: User;
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
    this.fetchBulks('', 1, pageLimit);
  }

  async fetchBulks(query: string, page: number, perpage: number) {
    await this.props.loadBulks(query, page, perpage);
  }

  setUploadOpen = (open: boolean) => {
    this.setState({ isUploadOpen: open });
  }

  deleteBulk = (bulk: Bulk) => {
    this.props.deleteBulk(bulk.id, pageLimit);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setBulksSearchQuery(value);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchBulks(searchQuery, page, pageLimit);
  };

  renderBulk(bulk: Bulk) {
    const { signedInUser } = this.props;
    const bulkUrl = (bulk.errors > 0) ? `org/bulks/${bulk.id}/errors`: `#`;
    const admin = signedInUser.isGrafanaAdmin;
    const canRead = contextSrv.hasAccess(AccessControlAction.ActionBulksRead, admin);
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionBulksWrite, admin);

    return (
      <tr key={bulk.id}>
        <td className="link-td">{canRead ? <a href={bulkUrl}>{bulk.filename}</a> : <>{bulk.filename}</>}</td>
        <td className="link-td">{canRead ? <a href={bulkUrl}>{bulk.initiated}</a> : <>{bulk.initiated}</>}</td>
        <td className="link-td">{canRead ? <a href={bulkUrl}>{bulk.processed}</a> : <>{bulk.processed}</>}</td>
        <td className="link-td">{canRead ? <a href={bulkUrl}>{bulk.errors}</a> : <>{bulk.errors}</>}</td>
        <td className="link-td">{canRead ? <a href={bulkUrl}>{bulk.updated_at.split("T")[0]}</a> : <>{bulk.updated_at.split("T")[0]}</>}</td>
        <td className="text-right">
          <DeleteButton
            aria-label="Delete"
            size="sm"
            disabled={!canWrite}
            onConfirm={() => this.deleteBulk(bulk)}
          />
        </td>
      </tr>
    );
  }

  renderBulkList() {
    const { bulks, searchQuery, signedInUser, searchPage, bulksCount } = this.props;
    const canWrite = contextSrv.hasAccess(AccessControlAction.ActionBulksWrite, signedInUser.isGrafanaAdmin);
    const totalPages = Math.ceil(bulksCount / pageLimit);
    const { isUploadOpen } = this.state;

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>
          <Button onClick={() => this.setUploadOpen(true)} disabled={!canWrite}>
            Create batch processes
          </Button>
          <Upload
            isOpen={isUploadOpen}
            onCancel={(open: boolean ) => {
              this.setUploadOpen(open);
            }}
          />
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
    navModel: getNavModel(state.navIndex, 'bulks'),
    bulks: getBulks(state.bulks),
    searchQuery: getSearchQuery(state.bulks),
    searchPage: getBulksSearchPage(state.bulks),
    bulksCount: getBulksCount(state.bulks),
    hasFetched: state.bulks.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadBulks,
  deleteBulk,
  setBulksSearchQuery,
  setBulksSearchPage,
};

export default connectWithCleanUp(
  mapStateToProps,
  mapDispatchToProps,
  (state) => state.bulks
)(BulkList);
