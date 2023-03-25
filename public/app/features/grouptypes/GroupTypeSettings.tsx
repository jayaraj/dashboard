import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Input, Field, Form, Button, FieldSet, VerticalGroup, Label } from '@grafana/ui';
import { FormElementsEditor, LayoutSectionsEditor } from 'app/core/components/CustomForm/components';
import { FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { contextSrv } from 'app/core/core';
import { GroupType, AccessControlAction, ResourceConfiguration } from 'app/types';

import { updateGroupType } from './state/actions';

const mapDispatchToProps = {
  updateGroupType,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  groupType: GroupType;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const GroupTypeSettings: FC<Props> = ({ groupType, updateGroupType }) => {
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, contextSrv.user.isGrafanaAdmin);
  const label = 'Group Type Settings';
  let [configuration, setConfiguration] = useState<ResourceConfiguration>({
    elements: [],
    sections: [],
  });

  useEffect(() => {
    const elements = groupType.configuration? JSON.parse(JSON.stringify(groupType.configuration.elements)): [];
    const sections = groupType.configuration? JSON.parse(JSON.stringify(groupType.configuration.sections)): [];
    setConfiguration({
      elements: [...elements],
      sections: [...sections],
    });
  }, [groupType]);

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
        defaultValues={{ ...groupType }}
        onSubmit={(gt: GroupType) => {
          updateGroupType(gt.type, configuration);
        }}
        disabled={!canWrite}
      >
        {({ register }) => (
          <FieldSet label={label}>
            <Field
              label="Type"
              description="can change only if no groups are created based on this type."
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

export default connector(GroupTypeSettings);
