import React, { FC } from 'react';

import { useQueryParams } from 'app/core/hooks/useQueryParams';
import { AlertingState } from 'app/types';
import { AlertListStateSection } from './AlertListStateSection';
import { getFiltersFromUrlParams } from './utils';
interface Props {}

export const AlertsStateView: FC<Props> = () => {
  const [queryParams] = useQueryParams();
  const { alertState } = getFiltersFromUrlParams(queryParams);

  return (
    <>
      {(!alertState || alertState === AlertingState.Alerting) && (
        <AlertListStateSection defaultCollapsed={false} state={AlertingState.Alerting} />
      )}
      {(!alertState || alertState === AlertingState.Pending) && (
        <AlertListStateSection defaultCollapsed={true} state={AlertingState.Pending} />
      )}
      {(!alertState || alertState === AlertingState.Normal) && (
        <AlertListStateSection defaultCollapsed={true} state={AlertingState.Normal} />
      )}
    </>
  );
};
