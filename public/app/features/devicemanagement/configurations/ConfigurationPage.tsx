import { css } from '@emotion/css';
import React, { useState } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, TabsBar, Tab, CallToActionCard } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/services/context_srv';

import ConfigurationTypeList from './ConfigurationTypeList';
import OrgConfigurations from './OrgConfigurations';
import { WhatsappConfiguration } from './WhatsappConfiguration';

enum TabView {
  ORG = 'org',
  TYPES = 'types',
  WHATSAPP = 'whatsapp',
}

const TAB_PAGE_MAP: Record<TabView, React.ReactElement> = {
  [TabView.ORG]: <OrgConfigurations />,
  [TabView.TYPES]: <ConfigurationTypeList />,
  [TabView.WHATSAPP]: <WhatsappConfiguration />,
};

export default function ConfigurationPage() {
  const styles = useStyles2(getStyles);

  const hasAccessToOrg = contextSrv.hasPermission('configurations.org:read');
  const hasAccessToTypes = contextSrv.hasPermission('configurations:read');

  const [view, setView] = useState(() => {
    if (hasAccessToOrg) {
      return TabView.ORG;
    } else if (hasAccessToTypes) {
      return TabView.WHATSAPP;
    }
    return null;
  });
  return (
    <Page navId={'configurationtypes'}>
      <TabsBar className={styles.tabsMargin}>
        {hasAccessToOrg && (
          <Tab label="Org Configuration" active={view === TabView.ORG} onChangeTab={() => setView(TabView.ORG)} />
        )}
        {hasAccessToTypes && (
          <>
            <Tab
              label="Whatsapp Configuration"
              active={view === TabView.WHATSAPP}
              onChangeTab={() => setView(TabView.WHATSAPP)}
            />
            <Tab
              label="Configuration Types"
              active={view === TabView.TYPES}
              onChangeTab={() => setView(TabView.TYPES)}
            />
          </>
        )}
      </TabsBar>
      {view ? (
        TAB_PAGE_MAP[view]
      ) : (
        <Page.Contents isLoading={false}>
          <CallToActionCard callToActionElement={<div />} message={`No configurations are found.`} />
        </Page.Contents>
      )}
    </Page>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  tabsMargin: css({
    marginBottom: theme.spacing(3),
  }),
});
