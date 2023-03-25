import { includes } from 'lodash';
import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

import GroupTypeSettings from './GroupTypeSettings';
import { loadGroupType } from './state/actions';
import { getGroupTypeLoadingNav } from './state/navModel';
import { getGroupType } from './state/selectors';

interface GroupTypePageRouteParams {
  id: string;
  page: string | null;
}

export interface OwnProps extends GrafanaRouteComponentProps<GroupTypePageRouteParams> {}

interface State {
  isLoading: boolean;
}

enum PageTypes {
  Settings = 'settings',
}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const groupTypeId = parseInt(props.match.params.id, 10);
  const pageName = props.match.params.page || 'settings';
  const groupTypeLoadingNav = getGroupTypeLoadingNav(pageName as string);
  const navModel = getNavModel(state.navIndex, `grouptype-${pageName}-${groupTypeId}`, groupTypeLoadingNav);
  const groupType = getGroupType(state.groupType, groupTypeId);

  return {
    navModel,
    groupTypeId: groupTypeId,
    pageName: pageName,
    groupType,
  };
}

const mapDispatchToProps = {
  loadGroupType,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class GroupTypePages extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }

  async componentDidMount() {
    await this.fetchGroupType();
  }

  async fetchGroupType() {
    const { loadGroupType, groupTypeId } = this.props;
    this.setState({ 
      isLoading: true,
    });
    const response = await loadGroupType(groupTypeId);
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
    const { groupType } = this.props;
    switch (currentPage) {
      case PageTypes.Settings:
        return <GroupTypeSettings groupType={groupType!} />;
    }

    return null;
  }

  render() {
    const { groupType, navModel } = this.props;

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.isLoading}>
          {groupType && Object.keys(groupType).length !== 0 && this.renderPage()}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(GroupTypePages);
