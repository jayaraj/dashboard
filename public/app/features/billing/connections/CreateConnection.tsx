import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Form, Field, FieldSet, InputControl, Input, Select, VerticalGroup, HorizontalGroup } from '@grafana/ui';
import { GroupPicker } from 'app/core/components/GroupPicker/GroupPicker';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/core';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { CreateConnectionDTO,  Group,  Profile,  StoreState,  connectionStatusTypes} from 'app/types';
import { stringToSelectableValue, stringsToSelectableValues } from '../../alerting/unified/utils/amroutes';


interface OwnProps extends GrafanaRouteComponentProps<{}> {}
function mapStateToProps(state: StoreState, props: OwnProps) {
  return {
  };
}
const mapDispatchToProps = {};
const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const CreateConnection = ({}: Props): JSX.Element => {
  let canWrite = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
  let [profiles, setProfiles] = useState(stringsToSelectableValues([]as string[]));
  const [group, setGroup] = useState<Group>({} as Group);

  useEffect(() => {
    profilesRequest();
  }, []);

  const profilesRequest = async () => {
    const response = await getBackendSrv().get('/api/orgs/profiles', { query: '', page: 1, perPage: 100 });
    response.profiles.map((profile: Profile) => setProfiles((opts) => [...opts, stringToSelectableValue(profile.name)]))
  };

  const create = async (dto: CreateConnectionDTO) => {
    const result = await getBackendSrv().post('/api/connections', {
      group_parent_id: group.id,
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

  const onChange = (group?: Group) => {
    if (group) {
      setGroup(group);
    } else {
      setGroup({} as Group)
    }
  }

  const filterFunction = (g: Group) => {
    return !g.type.toLowerCase().includes('connection');
  };

  return (
    <Page navId="connections">
      <Page.Contents>
        <Field label="Group" disabled={!canWrite} description="Select a leaf group/node to create a connection">
          <GroupPicker onChange={onChange} filterFunction={filterFunction} ></GroupPicker>
        </Field>
        <Form
          onSubmit={(dto: CreateConnectionDTO) => create(dto)}
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
              
              <Button type="submit" disabled={(!canWrite || !group.id )}>
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
