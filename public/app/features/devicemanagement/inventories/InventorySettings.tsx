import React, { FC, useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateMath } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Input, Field, Form, Button, FieldSet, VerticalGroup, HorizontalGroup, Select } from '@grafana/ui';
import { FormPanel } from 'app/core/components/CustomForm/components';
import { FormElementType } from 'app/core/components/CustomForm/constants';
import { FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { contextSrv } from 'app/core/core';
import { stringsToSelectableValues, stringToSelectableValue } from 'app/features/alerting/unified/utils/amroutes';
import { Inventory, AccessControlAction, ConfigurationType, InventoryConfiguration, UpdateInventoryDTO } from 'app/types';

import { updateInventory, updateInventoryConfiguration } from './state/actions';

const mapDispatchToProps = {
  updateInventory,
  updateInventoryConfiguration,
};

const connector = connect(null, mapDispatchToProps);
export interface OwnProps {
  inventory: Inventory;
}
export type Props = ConnectedProps<typeof connector> & OwnProps;

export const InventorySettings: FC<Props> = ({ inventory, updateInventory, updateInventoryConfiguration }) => {
  const fallback = contextSrv.hasRole('ServerAdmin');
  const canCreate = contextSrv.hasAccess(AccessControlAction.ActionInventoriesCreate, fallback);
  const label = 'Inventory Settings';
  let [configurationType, setConfigurationType] = useState<ConfigurationType>({configuration: {sections: [] as LayoutSection[], elements: [] as FormElement[]}} as ConfigurationType);
  let [inventoryConfiguration, setInventoryConfiguration] = useState<InventoryConfiguration>({} as InventoryConfiguration);
  let [updatedInventoryConfiguration, setUpdatedInventoryConfiguration] = useState<any>({});
  let [elements, setElements] = useState<FormElement[]>([]);
  let [types, setTypes] = useState(stringsToSelectableValues([]as string[]));
  let [type, setType] = useState<string>(inventory.type);


  const configurationTypeRequest = async (type: string) => {
    const response = await getBackendSrv().get(`/api/configurationtypes/association/resource/type/${type}`);
    setConfigurationType(response)
  };

  const inventoryConfigurationRequest = async (type: string) => {
    const response = await getBackendSrv().get(`/api/inventories/${inventory.id}/configurations/${type}`);
    setInventoryConfiguration(response)
  };

  const onSelect = async (type?: string) => {
    configurationTypeRequest(type? type: inventory.type);
    inventoryConfigurationRequest(type? type: inventory.type);
    setType(type? type: inventory.type);
  };

  const typesRequest = async () => {
    const response = await getBackendSrv().get('/api/configurationtypes/association/resource', { query: '', page: 1, perPage: 1000 });
    response.configuration_types.map((type: ConfigurationType) => setTypes((opts) => [...opts, stringToSelectableValue(type.type)]))
  };

  useEffect(() => {
    setType(inventory.type);
    typesRequest();
    configurationTypeRequest(type? type: inventory.type);
    inventoryConfigurationRequest(type? type: inventory.type);
  }, []);

  useEffect(() => {
    const elements = configurationType.configuration? JSON.parse(JSON.stringify(configurationType.configuration.elements)): [];
    if (inventoryConfiguration.configuration) {
      elements?.forEach((element: FormElement) => {
        if (element.type === FormElementType.DATETIME) {
          element.value = dateMath.parse(inventoryConfiguration.configuration[element.id]);
        }
        if (element.type === FormElementType.SLIDER) {
          element.value = inventoryConfiguration.configuration[element.id]? inventoryConfiguration.configuration[element.id]: element.min;
        } else {
          element.value = inventoryConfiguration.configuration[element.id];
        }
      });
    }
    setUpdatedInventoryConfiguration(inventoryConfiguration.configuration);
    setElements(elements);
  }, [configurationType, inventoryConfiguration]);

  const onChange = (formElements?: FormElement[]) => {
    const configurations: any = {};
    formElements?.forEach((element) => {configurations[element.id] = element.value});
    setUpdatedInventoryConfiguration(configurations);
    if (formElements) {
      setElements(formElements);
    }
  };

  return (
    <VerticalGroup>
      <Form
        defaultValues={{ ...inventory }}
        onSubmit={(dto: UpdateInventoryDTO) => {
          updateInventory(dto);
          updateInventoryConfiguration(type, updatedInventoryConfiguration);
        }}
        disabled={!canCreate}
      >
        {({ register }) => (
          <FieldSet label={label}>
            <HorizontalGroup   align = 'normal'>
              <VerticalGroup>
                <Field label="UUID" description="unique id" disabled={!canCreate} >
                  <Input {...register('uuid', { required: true })} id="uuid-input" width={40} />
                </Field>
                <Field label="Type" disabled={true} >
                  <Input {...register('type', { required: true })} id="type-input" width={40} />
                </Field>
              </VerticalGroup>
              <div style={{ padding: '0 50px'}} />
              <VerticalGroup>
                <Field label="Configuration Type" >
                  <Select width={40} options={types} onChange={(value) => onSelect(value?.value)}  value={type}/>
                </Field>
                <FormPanel configuration={{sections: configurationType.configuration.sections, elements: elements}} disabled={!canCreate} onChange={onChange}></FormPanel>
              </VerticalGroup>
            </HorizontalGroup>
            <Button type="submit" disabled={!canCreate}>
              Update
            </Button>
          </FieldSet>
        )}
      </Form>
    </VerticalGroup>
  );
};

export default connector(InventorySettings);
