import React from 'react';

import { NavModelItem } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Form, Field, FieldSet, Input, LinkButton, Stack } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { CreateProfileDTO } from 'app/types/billing/profile';

const pageNav: NavModelItem = {
  icon: 'invoice',
  id: 'profile-new',
  text: `Create Profile`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

export const CreateProfile = (): JSX.Element => {
  const createProfile = async (dto: CreateProfileDTO) => {
    const result = await getBackendSrv().post('/api/profiles', {
      name: dto.name,
      description: dto.description,
    });
    if (result.id) {
      locationService.push(`/org/profiles/edit/${result.id}`);
    }
  };

  return (
    <Page navId="profiles" pageNav={pageNav} actions={<LinkButton href={`/org/profiles`}>Back</LinkButton>}>
      <Page.Contents>
        <Form onSubmit={(dto: CreateProfileDTO) => createProfile(dto)} defaultValues={{ name: '', description: '' }}>
          {({ register, errors }) => (
            <>
              <FieldSet>
                <Field
                  label="Name"
                  description="Profile name"
                  required
                  invalid={!!errors.name}
                  error="Name is required"
                >
                  <Input {...register('name', { required: true })} width={40} />
                </Field>
                <Field label="Description" invalid={!!errors.description} error="description is required">
                  <Input {...register('description', { required: true })} width={40} />
                </Field>
              </FieldSet>
              <Stack gap={1} direction="row">
                <Button type="submit" variant="primary">
                  Create
                </Button>
                <LinkButton href={`/org/profiles`}>Back</LinkButton>
              </Stack>
            </>
          )}
        </Form>
      </Page.Contents>
    </Page>
  );
};

export default CreateProfile;
