import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Input, Field, Form, Button, FieldSet, VerticalGroup, HorizontalGroup, Label, InputControl, Switch, Select, RadioButtonGroup } from '@grafana/ui';
import { FormElementsEditor, LayoutSectionsEditor } from 'app/core/components/CustomForm/components';
import { FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { contextSrv } from 'app/core/core';
import { Configuration, associationTypes, configurationRoles, AlertDefinition, UpdateAlertDefinitionDTO, severityTypes } from 'app/types';

import { updateAlertDefinition } from './state/actions';

const mapDispatchToProps = {
  updateAlertDefinition,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  alertDefinition: AlertDefinition;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const AlertDefinitionSettings: FC<Props> = ({ alertDefinition, updateAlertDefinition }) => {
  const canWrite = contextSrv.user.isGrafanaAdmin;
  let [configuration, setConfiguration] = useState<Configuration>({elements: [], sections: []});

  useEffect(() => {
    const elements = alertDefinition.configuration? JSON.parse(JSON.stringify(alertDefinition.configuration.elements)): [];
    const sections = alertDefinition.configuration? JSON.parse(JSON.stringify(alertDefinition.configuration.sections)): [];
    setConfiguration({elements: [...elements], sections: [...sections]});
  }, [alertDefinition]);

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
        defaultValues={{ ...alertDefinition }}
        onSubmit={(update: UpdateAlertDefinitionDTO) => {
          const u: UpdateAlertDefinitionDTO = {...update, for: Number(update.for), configuration: configuration};
          updateAlertDefinition(u);
        }}
        disabled={!canWrite}
      >
        {({ register, control }) => (
          <FieldSet label={'Alert Definition Settings'}>
            <HorizontalGroup align = 'normal'>
              <VerticalGroup>
                <Field
                  label="Name"
                  disabled={!canWrite}
                >
                  <Input {...register('name', { required: true })} id="name-input" width={40} />
                </Field>
                <Field
                  label="Description"
                  disabled={!canWrite}
                >
                  <Input {...register('description', { required: true })} id="description-input" width={40} />
                </Field>
                <Field
                  label="Alerting Message"
                  disabled={!canWrite}
                >
                  <Input {...register('alerting_msg', { required: true })} id="alerting-msg-input" width={40} />
                </Field>
                <Field
                  label="Ok Message"
                  disabled={!canWrite}
                >
                  <Input {...register('ok_msg')} id="ok-msg-input" width={40} />
                </Field>
                <Field
                  label="Associated with"
                  disabled={!canWrite}
                >
                  <InputControl
                    name="associated_with"
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: {onChange, ...field}}) => <Select {...field} onChange={(value) => onChange(value.value)} options={associationTypes} width={40} />}
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
                <Field 
                label="Severity"
                disabled={!canWrite}
                >
                  <InputControl
                    name="severity"
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field: {onChange, ...field}}) => <Select {...field} onChange={(value) => onChange(value.value)} options={severityTypes} width={40} />}
                  />
                </Field>
                <Field
                  label="For"
                  description="Alert wait for"
                  disabled={!canWrite}
                >
                  <Input {...register('for')} id="for-input" type="number" width={40} />
                </Field>
                <Field label="Ticketable">
                  <Switch id="ticket_enabled" {...register('ticket_enabled')} />
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

export default connector(AlertDefinitionSettings);
