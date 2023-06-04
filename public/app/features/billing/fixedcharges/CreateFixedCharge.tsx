import React from 'react';

import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Form, Field, Input, FieldSet } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';

export interface FixedChargeDTO {
  tax: number;
  amount: number;
  description: string;
}

export const CreateFixedCharge = (): JSX.Element => {
  const createFixedCharge = async (formModel: FixedChargeDTO) => {
    const newFixedCharge = await getBackendSrv().post('/api/fixedcharges', {
      tax: Number(formModel.tax),
      amount: Number(formModel.amount),
      description: formModel.description,
    });
    if (newFixedCharge.id) {
      locationService.push(`/org/fixedcharges/edit/${newFixedCharge.id}`);
    }
  };

  return (
    <Page navId="fixedcharges">
      <Page.Contents>
        <Form onSubmit={createFixedCharge}>
          {({ register, errors }) => (
            <FieldSet label="New Charge">
              <Field label="Amount" required invalid={!!errors.amount} error="Charge Amount is required">
                <Input {...register('amount', { required: true })} id="fixedcharge-amount" width={40} />
              </Field>
              <Field label="Tax" required invalid={!!errors.tax} error="Tax is required and should be between (0 - 1)">
                <Input {...register('tax', { required: true })} id="fixedcharge-tax" width={40} />
              </Field>
              <Field label="Description" required invalid={!!errors.description} error="Description is required">
                <Input {...register('description', { required: true })} id="fixedcharge-description" width={40} />
              </Field>
              <div className="gf-form-button-row">
                <Button type="submit" variant="primary">
                  Create
                </Button>
              </div>
            </FieldSet>
          )}
        </Form>
      </Page.Contents>
    </Page>
  );
};
export default CreateFixedCharge;
