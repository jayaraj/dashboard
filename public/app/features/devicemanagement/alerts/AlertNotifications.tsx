import { css } from '@emotion/css';
import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Button, Modal, LoadingPlaceholder, HorizontalGroup, VerticalGroup, useStyles2, InlineField, Switch} from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { AccessControlAction, AlertDefinition, StoreState, UpdateNotificationDTO} from 'app/types';

import { loadNotification, updateNotification } from './state/actions';
import { getAlertNotification } from './state/selectors';
export interface OwnProps {
  isOpen: boolean
  onCancel: (open: boolean) => void;
  alertDefinition: AlertDefinition;
}

const mapDispatchToProps = {
  updateNotification,
  loadNotification,
};

function mapStateToProps(state: StoreState, props: OwnProps) {
  return {
    alertNotification: getAlertNotification(state.alertNotification, props.alertDefinition.name),
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const AlertNotifications: FC<Props> = ({ 
  isOpen, 
  onCancel,
  alertDefinition,
  alertNotification,
  updateNotification,
  loadNotification}) => {

  const fallback = contextSrv.hasRole('Admin');
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionAlertsRead, fallback);
  let [isLoading, setIsLoading] = useState<boolean>(false);
  let [updatedConfiguration , setUpdatedConfiguration] = useState<any>({});
  const styles = useStyles2(getStyles);
 
  const onConfigure = async () => {
    const dto: UpdateNotificationDTO = {alert_definition_id: alertDefinition.id, name: alertDefinition.name, configuration: updatedConfiguration};
    await updateNotification(dto);
    onCancel(false);
  };

  useEffect( () => {
    if (isOpen) {
      setIsLoading(true);
      loadNotification(alertDefinition.name);
    }
  }, [isOpen]);

  useEffect(() => {
    if (alertNotification) {
      setIsLoading(false);
      let config: any = {};
      if (alertNotification.configuration) {
        Object.keys(alertNotification.configuration).forEach(function(key){ config[key] = alertNotification.configuration[key]});
      }
      setUpdatedConfiguration(config);
    }
  }, [alertNotification]);

  const onChange =  (key: string, value: boolean) => { 
    let updates = {...updatedConfiguration};
    updates[key] = value;
    setUpdatedConfiguration(updates);
  };

  return (
    <Modal 
    title="Configure Notifications"
    icon="comment-alt-share"
    isOpen={isOpen}
    closeOnEscape={true}
    onDismiss={() => {onCancel(false)}}
    onClickBackdrop={() => {onCancel(false)}}
    iconTooltip="configure notifications"
    >
      {(isLoading) ? (
        <div className="preloader">
          <LoadingPlaceholder text={'Loading configurations...'} />
        </div>):
        (<HorizontalGroup align = 'normal'>
            <VerticalGroup >
              <InlineField
                className={styles.checkbox}
                label={'Email'}
                labelWidth={20}
              >
                <Switch value={updatedConfiguration['email']} onChange={()=>{onChange('email', !updatedConfiguration['email'])}} />
              </InlineField>
              <InlineField
                className={styles.checkbox}
                label={'Whatsapp'}
                labelWidth={20}
              >
                <Switch value={updatedConfiguration['whatsapp']} onChange={()=>{onChange('whatsapp', !updatedConfiguration['whatsapp'])}} />
              </InlineField>
            </VerticalGroup>
            <div style={{ padding: '0 50px'}} />
            <VerticalGroup>
              <InlineField
                className={styles.checkbox}
                label={'SMS'}
                labelWidth={20}
              >
                <Switch value={updatedConfiguration['sms']} onChange={()=>{onChange('sms', !updatedConfiguration['sms'])}} />
              </InlineField>
            </VerticalGroup>
          </HorizontalGroup>)
      }
      <Modal.ButtonRow>
        <Button variant="secondary" onClick={() => {onCancel(false)}} fill="outline">
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onConfigure()} disabled={!canWrite}>
          Update
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};

export default connector(AlertNotifications);

const getStyles = () => {
  return {
    checkbox: css`
      align-items: center;
      display: flex;
    `,
  };
};
