import { css } from '@emotion/css';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateMath, GrafanaTheme2 } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import {
  Button,
  Field,
  FieldSet,
  Form,
  VerticalGroup,
  Input,
  useTheme2,
  HorizontalGroup,
  Select,
  InputControl,
} from '@grafana/ui';
import { FormPanel } from 'app/core/components/CustomForm/components';
import { FormElementType } from 'app/core/components/CustomForm/constants';
import { FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { TagFilter } from 'app/core/components/TagFilter/TagFilter';
import { contextSrv } from 'app/core/services/context_srv';
import { stringsToSelectableValues, stringToSelectableValue } from 'app/features/alerting/unified/utils/amroutes';
import { GroupConfiguration, ConfigurationType } from 'app/types/devicemanagement/configuration';
import { Group, UpdateGroupDTO } from 'app/types/devicemanagement/group';

import { updateGroup, updateGroupConfiguration } from './state/actions';

export interface OwnProps {
  group: Group;
}

export const GroupSettings = ({ group, updateGroup, updateGroupConfiguration }: Props) => {
  const theme = useTheme2();
  const styles = getStyles(theme);
  const canWrite = contextSrv.hasPermission('groups:write');
  let [configurationType, setConfigurationType] = useState<ConfigurationType>({
    configuration: { sections: [] as LayoutSection[], elements: [] as FormElement[] },
  } as ConfigurationType);
  let [groupConfiguration, setGroupConfiguration] = useState<GroupConfiguration>({} as GroupConfiguration);
  let [updatedGroupConfiguration, setUpdatedGroupConfiguration] = useState<any>({});
  let [elements, setElements] = useState<FormElement[]>([]);
  let [types, setTypes] = useState(stringsToSelectableValues([] as string[]));
  let [type, setType] = useState<string>(group.type);

  const configurationTypeRequest = async (type: string) => {
    const response = await getBackendSrv().get(`/api/configurationtypes/association/group/type/${type}`);
    setConfigurationType(response);
  };

  const groupConfigurationRequest = async (type: string) => {
    const response = await getBackendSrv().get(`/api/groups/${group.id}/configurations/${type}`);
    setGroupConfiguration(response);
  };

  const onSelect = async (type?: string) => {
    configurationTypeRequest(type ? type : group.type);
    groupConfigurationRequest(type ? type : group.type);
    setType(type ? type : group.type);
  };

  const typesRequest = async () => {
    const response = await getBackendSrv().get('/api/configurationtypes/association/group', {
      query: '',
      page: 1,
      perPage: 1000,
    });
    response.configuration_types.map((type: ConfigurationType) =>
      setTypes((opts) => [...opts, stringToSelectableValue(type.type)])
    );
  };

  const getTags = async () => {
    const response = await getBackendSrv().get('/api/tags/group', { page: 1, perPage: 1000 });
    return response.tags.map(({ tag }: { tag: string }) => ({
      term: tag,
      count: 1,
    }));
  };

  useEffect(() => {
    setType(group.type);
    typesRequest();
    configurationTypeRequest(type ? type : group.type);
    groupConfigurationRequest(type ? type : group.type);
  }, []);

  useEffect(() => {
    const elements = configurationType.configuration
      ? JSON.parse(JSON.stringify(configurationType.configuration.elements))
      : [];
    if (groupConfiguration.configuration) {
      elements?.forEach((element: FormElement) => {
        if (element.type === FormElementType.DATETIME) {
          element.value = dateMath.parse(groupConfiguration.configuration[element.id]);
        }
        if (element.type === FormElementType.SLIDER) {
          element.value = groupConfiguration.configuration[element.id]
            ? groupConfiguration.configuration[element.id]
            : element.min;
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
    formElements?.forEach((element) => {
      configurations[element.id] = element.value;
    });
    setUpdatedGroupConfiguration(configurations);
    if (formElements) {
      setElements(formElements);
    }
  };

  return (
    <>
      <VerticalGroup>
        <Form
          defaultValues={{
            ...group,
            tags: group.tags
              ? group.tags
                  .replace(/^\{+|\"+|\}+$/g, '')
                  .split(',')
                  .filter(function (str: string) {
                    return str !== 'NULL';
                  })
              : [],
          }}
          onSubmit={(update: UpdateGroupDTO) => {
            updateGroup(update);
            updateGroupConfiguration(type, updatedGroupConfiguration ? updatedGroupConfiguration : {});
          }}
          disabled={!canWrite}
        >
          {({ register, control }) => (
            <FieldSet>
              <HorizontalGroup align="normal">
                <VerticalGroup>
                  <Field label="Name" disabled={!canWrite}>
                    <Input {...register('name', { required: true })} id="group-name" width={40} />
                  </Field>
                  <Field label="Type" disabled={true}>
                    <Input {...register('type')} disabled={true} type="string" id="group-type" width={40} />
                  </Field>
                  <Field label={'Tags'}>
                    <InputControl
                      control={control}
                      name="tags"
                      render={({ field: { ref, onChange, ...field } }) => {
                        return (
                          <TagFilter
                            allowCustomValue
                            placeholder="Add tags"
                            onChange={onChange}
                            tagOptions={getTags}
                            tags={field.value}
                            width={40}
                          />
                        );
                      }}
                    />
                  </Field>
                </VerticalGroup>
                <div style={{ padding: '0 50px' }} />
                <VerticalGroup>
                  <Field label="Configuration Type">
                    <Select width={40} options={types} onChange={(value) => onSelect(value?.value)} value={type} />
                  </Field>
                  <div className={styles.container}>
                    <FormPanel
                      configuration={{ sections: configurationType.configuration.sections, elements: elements }}
                      disabled={!canWrite}
                      onChange={onChange}
                    ></FormPanel>
                  </div>
                </VerticalGroup>
              </HorizontalGroup>
              <HorizontalGroup>
                <Button type="submit" disabled={!canWrite}>
                  Update
                </Button>
              </HorizontalGroup>
            </FieldSet>
          )}
        </Form>
      </VerticalGroup>
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      position: relative;
      width: 100%;
      display: flex;
      margin: auto;
      flex-direction: column;
    `,
  };
};

const mapDispatchToProps = {
  updateGroup,
  updateGroupConfiguration,
};
const connector = connect(null, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;
export default connector(GroupSettings);
