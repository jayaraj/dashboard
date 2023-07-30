import { css } from '@emotion/css';
import React, { FC, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { useQueryParams } from 'app/core/hooks/useQueryParams';
import { AlertDefinitionsView } from '../alerts/AlertDefinitionsView';
import AlertsFilter from '../alerts/AlertsFilter';
import { AlertsStateView } from '../alerts/AlertsStateView';

const mapDispatchToProps = {};
const connector = connect(null, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector>;

const VIEWS = {
  groups: AlertDefinitionsView,
  state: AlertsStateView,
};

export const AlertList: FC<Props> = ({}) => {
  const styles = useStyles2(getStyles);
  const [queryParams, setQueryParams] = useQueryParams();
  const view = VIEWS[queryParams['view'] as keyof typeof VIEWS]? (queryParams['view'] as keyof typeof VIEWS): 'groups';
  const ViewComponent = VIEWS[view];
  useEffect(() => {
    setQueryParams({ association: "group" });
  }, []);
  
  return (
    <>
      <>
        <AlertsFilter />
        <div className={styles.break} />
      </>
      <ViewComponent/>
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  break: css`
    width: 100%;
    height: 0;
    margin-bottom: ${theme.spacing(2)};
    border-bottom: solid 1px ${theme.colors.border.medium};
  `,
});

export default connector(AlertList);