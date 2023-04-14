import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import InventorySettings from './InventorySettings';
import { loadInventory } from './state/actions';
import { getInventoryLoadingNav } from './state/navModel';
import { getInventory } from './state/selectors';

interface InventoryPageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<InventoryPageRouteParams> {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const inventoryId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'settings';
  const inventoryLoadingNav = getInventoryLoadingNav(pageName as string);
  const navModel = getNavModel(state.navIndex, `inventory-${pageName}-${inventoryId}`, inventoryLoadingNav);
  const inventory = getInventory(state.inventory, inventoryId);

  return {
    navModel,
    inventoryId: inventoryId,
    pageName: pageName,
    inventory,
  };
}

const mapDispatchToProps = {
  loadInventory,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class InventoryPages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchInventory();
  }

  async fetchInventory() {
    const { loadInventory, inventoryId } = this.props;
    this.setState({ 
      isLoading: true,
    });
    const response = await loadInventory(inventoryId);
    this.setState({ isLoading: false });
    return response;
  }

  getCurrentPage() {
    const pages = ['settings'];
    const currentPage = this.props.pageName;
    return includes(pages, currentPage) ? currentPage : pages[0];
  }

  textsAreEqual = (text1: string, text2: string) => {
    if (!text1 && !text2) {
      return true;
    }

    if (!text1 || !text2) {
      return false;
    }

    return text1.toLocaleLowerCase() === text2.toLocaleLowerCase();
  };

  renderPage(): React.ReactNode {
    const currentPage = this.getCurrentPage();
    const { inventory } = this.props;
    switch (currentPage) {
      case PageTypes.Settings:
        return <InventorySettings inventory={inventory!} />;
    }

    return null;
  }

  render() {
    const { inventory, navModel } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          {inventory && Object.keys(inventory).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(InventoryPages);
