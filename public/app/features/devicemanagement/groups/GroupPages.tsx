import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Themeable2, withTheme2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import GroupResourceList from './GroupResourceList';
import GroupSettings from './GroupSettings';
import GroupUserList from './GroupUserList';
import SubGroupList from './SubGroupList';
import { loadGroup} from './state/actions';
import { getPageNav } from './state/navModel';
import { getGroup } from './state/selectors';

interface GroupPageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<GroupPageRouteParams>, Themeable2 {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Groups = 'groups',
  Resources = 'resources',
  Users = 'users',
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const groupId = parseInt(props.match.params.id, 10);
  const group = getGroup(state.group, groupId);
  const pageName = props.match.params.page || 'groups';
  const groupLoadingNav = getPageNav(pageName as string);
  const pageNav = getNavModel(state.navIndex, `group-${pageName}-${groupId}`, groupLoadingNav).main;

  return {
    groupId: groupId,
    pageNav,
    pageName: pageName,
    group,
  };
}

const mapDispatchToProps = {
  loadGroup: loadGroup,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export class GroupPages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    const { group, groupId } = this.props;
    const { isLoading } = this.state;
    if (!isLoading && (group === null || (group && group!.id !== groupId))) {
      await this.fetchGroup();
    }
  }

  async componentDidUpdate() {
    const { group, groupId } = this.props;
    const { isLoading } = this.state;
    if (!isLoading && (group === null || (group && group!.id !== groupId))) {
      await this.fetchGroup();
    }
  }

  async fetchGroup() {
    const { loadGroup, groupId } = this.props;
    this.setState({ isLoading: true });
    const group = await loadGroup(groupId);
    this.setState({ isLoading: false });
    return group;
  }

  getCurrentPage() {
    const pages = ['groups', 'resources', 'users', 'settings'];
    const currentPage = this.props.pageName;
    return includes(pages, currentPage) ? currentPage : pages[0];
  }

  renderPage(): React.ReactNode {
    const currentPage = this.getCurrentPage();
    const { group } = this.props;

    switch (currentPage) {
      case PageTypes.Groups:
        return <SubGroupList group={group!}/>;
      case PageTypes.Resources:
        return <GroupResourceList group={group!}/>;
      case PageTypes.Users:
        return <GroupUserList group={group!}/>;
      case PageTypes.Settings:
        return <GroupSettings group={group!}/>;
    }
    return null;
  }

  render() {
    const { group, pageNav } = this.props;

    return (
      <Page navId="resourcegroups" pageNav={pageNav}>
        <Page.Contents isLoading={this.state.isLoading}>
          {group && Object.keys(group).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(withTheme2(GroupPages));
