import React from 'react';

import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Form, Field, FieldSet, Input } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/core';
import { CreateProfileDTO } from 'app/types';


export const CreateProfile = (): JSX.Element => {
  const canWrite = contextSrv.user.isGrafanaAdmin || contextSrv.hasRole('Admin');

  const create = async (dto: CreateProfileDTO) => {
    const result = await getBackendSrv().post('/api/profiles', {
      name: dto.name,
      description: dto.description,
    });
    if (result.id) {
      locationService.push(`/org/profiles/edit/${result.id}`);
    }
  };

  return (
    <Page navId="profiles">
      <Page.Contents>
        <Form
          onSubmit={(dto: CreateProfileDTO) => create(dto)}
          disabled={!canWrite}
        >
          {({ register }) => (
            <FieldSet>
              <Field
                label="Name"
                description="Profile name"
                disabled={!canWrite}
              >
                <Input {...register('name', { required: true })} width={40} />
              </Field>
              <Field
                label="Description"
                disabled={!canWrite}
              >
                <Input {...register('description', { required: true })} width={40} />
              </Field>
              <Button type="submit" disabled={!canWrite}>
                Create
              </Button>
            </FieldSet>
          )}
        </Form>
      </Page.Contents>
    </Page>
  );
}

export default CreateProfile;
