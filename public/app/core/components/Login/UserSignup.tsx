import { css } from '@emotion/css';
import React from 'react';

import { LinkButton, VerticalGroup } from '@grafana/ui';
import { getConfig } from 'app/core/config';

export const UserSignup = () => {
  const href = getConfig().verifyEmailEnabled ? `${getConfig().appSubUrl}/verify` : `${getConfig().appSubUrl}/signup`;
  const paddingTop = css({ paddingTop: '16px' });

  return (
    <VerticalGroup>
      <div className={paddingTop}>New users please signup.</div>
      <LinkButton
        className={css({
          width: '100%',
          justifyContent: 'center',
        })}
        href={href}
        variant="secondary"
        fill="outline"
      >
        Sign up
      </LinkButton>
    </VerticalGroup>
  );
};
