import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { DataSourceSettings, urlUtil } from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { Alert, Button } from '@grafana/ui';
import { cleanUpAction } from 'app/core/actions/cleanUp';
import appEvents from 'app/core/app_events';
import Page from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/core';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { PluginStateInfo } from 'app/features/plugins/components/PluginStateInfo';
import { StoreState, AccessControlAction } from 'app/types/';

import { ShowConfirmModalEvent } from '../../../types/events';
import {
  deleteDataSource,
  initDataSourceSettings,
  loadDataSource,
  testDataSource,
  updateDataSource,
} from '../state/actions';
import { getDataSourceLoadingNav, buildNavModel, getDataSourceNav } from '../state/navModel';
import { dataSourceLoaded, setDataSourceName, setIsDefault } from '../state/reducers';
import { getDataSource, getDataSourceMeta } from '../state/selectors';

import BasicSettings from './BasicSettings';
import ButtonRow from './ButtonRow';
import { CloudInfoBox } from './CloudInfoBox';
import { PluginSettings } from './PluginSettings';

export interface OwnProps extends GrafanaRouteComponentProps<{ uid: string }> {}

function mapStateToProps(state: StoreState, props: OwnProps) {
  const dataSourceId = props.match.params.uid;
  const params = new URLSearchParams(props.location.search);
  const dataSource = getDataSource(state.dataSources, dataSourceId);
  const { plugin, loadError, loading, testingStatus } = state.dataSourceSettings;
  const page = params.get('page');

  const nav = plugin
    ? getDataSourceNav(buildNavModel(dataSource, plugin), page || 'settings')
    : getDataSourceLoadingNav('settings');

  const navModel = getNavModel(
    state.navIndex,
    page ? `datasource-page-${page}` : `datasource-settings-${dataSourceId}`,
    nav
  );

  return {
    dataSource: getDataSource(state.dataSources, dataSourceId),
    dataSourceMeta: getDataSourceMeta(state.dataSources, dataSource.type),
    dataSourceId: dataSourceId,
    page,
    plugin,
    loadError,
    loading,
    testingStatus,
    navModel,
  };
}

