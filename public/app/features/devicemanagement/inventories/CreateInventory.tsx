import React,  { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Select, Form, Field, Input, FieldSet, InputControl } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { stringToSelectableValue, stringsToSelectableValues } from 'app/features/alerting/unified/utils/amroutes';
import { ConfigurationType, CreateInventoryDTO, StoreState } from 'app/types';

function mapStateToProps(state: StoreState) {
  return {
  };
}
const mapDispatchToProps = {};
const connector = connect(mapStateToProps, mapDispatchToProps);
export interface OwnProps {}
export type Props = ConnectedProps<typeof connector> & OwnProps;

export const CreateInventory = (): JSX.Element => {
  let [types, setTypes] = useState(stringsToSelectableValues([]as string[]));

  useEffect(() => {
    typesRequest();
  }, []);

  const typesRequest = async () => {
    const response = await getBackendSrv().get('/api/configurationtypes/association/resource', { measurement: true, query: '', page: 1, perPage: 1000 });
    response.configuration_types.map((type: ConfigurationType) => setTypes((opts) => [...opts, stringToSelectableValue(type.type)]))
  };
  
  const create = async (dto: CreateInventoryDTO) => {
    const result = await getBackendSrv().post('/api/inventories', {
      type: dto.type,
      uuid: dto.uuid,
    });

    if (result.id) {
      locationService.push(`/org/inventories/edit/${result.id}`);
    }
  };

  return (
    <Page navId="inventories">
      <Page.Contents>
        <Form onSubmit={(dto: CreateInventoryDTO) => create(dto)}>
          {({ register, control, errors }) => (
            <FieldSet>
              <Field label="UUID" required invalid={!!errors.uuid} error="UUID is required">
                <Input {...register('uuid', { required: true })} id="inventory-uuid" width={40} />
              </Field>
              <Field label="Type" required invalid={!!errors.type} error="Type is required">
                <InputControl name="type" control={control} rules={{ required: true }}
                  render={({field: {onChange, ...field}}) => <Select {...field} onChange={(value) => onChange(value.value)} options={types} width={40}/>}
                />
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
}

export default connector(CreateInventory);
