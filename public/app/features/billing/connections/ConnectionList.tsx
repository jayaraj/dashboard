import React, { PureComponent } from 'react';

import { getBackendSrv } from '@grafana/runtime';
import { DeleteButton, FilterInput, VerticalGroup, HorizontalGroup, Pagination, Select, CallToActionCard, Button, Input, Label, InlineField, LinkButton } from '@grafana/ui';
import { SlideDown } from 'app/core/components/Animations/SlideDown';
import { CloseButton } from 'app/core/components/CloseButton/CloseButton';
import { Page } from 'app/core/components/Page/Page';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState, Connection, connectionPageLimit, connectionStatusTypes, AccessControlAction } from 'app/types';

import { connectWithCleanUp } from '../../../core/components/connectWithCleanUp';

import { deleteConnection, loadConnections } from './state/actions';
import { setConnectionsSearchQuery } from './state/reducers';
import { getConnectionsSearchQuery, getConnections, getConnectionsCount, getConnectionsSearchPage } from './state/selectors';

export interface Props {
  connections: Connection[];
  searchQuery: string;
  searchPage: number;
  connectionsCount: number;
  hasFetched: boolean;
  loadConnections: typeof loadConnections;
  deleteConnection: typeof deleteConnection;
  setConnectionsSearchQuery: typeof setConnectionsSearchQuery;
}

export interface State {
  isAdding: boolean;
  connectionExt: number;
  otp: string;
}

