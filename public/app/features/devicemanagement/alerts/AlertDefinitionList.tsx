import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, withErrorBoundary, LinkButton } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { useQueryParams } from 'app/core/hooks/useQueryParams';
import { contextSrv } from 'app/core/services/context_srv';

import { AlertDefinitionsView } from './components/AlertDefinitionsView';
import AlertsFilter from './components/AlertsFilter';
import { AlertsStateView } from './components/AlertsStateView';

const VIEWS = {
  groups: AlertDefinitionsView,
  state: AlertsStateView,
};

const AlertDefinitionList = withErrorBoundary(
  () => {
    const styles = useStyles2(getStyles);
    const [queryParams] = useQueryParams();
    const view = VIEWS[queryParams['view'] as keyof typeof VIEWS]
      ? (queryParams['view'] as keyof typeof VIEWS)
      : 'groups';
    const ViewComponent = VIEWS[view];
    const canCreate = contextSrv.hasPermission('alerts.definition:create');

    return (
      <Page
        navId="alerts"
        actions={
          <LinkButton href={canCreate ? 'org/alertdefinitions/new' : '#'} disabled={!canCreate}>
            {`New Alert`}
          </LinkButton>
        }
      >
        <Page.Contents>
          <>
            <AlertsFilter />
            <div className={styles.break} />
          </>
          <ViewComponent association={'org'} associationReference={0} />
        </Page.Contents>
      </Page>
    );
  },
  { style: 'page' }
);

const getStyles = (theme: GrafanaTheme2) => ({
  break: css`
    width: 100%;
    height: 0;
    margin-bottom: ${theme.spacing(2)};
    border-bottom: solid 1px ${theme.colors.border.medium};
  `,
});

export default AlertDefinitionList;
