import { css } from '@emotion/css';
import React, { useMemo, FC, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { connect, ConnectedProps, useDispatch} from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import { FieldSet, Input, Field, useStyles2, Button } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { Slab } from 'app/types';

import RatesField from './RatesField';
import { deleteSlab, updateSlab, createSlab } from './state/actions';

export interface OwnProps {
  slab?: Slab
}

const mapDispatchToProps = {
  deleteSlab: deleteSlab,
  updateSlab: updateSlab,
  createSlab: createSlab,
};

const connector = connect(null, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

const getDefaultSlabValues = (slab?: Slab): Slab => {
  if (slab) {
    return slab;
  } else {
    return {
      id: Number(0),
      profile_id: 0,
      tax: Number(0),
      slabs: Number(1),
      rates: [{id: '', from: Number(0), to: Number(0), final: true, amount: Number(0), description: ''}],
    };
  }
};

export const SlabSettings: FC<Props> = ({ slab, deleteSlab, updateSlab, createSlab }) => {
  const defaultValues = useMemo(() => getDefaultSlabValues(slab), [slab]);

  const formSlab = useForm({ defaultValues });
  const dispatch = useDispatch();
  const { register, handleSubmit, setValue } = formSlab;
  const canWrite = contextSrv.user.isGrafanaAdmin || contextSrv.hasRole('Admin');
  const styles = useStyles2(getStyles);
 
  const onSubmit = (data: Slab) => {
    const { id, tax, rates } = data;
    const updatedRates = rates.map((r) => {
      return {...r, from: Number(r.from), to: Number(r.to), amount: Number(r.amount)};
    });
    if (id) {
      dispatch(updateSlab({id: id, tax: Number(tax), rates: updatedRates}));
    } else {
      dispatch(createSlab({tax: Number(tax), rates: updatedRates}));
    }
  };

  useEffect(() => {
    setValue('id', defaultValues.id);
    setValue('profile_id', defaultValues.profile_id);
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

  return (
    <FormProvider {...formSlab}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldSet label={`${slab?.id === 0 ? 'Create slabs' : 'Update slabs'}`}>
          <Field label="Tax" description="tax applicable to these slabs values between (0 - 1)" disabled={!canWrite}>
            <Input {...register('tax', { required: true })} id="tax" width={30} />
          </Field>
          <RatesField/>
        </FieldSet>
        <div className={styles.flexRow}>
          <Button type="submit">Submit</Button>
          {(defaultValues.id !== 0) && (
            <Button type="button" icon="trash-alt" variant="secondary" onClick={() => deleteSlab(defaultValues.id)}></Button>
          )}
        </div>
      </form>
    </FormProvider>
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
