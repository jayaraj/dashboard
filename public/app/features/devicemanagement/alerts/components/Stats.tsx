import pluralize from 'pluralize';
import React, { FC, Fragment } from 'react';

import { Badge } from '@grafana/ui';
import { AlertStats, AlertingState } from 'app/types/devicemanagement/alert';

interface Props {
  stats: AlertStats;
}

export const Stats: FC<Props> = ({ stats }) => {
  const statsComponents: React.ReactNode[] = [];

  if (stats[AlertingState.Alerting]) {
    statsComponents.push(<Badge color="red" key="alerting" text={`${stats[AlertingState.Alerting]} alerting`} />);
  }
  if (stats[AlertingState.Pending]) {
    statsComponents.push(<Badge color="orange" key="pending" text={`${stats[AlertingState.Pending]} pending`} />);
  }
  if (stats[AlertingState.Normal]) {
    statsComponents.push(<Badge color="green" key="normal" text={`${stats[AlertingState.Normal]} normal`} />);
  }

  return (
    <div>
      <span>
        {stats.count} {pluralize('alert', stats.count)}
      </span>
      {!!statsComponents.length && (
        <>
          <span>: </span>
          {statsComponents.reduce<React.ReactNode[]>(
            (prev, curr, idx) =>
              prev.length
                ? [
                    prev,
                    <Fragment key={idx}>
                      <span> </span>
                    </Fragment>,
                    curr,
                  ]
                : [curr],
            []
          )}
        </>
      )}
    </div>
  );
};
