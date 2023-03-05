import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Input, Field, Form, Button, FieldSet, VerticalGroup } from '@grafana/ui';
import { contextSrv } from 'app/core/core';
import { FixedCharge, AccessControlAction } from 'app/types';

import { updateFixedCharge } from './state/actions';

const mapDispatchToProps = {
  updateFixedCharge,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  fixedCharge: FixedCharge;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const FixedChargeSettings: FC<Props> = ({ fixedCharge, updateFixedCharge }) => {
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionFixedChargesWrite, contextSrv.user.isGrafanaAdmin);
  const label = 'Org charge Settings';

  return (
    <VerticalGroup>
      <Form
        defaultValues={{ ...fixedCharge }}
        onSubmit={(formfixedCharge: FixedCharge) => {
          updateFixedCharge(Number(formfixedCharge.tax), Number(formfixedCharge.amount), formfixedCharge.description);
        }}
        disabled={!canWrite}
      >
        {({ register }) => (
          <FieldSet label={label}>
            <Field
              label="Amount"
              description="Cost of Item"
              disabled={!canWrite}
            >
              <Input {...register('amount', { required: true })} id="amount-input" width={60} />
            </Field>
            <Field
              label="Tax"
              description="tax deduction should be between (0 - 1)"
              disabled={!canWrite}
            >
              <Input {...register('tax', { required: true })} id="tax-input" width={60} />
            </Field>
            <Field
              label="Description"
              disabled={!canWrite}
            >
              <Input {...register('description', { required: true })} id="description-input" width={60} />
            </Field>
            <Button type="submit" disabled={!canWrite}>
              Update
            </Button>
          </FieldSet>
        )}
      </Form>
    </VerticalGroup>
  );
};

export default connector(FixedChargeSettings);
