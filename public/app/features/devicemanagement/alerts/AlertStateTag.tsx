import React, { FC } from 'react';

import { StateTag } from './StateTag';
import { alertStateToReadable, alertStateToState } from './utils';
import { AlertingState } from 'app/types';
interface Props {
  state: AlertingState;
}

export const AlertStateTag: FC<Props> = ({ state }) => (
  <StateTag state={alertStateToState(state)}>{alertStateToReadable(state)}</StateTag>
);
