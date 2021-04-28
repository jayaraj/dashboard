import { LoadingPlaceholder } from '@grafana/ui';
import {
  AlertManagerCortexConfig,
  GrafanaManagedReceiverConfig,
  Receiver,
} from 'app/plugins/datasource/alertmanager/types';
import React, { FC, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useUnifiedAlertingSelector } from '../../../hooks/useUnifiedAlertingSelector';
import { fetchGrafanaNotifiersAction, updateAlertManagerConfigAction } from '../../../state/actions';
import { GrafanaChannelValues, ReceiverFormValues } from '../../../types/receiver-form';
import { GRAFANA_RULES_SOURCE_NAME } from '../../../utils/datasource';
import {
  formValuesToGrafanaReceiver,
  grafanaReceiverToFormValues,
  updateConfigWithReceiver,
} from '../../../utils/receiver-form';
import { GrafanaCommonChannelSettings } from './GrafanaCommonChannelSettings';
import { ReceiverForm } from './ReceiverForm';

interface Props {
  alertManagerSourceName: string;
  config: AlertManagerCortexConfig;
  existing?: Receiver;
}

const defaultChannelValues: GrafanaChannelValues = Object.freeze({
  __id: '',
  sendReminder: true,
  secureSettings: {},
  settings: {},
  secureFields: {},
  disableResolveMessage: false,
  type: 'email',
});

export const GrafanaReceiverForm: FC<Props> = ({ existing, alertManagerSourceName, config }) => {
  const grafanaNotifiers = useUnifiedAlertingSelector((state) => state.grafanaNotifiers);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!(grafanaNotifiers.result || grafanaNotifiers.loading)) {
      dispatch(fetchGrafanaNotifiersAction());
    }
  }, [grafanaNotifiers, dispatch]);

  // transform receiver DTO to form values
  const [existingValue, id2original] = useMemo((): [
    ReceiverFormValues<GrafanaChannelValues> | undefined,
    Record<string, GrafanaManagedReceiverConfig>
  ] => {
    if (!existing || !grafanaNotifiers.result) {
      return [undefined, {}];
    }
    return grafanaReceiverToFormValues(existing, grafanaNotifiers.result!);
  }, [existing, grafanaNotifiers.result]);

  const onSubmit = (values: ReceiverFormValues<GrafanaChannelValues>) => {
    const newReceiver = formValuesToGrafanaReceiver(values, id2original, defaultChannelValues);
    dispatch(
      updateAlertManagerConfigAction({
        newConfig: updateConfigWithReceiver(config, newReceiver, existing?.name),
        oldConfig: config,
        alertManagerSourceName: GRAFANA_RULES_SOURCE_NAME,
        successMessage: existing ? 'Receiver updated.' : 'Receiver created',
        redirectPath: '/alerting/notifications',
      })
    );
  };

  const takenReceiverNames = useMemo(
    () => config.alertmanager_config.receivers?.map(({ name }) => name).filter((name) => name !== existing?.name) ?? [],
    [config, existing]
  );

  if (grafanaNotifiers.result) {
    return (
      <ReceiverForm<GrafanaChannelValues>
        onSubmit={onSubmit}
        initialValues={existingValue}
        notifiers={grafanaNotifiers.result}
        alertManagerSourceName={alertManagerSourceName}
        defaultItem={defaultChannelValues}
        takenReceiverNames={takenReceiverNames}
        commonSettingsComponent={GrafanaCommonChannelSettings}
      />
    );
  } else {
    return <LoadingPlaceholder text="Loading notifiers..." />;
  }
};
