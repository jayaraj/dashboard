import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateMath } from '@grafana/data';
import { Button, Modal, LoadingPlaceholder, CallToActionCard } from '@grafana/ui';
import { FormPanel } from 'app/core/components/CustomForm/components';
import { FormElementType } from 'app/core/components/CustomForm/constants';
import { Configuration, FormElement } from 'app/core/components/CustomForm/types';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { Alert, ConfigureAlertDTO, EnableAlertDTO } from 'app/types/devicemanagement/alert';

import { configureAlert, enableAlert, loadAlertDefinition } from '../state/actions';
import { getAlertDefinition } from '../state/selectors';

export interface OwnProps {
  isOpen: boolean;
  onCancel: (open: boolean) => void;
  alert: Alert;
  association: string;
  associationReference: number | string;
}

const mapDispatchToProps = {
  configureAlert,
  enableAlert,
  loadAlertDefinition,
};

function mapStateToProps(state: StoreState, props: OwnProps) {
  return {
    alertDefinition: getAlertDefinition(state.alertDefinition, props.alert.alert_definition_id),
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const AlertSettings: FC<Props> = ({
  isOpen,
  onCancel,
  alert,
  alertDefinition,
  configureAlert,
  enableAlert,
  loadAlertDefinition,
  association,
  associationReference,
}) => {
  const canWrite = contextSrv.hasPermission('alerts:write');
  let [isLoading, setIsLoading] = useState<boolean>(false);
  let [isEmpty, setIsEmpty] = useState<boolean>(false);
  let [updatedConfiguration, setUpdatedConfiguration] = useState<any>({});
  let [configuration, setConfiguration] = useState<Configuration>({ elements: [], sections: [] });

  const onConfigure = async () => {
    if (alert.id !== 0) {
      const dto: ConfigureAlertDTO = {
        name: alert.name,
        configuration: updatedConfiguration,
        association: alert.associated_with,
        associationReference: alert.association_reference,
        alert: alert,
      };
      await configureAlert(dto);
    } else {
      const dto: ConfigureAlertDTO = {
        name: alert.name,
        configuration: updatedConfiguration,
        association: association!,
        associationReference: associationReference,
      };
      await configureAlert(dto);
    }
    if (alert.onEdit) {
      alert.onEdit();
    }
    onCancel(false);
  };

  const onEnable = async (enabled: boolean) => {
    if (alert.id !== 0) {
      const dto: EnableAlertDTO = {
        name: alert.name,
        enabled: enabled,
        association: alert.associated_with,
        associationReference: alert.association_reference,
        alert: alert,
      };
      await enableAlert(dto);
    } else {
      const dto: EnableAlertDTO = {
        name: alert.name,
        enabled: enabled,
        association: association!,
        associationReference: associationReference,
      };
      await enableAlert(dto);
    }

    if (alert.onEdit) {
      alert.onEdit();
    }
    onCancel(false);
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      loadAlertDefinition(alert.alert_definition_id);
    }
  }, [isOpen]);

  useEffect(() => {
    const elements =
      alertDefinition && alertDefinition!.configuration
        ? JSON.parse(JSON.stringify(alertDefinition!.configuration.elements))
        : [];
    const sections =
      alertDefinition && alertDefinition!.configuration
        ? JSON.parse(JSON.stringify(alertDefinition!.configuration.sections))
        : [];
    if (alertDefinition) {
      setIsLoading(false);
    }
    setIsEmpty(elements.length <= 0);
    if (alert.configuration) {
      elements?.forEach((element: FormElement) => {
        if (element.type === FormElementType.DATETIME) {
          element.value = dateMath.parse(alert.configuration[element.id]);
        }
        if (element.type === FormElementType.SLIDER) {
          element.value = alert.configuration[element.id] ? alert.configuration[element.id] : element.min;
        } else {
          element.value = alert.configuration[element.id];
        }
      });
    }
    let configuration = alert.configuration ? alert.configuration : {};
    if (!alert.configuration) {
      elements?.map((element: FormElement) => {
        configuration[element.id] = element.value;
      });
    }
    setUpdatedConfiguration(configuration);
    setConfiguration({ elements: [...elements], sections: [...sections] });
  }, [alertDefinition, alert]);

  const onChange = (elements?: FormElement[]) => {
    const configurations: any = {};
    elements?.forEach((element) => {
      configurations[element.id] = element.value;
    });
    setUpdatedConfiguration(configurations);
    setConfiguration({
      ...configuration,
      elements: elements ? elements : configuration.elements,
    });
  };

  return (
    <Modal
      title="Configure Alert"
      icon="bell"
      isOpen={isOpen}
      closeOnEscape={true}
      onDismiss={() => {
        onCancel(false);
      }}
      onClickBackdrop={() => {
        onCancel(false);
      }}
      iconTooltip="configure alert"
    >
      {isLoading ? (
        <div className="preloader">
          <LoadingPlaceholder text={'Loading configurations...'} />
        </div>
      ) : isEmpty ? (
        <CallToActionCard callToActionElement={<div />} message="No configurations are available." />
      ) : (
        <FormPanel configuration={configuration} disabled={!canWrite} onChange={onChange}></FormPanel>
      )}
      <Modal.ButtonRow>
        <Button
          variant="secondary"
          onClick={() => {
            onCancel(false);
          }}
          fill="outline"
        >
          Cancel
        </Button>
        {alert.id === 0 && (
          <Button
            variant="secondary"
            onClick={() => {
              onEnable(false);
            }}
          >
            Disable
          </Button>
        )}
        {alert.id === 0 && (
          <Button
            variant="primary"
            onClick={() => {
              onEnable(true);
            }}
          >
            Enable
          </Button>
        )}
        {alert.id !== 0 && (
          <Button
            variant="primary"
            onClick={() => {
              onEnable(!alert.enabled);
            }}
          >
            {alert.enabled ? <>Disable</> : <>Enable</>}
          </Button>
        )}
        {!isEmpty && (
          <Button variant="primary" onClick={() => onConfigure()} disabled={!canWrite}>
            Update
          </Button>
        )}
      </Modal.ButtonRow>
    </Modal>
  );
};

export default connector(AlertSettings);
