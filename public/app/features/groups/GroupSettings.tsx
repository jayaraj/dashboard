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
      <FieldSet label={label}>
        <Form
          defaultValues={{ name: group.name }}
          onSubmit={(formgroup: { name: string }) => {
            updateGroup(formgroup.name);
          }}
          disabled={!canWrite}
        >
          {({ register }) => (
            <FieldSet label={label}>
              <Field label="Name" disabled={!canWrite}>
                <Input {...register('name', { required: true })} id="group-name" width={60} />
              </Field>
              <Button type="submit" disabled={!canWrite}>
                Update
              </Button>
            </FieldSet>
          )}
        </Form>
      </FieldSet>
    </VerticalGroup>
  );
};

export default connector(GroupSettings);