export class ConnectionList extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      isAdding: false,
      connectionExt: 0,
      otp: '',
    };
  }

  componentDidMount() {
    this.fetchConnections('', 1);
  }

  onToggleAdding = () => {
    const {isAdding} = this.state;
    this.setState({ isAdding: !isAdding });
  }

  sendOtp = async () => {
    const {connectionExt} = this.state;
    await getBackendSrv().post(`/api/connections/number/${connectionExt}/otp`);
  } 

  onSubmit = async () => {
    const {connectionExt, otp } = this.state;
    await getBackendSrv().post(`/api/connections/number/${connectionExt}/users`, { otp: otp }).then((data) => {
      console.log(data);
      return {};
    });
    this.fetchConnections('', 1);
  }

  setConnectionExt = (ext: number) => {
    this.setState({ connectionExt: ext });
  }

  setOtp = (otp: string) => {
    this.setState({ otp: otp });
  }

  async fetchConnections(query: string, page: number) {
    await this.props.loadConnections(query, page);
  }

  deleteConnection = (connection: Connection) => {
    this.props.deleteConnection(connection.id);
  };

  onSearchQueryChange = (value: string) => {
    this.props.setConnectionsSearchQuery(value);
  };

  onSearch = async () => {
    const { searchQuery, searchPage } = this.props;
    this.fetchConnections(searchQuery, searchPage);
  };

  onNavigate = async (page: number) => {
    const { searchQuery } = this.props;
    this.fetchConnections(searchQuery, page);
  };

  renderConnection(connection: Connection) {
    const url = `org/connections/edit/${connection.id}`;
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canDelete = contextSrv.hasAccess(AccessControlAction.ActionConnectionsCreate, fallback);

    return (
      <tr key={connection.id}>
         <td className="link-td">
          <a href={url}>{connection.connection_ext}</a> 
        </td>
        <td className="link-td">
          <a href={url}>{connection.name}</a> 
        </td>
        <td className="link-td">
          <a href={url}>{connection.profile}</a> 
        </td>
        <td className="link-td">
          <a href={url}>{connection.address1}</a>
        </td>
        <td className="link-td">
          <a href={url}>{connection.city}</a>
        </td>
        <td className="link-td">
          <a href={url}><Select value={connection.status} options={connectionStatusTypes} disabled={true} onChange={()=>{}}/></a>
        </td>
        <td className="text-right">
          <DeleteButton
            aria-label="Delete"
            size="sm"
            disabled={!canDelete}
            onConfirm={() => this.deleteConnection(connection)}
          />
        </td>
      </tr>
    );
  }

  renderEmptyList() {
    const { hasFetched, searchQuery } = this.props;
    const {isAdding, connectionExt, otp } = this.state;
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionConnectionsCreate, fallback);
    const newConnectionHref = canCreate ? '/org/connections/new' : '#';

    return (
      <div>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>
          <Button className="pull-right" onClick={this.onSearch}>
            Search
          </Button>
          <LinkButton href={newConnectionHref}  disabled={!canCreate}>
            Create Connection
          </LinkButton>
          <Button className="pull-right" onClick={this.onToggleAdding}>
            Add connection
          </Button>
        </div>
        <SlideDown in={isAdding}>
          <div className="cta-form">
            <CloseButton aria-label="Close 'Add connection' dialogue" onClick={this.onToggleAdding} />
            <Label htmlFor="add-connection">Add connection</Label>
            <form className="gf-form-group">
              <div className="gf-form-inline">
                <div className="gf-form">
                  <InlineField  label="Connection" labelWidth={20}>
                    <Input id="connect-ext-input" width={30} type="number" placeholder="connection no" value={connectionExt} onChange={(event) => (this.setConnectionExt(Number(event.currentTarget.value)))}/>
                  </InlineField>
                  <Button className="pull-right" onClick={this.sendOtp}>Send OTP</Button>
                </div>
              </div>
              <div className="gf-form-inline">
                <div className="gf-form">
                  <InlineField  label="OTP" labelWidth={20}>
                    <Input id="otp-input" type="text" width={30} placeholder="otp" value={otp} onChange={(event) => (this.setOtp(event.currentTarget.value))}/>
                  </InlineField>
                </div>
              </div>
              <div className="gf-form-inline">
                <div className="gf-form">
                  <Button onClick={this.onSubmit}>
                    Add
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </SlideDown>

        {!hasFetched ? <PageLoader /> : <CallToActionCard callToActionElement={<div />} message="No connections are available." />}
      </div>
    );
  }

  renderConnectionList() {
    const { connections, searchQuery, searchPage, connectionsCount } = this.props;
    const {isAdding, connectionExt, otp } = this.state;
    const totalPages = Math.ceil(connectionsCount / connectionPageLimit);
    const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
    const canCreate = contextSrv.hasAccess(AccessControlAction.ActionConnectionsCreate, fallback);
    const newConnectionHref = canCreate ? '/org/connections/new' : '#';

    return (
      <>
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow">
            <FilterInput placeholder="Search" value={searchQuery} onChange={this.onSearchQueryChange} />
          </div>
          <Button className="pull-right" onClick={this.onSearch}>
            Search
          </Button>
          <LinkButton href={newConnectionHref}  disabled={!canCreate}>
            Create Connection
          </LinkButton>
          <Button className="pull-right" onClick={this.onToggleAdding}>
            Add connection
          </Button>
        </div>
        <SlideDown in={isAdding}>
          <div className="cta-form">
            <CloseButton aria-label="Close 'Add connection' dialogue" onClick={this.onToggleAdding} />
            <Label htmlFor="add-connection">Add connection</Label>
            <form className="gf-form-group">
              <div className="gf-form-inline">
                <div className="gf-form">
                  <InlineField  label="Connection" labelWidth={20}>
                    <Input id="connect-ext-input" width={30} type="number" placeholder="connection no" value={connectionExt} onChange={(event) => (this.setConnectionExt(Number(event.currentTarget.value)))}/>
                  </InlineField>
                  <Button className="pull-right" onClick={this.sendOtp}>Send OTP</Button>
                </div>
              </div>
              <div className="gf-form-inline">
                <div className="gf-form">
                  <InlineField  label="OTP" labelWidth={20}>
                    <Input id="otp-input" type="text" width={30} placeholder="otp" value={otp} onChange={(event) => (this.setOtp(event.currentTarget.value))}/>
                  </InlineField>
                </div>
              </div>
              <div className="gf-form-inline">
                <div className="gf-form">
                  <Button onClick={this.onSubmit}>
                    Add
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </SlideDown>

        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Connection Number</th>
                  <th>Name</th>
                  <th>Profile</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>Status</th>
                  <th style={{ width: '1%' }} />
                </tr>
              </thead>
              <tbody>{connections.map((connection) => this.renderConnection(connection))}</tbody>
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

  renderList() {
    const { connectionsCount, hasFetched } = this.props;

    if (!hasFetched) {
      return null;
    }
    if (connectionsCount > 0) {
      return this.renderConnectionList();
    } else {
      return this.renderEmptyList();
    }
  }

  render() {
    const { hasFetched } = this.props;

    return (
      <Page navId="connections">
        <Page.Contents isLoading={!hasFetched}>{this.renderList()}</Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    connections: getConnections(state.connections),
    searchQuery: getConnectionsSearchQuery(state.connections),
    searchPage: getConnectionsSearchPage(state.connections),
    connectionsCount: getConnectionsCount(state.connections),
    hasFetched: state.connections.hasFetched,
  };
}

const mapDispatchToProps = {
  loadConnections: loadConnections,
  deleteConnection: deleteConnection,
  setConnectionsSearchQuery,
};

export default connectWithCleanUp( mapStateToProps, mapDispatchToProps, (state) => state.connections)(ConnectionList);
