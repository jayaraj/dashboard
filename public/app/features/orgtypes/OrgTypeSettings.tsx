import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Input, Field, Form, Button, FieldSet, VerticalGroup, Label } from '@grafana/ui';
import { FormElementsEditor, LayoutSectionsEditor } from 'app/core/components/CustomForm/components';
import { FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { contextSrv } from 'app/core/core';
import { OrgType, AccessControlAction, ResourceConfiguration } from 'app/types';

import { updateOrgType } from './state/actions';

const mapDispatchToProps = {
  updateOrgType,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  orgType: OrgType;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const OrgTypeSettings: FC<Props> = ({ orgType, updateOrgType }) => {
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, contextSrv.user.isGrafanaAdmin);
  const label = 'Org Type Settings';
  let [configuration, setConfiguration] = useState<ResourceConfiguration>({
    elements: [],
    sections: [],
  });

  useEffect(() => {
    const elements = orgType.configuration? JSON.parse(JSON.stringify(orgType.configuration.elements)): [];
    const sections = orgType.configuration? JSON.parse(JSON.stringify(orgType.configuration.sections)): [];
    setConfiguration({
      elements: [...elements],
      sections: [...sections],
    });
  }, [orgType]);

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
        defaultValues={{ ...orgType }}
        onSubmit={(gt: OrgType) => {
          updateOrgType(gt.type, configuration);
        }}
        disabled={!canWrite}
      >
        {({ register }) => (
          <FieldSet label={label}>
            <Field
              label="Type"
              description="can change only if no orgs are created based on this type."
              disabled={!canWrite}
            >
              <Input {...register('type', { required: true })} id="name-input" width={60} />
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

export default connector(OrgTypeSettings);
