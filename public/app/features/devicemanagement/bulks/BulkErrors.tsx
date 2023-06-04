import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Themeable2, withTheme2, VerticalGroup, HorizontalGroup, Pagination, LinkButton } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { BulkError, bulkErrorPageLimit, StoreState } from 'app/types';

import { loadBulkErrors } from './state/actions';
import { getBulkErrors, getBulkErrorsCount, getBulkErrorsSearchPage } from './state/selectors';

interface State {
  isLoading: boolean;
}

export interface OwnProps extends GrafanaRouteComponentProps<{ id: string }>, Themeable2 {}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const bulkId = parseInt(props.match.params.id, 10);
  const errors = getBulkErrors(state.bulkErrors);
  const searchPage =  getBulkErrorsSearchPage(state.bulkErrors);
  const errorsCount = getBulkErrorsCount(state.bulkErrors);
  
  return {
    bulkId: bulkId,
    bulkErrors: errors,
    searchPage: searchPage,
    bulkErrorsCount: errorsCount,
  };
}

const mapDispatchToProps = {
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
    const { bulkId } = this.props;
    const { isLoading } = this.state;
    if (!isLoading) {
      await this.fetchBulkErrors(bulkId, 1)
    }
  }

  async fetchBulkErrors(id: number, page: number) {
    const { loadBulkErrors } = this.props;
    await loadBulkErrors(id, page);
  }

  onNavigate = async (page: number) => {
    const { bulkId } = this.props;
    await this.fetchBulkErrors(bulkId, page)
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
    const { bulkErrors, searchPage, bulkErrorsCount } = this.props;
    const totalPages = Math.ceil(bulkErrorsCount / bulkErrorPageLimit);
    
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
              <tbody>{bulkErrors.map((error) => this.renderError(error))}</tbody>
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
    return (
      <Page navId="bulks">
        <Page.Contents isLoading={this.state.isLoading}>
          {this.renderList()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(withTheme2(BulkErrors));

