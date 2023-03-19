import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Themeable2, withTheme2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import ChildrenList from './ChildrenList';
import GroupSettings from './GroupSettings';
import InvoiceList from './InvoiceList';
import ResourceList from './ResourceList';
import TransactionList from './TransactionList';
import UserList from './UserList';
import { loadResources, loadGroup, loadUsers } from './state/actions';
import { getGroupLoadingNav } from './state/navModel';
import { getResources, getGroup, getUsers, getChildren } from './state/selectors';

interface GroupPageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<GroupPageRouteParams>, Themeable2 {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Children = 'children',
  Resources = 'resources',
  Users = 'users',
  Invoices = 'invoices',
  Transactions = 'transactions',
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const groupId = parseInt(props.match.params.id, 10);
  const group = getGroup(state.group, groupId);
  const resources = getResources(state.group);
  const users = getUsers(state.group);
  const children = getChildren(state.group, groupId);
  const pageName = (props.match.params.page)? props.match.params.page: (!group?.child)? 'resources': 'children';
  const groupLoadingNav = getGroupLoadingNav(pageName as string);
  const navModel = getNavModel(state.navIndex, `group-${pageName}-${groupId}`, groupLoadingNav);

  return {
    navModel,
    groupId: groupId,
    pageName: pageName,
    group,
    resources,
    users,
    children,
  };
}

const mapDispatchToProps = {
  loadGroup,
  loadResources,
  loadUsers,
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
    const pages = ['children', 'resources', 'users', 'invoices', 'transactions', 'settings'];
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
    const { resources, group, users, children } = this.props;

    switch (currentPage) {
      case PageTypes.Children:
        return <ChildrenList groups={children} group={group!}/>;
      case PageTypes.Resources:
        return <ResourceList resources={resources} group={group!}/>;
      case PageTypes.Users:
        return <UserList users={users} />;
      case PageTypes.Invoices:
          return <InvoiceList group={group!} />;
      case PageTypes.Transactions:
        return <TransactionList group={group!} />;
      case PageTypes.Settings:
        return <GroupSettings group={group!} />;
    }
    return null;
  }

  render() {
    const { group, navModel } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          {group && Object.keys(group).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(withTheme2(GroupPages));
