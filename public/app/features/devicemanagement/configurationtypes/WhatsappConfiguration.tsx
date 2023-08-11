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
  const timerInterval = useRef<any>(null);
  const [timer, setTimer] = useState(0);
  const secounds = (timer > 9) ? '' + timer : '0' + timer;
  const getWhatsapp = async () => {
    setIsLoading(true);
    const response = await getBackendSrv().get('/api/notifications/whatsapp');
    if (!response.logged_in) {
      clearInterval(timerInterval.current!);
      setTimer(30);
    }
    setIsLoading(false);
    return response;
  };

  React.useEffect(() => {
    let timeoutId: number | ReturnType<typeof setTimeout>
    if (timer > 0) {  
      timeoutId = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  });

  useEffect(() => {
    if (!interval.current && isOpen) {
      fetchWhatsapp();
      interval.current = setInterval(() => fetchWhatsapp(), 33000);
    }
    return () => {
      clearInterval(interval.current!);
      clearInterval(timerInterval.current!);
      interval.current = null;
      timerInterval.current = null;
      setTimer(0);
    };
}, [isOpen]);

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
