import React, { useMemo, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { NavModelItem } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { FieldSet, Input, Field, Button, InputControl, Select, LinkButton, Stack } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { CreateSlabDTO, Slab } from 'app/types/billing/profile';

import { stringToSelectableValue, stringsToSelectableValues } from '../../alerting/unified/utils/amroutes';

import RatesField from './RatesField';

const pageNav: NavModelItem = {
  icon: 'tax',
  id: 'slab-new',
  text: `Create Slab`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

interface Props extends GrafanaRouteComponentProps<{ id: string }> {}

export const CreateSlab = ({ match }: Props): JSX.Element => {
  const profileId = parseInt(match.params.id, 10);
  let [tags, setTags] = useState(stringsToSelectableValues([] as string[]));
  const getDefaultSlabValues = (): Slab => {
    return {
      id: Number(0),
      tag: '',
      profile_id: 0,
      tax: Number(0),
      slabs: Number(1),
      rates: [{ id: '', from: Number(0), to: Number(0), final: true, amount: Number(0), description: '' }],
    };
  };
  const defaultValues = useMemo(() => getDefaultSlabValues(), []);
  const formSlab = useForm({ defaultValues });
  const { register, control, handleSubmit } = formSlab;
  const getTags = async () => {
    const response = await getBackendSrv().get('/api/tags/resource', { page: 1, perPage: 1000 });
    return response.tags.map(({ tag }: { tag: string }) => setTags((opts) => [...opts, stringToSelectableValue(tag)]));
  };

  useEffect(() => {
    getTags();
  }, []);

  const create = async (dto: CreateSlabDTO) => {
    const updatedRates = dto.rates.map((r) => {
      return { ...r, from: Number(r.from), to: Number(r.to), amount: Number(r.amount) };
    });
    const result = await getBackendSrv().post(`/api/slabs`, {
      tax: dto.tax,
      tag: dto.tag,
      slabs: dto.rates?.length,
      rates: updatedRates,
      profile_id: profileId,
    });
    if (result.id) {
      locationService.push(`/org/profiles/edit/${profileId}/slabs`);
    }
  };

  return (
    <Page
      navId="profiles"
      pageNav={pageNav}
      actions={<LinkButton href={`/org/profiles/edit/${profileId}/slabs`}>Back</LinkButton>}
    >
      <Page.Contents>
        <FormProvider {...formSlab}>
          <form onSubmit={handleSubmit(create)}>
            <FieldSet>
              <Field label={'Tag'}>
                <InputControl
                  control={control}
                  name="tag"
                  render={({ field: { ref, onChange, ...field } }) => {
                    return <Select {...field} onChange={(value) => onChange(value.value)} options={tags} width={30} />;
                  }}
                />
              </Field>
              <Field label="Tax" description="tax applicable to these slabs values between (0 - 1)">
                <Input {...register('tax', { required: true })} id="tax" width={30} />
              </Field>
              <RatesField />
            </FieldSet>
            <Stack gap={1} direction="row">
              <Button type="submit" variant="primary">
                Create
              </Button>
              <LinkButton href={`/org/profiles/edit/${profileId}/slabs`}>Back</LinkButton>
            </Stack>
          </form>
        </FormProvider>
      </Page.Contents>
    </Page>
  );
};

export default CreateSlab;
