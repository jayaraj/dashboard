import React, { FC, useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateMath, SelectableValue } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Input, Field, Form, Button, FieldSet, VerticalGroup, Select } from '@grafana/ui';
import { FormPanel } from 'app/core/components/CustomForm/components';
import { FormElement } from 'app/core/components/CustomForm/types';
import { FormElementType } from 'app/core/components/CustomForm/constants';
import { contextSrv } from 'app/core/core';
import { Inventory, AccessControlAction, ResourceConfiguration, ResourceType } from 'app/types';

import { updateInventory } from './state/actions';

const mapDispatchToProps = {
  updateInventory,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  inventory: Inventory;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const InventorySettings: FC<Props> = ({ inventory, updateInventory }) => {
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionInventoriesWrite, contextSrv.user.isGrafanaAdmin);
  const label = 'Inventory Settings';
  let [configuration, setConfiguration] = useState<ResourceConfiguration>({
    elements: [],
    sections: [],
  });
  let [data, setData] = useState<any>({});
  let [type, setType] = useState<string>(inventory.type);
  let [types, setTypes] = useState<Array<SelectableValue<string>>>([]);

  const onSelect = async (type?: string) => {
    updateConfigurations(type?type:'');
  };

  const updateConfigurations = async (type: string) => {
    const response = await getBackendSrv().get(`/api/resourcetypes/type/${type}`);
    const config = response.configuration? JSON.parse(JSON.stringify(response.configuration)): {
      sections: [],
      elements: [],
    }
    const inventoryConfig = await getBackendSrv().get(`/api/inventories/${inventory.id}/configurations/${type}`);
    if (inventoryConfig) {
      config.elements?.forEach((element: FormElement) => {
        if (element.type === FormElementType.DATETIME) {
          element.value = dateMath.parse(inventoryConfig[element.id]);
        }
        if (element.type === FormElementType.SLIDER) {
          element.value = inventoryConfig[element.id]? inventoryConfig[element.id]: element.min;
        } else {
          element.value = inventoryConfig[element.id];
        }
      });
    }
    setConfiguration(config);
    setType(type? type: '');
    setData(inventoryConfig)
  };

  useEffect(() => {
    fetchResourceTypes();
    updateConfigurations(inventory.type);
  }, []);

  const fetchResourceTypes = async () => {
    const response = await getBackendSrv().get('/api/resourcetypes/search', { query: '', page: 1, perPage: 10000 });
    const resourceTypes = response.resource_types.map(
      (type: ResourceType): SelectableValue<string> => ({
        value: type.type,
        label: type.type,
        name: type.type,
      })
    );
    setTypes(resourceTypes);
  };

  const onChange = (elements?: FormElement[]) => {
    const update: any = {};
    elements?.forEach((element) => {
      update[element.id] = element.value;
    });
    setData(update);
  };

  return (
    <VerticalGroup>
      <Field
        label="Configuration Type"
        description="choose a type "
        disabled={!canWrite}
      >
        <Select
          width={40}
          options={types}
          onChange={(value) => onSelect(value?.value)}
          value={type}
        />
      </Field>
      
      <FormPanel configuration={configuration} disabled={!canWrite} onChange={onChange}></FormPanel>
      <Form
        defaultValues={{ ...inventory }}
        onSubmit={(gt: Inventory) => {
          updateInventory(gt.uuid, type, data);
        }}
        disabled={!canWrite}
      >
        {({ register }) => (
          <FieldSet label={label}>
            <Field
              label="UUID"
              description="unique id"
              disabled={!canWrite}
            >
              <Input {...register('uuid', { required: true })} id="uuid-input" width={40} />
            </Field>
            <Field
              label="Type"
              disabled={true}
            >
              <Input {...register('type', { required: true })} id="type-input" width={40} />
            </Field>
            <Button type="submit" disabled={!canWrite}>
              Update
            </Button>
          </FieldSet>
        )}
      </Form>
    </VerticalGroup>
  );
};

export default connector(InventorySettings);
