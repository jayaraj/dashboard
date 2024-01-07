import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Input, Field, Form, Button, FieldSet, VerticalGroup } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { Profile, UpdateProfileDTO } from 'app/types/billing/profile';

import { updateProfile } from './state/actions';

export interface OwnProps {
  profile: Profile;
}

export const ProfileSettings = ({ profile, updateProfile }: Props) => {
  const canWrite = contextSrv.hasPermission('profiles:write');
  return (
    <VerticalGroup>
      <Form
        defaultValues={{ ...profile }}
        onSubmit={(update: UpdateProfileDTO) => updateProfile(update)}
        disabled={!canWrite}
      >
        {({ register }) => (
          <>
            <FieldSet>
              <Field label="Name" description="Profile name" disabled={!canWrite}>
                <Input {...register('name', { required: true })} width={40} />
              </Field>
              <Field label="Description" disabled={!canWrite}>
                <Input {...register('description', { required: true })} width={40} />
              </Field>
            </FieldSet>
            <Button type="submit" disabled={!canWrite}>
              Update
            </Button>
          </>
        )}
      </Form>
    </VerticalGroup>
  );
};

const mapDispatchToProps = {
  updateProfile,
};
const connector = connect(null, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;
export default connector(ProfileSettings);
