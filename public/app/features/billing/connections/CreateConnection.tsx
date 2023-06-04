import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Form, Field, FieldSet, InputControl, Input, Select, VerticalGroup, HorizontalGroup } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/core';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { CreateConnectionDTO,  Profile,  StoreState,  connectionStatusTypes} from 'app/types';
import { stringToSelectableValue, stringsToSelectableValues } from '../../alerting/unified/utils/amroutes';

function mapStateToProps(state: StoreState) {
  return {
  };
}
const mapDispatchToProps = {};
const connector = connect(mapStateToProps, mapDispatchToProps);
interface OwnProps extends GrafanaRouteComponentProps<{ id: string }> {}
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const CreateConnection = ({match}: Props): JSX.Element => {
  const canWrite = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
  let [profiles, setProfiles] = useState(stringsToSelectableValues([]as string[]));
  const groupId = parseInt(match.params.id, 10);

  useEffect(() => {
    profilesRequest();
  }, []);

  const profilesRequest = async () => {
    const response = await getBackendSrv().get('/api/orgs/profiles', { query: '', page: 1, perPage: 100 });
    response.profiles.map((profile: Profile) => setProfiles((opts) => [...opts, stringToSelectableValue(profile.name)]))
  };

  const create = async (dto: CreateConnectionDTO) => {
    const result = await getBackendSrv().post('/api/connections', {
      group_id: groupId,
      profile: dto.profile,
      status: dto.status,
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      address1: dto.address1,
      address2: dto.address2,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      pincode: dto.pincode,
    });
    if (result.id) {
      locationService.push(`/org/connections/edit/${result.id}`);
    }
  };

  return (
    <Page navId="connections">
      <Page.Contents>
        <Form
          onSubmit={(dto: CreateConnectionDTO) => create(dto)}
          disabled={!canWrite}
        >
          {({ register, control }) => (
            <FieldSet>
              <HorizontalGroup  align = 'normal'>
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
                  <Field label="Country" disabled={!canWrite}>
                    <Input {...register('country', { required: true })} id="country-input" width={40} />
                  </Field>
                  <Field label="state" disabled={!canWrite}>
                    <Input {...register('state', { required: true })} id="state-input" width={40} />
                  </Field>
                </VerticalGroup>
              </HorizontalGroup>
              
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

export default connector(CreateConnection);
