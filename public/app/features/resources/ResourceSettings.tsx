import { css } from '@emotion/css';
import React, { FC, useEffect, useState  } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateMath, GrafanaTheme2 } from '@grafana/data';
import { Button, Field, FieldSet, Form, VerticalGroup, Input, useTheme2, Legend  } from '@grafana/ui';
import { FormPanel } from 'app/core/components/CustomForm/components';
import { FormElementType } from 'app/core/components/CustomForm/constants';
import { FormElement } from 'app/core/components/CustomForm/types';
import config from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';
import { Resource, AccessControlAction, ResourceType, ResourceConfiguration } from 'app/types';

import { updateResource, updateResourceConfiguration } from './state/actions';

const mapDispatchToProps = {
  updateResource,
  updateResourceConfiguration,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  resource: Resource;
  data: any;
  resourceType: ResourceType;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const ResourceSettings: FC<Props> = ({ resource, data, resourceType, updateResource, updateResourceConfiguration }) => {
  const theme = useTheme2();
  const styles = getStyles(theme);
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, contextSrv.hasRole('Editor'));
  const label = config.resourceLabel + ' Settings';
  let [configuration, setConfiguration] = useState<ResourceConfiguration>({
    elements: [],
    sections: [],
  });
  let [newData, setNewData] = useState<any>({});

  useEffect(() => {
    const elements = resourceType.configuration? JSON.parse(JSON.stringify(resourceType.configuration.elements)): [];
    const sections = resourceType.configuration? JSON.parse(JSON.stringify(resourceType.configuration.sections)): [];
    elements?.forEach((element: FormElement) => {
      if (element.type === FormElementType.DATETIME) {
        element.value = dateMath.parse(data[element.id]);
      }
      if (element.type === FormElementType.SLIDER) {
        element.value = data[element.id]? data[element.id]: element.min;
      } else {
        element.value = data[element.id];
      }
    });

    setNewData(data);
    setConfiguration({
      elements: [...elements],
      sections: [...sections],
    });
  }, [data, resourceType]);

  const onChange = (elements?: FormElement[]) => {
    const update: any = {};
    elements?.forEach((element) => {
      update[element.id] = element.value;
    });
    setNewData(update);
    setConfiguration({
      ...configuration,
      elements: elements?elements:configuration.elements,
    });
  };

  return (
    <VerticalGroup>
      {(configuration!.elements.length > 0) && (
      <Legend>Configurations</Legend>
      )}
      <div
        className={styles.container}
      >
        <FormPanel configuration={configuration} disabled={!canWrite} onChange={onChange}></FormPanel>
      </div>
      <Form
        defaultValues={{ ...resource }}
        onSubmit={(formresource: Resource) => {
          updateResource(formresource.name, formresource.uuid, formresource.longitude, formresource.latitude);
          updateResourceConfiguration(newData)
        }}
        disabled={!canWrite}
      >
        {({ register }) => (
          <FieldSet label={label}>
            <Field label="Name" disabled={!canWrite}>
              <Input {...register('name', { required: true })} id="resource-name" width={60} />
            </Field>
            <Field label="UUID" disabled={!canWrite}>
              <Input {...register('uuid', { required: true })} id="resource-uuid" width={60} />
            </Field>
            <Field label="Type" disabled={true}>
              <Input {...register('type')} disabled={true} type="string" id="resource-type" width={60} />
            </Field>
            <Field label="Latitude" disabled={!canWrite}>
              <Input {...register('latitude')} type="number" id="resource-latitude" width={60} />
            </Field>
            <Field label="Longitude" disabled={!canWrite}>
              <Input {...register('longitude')} type="number" id="resource-longitude" width={60} />
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

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      position: relative;
      width:100%;
      display: flex;
      margin: auto;
      flex-direction: column;
    `,
  };
};

export default connector(ResourceSettings);
