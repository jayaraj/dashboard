import React, { PureComponent } from 'react';

import { DeleteButton, LinkButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination, Select, Button } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv, User } from 'app/core/services/context_srv';
import { StoreState, ConfigurationType, configurationTypePageLimit, associationTypes } from 'app/types';

import { connectWithCleanUp } from '../../../core/components/connectWithCleanUp';

import { OrgRolePicker } from '../../admin/OrgRolePicker';
import WhatsappConfiguration from './WhatsappConfiguration';
import { deleteConfigurationType, loadConfigurationTypes } from './state/actions';
import { setConfigurationTypesSearchQuery } from './state/reducers';
import { getSearchQuery, getConfigurationTypes, getConfigurationTypesCount, getConfigurationTypeSearchPage } from './state/selectors';

export interface Props {
  configurationTypes: ConfigurationType[];
  searchQuery: string;
  searchPage: number;
  configurationTypesCount: number;
  hasFetched: boolean;
  loadConfigurationTypes: typeof loadConfigurationTypes;
  deleteConfigurationType: typeof deleteConfigurationType;
  setConfigurationTypesSearchQuery: typeof setConfigurationTypesSearchQuery;
  signedInUser: User;
}

export interface State {
  isWhatsappOpen: boolean;
}

export class ConfigurationTypeList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isWhatsappOpen: false };
  }

  componentDidMount() {
    this.fetchConfigurationTypes('', 1);
  }

  setWhatsappOpen = (open: boolean) => {
    this.setState({ isWhatsappOpen: open });
  }

  async fetchConfigurationTypes(query: string, page: number) {
    await this.props.loadConfigurationTypes(query, page);
  }

  deleteConfigurationType = (configurationType: ConfigurationType) => {
    this.props.deleteConfigurationType(configurationType.id);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setConfigurationTypesSearchQuery(value);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchConfigurationTypes(searchQuery, page);
  };

  renderConfigurationType(configurationType: ConfigurationType) {
    const { signedInUser } = this.props;
    const url = `org/configurationtypes/edit/${configurationType.id}`;
    const canRead = signedInUser.isGrafanaAdmin;
    const canWrite = signedInUser.isGrafanaAdmin;

    return (
      <tr key={configurationType.id}>
        <td className="link-td">
          {canRead ? <a href={url}>{configurationType.type}</a> : <>{configurationType.type}</>}
        </td>
        <td className="link-td">
          {canRead ? <a href={url}><Select value={configurationType.associated_with} options={associationTypes} disabled={true}  onChange={()=>{}}/></a> : <Select value={configurationType.associated_with} options={associationTypes} disabled={true}  onChange={()=>{}}/>}
        </td>
        <td className="link-td">
          {canRead ? <a href={url}><OrgRolePicker aria-label="Role" value={configurationType.role} disabled={true} onChange={()=>{}}/></a> : <>
          <OrgRolePicker aria-label="Role" value={configurationType.role} disabled={true}  onChange={()=>{}}/></>}
        </td>
        <td className="link-td">
          {canRead ? <a href={url}>{(configurationType.measurement)? 'measurement': 'other'}</a> : <>{(configurationType.measurement)? 'measurement': 'other'}</>}
        </td>
        <td className="text-right">
          <DeleteButton
            aria-label="Delete"
            size="sm"
            disabled={!canWrite}
            onConfirm={() => this.deleteConfigurationType(configurationType)}
          />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const  isWhatsappOpen = this.state.isWhatsappOpen? true: false;
    const canWrite = this.props.signedInUser.isGrafanaAdmin;
    const newHref = canWrite ? '/org/configurationtypes/new' : '#';
    const buttonTitle = ' New Type';
    const title = 'No types are available';
    return (<>
              <div className="page-action-bar">
                <div className="gf-form gf-form--grow">
                </div>
                <Button variant="secondary" disabled={!canWrite} icon="whatsapp" onClick={() => this.setWhatsappOpen(true)}>
                  Configure
                </Button>
              </div>
              <EmptyListCTA title={title} buttonIcon="rss" buttonLink={newHref} buttonTitle={buttonTitle} />
              <WhatsappConfiguration isOpen={isWhatsappOpen}  onCancel={(open: boolean ) => { this.setWhatsappOpen(open);}}/>
            </>);
  }

  renderConfigurationTypeList() {
    const { configurationTypes, searchQuery, searchPage, configurationTypesCount } = this.props;
    const  isWhatsappOpen = this.state.isWhatsappOpen? true: false;
    const canWrite = this.props.signedInUser.isGrafanaAdmin;
    const disabledClass = canWrite ? '' : ' disabled';
    const url = canWrite ? '/org/configurationtypes/new' : '#';
    const totalPages = Math.ceil(configurationTypesCount / configurationTypePageLimit);

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>
          <Button variant="secondary" disabled={!canWrite} icon="whatsapp" onClick={() => this.setWhatsappOpen(true)}>
            Configure
          </Button>
          <LinkButton className={disabledClass} href={url}>
            New Type
          </LinkButton>
        </div>

        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Configuration Type Of</th>
                  <th>Permission</th>
                  <th>Measurement</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{configurationTypes.map((configurationType) => this.renderConfigurationType(configurationType))}</tbody>
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
        <WhatsappConfiguration isOpen={isWhatsappOpen}  onCancel={this.setWhatsappOpen}/>
      </>
    );
  }

  renderList() {
    const { configurationTypesCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }

    if (configurationTypesCount > 0) {
      return this.renderConfigurationTypeList();
    } else {
      return this.renderEmptyList();
    }
  }

  render() {
    const { hasFetched } = this.props;

    return (
      <Page navId="configurationtypes">
        <Page.Contents isLoading={!hasFetched}>{this.renderList()}</Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    configurationTypes: getConfigurationTypes(state.configurationTypes),
    searchQuery: getSearchQuery(state.configurationTypes),
    searchPage: getConfigurationTypeSearchPage(state.configurationTypes),
    configurationTypesCount: getConfigurationTypesCount(state.configurationTypes),
    hasFetched: state.configurationTypes.hasFetched,
    signedInUser: contextSrv.user,
  };
}

const mapDispatchToProps = {
  loadConfigurationTypes: loadConfigurationTypes,
  deleteConfigurationType,
  setConfigurationTypesSearchQuery,
};

export default connectWithCleanUp( mapStateToProps, mapDispatchToProps, (state) => state.configurationTypes)(ConfigurationTypeList);
