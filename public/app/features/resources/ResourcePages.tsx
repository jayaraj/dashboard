import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Themeable2, withTheme2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import GroupList from './GroupList';
import ResourceSettings from './ResourceSettings';
import { loadGroups, loadResource } from './state/actions';
import { getResourceLoadingNav } from './state/navModel';
import { getGroups, getResource, getResourceConfiguration, getResourceType } from './state/selectors';

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
  const resourceLoadingNav = getResourceLoadingNav(pageName as string);
  const navModel = getNavModel(state.navIndex, `resource-${pageName}-${resourceId}`, resourceLoadingNav);
  const groups = getGroups(state.resource);
  const data = getResourceConfiguration(state.resource);
  const resourceType = getResourceType(state.resource);

  return {
    navModel,
    resourceId: resourceId,
    pageName: pageName,
    resource,
    groups,
    data,
    resourceType,
  };
}

const mapDispatchToProps = {
  loadResource,
  loadGroups,
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
    const { loadResource, resourceId } = this.props;
    this.setState({ isLoading: true });
    const resource = await loadResource(resourceId);
    await this.props.loadGroups('', 1, 20);
    this.setState({ isLoading: false });
    return resource;
  }

  getCurrentPage() {
    const pages = ['groups', 'settings'];
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
    const { groups, resource, data, resourceType  } = this.props;

    switch (currentPage) {
      case PageTypes.Groups:
        return <GroupList groups={groups} />;
      case PageTypes.Settings:
        return <ResourceSettings resource={resource!} data={data!} resourceType={resourceType!}/>;
    }
    return null;
  }

  render() {
    const { resource, navModel } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          {resource && Object.keys(resource).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(withTheme2(ResourcePages));
