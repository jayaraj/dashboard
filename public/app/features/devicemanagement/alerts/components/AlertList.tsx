import { css } from '@emotion/css';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { useQueryParams } from 'app/core/hooks/useQueryParams';

import { AlertDefinitionsView } from './AlertDefinitionsView';
import AlertsFilter from './AlertsFilter';
import { AlertsStateView } from './AlertsStateView';

export interface OwnProps {
  association: string;
  associationReference: number | string;
}

const VIEWS = {
  groups: AlertDefinitionsView,
  state: AlertsStateView,
};

export const AlertList = ({ association, associationReference }: Props) => {
  const styles = useStyles2(getStyles);
  const [queryParams] = useQueryParams();
  const view = VIEWS[queryParams['view'] as keyof typeof VIEWS]
    ? (queryParams['view'] as keyof typeof VIEWS)
    : 'groups';
  const ViewComponent = VIEWS[view];

  return (
    <>
      <>
        <AlertsFilter />
        <div className={styles.break} />
      </>
      <ViewComponent association={association} associationReference={associationReference} />
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  break: css`
    width: 100%;
    height: 0;
    margin-bottom: ${theme.spacing(2)};
    border-bottom: solid 1px ${theme.colors.border.medium};
  `,
});

const mapDispatchToProps = {};
const connector = connect(null, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;
export default connector(AlertList);
