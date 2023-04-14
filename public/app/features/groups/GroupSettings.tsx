import { css } from '@emotion/css';
import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateMath, GrafanaTheme2 } from '@grafana/data';
import { Button, Field, FieldSet, Form, VerticalGroup, Input, useTheme2, Legend } from '@grafana/ui';
import { FormPanel } from 'app/core/components/CustomForm/components';
import { FormElementType } from 'app/core/components/CustomForm/constants';
import { FormElement } from 'app/core/components/CustomForm/types';
import { contextSrv } from 'app/core/services/context_srv';
import { Group, AccessControlAction, ResourceConfiguration, GroupType } from 'app/types';

import { updateGroup, updateGroupConfiguration } from './state/actions';

const mapDispatchToProps = {
  updateGroup,
  updateGroupConfiguration,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  group: Group;
  data: any;
  groupType: GroupType;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const GroupSettings: FC<Props> = ({ group, data, groupType, updateGroup, updateGroupConfiguration }) => {
  const theme = useTheme2();
  const styles = getStyles(theme);
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, contextSrv.hasRole('Editor'));
  const label = 'Group Settings';
  let [configuration, setConfiguration] = useState<ResourceConfiguration>({
    elements: [],
    sections: [],
  });
  let [newData, setNewData] = useState<any>({});

  useEffect(() => {
    const elements = groupType.configuration? JSON.parse(JSON.stringify(groupType.configuration.elements)): [];
    const sections = groupType.configuration? JSON.parse(JSON.stringify(groupType.configuration.sections)): [];
    if (data) {
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
    }
    setNewData(data);
    setConfiguration({
      elements: [...elements],
      sections: [...sections],
    });
  }, [data, groupType]);

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
        defaultValues={{ name: group.name, type: group.type }}
        onSubmit={(formgroup: { name: string, type: string }) => {
          updateGroup(formgroup.name, formgroup.type);
          updateGroupConfiguration(newData)
        }}
        disabled={!canWrite}
      >
        {({ register }) => (
          <FieldSet label={label}>
            <Field label="Name" disabled={!canWrite}>
              <Input {...register('name', { required: true })} id="group-name" width={60} />
            </Field>
            <Field label="Type" disabled={true}>
              <Input {...register('type')} disabled={true} type="string" id="group-type" width={60} />
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

export default connector(GroupSettings);
