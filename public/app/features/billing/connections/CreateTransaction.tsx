import { css } from '@emotion/css';
import classNames from 'classnames';
import React, { useMemo } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import { FieldSet, Input, Field, useStyles2, Button, Modal, Select, InputControl, IconButton } from '@grafana/ui';
import { TRANSACTION_TYPES, ContextDTO } from 'app/types/billing/connection';

import { createTransaction } from './state/actions';

export interface OwnProps {
  isOpen: boolean;
  onCancel: (open: boolean) => void;
}

const getDefaultTransactionDTO = (): TransactionDTO => {
  return {
    type: TRANSACTION_TYPES[0]?.value || '',
    tax: Number(0),
    amount: Number(0),
    description: '',
    contexts: [
      { key: 'invoice', value: '' },
      { key: 'ref', value: '' },
    ],
  };
};

interface TransactionDTO {
  tax: number;
  type: string;
  amount: number;
  description: string;
  contexts: ContextDTO[];
}

export const CreateTransaction = ({ isOpen, onCancel, createTransaction }: Props) => {
  const defaultValues = useMemo(() => getDefaultTransactionDTO(), []);
  const formTransaction = useForm({ defaultValues });
  const { register, control, handleSubmit, reset } = formTransaction;
  const styles = useStyles2(getStyles);
  let { fields: contexts = [], append, remove } = useFieldArray<TransactionDTO>({ control, name: 'contexts' });

  const onSubmit = (dto: TransactionDTO) => {
    const { type, tax, amount, description, contexts } = dto;
    const ctx = {} as any;
    contexts.map((c) => {
      ctx[c.key] = c.value;
    });
    reset();
    createTransaction({
      type: type,
      tax: Number(tax),
      amount: Number(amount),
      description: description,
      contexts: ctx,
    });
  };

  return (
    <Modal
      title="Create Transaction"
      icon="invoice"
      isOpen={isOpen}
      closeOnEscape={true}
      onDismiss={() => {
        onCancel(false);
      }}
      onClickBackdrop={() => {
        onCancel(false);
      }}
      iconTooltip="create transaction"
    >
      <FormProvider {...formTransaction}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <div className={classNames([styles.flexRow, styles.alignBaseline])}>
              <Field label="Type" description="transaction type" className={styles.formInput}>
                <InputControl
                  name="type"
                  render={({ field: { onChange, ...field } }) => (
                    <Select
                      {...field}
                      onChange={(value) => onChange(value.value)}
                      options={TRANSACTION_TYPES}
                      width={40}
                    />
                  )}
                  control={control}
                  rules={{ required: true }}
                />
              </Field>
              <Field label="Tax" description="tax should be between (0 - 1)" className={styles.formInput}>
                <Input {...register('tax', { required: true })} id="tax" width={30} />
              </Field>
            </div>
            <div className={classNames([styles.flexRow, styles.alignBaseline])}>
              <Field label="Amount" description="Amount to be charged" className={styles.formInput}>
                <Input {...register('amount', { required: true })} id="amount" width={30} />
              </Field>
              <Field label="Description" description="Description" className={styles.formInput}>
                <Input {...register('description', { required: true })} id="description" width={30} />
              </Field>
            </div>

            <Field label="Context">
              <div>
                <div className={styles.context}>
                  {contexts.map((context, index) => {
                    return (
                      <div className={styles.row} key={`${index}`} data-testid="key">
                        <Field label="Key">
                          <Input
                            {...register(`contexts.${index}.key` as const, {
                              required: { value: true, message: 'Required.' },
                            })}
                            value={context.key}
                            placeholder="key"
                            data-testid={`label-key-${index}`}
                          />
                        </Field>
                        <Field label="Value">
                          <Input
                            {...register(`contexts.${index}.value` as const, {
                              required: { value: true, message: 'Required.' },
                            })}
                            placeholder="value"
                            data-testid={`label-value-${index}`}
                          />
                        </Field>
                        <IconButton
                          className={styles.removeButton}
                          tooltip="Remove slab"
                          name={'trash-alt'}
                          onClick={() => remove(index)}
                        >
                          Remove
                        </IconButton>
                      </div>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  icon="plus"
                  variant="secondary"
                  onClick={() => {
                    const newContext = { key: '', value: '' };
                    append(newContext);
                  }}
                >
                  Add data
                </Button>
              </div>
            </Field>
          </FieldSet>
          <Modal.ButtonRow>
            <Button
              variant="secondary"
              onClick={() => {
                onCancel(false);
              }}
              fill="outline"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create
            </Button>
          </Modal.ButtonRow>
        </form>
      </FormProvider>
    </Modal>
  );
};

const mapDispatchToProps = {
  createTransaction,
};

const connector = connect(null, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(CreateTransaction);

const getStyles = (theme: GrafanaTheme2) => ({
  context: css`
    max-width: ${theme.breakpoints.values.sm}px;
    margin: ${theme.spacing(1)} 0;
    padding-top: ${theme.spacing(0.5)};
  `,
  removeButton: css`
    margin-left: ${theme.spacing(1)};
    margin-top: ${theme.spacing(2.5)};
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
  flexRow: css`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-end;
  `,
  alignBaseline: css`
    align-items: baseline;
    margin-bottom: ${theme.spacing(3)};
  `,
  formInput: css`
    width: 275px;

    & + & {
      margin-left: ${theme.spacing(3)};
    }
  `,
});
