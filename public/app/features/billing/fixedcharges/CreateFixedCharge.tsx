import React, { useEffect, useState } from 'react';
import { NavModelItem } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Form, Field, Input, FieldSet, LinkButton, Stack, InputControl, Select } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { FixedChargeDTO } from 'app/types/billing/fixedcharge';
import { Profile } from 'app/types/billing/profile';

import { stringToSelectableValue, stringsToSelectableValues } from '../../alerting/unified/utils/amroutes';

const pageNav: NavModelItem = {
  icon: 'fixed-charge',
  id: 'fixedcharge-new',
  text: `New Charge`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

export const CreateFixedCharge = (): JSX.Element => {
  let [profiles, setProfiles] = useState(stringsToSelectableValues([] as string[]));

  const createFixedCharge = async (dto: FixedChargeDTO) => {
    const result = await getBackendSrv().post('/api/fixedcharges', {
      profile: dto.profile,
      tax: Number(dto.tax),
      amount: Number(dto.amount),
      description: dto.description,
    });
    if (result.id) {
      locationService.push(`/org/fixedcharges/edit/${result.id}`);
    }
  };
  const profilesRequest = async () => {
    const response = await getBackendSrv().get('/api/profiles', { query: '', page: 1, perPage: 100 });
    response.profiles.map((profile: Profile) =>
      setProfiles((opts) => [...opts, stringToSelectableValue(profile.name)])
    );
  };

  useEffect(() => {
    profilesRequest();
  }, []);

  return (
    <Page navId="fixedcharges" pageNav={pageNav} actions={<LinkButton href={`/org/fixedcharges`}>Back</LinkButton>}>
      <Page.Contents>
        <Form defaultValues={{ tax: 0, amount: 0, description: '' }} onSubmit={createFixedCharge}>
          {({ register, errors, control }) => (
            <>
              <FieldSet>
                <Field label="Profile">
                  <InputControl
                    name="profile"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, ...field } }) => (
                      <Select {...field} onChange={(value) => onChange(value.value)} options={profiles} width={40} />
                    )}
                  />
                </Field>
                <Field label="Amount" required invalid={!!errors.amount} error="Amount is required">
                  <Input {...register('amount', { required: true })} id="fixedcharge-amount" width={40} />
                </Field>
                <Field
                  label="Tax"
                  required
                  invalid={!!errors.tax}
                  error="Tax is required and should be between (0 - 1)"
                >
                  <Input {...register('tax', { required: true })} id="fixedcharge-tax" width={40} />
                </Field>
                <Field label="Description" required invalid={!!errors.description} error="Description is required">
                  <Input {...register('description', { required: true })} id="fixedcharge-description" width={40} />
                </Field>
              </FieldSet>
              <Stack gap={1} direction="row">
                <Button type="submit" variant="primary">
                  Create
                </Button>
                <LinkButton href={`/org/fixedcharges`}>Back</LinkButton>
              </Stack>
            </>
          )}
        </Form>
      </Page.Contents>
    </Page>
  );
};
export default CreateFixedCharge;
