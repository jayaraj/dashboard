import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Themeable2, withTheme2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import FixedChargeSettings from './FixedChargeSettings';
import { loadFixedCharge } from './state/actions';
import { getFixedChargeLoadingNav } from './state/navModel';
import { getFixedCharge } from './state/selectors';

interface FixedChargePageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<FixedChargePageRouteParams>, Themeable2 {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const fixedChargeId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'settings';
  const fixedChargeLoadingNav = getFixedChargeLoadingNav(pageName as string);
  const pageNav = getNavModel(state.navIndex, `fixedcharge-${pageName}-${fixedChargeId}`, fixedChargeLoadingNav).main;
  const fixedCharge = getFixedCharge(state.fixedCharge, fixedChargeId);

  return {
    pageNav,
    fixedChargeId: fixedChargeId,
    pageName: pageName,
    fixedCharge,
  };
}

const mapDispatchToProps = {
  loadFixedCharge,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class FixedChargePages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchFixedCharge();
  }

  async fetchFixedCharge() {
    const { loadFixedCharge, fixedChargeId } = this.props;
    this.setState({ 
      isLoading: true,
    });
    const response = await loadFixedCharge(fixedChargeId);
    this.setState({ isLoading: false });
    return response;
  }

  getCurrentPage() {
    const pages = ['settings'];
    const currentPage = this.props.pageName;
    return includes(pages, currentPage) ? currentPage : pages[0];
  }

  renderPage(): React.ReactNode {
    const currentPage = this.getCurrentPage();
    const { fixedCharge } = this.props;
    switch (currentPage) {
      case PageTypes.Settings:
        return <FixedChargeSettings fixedCharge={fixedCharge!} />;
    }
    return null;
  }

  render() {
    const { fixedCharge, pageNav } = this.props;

    return (
      <Page navId="fixedcharges" pageNav={pageNav}>
        <Page.Contents isLoading={this.state.isLoading}>
          {fixedCharge && Object.keys(fixedCharge).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(withTheme2(FixedChargePages));
