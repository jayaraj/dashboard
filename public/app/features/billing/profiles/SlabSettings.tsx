import { css } from '@emotion/css';
import React, { useMemo, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { connect, ConnectedProps} from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { FieldSet, Input, Field, useStyles2, Button, InputControl, Select, Themeable2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { loadSlab } from './state/actions';
import { getNavModel } from 'app/core/selectors/navModel';
import { Slab, StoreState, UpdateSlabDTO } from 'app/types';

import { stringToSelectableValue, stringsToSelectableValues } from '../../alerting/unified/utils/amroutes';

import RatesField from './RatesField';
import { getPageNav } from './state/navModel';
import { getSlab } from './state/selectors';

interface OwnProps extends GrafanaRouteComponentProps<{ id: string, slabId: string }>, Themeable2 {}
function mapStateToProps(state: StoreState, props: OwnProps) {
  const profileId = parseInt(props.match.params.id, 10);
  const slabId = parseInt(props.match.params.slabId, 10);
  const pageName = 'slabs';
  const profileLoadingNav = getPageNav(pageName as string);
  const pageNav = getNavModel(state.navIndex, `profile-${pageName}-${profileId}`, profileLoadingNav).main;
  const slab = getSlab(state.slab, slabId);

  return {
    slabId,
    pageNav,
    slab
  };
}
const mapDispatchToProps = {
  loadSlab,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const SlabSettings  = ({slabId, pageNav, slab, loadSlab}: Props): JSX.Element => {
  let [tags, setTags] = useState(stringsToSelectableValues([]as string[]));
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
        rates: [{id: '', from: Number(0), to: Number(0), final: true, amount: Number(0), description: ''}],
      };
    }
    
  };
  const defaultValues = useMemo(() => getDefaultSlabValues(slab), [slab]);
  const formSlab = useForm({defaultValues});
  const { register, control, handleSubmit, setValue } = formSlab;
  const styles = useStyles2(getStyles);

  useEffect(() => {
    loadSlab(slabId);
    getTags();
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
    })
  }, [defaultValues, setValue]);

  const getTags =  async () => {
    const response = await getBackendSrv().get('/api/tags/resource', {page: 1, perPage: 1000});
    return response.tags.map(({ tag }: {tag: string}) => setTags((opts) => [...opts, stringToSelectableValue(tag)]));
  }

  const update = async (dto: UpdateSlabDTO) => {
    const updatedRates = dto.rates.map((r) => {
      return {...r, from: Number(r.from), to: Number(r.to), amount: Number(r.amount)};
    });
    const result = await getBackendSrv().put(`/api/slabs/${slabId}`, {
      tax: dto.tax,
      tag: dto.tag,
      slabs: dto.rates?.length,
      rates: updatedRates,
    });
    const profileId = slab!.profile_id? slab!.profile_id: 0;
    if (result.id) {
      locationService.push(`/org/profiles/edit/${profileId}/slabs`);
    }
  };
 
  return (
    <Page navId="profiles" pageNav={pageNav}>
      <Page.Contents>
        <FormProvider {...formSlab}>
          <form onSubmit={handleSubmit(update)}>
            <FieldSet label={'Update slabs'}>
              <Field label={'Tag'}>
                <InputControl
                  control={control}
                  name="tag"
                  render={({ field: { ref, onChange, ...field } }) => {
                    return (
                      <Select {...field} onChange={(value) => onChange(value.value)} options={tags} width={30}/>
                    );
                  }}
                />
              </Field>
              <Field label="Tax" description="tax applicable to these slabs values between (0 - 1)">
                <Input {...register('tax', { required: true })} id="tax" width={30} />
              </Field>
              <RatesField/>
            </FieldSet>
            <div className={styles.flexRow}>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </FormProvider>
      </Page.Contents>
    </Page>
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


export default connector(SlabSettings);
