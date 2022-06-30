import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Input, Field, Form, Button, FieldSet, VerticalGroup } from '@grafana/ui';
import config from 'app/core/config';
import { contextSrv } from 'app/core/core';
import { ResourceType, AccessControlAction } from 'app/types';

import { updateResourceType } from './state/actions';

const mapDispatchToProps = {
  updateResourceType,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  resourceType: ResourceType;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const ResourceTypeSettings: FC<Props> = ({ resourceType, updateResourceType }) => {
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, contextSrv.user.isGrafanaAdmin);
  const label = config.resourceLabel + 'Type Settings';

  return (
    <VerticalGroup>
      <Form
        defaultValues={{ ...resourceType }}
        onSubmit={(formresourceType: ResourceType) => {
          updateResourceType(formresourceType.type);
        }}
        disabled={!canWrite}
      >
        {({ register }) => (
          <FieldSet label={label}>
            <Field
              label="Type"
              description="can change only if no resources are created based on this type."
              disabled={!canWrite}
            >
              <Input {...register('type', { required: true })} id="name-input" width={60} />
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

export default connector(ResourceTypeSettings);
