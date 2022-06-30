import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Button, Field, FieldSet, Form, VerticalGroup, Input } from '@grafana/ui';
import config from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';
import { Resource, AccessControlAction } from 'app/types';

import { updateResource } from './state/actions';

const mapDispatchToProps = {
  updateResource,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  resource: Resource;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const ResourceSettings: FC<Props> = ({ resource, updateResource }) => {
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, contextSrv.hasRole('Editor'));
  const label = config.resourceLabel + ' Settings';

  return (
    <VerticalGroup>
      <Form
        defaultValues={{ ...resource }}
        onSubmit={(formresource: Resource) => {
          updateResource(formresource.name, formresource.uuid, formresource.longitude, formresource.latitude);
        }}
        disabled={!canWrite}
      >
        {({ register }) => (
          <FieldSet label={label}>
            <Field label="Name" disabled={!canWrite}>
              <Input {...register('name', { required: true })} id="resource-name" width={60} />
            </Field>
            <Field label="UUID" disabled={!canWrite}>
              <Input {...register('uuid', { required: true })} id="resource-uuid" width={60} />
            </Field>
            <Field label="Type" disabled={true}>
              <Input {...register('type')} disabled={true} type="string" id="resource-type" width={60} />
            </Field>
            <Field label="Latitude" disabled={!canWrite}>
              <Input {...register('latitude')} type="number" id="resource-latitude" width={60} />
            </Field>
            <Field label="Longitude" disabled={!canWrite}>
              <Input {...register('longitude')} type="number" id="resource-longitude" width={60} />
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

export default connector(ResourceSettings);