const mapDispatchToProps = {
  deleteDataSource,
  loadDataSource,
  setDataSourceName,
  updateDataSource,
  setIsDefault,
  dataSourceLoaded,
  initDataSourceSettings,
  testDataSource,
  cleanUpAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = OwnProps & ConnectedProps<typeof connector>;

export class DataSourceSettingsPage extends PureComponent<Props> {
  componentDidMount() {
    const { initDataSourceSettings, dataSourceId } = this.props;
    initDataSourceSettings(dataSourceId);
  }

  componentWillUnmount() {
    this.props.cleanUpAction({
      stateSelector: (state) => state.dataSourceSettings,
    });
  }

  onSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    await this.props.updateDataSource({ ...this.props.dataSource });

    this.testDataSource();
  };

  onTest = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    this.testDataSource();
  };

  onDelete = () => {
    appEvents.publish(
      new ShowConfirmModalEvent({
        title: 'Delete',
        text: `Are you sure you want to delete the "${this.props.dataSource.name}" data source?`,
        yesText: 'Delete',
        icon: 'trash-alt',
        onConfirm: () => {
          this.confirmDelete();
        },
      })
    );
  };

  confirmDelete = () => {
    this.props.deleteDataSource();
  };

  onModelChange = (dataSource: DataSourceSettings) => {
    this.props.dataSourceLoaded(dataSource);
  };

  isReadOnly() {
    return this.props.dataSource.readOnly === true;
  }

  renderIsReadOnlyMessage() {
    return (
      <Alert aria-label={selectors.pages.DataSource.readOnly} severity="info" title="Provisioned data source">
        This data source was added by config and cannot be modified using the UI. Please contact your server admin to
        update this data source.
      </Alert>
    );
  }

  renderMissingEditRightsMessage() {
    return (
      <Alert severity="info" title="Missing rights">
        You are not allowed to modify this data source. Please contact your server admin to update this data source.
      </Alert>
    );
  }

  testDataSource() {
    const { dataSource, testDataSource } = this.props;
    testDataSource(dataSource.name);
  }

  get hasDataSource() {
    return this.props.dataSource.id > 0;
  }

  onNavigateToExplore() {
    const { dataSource } = this.props;
    const exploreState = JSON.stringify({ datasource: dataSource.name, context: 'explore' });
    const url = urlUtil.renderUrl('/explore', { left: exploreState });
    return url;
  }

  renderLoadError() {
    const { loadError, dataSource } = this.props;
    const canDeleteDataSource =
      !this.isReadOnly() && contextSrv.hasPermissionInMetadata(AccessControlAction.DataSourcesDelete, dataSource);

    const node = {
      text: loadError!,
      subTitle: 'Data Source Error',
      icon: 'exclamation-triangle',
    };
    const nav = {
      node: node,
      main: node,
    };

    return (
      <Page navModel={nav}>
        <Page.Contents isLoading={this.props.loading}>
          {this.isReadOnly() && this.renderIsReadOnlyMessage()}
          <div className="gf-form-button-row">
            {canDeleteDataSource && (
              <Button type="submit" variant="destructive" onClick={this.onDelete}>
                Delete
              </Button>
            )}
            <Button variant="secondary" fill="outline" type="button" onClick={() => history.back()}>
              Back
            </Button>
          </div>
        </Page.Contents>
      </Page>
    );
  }

  renderConfigPageBody(page: string) {
    const { plugin } = this.props;
    if (!plugin || !plugin.configPages) {
      return null; // still loading
    }

    for (const p of plugin.configPages) {
      if (p.id === page) {
        // Investigate is any plugins using this? We should change this interface
        return <p.body plugin={plugin} query={{}} />;
      }
    }

    return <div>Page not found: {page}</div>;
  }

  renderAlertDetails() {
    const { testingStatus } = this.props;

    return (
      <>
        {testingStatus?.details?.message}
        {testingStatus?.details?.verboseMessage ? (
          <details style={{ whiteSpace: 'pre-wrap' }}>{testingStatus?.details?.verboseMessage}</details>
        ) : null}
      </>
    );
  }

  renderSettings() {
    const { dataSourceMeta, setDataSourceName, setIsDefault, dataSource, plugin, testingStatus } = this.props;
    const canWriteDataSource = contextSrv.hasPermissionInMetadata(AccessControlAction.DataSourcesWrite, dataSource);
    const canDeleteDataSource = contextSrv.hasPermissionInMetadata(AccessControlAction.DataSourcesDelete, dataSource);

    return (
      <form onSubmit={this.onSubmit}>
        {!canWriteDataSource && this.renderMissingEditRightsMessage()}
        {this.isReadOnly() && this.renderIsReadOnlyMessage()}
        {dataSourceMeta.state && (
          <div className="gf-form">
            <label className="gf-form-label width-10">Plugin state</label>
            <label className="gf-form-label gf-form-label--transparent">
              <PluginStateInfo state={dataSourceMeta.state} />
            </label>
          </div>
        )}

        <CloudInfoBox dataSource={dataSource} />

        <BasicSettings
          dataSourceName={dataSource.name}
          isDefault={dataSource.isDefault}
          onDefaultChange={(state) => setIsDefault(state)}
          onNameChange={(name) => setDataSourceName(name)}
        />

        {plugin && (
          <PluginSettings
            plugin={plugin}
            dataSource={dataSource}
            dataSourceMeta={dataSourceMeta}
            onModelChange={this.onModelChange}
          />
        )}

        {testingStatus?.message && (
          <div className="gf-form-group p-t-2">
            <Alert
              severity={testingStatus.status === 'error' ? 'error' : 'success'}
              title={testingStatus.message}
              aria-label={selectors.pages.DataSource.alert}
            >
              {testingStatus.details && this.renderAlertDetails()}
            </Alert>
          </div>
        )}

        <ButtonRow
          onSubmit={(event) => this.onSubmit(event)}
          canSave={!this.isReadOnly() && canWriteDataSource}
          canDelete={!this.isReadOnly() && canDeleteDataSource}
          onDelete={this.onDelete}
          onTest={(event) => this.onTest(event)}
          exploreUrl={this.onNavigateToExplore()}
        />
      </form>
    );
  }

  render() {
    const { navModel, page, loadError, loading } = this.props;

    if (loadError) {
      return this.renderLoadError();
    }

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={loading}>
          {this.hasDataSource ? <div>{page ? this.renderConfigPageBody(page) : this.renderSettings()}</div> : null}
        </Page.Contents>
      </Page>
    );
  }
}

export default connector(DataSourceSettingsPage);
