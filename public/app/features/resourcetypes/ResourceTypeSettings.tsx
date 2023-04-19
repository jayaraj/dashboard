import React, { FC, useEffect, useState  } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Input, Field, Form, Button, FieldSet, VerticalGroup, Label, Checkbox } from '@grafana/ui';
import { FormElementsEditor, LayoutSectionsEditor } from 'app/core/components/CustomForm/components';
import { FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import config from 'app/core/config';
import { contextSrv } from 'app/core/core';
import { ResourceType, AccessControlAction, ResourceConfiguration } from 'app/types';

import { updateResourceType } from './state/actions';

const mapDispatchToProps = {
  updateResourceType,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  resourceType: ResourceType;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const ResourceTypeSettings: FC<Props> = ({ resourceType, updateResourceType }) => {
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, contextSrv.user.isGrafanaAdmin);
  const label = config.resourceLabel + 'Type Settings';
  let [configuration, setConfiguration] = useState<ResourceConfiguration>({
    elements: [],
    sections: [],
  });

  useEffect(() => {
    const elements = resourceType.configuration? JSON.parse(JSON.stringify(resourceType.configuration.elements)): [];
    const sections = resourceType.configuration? JSON.parse(JSON.stringify(resourceType.configuration.sections)): [];
    setConfiguration({
      elements: [...elements],
      sections: [...sections],
    });
  }, [resourceType]);

  const onSectionsChange = (sections?: LayoutSection[]) => {
    setConfiguration({
      ...configuration,
      sections: sections?sections:configuration.sections,
    });
  };

  const onElementsChange = (elements?: FormElement[]) => {
    setConfiguration({
      ...configuration,
      elements: elements?elements:configuration.elements,
    });
  };

  return (
    <VerticalGroup>
      <Form
        defaultValues={{ ...resourceType }}
        onSubmit={(formresourceType: ResourceType) => {
          updateResourceType(formresourceType.type, formresourceType.other_configurations, configuration);
        }}
        disabled={!canWrite}
      >
        {({ register }) => (
          <FieldSet label={label}>
            <Field
              label="Type"
              description="can change only if no resources are created based on this type."
              disabled={!canWrite}
            >
              <Input {...register('type', { required: true })} id="name-input" width={60} />
            </Field>
            <Field label="OtherConfigurations" disabled={!canWrite}>
              <Checkbox  {...register('other_configurations')} />
            </Field>
            <Field
              label="Configuration"
              description="Edit Configuration Details"
              disabled={!canWrite}
            >
              <VerticalGroup>
                <Label>Layouts</Label>
                <LayoutSectionsEditor onChange={onSectionsChange} sections={configuration.sections} ></LayoutSectionsEditor>
                <Label>Elements</Label>
                <FormElementsEditor elements={configuration.elements} onChange={onElementsChange} sections={configuration.sections} ></FormElementsEditor>
              </VerticalGroup>
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

export default connector(ResourceTypeSettings);
