import React, { useEffect, useState } from 'react';

import { NavModelItem } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Select, Form, Field, Input, FieldSet, InputControl, LinkButton, Stack } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { stringToSelectableValue, stringsToSelectableValues } from 'app/features/alerting/unified/utils/amroutes';
import { ConfigurationType } from 'app/types/devicemanagement/configuration';
import { CreateInventoryDTO } from 'app/types/devicemanagement/inventory';

const pageNav: NavModelItem = {
  icon: 'inventory',
  id: 'inventory-new',
  text: `New Inventory`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

export const CreateInventory = (): JSX.Element => {
  let [types, setTypes] = useState(stringsToSelectableValues([] as string[]));

  useEffect(() => {
    typesRequest();
  }, []);

  const typesRequest = async () => {
    const response = await getBackendSrv().get('/api/configurationtypes/association/resource', {
      measurement: true,
      query: '',
      page: 1,
      perPage: 1000,
    });
    response.configuration_types.map((type: ConfigurationType) =>
      setTypes((opts) => [...opts, stringToSelectableValue(type.type)])
    );
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
    <Page navId="inventories" pageNav={pageNav} actions={
      <LinkButton href={`/org/inventories`} >Back</LinkButton>
    }>
      <Page.Contents>
        <Form onSubmit={(dto: CreateInventoryDTO) => create(dto)}>
          {({ register, control, errors }) => (
            <>
              <FieldSet>
                <Field label="UUID" required invalid={!!errors.uuid} error="UUID is required">
                  <Input {...register('uuid', { required: true })} id="inventory-uuid" width={40} />
                </Field>
                <Field label="Type" required invalid={!!errors.type} error="Type is required">
                  <InputControl
                    name="type"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, ...field } }) => (
                      <Select {...field} onChange={(value) => onChange(value.value)} options={types} width={40} />
                    )}
                  />
                </Field>
              </FieldSet>
              <Stack gap={1} direction="row">
                <Button type="submit" variant="primary">Create</Button>
                <LinkButton href={`/org/inventories`} >Back</LinkButton>
              </Stack>
            </>
          )}
        </Form>
      </Page.Contents>
    </Page>
  );
};

export default CreateInventory;
