import React, { useMemo, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import { NavModelItem } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { FieldSet, Input, Field, Button, InputControl, Select, Themeable2, LinkButton, Stack } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { StoreState } from 'app/types';
import { Slab, UpdateSlabDTO } from 'app/types/billing/profile';

import { stringToSelectableValue, stringsToSelectableValues } from '../../alerting/unified/utils/amroutes';

import RatesField from './RatesField';
import { loadSlab } from './state/actions';
import { getSlab } from './state/selectors';

interface SlabPageRouteParams {
  id: string;
  slabId: string;
}
interface OwnProps extends GrafanaRouteComponentProps<SlabPageRouteParams>, Themeable2 {}
const pageNav: NavModelItem = {
  icon: 'tax',
  id: 'slab-setting',
  text: `Update Slab`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

export const SlabSettings = ({ profileId, slabId, slab, loadSlab }: Props) => {
  let [tags, setTags] = useState(stringsToSelectableValues([] as string[]));
  const getDefaultSlabValues = (slab: Slab | null): Slab => {
    if (slab) {
      return slab;
    } else {
      return {
        id: Number(0),
        tag: '',
        profile_id: 0,
        tax: Number(0),
        slabs: Number(1),
        rates: [{ id: '', from: Number(0), to: Number(0), final: true, amount: Number(0), description: '' }],
      };
    }
  };
  const defaultValues = useMemo(() => getDefaultSlabValues(slab), [slab]);
  const formSlab = useForm({ defaultValues });
  const { register, control, handleSubmit, setValue } = formSlab;
  const getTags = async () => {
    const response = await getBackendSrv().get('/api/tags/resource', { page: 1, perPage: 1000 });
    return response.tags.map(({ tag }: { tag: string }) => setTags((opts) => [...opts, stringToSelectableValue(tag)]));
  };

  const update = async (dto: UpdateSlabDTO) => {
    const updatedRates = dto.rates.map((r) => {
      return { ...r, from: Number(r.from), to: Number(r.to), amount: Number(r.amount) };
    });

    await getBackendSrv().put(`/api/slabs/${slabId}`, {
      tax: dto.tax,
      tag: dto.tag,
      slabs: dto.rates?.length,
      rates: updatedRates,
    });
  };

  useEffect(() => {
    getTags();
    loadSlab(slabId);
  }, []);

  useEffect(() => {
    setValue('id', defaultValues.id);
    setValue('profile_id', defaultValues.profile_id);
    setValue('tag', defaultValues.tag);
    setValue('tax', defaultValues.tax);
    setValue('slabs', defaultValues.slabs);
    defaultValues.rates.map((rate, index) => {
      setValue(`rates.${index}.from`, rate.from);
      setValue(`rates.${index}.to`, rate.to);
      setValue(`rates.${index}.amount`, rate.amount);
      setValue(`rates.${index}.final`, rate.final);
      setValue(`rates.${index}.description`, rate.description);
    });
  }, [defaultValues, setValue]);

  return (
    <Page
      navId="profiles"
      pageNav={pageNav}
      actions={<LinkButton href={`/org/profiles/edit/${profileId}/slabs`}>Back</LinkButton>}
    >
      <Page.Contents>
        <FormProvider {...formSlab}>
          <form onSubmit={handleSubmit(update)}>
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

function mapStateToProps(state: StoreState, props: OwnProps) {
  const profileId = parseInt(props.match.params.id, 10);
  const slabId = parseInt(props.match.params.slabId, 10);
  const slab = getSlab(state.slab, slabId);

  return {
    profileId,
    slabId,
    pageNav,
    slab,
  };
}

const mapDispatchToProps = {
  loadSlab,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(SlabSettings);
