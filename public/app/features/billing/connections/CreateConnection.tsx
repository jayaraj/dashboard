import React, { useEffect, useState } from 'react';

import { NavModelItem } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import {
  Button,
  Form,
  Field,
  FieldSet,
  InputControl,
  Input,
  Stack,
  Select,
  VerticalGroup,
  HorizontalGroup,
  LinkButton,
} from '@grafana/ui';
import { GroupPicker } from 'app/core/components/GroupPicker/GroupPicker';
import { Page } from 'app/core/components/Page/Page';
import { TagFilter } from 'app/core/components/TagFilter/TagFilter';
import { CreateConnectionDTO, connectionStatusTypes } from 'app/types/billing/connection';
import { Profile } from 'app/types/billing/profile';
import { Group } from 'app/types/devicemanagement/group';

import { stringToSelectableValue, stringsToSelectableValues } from '../../alerting/unified/utils/amroutes';

const pageNav: NavModelItem = {
  icon: 'group-type',
  id: 'connection-new',
  text: `New connection`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

export const CreateConnection = (): JSX.Element => {
  let [profiles, setProfiles] = useState(stringsToSelectableValues([] as string[]));
  const [group, setGroup] = useState<Group>({} as Group);
  const profilesRequest = async () => {
    const response = await getBackendSrv().get('/api/profiles', { query: '', page: 1, perPage: 100 });
    response.profiles.map((profile: Profile) =>
      setProfiles((opts) => [...opts, stringToSelectableValue(profile.name)])
    );
  };
  const getTags = async () => {
    const response = await getBackendSrv().get('/api/tags/group', { page: 1, perPage: 1000 });
    return response.tags.map(({ tag }: { tag: string }) => ({
      term: tag,
      count: 1,
    }));
  };

  useEffect(() => {
    profilesRequest();
  }, []);

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
      tags: dto.tags,
      latitude: Number(dto.latitude),
      longitude: Number(dto.longitude),
    });
    if (result.id) {
      locationService.push(`/org/connections/edit/${result.id}`);
    }
  };

  const onChange = (group?: Group) => (group ? setGroup(group) : setGroup({} as Group));

  const filterFunction = (g: Group) => {
    return !g.type.toLowerCase().includes('connection');
  };

  return (
    <Page
      navId="billing-connections"
      pageNav={pageNav}
      actions={<LinkButton href={`org/connections`}>Back</LinkButton>}
    >
      <Page.Contents>
        <Field label="Group" description="Select a leaf group/node to create a connection">
          <GroupPicker onChange={onChange} filterFunction={filterFunction}></GroupPicker>
        </Field>
        <Form
          onSubmit={(dto: CreateConnectionDTO) => create(dto)}
          defaultValues={{
            group_parent_id: 0,
            profile: '',
            status: '',
            name: '',
            phone: '',
            email: '',
            address1: '',
            address2: '',
            city: '',
            pincode: '',
            country: '',
            state: '',
            tags: [],
            latitude: 0.0,
            longitude: 0.0,
          }}
        >
          {({ register, control }) => (
            <FieldSet>
              <HorizontalGroup align="normal">
                <VerticalGroup>
                  <Field label="Name">
                    <Input {...register('name', { required: true })} id="name-input" width={40} />
                  </Field>
                  <Field label="Email">
                    <Input {...register('email', { required: true })} id="email-input" width={40} />
                  </Field>
                  <Field label="Phone">
                    <Input
                      {...register('phone', {
                        required: true,
                        pattern: {
                          value: /^(\+[0-9]{1,3}|0[0-9]{1,3})[0-9]{10}$/,
                          message: 'Phone is invalid',
                        },
                      })}
                      id="phone-input"
                      width={40}
                      placeholder="+(cc)(10 dig) / 0(cc)(10 dig)"
                    />
                  </Field>
                  <Field label="Address1">
                    <Input {...register('address1', { required: true })} id="address1-input" width={40} />
                  </Field>
                  <Field label="city">
                    <Input {...register('city', { required: true })} id="city-input" width={40} />
                  </Field>
                  <Field label="Country">
                    <Input {...register('country', { required: true })} id="country-input" width={40} />
                  </Field>
                  <Field label="latitude">
                    <Input {...register('latitude', { required: true })} id="latitude-input" width={40} />
                  </Field>
                </VerticalGroup>
                <div style={{ padding: '0 50px' }} />
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
                  <Field label="Profile">
                    <InputControl
                      name="profile"
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { onChange, ...field } }) => (
                        <Select {...field} onChange={(value) => onChange(value.value)} options={profiles} width={40} />
                      )}
                    />
                  </Field>
                  <Field label="Status">
                    <InputControl
                      name="status"
                      control={control}
                      rules={{ required: true }}
                      render={({ field: { onChange, ...field } }) => (
                        <Select
                          {...field}
                          onChange={(value) => onChange(value.value)}
                          options={connectionStatusTypes}
                          width={40}
                        />
                      )}
                    />
                  </Field>
                  <Field label="Address2">
                    <Input {...register('address2', { required: false })} id="address2-input" width={40} />
                  </Field>
                  <Field label="Pincode">
                    <Input {...register('pincode', { required: true })} id="pincode-input" width={40} />
                  </Field>
                  <Field label="state">
                    <Input {...register('state', { required: true })} id="state-input" width={40} />
                  </Field>
                  <Field label="longitude">
                    <Input {...register('longitude', { required: true })} id="longitude-input" width={40} />
                  </Field>
                </VerticalGroup>
              </HorizontalGroup>
              <Stack gap={1} direction="row">
                <Button type="submit" disabled={!group.id}>
                  Create
                </Button>
                <LinkButton href={`org/connections`}>Back</LinkButton>
              </Stack>
            </FieldSet>
          )}
        </Form>
      </Page.Contents>
    </Page>
  );
};

export default CreateConnection;
