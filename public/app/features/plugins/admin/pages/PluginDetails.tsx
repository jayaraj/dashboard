import React from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, TabsBar, TabContent, Tab, Alert } from '@grafana/ui';

import { AppNotificationSeverity } from 'app/types';
import { PluginDetailsSignature } from '../components/PluginDetailsSignature';
import { PluginDetailsHeader } from '../components/PluginDetailsHeader';
import { usePluginDetails } from '../hooks/usePluginDetails';
import { Page as PluginPage } from '../components/Page';
import { Loader } from '../components/Loader';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { ActionTypes } from '../types';
import { PluginDetailsBody } from '../components/PluginDetailsBody';

type PluginDetailsProps = GrafanaRouteComponentProps<{ pluginId?: string }>;

export default function PluginDetails({ match }: PluginDetailsProps): JSX.Element | null {
  const { pluginId } = match.params;
  const { state, dispatch } = usePluginDetails(pluginId!);
  const { loading, error, plugin, pluginConfig, tabs, activeTab } = state;
  const tab = tabs[activeTab];
  const styles = useStyles2(getStyles);
  const parentUrl = match.url.substring(0, match.url.lastIndexOf('/'));

  if (loading) {
    return (
      <Page>
        <Loader />
      </Page>
    );
  }

  if (!plugin) {
    return null;
  }

  return (
    <Page>
      <PluginPage>
        <PluginDetailsHeader currentUrl={match.url} parentUrl={parentUrl} pluginId={pluginId} />

        {/* Tab navigation */}
        <TabsBar>
          {tabs.map((tab: { label: string }, idx: number) => (
            <Tab
              key={tab.label}
              label={tab.label}
              active={idx === activeTab}
              onChangeTab={() => dispatch({ type: ActionTypes.SET_ACTIVE_TAB, payload: idx })}
            />
          ))}
        </TabsBar>

        {/* Active tab */}
        <TabContent className={styles.tabContent}>
          {error && (
            <Alert severity={AppNotificationSeverity.Error} title="Error Loading Plugin">
              <>
                Check the server startup logs for more information. <br />
                If this plugin was loaded from git, make sure it was compiled.
              </>
            </Alert>
          )}
          <PluginDetailsSignature installedPlugin={pluginConfig} className={styles.signature} />
          <PluginDetailsBody tab={tab} plugin={pluginConfig} remoteVersions={plugin.versions} readme={plugin.readme} />
        </TabContent>
      </PluginPage>
    </Page>
  );
}

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    signature: css`
      margin: ${theme.spacing(3)};
      margin-bottom: 0;
    `,
    // Needed due to block formatting context
    tabContent: css`
      overflow: auto;
    `,
  };
};
