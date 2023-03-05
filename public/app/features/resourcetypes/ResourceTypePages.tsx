import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import ResourceTypeSettings from './ResourceTypeSettings';
import SlabSettings  from './SlabSettings';
import { loadResourceType } from './state/actions';
import { getResourceTypeLoadingNav } from './state/navModel';
import { getResourceType, getSlab } from './state/selectors';

interface ResourceTypePageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<ResourceTypePageRouteParams> {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Settings = 'settings',
  Slab = 'slab',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const resourceTypeId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'settings';
  const resourceTypeLoadingNav = getResourceTypeLoadingNav(pageName as string);
  const navModel = getNavModel(state.navIndex, `resourcetype-${pageName}-${resourceTypeId}`, resourceTypeLoadingNav);
  const resourceType = getResourceType(state.resourceType, resourceTypeId);
  const slab = getSlab(state.slab, resourceType?.type)

  return {
    navModel,
    resourceTypeId: resourceTypeId,
    pageName: pageName,
    resourceType,
    slab,
  };
}

const mapDispatchToProps = {
  loadResourceType,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class ResourceTypePages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchResourceType();
  }

  async fetchResourceType() {
    const { loadResourceType, resourceTypeId } = this.props;
    this.setState({ 
      isLoading: true,
    });
    const response = await loadResourceType(resourceTypeId);
    this.setState({ isLoading: false });
    return response;
  }

  getCurrentPage() {
    const pages = ['settings', 'slab'];
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
    const { resourceType, slab } = this.props;
    switch (currentPage) {
      case PageTypes.Settings:
        return <ResourceTypeSettings resourceType={resourceType!} />;
      case PageTypes.Slab:
          return <SlabSettings slab={slab!} />;
    }

    return null;
  }

  render() {
    const { resourceType, navModel } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          {resourceType && Object.keys(resourceType).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(ResourceTypePages);
