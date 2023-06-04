import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Input, Field, Form, Button, FieldSet, VerticalGroup } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { Profile, UpdateProfileDTO } from 'app/types';

import { updateProfile } from './state/actions';

const mapDispatchToProps = {
  updateProfile,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  profile: Profile;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const ProfileSettings: FC<Props> = ({ profile, updateProfile }) => {
  const canWrite = contextSrv.user.isGrafanaAdmin || contextSrv.hasRole('Admin');
  return (
    <VerticalGroup>
      <Form defaultValues={{ ...profile }} onSubmit={(update: UpdateProfileDTO) => updateProfile(update)} disabled={!canWrite}>
        {({ register }) => (
          <FieldSet>
            <Field label="Name" description="Profile name" disabled={!canWrite}>
              <Input {...register('name', { required: true })} width={40} />
            </Field>
            <Field label="Description" disabled={!canWrite} >
              <Input {...register('description', { required: true })} width={40} />
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

export default connector(ProfileSettings);
