import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { Input, Field, Form, Button, FieldSet, VerticalGroup, HorizontalGroup, InputControl, Select, InfoBox} from '@grafana/ui';
import { contextSrv } from 'app/core/core';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { AccessControlAction, Connection, Profile, UpdateConnectionDTO, connectionStatusTypes } from 'app/types';

import { stringToSelectableValue, stringsToSelectableValues } from '../../alerting/unified/utils/amroutes';
import { updateConnection, updateConnectionTags } from './state/actions';
import { TagFilter } from 'app/core/components/TagFilter/TagFilter';

const mapDispatchToProps = {
  updateConnection,
  updateConnectionTags,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  connection: Connection;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const ConnectionSettings: FC<Props> = ({ connection, updateConnection, updateConnectionTags }) => {
  const fallback = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionConnectionsWrite, fallback);
  let [profiles, setProfiles] = useState(stringsToSelectableValues([]as string[]));
  let [groupPathname, setGroupPathname] = useState<string>('');

  const groupPathnameRequest = async () => {
    const response = await getBackendSrv().get(`/api/groups/${connection.group_id}/pathname`);
    setGroupPathname(response.pathname)
  };

  const profilesRequest = async () => {
    const response = await getBackendSrv().get('/api/orgs/profiles', { query: '', page: 1, perPage: 100 });
    response.profiles.map((profile: Profile) => setProfiles((opts) => [...opts, stringToSelectableValue(profile.name)]))
  };

  const getTags =  async () => {
    const response = await getBackendSrv().get('/api/tags', {page: 1, perPage: 1000});
    return response.tags.map(({ tag }) => ({
      term: tag,
      count: 1,
    }));
  }

  useEffect(() => {
    profilesRequest();
    groupPathnameRequest();
  }, []);

  return (
    <>
      <VerticalGroup>
        <Form
          defaultValues={{ ...connection}}
          onSubmit={(update: UpdateConnectionDTO) => {
            updateConnectionTags(update.tags);
            updateConnection(update);
          }}
          disabled={!canWrite}
        >
          {({ register, control }) => (
            <FieldSet label={'Connection Settings'}>

              <InfoBox>{groupPathname}</InfoBox>
              <HorizontalGroup   align = 'normal'>
                <VerticalGroup>
                  <Field label="Name" disabled={!canWrite}>
                    <Input {...register('name', { required: true })} id="name-input" width={40} />
                  </Field>
                  <Field label="Email" disabled={!canWrite}>
                    <Input {...register('email', { required: true })} id="email-input" width={40} />
                  </Field>
                  <Field label="Phone" disabled={!canWrite}>
                    <Input {...register('phone', {
                        required: true,
                        pattern: {
                          value: /^(\+[0-9]{1,3}|0[0-9]{1,3})[0-9]{10}$/,
                          message: 'Phone is invalid',
                        },
                    })} id="phone-input" width={40} placeholder="+(cc)(10 dig) / 0(cc)(10 dig)" />
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
                  <Field label={'Tags'}>
                    <InputControl
                      control={control}
                      name="tags"
                      render={({ field: { ref, onChange, ...field } }) => {
                        return (
                          <TagFilter
                            allowCustomValue
                            placeholder="Add tags"
                            onChange={onChange}
                            tagOptions={getTags}
                            tags={field.value}
                            width={40}
                          />
                        );
                      }}
                    />
                  </Field>
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
              </HorizontalGroup> 
            </FieldSet>
          )}
        </Form>
      </VerticalGroup>
    </>
  );
};

export default connector(ConnectionSettings);
