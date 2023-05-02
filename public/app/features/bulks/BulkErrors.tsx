import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { NavModel } from '@grafana/data';
import { Themeable2, withTheme2, VerticalGroup, HorizontalGroup, Pagination, LinkButton } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { BulkError, StoreState } from 'app/types';

import { loadBulk, loadBulkErrors } from './state/actions';
import { getBulk, getBulkErrors, getBulkErrorsCount, getBulkErrorsSearchPage } from './state/selectors';

const pageLimit = 30;

interface BulkPageRouteParams {
  bulkId: string;
}

export interface OwnProps extends GrafanaRouteComponentProps<BulkPageRouteParams>, Themeable2 {
  match: any;
  navModel: NavModel;
}

interface State {
  isLoading: boolean;
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const bulkId = parseInt(props.match.params.bulkId, 10);
  const bulk = getBulk(state.bulk, bulkId);
  const navModel = getNavModel(state.navIndex, 'bulks');
  const errors = getBulkErrors(state.bulk);
  const searchPage =  getBulkErrorsSearchPage(state.bulk);
  const errorsCount = getBulkErrorsCount(state.bulk);
  
  return {
    navModel: navModel,
    bulkId: bulkId,
    bulk: bulk,
    errors: errors,
    searchPage: searchPage,
    errorsCount: errorsCount,
  };
}

const mapDispatchToProps = {
  loadBulk,
  loadBulkErrors,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export class BulkErrors extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    const { bulk, bulkId } = this.props;
    const { isLoading } = this.state;
    if ((!isLoading) && (bulk === null || (bulk && bulk!.id !== bulkId))) {
      await this.fetchBulk();
      await this.fetchBulkErrors(bulkId, 1, pageLimit)
    }
  }

  async fetchBulk() {
    const { loadBulk, bulkId } = this.props;
    this.setState({ 
      isLoading: true,
    });
    const response = await loadBulk(bulkId, pageLimit);
    this.setState({ isLoading: false });
    return response;
  }

  async fetchBulkErrors(id: number, page: number, perPage: number) {
    const { loadBulkErrors } = this.props;
    await loadBulkErrors(id, page, perPage);
  }

  onNavigate = async (page: number) => {
    const { bulkId } = this.props;
    await this.fetchBulkErrors(bulkId, page, pageLimit)
  };

  renderError(error: BulkError) {
    const records = Object.keys(error.configuration).filter((key) => !key.includes('__'));
    return (
      <tr key={error.id}> 
        <td style={{ whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
          {
            records.map((key, index) => {
              return (
                <span key={key}>
                  {key}={error.configuration[key]}{(index !== records.length-1)&&(', ')} 
                </span>
              );
            })
          }
        </td>
        <td style={{ whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{error.error}</td>
      </tr>
    );
  }

  renderList() {
    const { errors, searchPage, errorsCount } = this.props;
    const totalPages = Math.ceil(errorsCount / pageLimit);
    
    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
          </div>
          <LinkButton href={`org/bulks`}>
            Back
          </LinkButton>
        </div>
        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Record</th>
                  <th style={{ textAlign: 'center' }}>Error</th>
                </tr>
              </thead>
              <tbody>{errors.map((error) => this.renderError(error))}</tbody>
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

  render() {
    const { navModel } = this.props;
    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          {this.renderList()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(withTheme2(BulkErrors));

