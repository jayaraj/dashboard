import { css } from '@emotion/css';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import { Input, Field, Form, Button, FieldSet, VerticalGroup, LinkButton, useStyles2 } from '@grafana/ui';
import { contextSrv } from 'app/core/core';
import { FixedCharge } from 'app/types/billing/fixedcharge';

import { updateFixedCharge } from './state/actions';

export interface OwnProps {
  fixedCharge: FixedCharge;
}

export const FixedChargeSettings = ({ fixedCharge, updateFixedCharge }: Props) => {
  const canWrite = contextSrv.hasPermission('fixedcharges:write');
  const styles = useStyles2(getStyles);

  return (
    <VerticalGroup>
      <Form
        defaultValues={{ ...fixedCharge }}
        onSubmit={(charge: FixedCharge) => {
          updateFixedCharge(Number(charge.tax), Number(charge.amount), charge.description);
        }}
        disabled={!canWrite}
      >
        {({ register }) => (
          <>
            <FieldSet>
              <Field label="Amount" description="Cost of Item" disabled={!canWrite}>
                <Input {...register('amount', { required: true })} id="amount-input" width={40} />
              </Field>
              <Field label="Tax" description="tax deduction should be between (0 - 1)" disabled={!canWrite}>
                <Input {...register('tax', { required: true })} id="tax-input" width={40} />
              </Field>
              <Field label="Description" disabled={!canWrite}>
                <Input {...register('description', { required: true })} id="description-input" width={40} />
              </Field>
            </FieldSet>
            <div className={styles.flexRow}>
              <Button type="submit" disabled={!canWrite}>
                Update
              </Button>
              <LinkButton href={`/org/fixedcharges`}>Back</LinkButton>
            </div>
          </>
        )}
      </Form>
    </VerticalGroup>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  flexRow: css`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;

    & > * {
      margin-right: ${theme.spacing(1)};
    }
  `,
});

const mapDispatchToProps = {
  updateFixedCharge,
};

const connector = connect(null, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;
export default connector(FixedChargeSettings);
