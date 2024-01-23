import { css } from '@emotion/css';
import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';

import { GrafanaTheme2 } from '@grafana/data';
import {
  Input,
  Field,
  Form,
  Button,
  FieldSet,
  VerticalGroup,
  HorizontalGroup,
  Label,
  InputControl,
  Switch,
  Select,
  LinkButton,
  Stack,
  RadioButtonGroup,
  CodeEditor,
  useStyles2,
} from '@grafana/ui';
import { FormElementsEditor, LayoutSectionsEditor } from 'app/core/components/CustomForm/components';
import { Configuration, FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { contextSrv } from 'app/core/core';
import { AlertDefinition, UpdateAlertDefinitionDTO, severityTypes } from 'app/types/devicemanagement/alert';
import { associationTypes, configurationRoles } from 'app/types/devicemanagement/configuration';

import TestAlertScript from './TestAlertScript';
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
  const canWrite = contextSrv.hasPermission('alerts.definition:write');
  let [configuration, setConfiguration] = useState<Configuration>({ elements: [], sections: [] });
  const [opened, setOpened] = useState<boolean>(false);
  const styles = useStyles2(getStyles);

  useEffect(() => {
    const elements = alertDefinition.configuration
      ? JSON.parse(JSON.stringify(alertDefinition.configuration.elements))
      : [];
    const sections = alertDefinition.configuration
      ? JSON.parse(JSON.stringify(alertDefinition.configuration.sections))
      : [];
    setConfiguration({ elements: [...elements], sections: [...sections] });
  }, [alertDefinition]);

  const onSectionsChange = (sections?: LayoutSection[]) => {
    setConfiguration({
      ...configuration,
      sections: sections ? sections : configuration.sections,
    });
  };

  const onElementsChange = (elements?: FormElement[]) => {
    setConfiguration({
      ...configuration,
      elements: elements ? elements : configuration.elements,
    });
  };

  return (
    <VerticalGroup>
      <Form
        defaultValues={{ ...alertDefinition }}
        onSubmit={(update: UpdateAlertDefinitionDTO) => {
          const u: UpdateAlertDefinitionDTO = { ...update, for: Number(update.for), configuration: configuration };
          updateAlertDefinition(u);
        }}
        disabled={!canWrite}
      >
        {({ register, control }) => (
          <>
            <FieldSet>
              <HorizontalGroup align="normal">
                <VerticalGroup>
                  <Field label="Name" disabled={!canWrite}>
                    <Input {...register('name', { required: true })} id="name-input" width={40} />
                  </Field>
                  <Field label="Description" disabled={!canWrite}>
                    <Input {...register('description', { required: true })} id="description-input" width={40} />
                  </Field>
                  <Field label="Alerting Message" disabled={!canWrite}>
                    <Input {...register('alerting_msg', { required: true })} id="alerting-msg-input" width={40} />
                  </Field>
                  <Field label="Ok Message" disabled={!canWrite}>
                    <Input {...register('ok_msg')} id="ok-msg-input" width={40} />
                  </Field>
                  <Field label="Associated with" disabled={!canWrite}>
                    <InputControl
                      name="associated_with"
                      control={control}
                      rules={{
                        required: true,
                      }}
                      render={({ field: { onChange, ...field } }) => (
                        <Select
                          {...field}
                          onChange={(value) => onChange(value.value)}
                          options={associationTypes}
                          width={40}
                        />
                      )}
                    />
                  </Field>
                  <Field label="Role" description="access permission" disabled={!canWrite}>
                    <InputControl
                      render={({ field: { ref, ...field } }) => (
                        <RadioButtonGroup {...field} options={configurationRoles} />
                      )}
                      control={control}
                      name="role"
                    />
                  </Field>
                  <Field label="Severity" disabled={!canWrite}>
                    <InputControl
                      name="severity"
                      control={control}
                      rules={{
                        required: true,
                      }}
                      render={({ field: { onChange, ...field } }) => (
                        <Select
                          {...field}
                          onChange={(value) => onChange(value.value)}
                          options={severityTypes}
                          width={40}
                        />
                      )}
                    />
                  </Field>
                  <Field label="For" description="Alert wait for" disabled={!canWrite}>
                    <Input {...register('for')} id="for-input" type="number" width={40} />
                  </Field>
                  <Field label="Ticketable">
                    <Switch id="ticket_enabled" {...register('ticket_enabled')} />
                  </Field>
                  <Stack gap={1} direction="row">
                    <Button type="submit" disabled={!canWrite}>
                      Update
                    </Button>
                    <Button onClick={() => setOpened(true)} disabled={!canWrite}>
                      Test Alert
                    </Button>
                    <LinkButton href={`/org/alertdefinitions`}>Back</LinkButton>
                    <TestAlertScript
                      isOpen={opened}
                      onCancel={(open: boolean) => setOpened(open)}
                      definition={alertDefinition}
                    />
                  </Stack>
                </VerticalGroup>
                <div style={{ padding: '0 50px' }} />
                <VerticalGroup>
                  <Field label="Configuration" description="Edit Configuration Details" disabled={!canWrite}>
                    <VerticalGroup>
                      <Label>Layouts</Label>
                      <LayoutSectionsEditor
                        onChange={onSectionsChange}
                        sections={configuration.sections}
                      ></LayoutSectionsEditor>
                      <Label>Elements</Label>
                      <FormElementsEditor
                        elements={configuration.elements}
                        onChange={onElementsChange}
                        sections={configuration.sections}
                      ></FormElementsEditor>
                    </VerticalGroup>
                  </Field>
                  <Field label="Code" description="Java script code for alert">
                    <InputControl
                      name="code"
                      control={control}
                      rules={{
                        required: true,
                      }}
                      render={({ field: { onChange, ...field } }) => (
                        <div className={styles.content}>
                          <AutoSizer disableWidth>
                            {({ height }) => (
                              <CodeEditor
                                {...field}
                                width={500}
                                height={height}
                                language="javascript"
                                showLineNumbers={true}
                                showMiniMap={false}
                                onBlur={(code) => onChange(code)}
                                monacoOptions={{ formatOnPaste: true, formatOnType: true }}
                              />
                            )}
                          </AutoSizer>
                        </div>
                      )}
                    />
                  </Field>
                </VerticalGroup>
              </HorizontalGroup>
            </FieldSet>
          </>
        )}
      </Form>
    </VerticalGroup>
  );
};

export default connector(AlertDefinitionSettings);

export const getStyles = (theme: GrafanaTheme2) => ({
  content: css`
    flex-grow: 1;
    height: 500px;
    padding-bottom: 16px;
    margin-bottom: ${theme.spacing(2)};
  `,
});
