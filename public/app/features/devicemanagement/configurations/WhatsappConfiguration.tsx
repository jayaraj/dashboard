import { css } from '@emotion/css';
import React, { useEffect, useState, useRef } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';

import { getBackendSrv } from '@grafana/runtime';
import { HorizontalGroup, VerticalGroup, useStyles2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';

export interface Props {}

export const WhatsappConfiguration = ({}: Props) => {
  let [isLoading, setIsLoading] = useState<boolean>(false);
  const [state, fetchWhatsapp] = useAsyncFn(async () => await getWhatsapp(), []);
  const qrCode = state.value ? state.value.qr_code : '';
  const styles = useStyles2(getStyles);
  const interval = useRef<any>(null);
  const timerInterval = useRef<any>(null);
  const [timer, setTimer] = useState(0);
  const secounds = timer > 9 ? '' + timer : '0' + timer;
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
    let timeoutId: number | ReturnType<typeof setTimeout>;
    if (timer > 0) {
      timeoutId = setTimeout(() => setTimer(timer - 1), 1000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  });

  useEffect(() => {
    fetchWhatsapp();
    interval.current = setInterval(() => fetchWhatsapp(), 33000);
    return () => {
      clearInterval(interval.current!);
      clearInterval(timerInterval.current!);
      interval.current = null;
      timerInterval.current = null;
      setTimer(0);
    };
  }, []);

  return (
    <Page.Contents isLoading={isLoading}>
      <HorizontalGroup justify="center">
        <VerticalGroup>
          {(state.value ? state.value.logged_in : false) ? (
            <h1 style={{ textAlign: 'center', fontWeight: 'bold', color: '#34BA18' }}>Configured</h1>
          ) : (
            <div className={styles.qrcode}>
              <pre style={{ fontSize: '6px', letterSpacing: '0', lineHeight: '1em' }}>{qrCode}</pre>
              <h3 style={{ textAlign: 'center', fontWeight: 'bold', color: '#898989' }}>{secounds}</h3>
            </div>
          )}
        </VerticalGroup>
      </HorizontalGroup>
    </Page.Contents>
  );
};

const getStyles = () => {
  return {
    qrcode: css`
      align-items: center;
      justify-contents: center;
      display: relative;
      width: '100%';
      font-weight: bold;
    `,
  };
};
