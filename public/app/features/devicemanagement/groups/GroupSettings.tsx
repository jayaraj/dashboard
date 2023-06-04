import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateMath } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Button, Field, FieldSet, Form, VerticalGroup, Input, HorizontalGroup, LinkButton, Select } from '@grafana/ui';
import { FormPanel } from 'app/core/components/CustomForm/components';
import { FormElementType } from 'app/core/components/CustomForm/constants';
import { FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { contextSrv } from 'app/core/services/context_srv';
import { Group, AccessControlAction, GroupConfiguration, ConfigurationType, UpdateGroupDTO, Connection } from 'app/types';

import { updateGroup, updateGroupConfiguration } from './state/actions';
import { stringsToSelectableValues, stringToSelectableValue } from 'app/features/alerting/unified/utils/amroutes';

const mapDispatchToProps = {
  updateGroup,
  updateGroupConfiguration,
};

const connector = connect(null, mapDispatchToProps);
export interface OwnProps {
  group: Group;
}
export type Props = ConnectedProps<typeof connector> & OwnProps;

export const GroupSettings: FC<Props> = ({ group, updateGroup, updateGroupConfiguration }) => {
  const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, fallback);
  const canCreate = contextSrv.hasAccess(AccessControlAction.ActionConnectionsCreate, fallback);
  const label = 'Group Settings';
  let [configurationType, setConfigurationType] = useState<ConfigurationType>({configuration: {sections: [] as LayoutSection[], elements: [] as FormElement[]}} as ConfigurationType);
  let [groupConfiguration, setGroupConfiguration] = useState<GroupConfiguration>({} as GroupConfiguration);
  let [updatedGroupConfiguration, setUpdatedGroupConfiguration] = useState<any>({});
  let [elements, setElements] = useState<FormElement[]>([]);
  let [connection, setConnection] = useState<Connection>({} as Connection);
  let [types, setTypes] = useState(stringsToSelectableValues([]as string[]));
  let [type, setType] = useState<string>(group.type);

  const configurationTypeRequest = async (type: string) => {
    const response = await getBackendSrv().get(`/api/configurationtypes/association/group/type/${type}`);
    setConfigurationType(response)
  };

  const connectionRequest = async () => {
    const response = await getBackendSrv().get(`/api/connections/group/${group.id}`);
    setConnection(response)
  };

  const groupConfigurationRequest = async (type: string) => {
    const response = await getBackendSrv().get(`/api/groups/${group.id}/configurations/${type}`);
    setGroupConfiguration(response)
  };

  const onSelect = async (type?: string) => {
    configurationTypeRequest(type? type: group.type);
    groupConfigurationRequest(type? type: group.type);
    setType(type? type: group.type);
  };

  const typesRequest = async () => {
    const response = await getBackendSrv().get('/api/configurationtypes/association/group', { query: '', page: 1, perPage: 1000 });
    response.configuration_types.map((type: ConfigurationType) => setTypes((opts) => [...opts, stringToSelectableValue(type.type)]))
  };

  useEffect(() => {
    setType(group.type);
    typesRequest();
    configurationTypeRequest(type? type: group.type);
    groupConfigurationRequest(type? type: group.type);
    connectionRequest();
  }, []);

  useEffect(() => {
    const elements = configurationType.configuration? JSON.parse(JSON.stringify(configurationType.configuration.elements)): [];
    if (groupConfiguration.configuration) {
      elements?.forEach((element: FormElement) => {
        if (element.type === FormElementType.DATETIME) {
          element.value = dateMath.parse(groupConfiguration.configuration[element.id]);
        }
        if (element.type === FormElementType.SLIDER) {
          element.value = groupConfiguration.configuration[element.id]? groupConfiguration.configuration[element.id]: element.min;
        } else {
          element.value = groupConfiguration.configuration[element.id];
        }
      });
    }
    setUpdatedGroupConfiguration(groupConfiguration.configuration);
    setElements(elements);
  }, [configurationType, groupConfiguration]);

  const onChange = (formElements?: FormElement[]) => {
    const configurations: any = {};
    formElements?.forEach((element) => {configurations[element.id] = element.value});
    setUpdatedGroupConfiguration(configurations);
    if (formElements) {
      setElements(formElements);
    }
  };

  return (
    <>
      {(!group.child) && (
        <div className="page-action-bar">
          <div className="gf-form gf-form--grow"></div>
          {((connection) && (connection.id !== 0)) && (
            <LinkButton disabled={!canCreate} href={`/org/connections/edit/${connection.id}/settings`}>Connection: {connection.connection_ext}</LinkButton>
          )}
          {((!connection) || (connection.id === 0)) && (
            <LinkButton disabled={!canCreate} href={`/org/groups/${group.id}/connections/new`}>Create Connection</LinkButton>
          )}
        </div>
      )}
      <VerticalGroup>
        <Form
          defaultValues={{ name: group.name, type: group.type }}
          onSubmit={(update: UpdateGroupDTO) => {
            updateGroup(update);
            updateGroupConfiguration(type, updatedGroupConfiguration?updatedGroupConfiguration:{});
          }}
          disabled={!canWrite}
        >
          {({ register }) => (
            <FieldSet label={label}>
              <HorizontalGroup   align = 'normal'>
                <VerticalGroup>
                  <Field label="Name" disabled={!canWrite}>
                    <Input {...register('name', { required: true })} id="group-name" width={40} />
                  </Field>
                  <Field label="Type" disabled={true}>
                    <Input {...register('type')} disabled={true} type="string" id="group-type" width={40} />
                  </Field>
                </VerticalGroup>
                <div style={{ padding: '0 50px'}} />
                <VerticalGroup>
                  <Field label="Configuration Type">
                    <Select width={40} options={types} onChange={(value) => onSelect(value?.value)}  value={type}/>
                  </Field>
                  <FormPanel configuration={{sections: configurationType.configuration.sections, elements: elements}} disabled={!canWrite} onChange={onChange}></FormPanel> 
                </VerticalGroup>
              </HorizontalGroup>
              <Button type="submit" disabled={!canWrite}>
                Update
              </Button>
            </FieldSet>
          )}
        </Form>
      </VerticalGroup>
    </>
  );
};

export default connector(GroupSettings);
