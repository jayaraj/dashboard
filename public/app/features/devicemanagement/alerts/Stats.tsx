import pluralize from 'pluralize';
import React, { FC, Fragment } from 'react';
import { AlertStats, AlertingState } from 'app/types';
import { StateColoredText } from './StateColoredText';

interface Props {
  stats: AlertStats;
}

export const Stats: FC<Props> = ({ stats }) => {
  //TODO
  const statsComponents: React.ReactNode[] = [];
  if (stats[AlertingState.Alerting]) {
    statsComponents.push(
      <StateColoredText key="alerting" status={AlertingState.Alerting}>
        {stats[AlertingState.Alerting]} alerting
      </StateColoredText>
    );
  }
  if (stats[AlertingState.Pending]) {
    statsComponents.push(
      <StateColoredText key="pending" status={AlertingState.Pending}>
        {stats[AlertingState.Pending]} pending
      </StateColoredText>
    );
  }
  if (stats[AlertingState.Normal]) {
    statsComponents.push(
      <StateColoredText key="inactive" status={AlertingState.Normal}>
        {stats[AlertingState.Normal]} normal
      </StateColoredText>
    );
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
                      <span>, </span>
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
