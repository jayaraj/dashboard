import { css } from '@emotion/css';
import React, { useEffect, useState, ChangeEvent } from 'react';
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
  Select,
  HorizontalGroup,
  InputControl,
} from '@grafana/ui';
import { FormPanel } from 'app/core/components/CustomForm/components';
import { FormElementType } from 'app/core/components/CustomForm/constants';
import { FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { TagFilter } from 'app/core/components/TagFilter/TagFilter';
import { contextSrv } from 'app/core/services/context_srv';
import { stringsToSelectableValues, stringToSelectableValue } from 'app/features/alerting/unified/utils/amroutes';
import { ResourceConfiguration, ConfigurationType } from 'app/types/devicemanagement/configuration';
import { Resource, UpdateResourceDTO } from 'app/types/devicemanagement/resource';

import Upload from './Upload';
import { updateResource, updateResourceConfiguration } from './state/actions';

export interface OwnProps {
  resource: Resource;
}

export const ResourceSettings = ({ resource, updateResource, updateResourceConfiguration }: Props) => {
  const theme = useTheme2();
  const styles = getStyles(theme);
  const canWrite = contextSrv.hasPermission('resources:write');
  let [configurationType, setConfigurationType] = useState<ConfigurationType>({
    configuration: { sections: [] as LayoutSection[], elements: [] as FormElement[] },
  } as ConfigurationType);
  let [resourceConfiguration, setResourceConfiguration] = useState<ResourceConfiguration>({} as ResourceConfiguration);
  let [updatedResourceConfiguration, setUpdatedResourceConfiguration] = useState<any>({});
  let [elements, setElements] = useState<FormElement[]>([]);
  let [imageUrl, setImageUrl] = useState<string>(resource.image_url);
  let [type, setType] = useState<string>(resource.type);
  let [types, setTypes] = useState(stringsToSelectableValues([] as string[]));

  const [opened, setOpened] = useState<boolean>(false);
  const configurationTypeRequest = async (type: string) => {
    const response = await getBackendSrv().get(`/api/configurationtypes/association/resource/type/${type}`);
    setConfigurationType(response);
  };

  const resourceConfigurationRequest = async (type: string) => {
    const response = await getBackendSrv().get(`/api/resources/${resource.id}/configurations/${type}`);
    setResourceConfiguration(response);
  };

  const getTags = async () => {
    const response = await getBackendSrv().get('/api/tags/resource', { page: 1, perPage: 1000 });
    return response.tags.map(({ tag }: { tag: string }) => ({
      term: tag,
      count: 1,
    }));
  };

  const onSelect = async (type?: string) => {
    configurationTypeRequest(type ? type : resource.type);
    resourceConfigurationRequest(type ? type : resource.type);
    setType(type ? type : resource.type);
  };

  const typesRequest = async () => {
    const response = await getBackendSrv().get('/api/configurationtypes/association/resource', {
      query: '',
      page: 1,
      perPage: 1000,
    });
    response.configuration_types.map((type: ConfigurationType) =>
      setTypes((opts) => [...opts, stringToSelectableValue(type.type)])
    );
  };

  useEffect(() => {
    setType(resource.type);
    typesRequest();
    configurationTypeRequest(type ? type : resource.type);
    resourceConfigurationRequest(type ? type : resource.type);
  }, []);

  useEffect(() => {
    const elements = configurationType.configuration
      ? JSON.parse(JSON.stringify(configurationType.configuration.elements))
      : [];
    if (resourceConfiguration.configuration) {
      elements?.forEach((element: FormElement) => {
        if (element.type === FormElementType.DATETIME) {
          element.value = dateMath.parse(resourceConfiguration.configuration[element.id]);
        }
        if (element.type === FormElementType.SLIDER) {
          element.value = resourceConfiguration.configuration[element.id]
            ? resourceConfiguration.configuration[element.id]
            : element.min;
        } else {
          element.value = resourceConfiguration.configuration[element.id];
        }
      });
    }
    setUpdatedResourceConfiguration(resourceConfiguration.configuration);
    setElements(elements);
  }, [configurationType, resourceConfiguration]);

  const onChange = (formElements?: FormElement[]) => {
    const configurations: any = {};
    formElements?.forEach((element) => {
      configurations[element.id] = element.value;
    });
    setUpdatedResourceConfiguration(configurations);
    if (formElements) {
      setElements(formElements);
    }
  };

  const onUpload = (location: string) => {
    setImageUrl(location);
  };

  return (
    <VerticalGroup>
      <Form
        defaultValues={{
          ...resource,
          tags: resource.tags
            ? resource.tags
                .replace(/^\{+|\"+|\}+$/g, '')
                .split(',')
                .filter(function (str: string) {
                  return str !== 'NULL';
                })
            : [],
        }}
        onSubmit={(dto: UpdateResourceDTO) => {
          dto.image_url = imageUrl;
          updateResource(dto);
          updateResourceConfiguration(type, updatedResourceConfiguration ? updatedResourceConfiguration : {});
        }}
        disabled={!canWrite}
      >
        {({ register, control }) => (
          <FieldSet>
            <HorizontalGroup align="normal">
              <VerticalGroup>
                <Field label="Name" disabled={!canWrite}>
                  <Input {...register('name', { required: true })} id="resource-name" width={40} />
                </Field>
                <Field label="UUID" disabled={!canWrite}>
                  <Input {...register('uuid', { required: true })} id="resource-uuid" width={40} />
                </Field>
                <Field label="Type" disabled={true}>
                  <Input {...register('type')} disabled={true} type="string" id="resource-type" width={40} />
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
                <Field label="Image Url" disabled={!canWrite}>
                  <HorizontalGroup>
                    <Input
                      type="string"
                      id="resource-image-url"
                      width={40}
                      value={imageUrl}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setImageUrl(event.target.value)}
                    />
                    <Button onClick={() => setOpened(true)} disabled={!canWrite}>
                      Upload
                    </Button>
                    <Upload
                      isOpen={opened}
                      onCancel={(open: boolean) => setOpened(open)}
                      resource={resource}
                      onUpload={(location: string) => onUpload(location)}
                    />
                  </HorizontalGroup>
                </Field>
                <Field label="Latitude" disabled={!canWrite}>
                  <Input {...register('latitude')} type="number" id="resource-latitude" width={40} />
                </Field>
                <Field label="Longitude" disabled={!canWrite}>
                  <Input {...register('longitude')} type="number" id="resource-longitude" width={40} />
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
  updateResource,
  updateResourceConfiguration,
};
const connector = connect(null, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;
export default connector(ResourceSettings);
