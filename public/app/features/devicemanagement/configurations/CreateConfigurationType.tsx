import React, { useState } from 'react';

import { NavModelItem, IconName } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import {
  Button,
  Form,
  Field,
  FieldSet,
  Label,
  VerticalGroup,
  InputControl,
  Input,
  Switch,
  Select,
  RadioButtonGroup,
  HorizontalGroup,
  Stack,
  LinkButton,
} from '@grafana/ui';
import { FormElementsEditor, LayoutSectionsEditor } from 'app/core/components/CustomForm/components';
import { Configuration, FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/core';
import {
  CreateConfigurationTypeDTO,
  associationTypes,
  configurationRoles,
} from 'app/types/devicemanagement/configuration';

const pageNav: NavModelItem = {
  icon: 'configurationtypes' as IconName,
  id: 'configurationtype-new',
  text: `New Configuration Type`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

export const CreateConfigurationType = (): JSX.Element => {
  const canWrite = contextSrv.user.isGrafanaAdmin;
  let [configuration, setConfiguration] = useState<Configuration>({
    elements: [],
    sections: [],
  });
  const create = async (dto: CreateConfigurationTypeDTO) => {
    const result = await getBackendSrv().post('/api/configurationtypes', {
      type: dto.type,
      associated_with: dto.associated_with,
      measurement: dto.measurement,
      role: dto.role,
      configuration: configuration,
    });
    if (result.id) {
      locationService.push(`/org/configurationtypes/edit/${result.id}`);
    }
  };

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
    <Page navId="configurationtypes" pageNav={pageNav} actions={
      <LinkButton href={`/configurationtypes`} >Back</LinkButton>
    }>
      <Page.Contents>
        <Form onSubmit={(dto: CreateConfigurationTypeDTO) => create(dto)} disabled={!canWrite}>
          {({ register, control }) => (
            <FieldSet>
              <HorizontalGroup align="normal">
                <VerticalGroup>
                  <Field
                    label="Type"
                    description="can change only if no configurations are created based on this type."
                    disabled={!canWrite}
                  >
                    <Input {...register('type', { required: true })} width={40} />
                  </Field>
                  <Field label="Associated with" description="" disabled={!canWrite}>
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
                  <Field label="Measurement">
                    <Switch id="measurement" {...register('measurement')} />
                  </Field>
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
                </VerticalGroup>
              </HorizontalGroup>
              <Stack gap={1} direction="row">
                <Button type="submit" variant="primary">Create</Button>
                <LinkButton href={`/configurationtypes`} >Back</LinkButton>
              </Stack>
            </FieldSet>
          )}
        </Form>
      </Page.Contents>
    </Page>
  );
};

export default CreateConfigurationType;
