import { css, cx } from '@emotion/css';
import React, { FC } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, Field, Input, IconButton, useStyles2, Checkbox } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { AccessControlAction, Slab } from 'app/types';


interface Props {
  className?: string;
}

const RatesField: FC<Props> = ({ className }) => {
  const styles = useStyles2(getStyles);
  const formSlab = useFormContext<Slab>();
  const { control, register, setValue, watch } = formSlab;
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionSlabWrite, contextSrv.user.isGrafanaAdmin);
  let { fields: rates = [], append, remove } = useFieldArray<Slab>({ control, name: 'rates' });
  rates = watch('rates'); 

  return (
    <div className={cx(className, styles.wrapper)}>
      <Field label="Slabs" required>
        <div>
          <div className={styles.rates}>
            {rates.map((rate, index) => {
              return (
                <div className={styles.row} key={`${index}`} data-testid="rate">
                  <Field
                    label="From"
                    description="lower range"
                    disabled={!canWrite}
                  >
                    <Input
                      {...register(`rates.${index}.from` as const, {
                        required: { value: true, message: 'Required.' },
                      })}
                      defaultValue={rate.from}
                      placeholder="from"
                    />
                  </Field>
                  {!rate.final && (
                    <Field
                      label="To"
                      description="higher range"
                      disabled={!canWrite}
                    >
                      <Input
                        {...register(`rates.${index}.to` as const, {
                          required: { value: true, message: 'Required.' },
                        })}
                        defaultValue={rate.to}
                        placeholder="to"
                      />
                    </Field>
                  )}
                  <Field
                    label="Amount"
                    description="Cost"
                    disabled={!canWrite}
                  >
                    <Input
                      {...register(`rates.${index}.amount` as const, {
                        required: { value: true, message: 'Required.' },
                      })}
                      defaultValue={rate.amount}
                      placeholder="amount"
                    />
                  </Field>
                  <Field
                    label="Description"
                    description="description"
                    disabled={!canWrite}
                  >
                    <Input
                      {...register(`rates.${index}.description` as const, {
                        required: { value: true, message: 'Required.' },
                      })}
                      defaultValue={rate.description}
                      placeholder=""
                    />
                  </Field>
                  <Field label="AboveOnly" description="is gt only" disabled={!canWrite}>
                    <Checkbox id={rate.id} className={styles.checkbox} {...register(`rates.${index}.final`)} defaultChecked={rate.final} onChange={(e)=> {
                      setValue(`rates.${index}.final`, e.currentTarget.checked)
                      }} />
                  </Field>
                  {rates.length > 1 && (
                    <IconButton
                      className={styles.removeButton}
                      tooltip="Remove slab"
                      name={'trash-alt'}
                      onClick={() => remove(index)}
                    >
                      Remove
                    </IconButton>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            type="button"
            icon="plus"
            variant="secondary"
            onClick={() => {
              const newRate = { from: Number(0), to: Number(0), final: false, amount: Number(0), description: '' };
              append(newRate);
            }}
          >
            Add slab
          </Button>
        </div>
      </Field>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    wrapper: css`
      margin-top: ${theme.spacing(2)};
    `,
    row: css`
      display: flex;
      align-items: flex-start;
      flex-direction: row;
      background-color: ${theme.colors.background.secondary};
      padding: ${theme.spacing(1)} ${theme.spacing(1)} 0 ${theme.spacing(1)};
      & > * + * {
        margin-left: ${theme.spacing(2)};
      }
    `,
    removeButton: css`
      margin-left: ${theme.spacing(1)};
      margin-top: ${theme.spacing(2.5)};
    `,
    checkbox: css`
      align-items: center;
      padding-top: ${theme.spacing(1)};
    `,
    rates: css`
      max-width: ${theme.breakpoints.values.md}px;
      margin: ${theme.spacing(1)} 0;
      padding-top: ${theme.spacing(0.5)};
    `,
  };
};

export default RatesField;
