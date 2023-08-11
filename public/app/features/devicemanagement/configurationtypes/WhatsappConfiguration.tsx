import { css } from '@emotion/css';
import React, { FC, useEffect, useState, useRef } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { connect, ConnectedProps } from 'react-redux';

import { getBackendSrv } from '@grafana/runtime';
import { Button, Modal, LoadingPlaceholder, HorizontalGroup, VerticalGroup, useStyles2} from '@grafana/ui';
import { StoreState } from 'app/types';

export interface OwnProps {
  isOpen: boolean
  onCancel: (open: boolean) => void;
}

const mapDispatchToProps = {};

function mapStateToProps(state: StoreState, props: OwnProps) {
  return {};
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const WhatsappConfiguration: FC<Props> = ({ isOpen, onCancel}) => {

  let [isLoading, setIsLoading] = useState<boolean>(false);
  const [state, fetchWhatsapp] = useAsyncFn(async () => await getWhatsapp(), []);
  const qrCode = (state.value)? state.value.qr_code: '';
  const styles = useStyles2(getStyles);
  const interval = useRef<any>(null)
  const [timer, setTimer] = useState(0);
  const secounds = (timer > 9) ? '' + timer : '0' + timer;
  const getWhatsapp = async () => {
    setIsLoading(true);
    const response = await getBackendSrv().get('/api/notifications/whatsapp');
    if (!response.logged_in) {
      setTimer(30);
    }
    setIsLoading(false);
    return response;
  };

  useEffect( () => {
    if (isOpen) {
      fetchWhatsapp();
    }
  }, [isOpen]);

  useEffect(() => {
    if (state && state.value && !state.value.logged_in && !interval.current) {
      interval.current = setInterval(() => fetchWhatsapp(), 30000);
    }
    return () => {
      clearInterval(interval.current!);
    };
}, [state]);

React.useEffect(() => {
  if (timer > 0) {
    setTimeout(() => setTimer(timer - 1), 1000);
  }
}, [timer]);

  return (
    <Modal 
    title="Configure Whatsapp"
    icon="whatsapp"
    isOpen={isOpen}
    closeOnEscape={true}
    onDismiss={() => {onCancel(false)}}
    onClickBackdrop={() => {onCancel(false)}}
    iconTooltip="configure whatsapp"
    >
      {(isLoading) ? (
        <div className="preloader" style={{height: "225px"}} >
          <LoadingPlaceholder text={'Loading...'} />
        </div>):
        (<HorizontalGroup justify = 'center'>
            <VerticalGroup >
              {((state.value)? state.value.logged_in: false)? (<h1 style={{textAlign: "center", fontWeight: 'bold', color: '#34BA18'}}>Configured</h1>): (
              <div className={styles.qrcode}>
                <pre style={{fontSize: "6px", letterSpacing: "0", lineHeight: "1em"}}>{qrCode}</pre>
                <h3 style={{textAlign: "center", fontWeight: 'bold', color: '#898989'}}>{secounds}</h3>
              </div>)}
            </VerticalGroup>
          </HorizontalGroup>)
      }
      <Modal.ButtonRow>
        <Button variant="secondary" onClick={() => {onCancel(false)}} fill="outline">
          Cancel
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};

export default connector(WhatsappConfiguration);

const getStyles = () => {
  return {
    qrcode: css`
      align-items: center;
      justify-contents: center;
      display: relative;
      width: "100%";
      font-weight: bold;
    `,

  };
};
