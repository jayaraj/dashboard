import React, { useEffect, useState } from 'react';

import { NavModelItem } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Select, Form, Field, Input, FieldSet, InputControl, LinkButton, Stack } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { TagFilter } from 'app/core/components/TagFilter/TagFilter';
import config from 'app/core/config';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { stringToSelectableValue, stringsToSelectableValues } from 'app/features/alerting/unified/utils/amroutes';
import { ConfigurationType } from 'app/types/devicemanagement/configuration';
import { CreateResourceDTO } from 'app/types/devicemanagement/resource';

const pageNav: NavModelItem = {
  icon: 'resource',
  id: 'resource-new',
  text: `New ${config.resourceTitle.toLowerCase()}`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

interface Props extends GrafanaRouteComponentProps<{ id: string }> {}

export const CreateGroupResource = ({ match }: Props): JSX.Element => {
  const groupId = parseInt(match.params.id, 10);
  let [types, setTypes] = useState(stringsToSelectableValues([] as string[]));

  useEffect(() => {
    typesRequest();
  }, []);

  const typesRequest = async () => {
    const response = await getBackendSrv().get('/api/configurationtypes/association/resource', {
      measurement: true,
      query: '',
      page: 1,
      perPage: 1000,
    });
    response.configuration_types.map((type: ConfigurationType) =>
      setTypes((opts) => [...opts, stringToSelectableValue(type.type)])
    );
  };

  const create = async (dto: CreateResourceDTO) => {
    const result = await getBackendSrv().post(`/api/groups/${groupId}/resources`, {
      latitude: Number(dto.latitude),
      longitude: Number(dto.longitude),
      name: dto.name,
      type: dto.type,
      image_url: dto.image_url,
      uuid: dto.uuid,
      configuration: {},
      tags: dto.tags,
    });
    if (result.id) {
      locationService.push(`/org/resources/edit/${result.id}`);
    }
  };

  const getTags = async () => {
    const response = await getBackendSrv().get('/api/tags/resource', { page: 1, perPage: 1000 });
    return response.tags.map(({ tag }: { tag: string }) => ({
      term: tag,
      count: 1,
    }));
  };

  return (
    <Page navId="devicemanagement-groups" pageNav={pageNav} actions={
      <LinkButton href={`/org/groups/edit/${groupId}/resources`} >Back</LinkButton>
    }>
      <Page.Contents>
        <Form
          onSubmit={(dto: CreateResourceDTO) => create(dto)}
          defaultValues={{ name: '', type: '', tags: [], image_url: '', uuid: '', latitude: 0, longitude: 0 }}
        >
          {({ register, control, errors }) => (
            <>
              <FieldSet>
                <Field label="Name" required invalid={!!errors.name} error="Name is required">
                  <Input {...register('name', { required: true })} id="resource-name" width={40} />
                </Field>
                <Field label="UUID" required invalid={!!errors.uuid} error="UUID is required">
                  <Input {...register('uuid', { required: true })} id="resource-uuid" width={40} />
                </Field>
                <Field label="Type" required invalid={!!errors.type} error="Type is required">
                  <InputControl
                    name="type"
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, ...field } }) => (
                      <Select {...field} onChange={(value) => onChange(value.value)} options={types} width={40} />
                    )}
                  />
                </Field>
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
                <Field label="Image Url">
                  <Input {...register('image_url')} type="string" id="resource-image-url" width={40} />
                </Field>
                <Field label="Latitude" invalid={!!errors.latitude} error="latitude is invalid">
                  <Input {...register('latitude')} type="number" id="resource-latitude" width={40} />
                </Field>
                <Field label="Longitude" invalid={!!errors.longitude} error="longitude is invalid">
                  <Input {...register('longitude')} type="number" id="resource-longitude" width={40} />
                </Field>
              </FieldSet>
              <Stack gap={1} direction="row">
                <Button type="submit" variant="primary">Create</Button>
                <LinkButton href={`/org/groups/edit/${groupId}/resources`} >Back</LinkButton>
              </Stack>
            </>
          )}
        </Form>
      </Page.Contents>
    </Page>
  );
};

export default CreateGroupResource;
