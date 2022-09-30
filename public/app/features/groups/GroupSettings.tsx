import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Button, Field, FieldSet, Form, VerticalGroup, Input } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { Group, AccessControlAction } from 'app/types';

import { updateGroup } from './state/actions';

const mapDispatchToProps = {
  updateGroup,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  group: Group;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const GroupSettings: FC<Props> = ({ group, updateGroup }) => {
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionGroupsWrite, contextSrv.hasRole('Editor'));
  const label = 'Group Settings';

  return (
    <VerticalGroup>
      <Form
        defaultValues={{ name: group.name, type: group.type }}
        onSubmit={(formgroup: { name: string, type: string }) => {
          updateGroup(formgroup.name, formgroup.type);
        }}
        disabled={!canWrite}
      >
        {({ register }) => (
          <FieldSet label={label}>
            <Field label="Name" disabled={!canWrite}>
              <Input {...register('name', { required: true })} id="group-name" width={60} />
            </Field>
            <Field label="Type" disabled={!canWrite}>
              <Input {...register('type', { required: true })} id="group-type" width={60} />
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

export default connector(GroupSettings);
