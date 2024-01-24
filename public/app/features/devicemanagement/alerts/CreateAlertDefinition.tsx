import { css } from '@emotion/css';
import React, { useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import { NavModelItem, GrafanaTheme2 } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import {
  Button,
  Select,
  Form,
  Field,
  Input,
  FieldSet,
  InputControl,
  LinkButton,
  RadioButtonGroup,
  Switch,
  Label,
  Stack,
  HorizontalGroup,
  VerticalGroup,
  CodeEditor,
  useStyles2,
} from '@grafana/ui';
import { FormElementsEditor, LayoutSectionsEditor } from 'app/core/components/CustomForm/components';
import { Configuration, FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/services/context_srv';
import { CreateAlertDefinitionDTO, defaultCode, severityTypes } from 'app/types/devicemanagement/alert';
import { associationTypes, configurationRoles } from 'app/types/devicemanagement/configuration';

const pageNav: NavModelItem = {
  icon: 'bell-edit',
  id: 'alert-new',
  text: `New Alert Definition`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

export const CreateAlertDefinition = (): JSX.Element => {
  const canCreate = contextSrv.hasPermission('alerts.definition:create');
  const styles = useStyles2(getStyles);
  let [configuration, setConfiguration] = useState<Configuration>({ elements: [], sections: [] });
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

  const create = async (dto: CreateAlertDefinitionDTO) => {
    const result = await getBackendSrv().post('/api/alertdefinitions', {
      name: dto.name,
      description: dto.description,
      alerting_msg: dto.alerting_msg,
      ok_msg: dto.ok_msg,
      associated_with: dto.associated_with,
      role: dto.role,
      severity: dto.severity,
      for: dto.for,
      ticket_enabled: dto.ticket_enabled,
      configuration: dto.configuration,
      code: dto.code,
    });
    if (result.id) {
      locationService.push(`/org/alertdefinitions/edit/${result.id}`);
    }
  };

  return (
    <Page navId="alerts" pageNav={pageNav} actions={<LinkButton href={`/org/alertdefinitions`}>Back</LinkButton>}>
      <Page.Contents>
        <Form
          defaultValues={{ code: defaultCode }}
          onSubmit={(dto: CreateAlertDefinitionDTO) => {
            const newDefinition: CreateAlertDefinitionDTO = {
              ...dto,
              for: Number(dto.for),
              configuration: configuration,
            };
            create(newDefinition);
          }}
          disabled={!canCreate}
        >
          {({ register, control }) => (
            <>
              <FieldSet>
                <HorizontalGroup align="normal">
                  <VerticalGroup>
                    <Field label="Name" disabled={!canCreate}>
                      <Input {...register('name', { required: true })} id="name-input" width={40} />
                    </Field>
                    <Field label="Description" disabled={!canCreate}>
                      <Input {...register('description', { required: true })} id="description-input" width={40} />
                    </Field>
                    <Field label="Alerting Message" disabled={!canCreate}>
                      <Input {...register('alerting_msg', { required: true })} id="alerting-msg-input" width={40} />
                    </Field>
                    <Field label="Ok Message" disabled={!canCreate}>
                      <Input {...register('ok_msg')} id="ok-msg-input" width={40} />
                    </Field>
                    <Field label="Associated with" disabled={!canCreate}>
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
                    <Field label="Role" description="access permission" disabled={!canCreate}>
                      <InputControl
                        render={({ field: { ref, ...field } }) => (
                          <RadioButtonGroup {...field} options={configurationRoles} />
                        )}
                        control={control}
                        name="role"
                      />
                    </Field>
                    <Field label="Severity" disabled={!canCreate}>
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
                    <Field label="For" description="Alert wait for" disabled={!canCreate}>
                      <Input {...register('for')} id="for-input" type="number" width={40} />
                    </Field>
                    <Field label="Ticketable">
                      <Switch id="ticket_enabled" {...register('ticket_enabled')} />
                    </Field>
                    <Stack gap={1} direction="row">
                      <Button type="submit" variant="primary" disabled={!canCreate}>
                        Create
                      </Button>
                      <LinkButton href={`/org/alertdefinitions`}>Back</LinkButton>
                    </Stack>
                  </VerticalGroup>
                  <div style={{ padding: '0 50px' }} />
                  <VerticalGroup>
                    <Field label="Configuration" description="Edit Configuration Details" disabled={!canCreate}>
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
      </Page.Contents>
    </Page>
  );
};
export default CreateAlertDefinition;

export const getStyles = (theme: GrafanaTheme2) => ({
  content: css`
    flex-grow: 1;
    height: 500px;
    padding-bottom: 16px;
    margin-bottom: ${theme.spacing(2)};
  `,
});
