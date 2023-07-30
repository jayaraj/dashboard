import { css } from '@emotion/css';
import React, { useEffect  } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, withErrorBoundary } from '@grafana/ui';
import { useQueryParams } from 'app/core/hooks/useQueryParams';

import { Page } from 'app/core/components/Page/Page';
import AlertsFilter from './AlertsFilter';
import { AlertsStateView } from './AlertsStateView';
import { AlertDefinitionsView } from './AlertDefinitionsView';

const VIEWS = {
  groups: AlertDefinitionsView,
  state: AlertsStateView,
};

const AlertDefinitionList = withErrorBoundary(
  () => {
    const styles = useStyles2(getStyles);
    const [queryParams, setQueryParams] = useQueryParams();
    const view = VIEWS[queryParams['view'] as keyof typeof VIEWS]? (queryParams['view'] as keyof typeof VIEWS): 'groups';
    const ViewComponent = VIEWS[view];
    useEffect(() => {
      setQueryParams({ association: "org" });
    }, []);

    return (
      <Page navId="alerts">
        <Page.Contents>
          <>
            <AlertsFilter />
            <div className={styles.break} />
          </>
          <ViewComponent/>
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
