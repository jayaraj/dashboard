import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Input, Field, Form, Button, FieldSet, VerticalGroup, HorizontalGroup, Label, InputControl, Switch, Select, RadioButtonGroup } from '@grafana/ui';
import { FormElementsEditor, LayoutSectionsEditor } from 'app/core/components/CustomForm/components';
import { FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { contextSrv } from 'app/core/core';
import { ConfigurationType, Configuration, UpdateConfigurationTypeDTO, associationTypes, configurationRoles } from 'app/types';

import { updateConfigurationType } from './state/actions';

const mapDispatchToProps = {
  updateConfigurationType,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  configurationType: ConfigurationType;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const ConfigurationTypeSettings: FC<Props> = ({ configurationType, updateConfigurationType }) => {
  const canWrite = contextSrv.user.isGrafanaAdmin;
  let [configuration, setConfiguration] = useState<Configuration>({
    elements: [],
    sections: [],
  });

  useEffect(() => {
    const elements = configurationType.configuration? JSON.parse(JSON.stringify(configurationType.configuration.elements)): [];
    const sections = configurationType.configuration? JSON.parse(JSON.stringify(configurationType.configuration.sections)): [];
    setConfiguration({
      elements: [...elements],
      sections: [...sections],
    });
  }, [configurationType]);

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
        defaultValues={{ ...configurationType }}
        onSubmit={(update: UpdateConfigurationTypeDTO) => {
          const u: UpdateConfigurationTypeDTO = {...update, configuration: configuration};
          updateConfigurationType(u);
        }}
        disabled={!canWrite}
      >
        {({ register, control }) => (
          <FieldSet label={'Type Settings'}>
            <HorizontalGroup align = 'normal'>
              <VerticalGroup>
                <Field
                  label="Type"
                  description="can change only if no configurations are created based on this type."
                  disabled={!canWrite}
                >
                  <Input {...register('type', { required: true })} id="name-input" width={40} />
                </Field>
                <Field
                  label="Associated with"
                  description=""
                  disabled={!canWrite}
                >
                  <InputControl
                    name="associated_with"
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => <Select {...field} options={associationTypes} width={40} />}
                  />
                </Field>
                <Field 
                label="Role"
                description="access permission"
                disabled={!canWrite}
                >
                  <InputControl
                    render={({ field: { ref, ...field } }) => <RadioButtonGroup {...field} options={configurationRoles} />}
                    control={control}
                    name="role"
                  />
                </Field>
                <Field label="Measurement">
                  <Switch id="measurement" {...register('measurement')} />
                </Field>
              </VerticalGroup>
              <div style={{ padding: '0 50px'}} />
              <VerticalGroup>
                <Field label="Configuration" description="Edit Configuration Details" disabled={!canWrite}>
                  <VerticalGroup>
                    <Label>Layouts</Label>
                    <LayoutSectionsEditor onChange={onSectionsChange} sections={configuration.sections} ></LayoutSectionsEditor>
                    <Label>Elements</Label>
                    <FormElementsEditor elements={configuration.elements} onChange={onElementsChange} sections={configuration.sections} ></FormElementsEditor>
                  </VerticalGroup>
                </Field>
              </VerticalGroup>
            </HorizontalGroup>
            

            <Button type="submit" disabled={!canWrite}>
              Update
            </Button>
          </FieldSet>
        )}
      </Form>
    </VerticalGroup>
  );
};

export default connector(ConfigurationTypeSettings);
