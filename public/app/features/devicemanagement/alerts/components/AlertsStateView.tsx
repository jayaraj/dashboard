import React from 'react';

import { useQueryParams } from 'app/core/hooks/useQueryParams';
import { AlertingState } from 'app/types/devicemanagement/alert';

import { AlertListStateSection } from './AlertListStateSection';
import { getFiltersFromUrlParams } from './utils';

interface Props {
  association: string;
  associationReference: number | string;
}
export const AlertsStateView = ({ association, associationReference }: Props) => {
  const [queryParams] = useQueryParams();
  const { alertState } = getFiltersFromUrlParams(queryParams);

  return (
    <>
      {(!alertState || alertState === AlertingState.Alerting) && (
        <AlertListStateSection
          defaultCollapsed={false}
          state={AlertingState.Alerting}
          association={association}
          associationReference={associationReference}
        />
      )}
      {(!alertState || alertState === AlertingState.Pending) && (
        <AlertListStateSection
          defaultCollapsed={true}
          state={AlertingState.Pending}
          association={association}
          associationReference={associationReference}
        />
      )}
      {(!alertState || alertState === AlertingState.Normal) && (
        <AlertListStateSection
          defaultCollapsed={true}
          state={AlertingState.Normal}
          association={association}
          associationReference={associationReference}
        />
      )}
    </>
  );
};
