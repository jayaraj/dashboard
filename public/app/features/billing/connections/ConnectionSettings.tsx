import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Input, Field, Form, Button, FieldSet, VerticalGroup, HorizontalGroup, InputControl, Select, LinkButton} from '@grafana/ui';
import { contextSrv } from 'app/core/core';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { AccessControlAction, Connection, Group, Profile, UpdateConnectionDTO, connectionStatusTypes } from 'app/types';

import { stringToSelectableValue, stringsToSelectableValues } from '../../alerting/unified/utils/amroutes';
import { updateConnection } from './state/actions';

const mapDispatchToProps = {
  updateConnection,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  connection: Connection;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const ConnectionSettings: FC<Props> = ({ connection, updateConnection }) => {
  const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionConnectionsWrite, fallback);
  let [profiles, setProfiles] = useState(stringsToSelectableValues([]as string[]));
  let [group, setGroup] = useState<Group>({} as Group);

  const groupRequest = async () => {
    const response = await getBackendSrv().get(`/api/groups/${connection.group_id}`);
    setGroup(response)
  };

  const profilesRequest = async () => {
    const response = await getBackendSrv().get('/api/orgs/profiles', { query: '', page: 1, perPage: 100 });
    response.profiles.map((profile: Profile) => setProfiles((opts) => [...opts, stringToSelectableValue(profile.name)]))
  };


  useEffect(() => {
    profilesRequest();
    groupRequest();
  }, []);


  return (
    <>
      <VerticalGroup>
        <Form
          defaultValues={{ ...connection }}
          onSubmit={(update: UpdateConnectionDTO) => updateConnection(update)}
          disabled={!canWrite}
        >
          {({ register, control }) => (
            <FieldSet label={'Connection Settings'}>
              <HorizontalGroup   align = 'normal'>
                <VerticalGroup>
                  <Field label="Name" disabled={!canWrite}>
                    <Input {...register('name', { required: true })} id="name-input" width={40} />
                  </Field>
                  <Field label="Email" disabled={!canWrite}>
                    <Input {...register('email', { required: true })} id="email-input" width={40} />
                  </Field>
                  <Field label="Phone" disabled={!canWrite}>
                    <Input {...register('phone', { required: true })} id="phone-input" width={40} />
                  </Field>
                  <Field label="Address1" disabled={!canWrite}>
                    <Input {...register('address1', { required: true })} id="address1-input" width={40} />
                  </Field>
                  <Field label="city" disabled={!canWrite}>
                    <Input {...register('city', { required: true })} id="city-input" width={40} />
                  </Field>
                  <Field label="Pincode" disabled={!canWrite}>
                    <Input {...register('pincode', { required: true })} id="pincode-input" width={40} />
                  </Field>
                </VerticalGroup>
                <div style={{ padding: '0 50px'}} />
                <VerticalGroup>
                  <Field label="Profile" disabled={!canWrite}>
                    <InputControl name="profile" control={control} rules={{ required: true }}
                      render={({field: {onChange, ...field}}) => <Select {...field} onChange={(value) => onChange(value.value)} options={profiles} width={40}/>}
                    />
                  </Field>
                  <Field label="Status" disabled={!canWrite}>
                    <InputControl name="status" control={control} rules={{ required: true }}
                      render={({field: {onChange, ...field}}) => <Select {...field} onChange={(value) => onChange(value.value)} options={connectionStatusTypes} width={40}/>}
                    />
                  </Field>
                  <Field label="Address2" disabled={!canWrite}>
                    <Input {...register('address2', { required: false })} id="address2-input" width={40} />
                  </Field>
                  
                  <Field label="state" disabled={!canWrite}>
                    <Input {...register('state', { required: true })} id="state-input" width={40} />
                  </Field>
                  <Field label="Country" disabled={!canWrite}>
                    <Input {...register('country', { required: true })} id="country-input" width={40} />
                  </Field>
                </VerticalGroup>
              </HorizontalGroup>
              <HorizontalGroup>
                <Button type="submit" disabled={!canWrite}>
                  Update
                </Button>
                {((group) && (group.id !== 0)) && (
                  <LinkButton href={`/org/groups/edit/${group.id}/resources`}>Group: {group.name}</LinkButton>
                )}
              </HorizontalGroup> 
            </FieldSet>
          )}
        </Form>
      </VerticalGroup>
    </>
  );
};

export default connector(ConnectionSettings);
