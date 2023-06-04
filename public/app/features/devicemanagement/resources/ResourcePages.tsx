import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Themeable2, withTheme2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import ResourceGroupList from './ResourceGroupList';
import ResourceSettings from './ResourceSettings';
import { loadResource } from './state/actions';
import { getPageNav } from './state/navModel';
import { getResource } from './state/selectors';

interface ResourcePageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<ResourcePageRouteParams>, Themeable2 {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Groups = 'groups',
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const resourceId = parseInt(props.match.params.id, 10);
  const resource = getResource(state.resource, resourceId);
  const pageName = props.match.params.page || 'groups';
  const resourceLoadingNav = getPageNav(pageName as string);
  const pageNav = getNavModel(state.navIndex, `resource-${pageName}-${resourceId}`, resourceLoadingNav).main;

  return {
    pageNav,
    resourceId: resourceId,
    pageName: pageName,
    resource,
  };
}

const mapDispatchToProps = {
  loadResource: loadResource,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export class ResourcePages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchResource();
  }

  async fetchResource() {
    const { resourceId, loadResource } = this.props;
    this.setState({ isLoading: true });
    const resource = await loadResource(resourceId);
    this.setState({ isLoading: false });
    return resource;
  }

  getCurrentPage() {
    const pages = ['groups', 'settings'];
    const currentPage = this.props.pageName;
    return includes(pages, currentPage) ? currentPage : pages[0];
  }

  renderPage(): React.ReactNode {
    const currentPage = this.getCurrentPage();
    const { resource } = this.props;

    switch (currentPage) {
      case PageTypes.Groups:
        return <ResourceGroupList />;
      case PageTypes.Settings:
        return <ResourceSettings resource={resource!}/>;
    }
    return null;
  }

  render() {
    const { resource, pageNav } = this.props;
    return (
      <Page navId="resources" pageNav={pageNav}>
        <Page.Contents isLoading={this.state.isLoading}>
          {resource && Object.keys(resource).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(withTheme2(ResourcePages));
