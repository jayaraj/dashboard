import React, { useEffect, useState } from 'react';

import { NavModelItem } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Select, Form, Field, Input, FieldSet, InputControl, LinkButton, Stack } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { TagFilter } from 'app/core/components/TagFilter/TagFilter';
import config from 'app/core/config';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { stringToSelectableValue, stringsToSelectableValues } from 'app/features/alerting/unified/utils/amroutes';
import { CreateConnectionResourceDTO } from 'app/types/billing/connection';
import { ConfigurationType } from 'app/types/devicemanagement/configuration';

interface Props extends GrafanaRouteComponentProps<{ id: string }> {}
const pageNav: NavModelItem = {
  icon: 'rss',
  id: 'resource-new',
  text: `New ${config.resourceTitle.toLowerCase()}`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

export const CreateResource = ({ match }: Props): JSX.Element => {
  const connectionId = parseInt(match.params.id, 10);
  let [types, setTypes] = useState(stringsToSelectableValues([] as string[]));
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
  const getTags = async () => {
    const response = await getBackendSrv().get('/api/tags/resource', { page: 1, perPage: 1000 });
    return response.tags.map(({ tag }: { tag: string }) => ({
      term: tag,
      count: 1,
    }));
  };

  useEffect(() => {
    typesRequest();
  }, []);

  const create = async (dto: CreateConnectionResourceDTO) => {
    const result = await getBackendSrv().post(`/api/connections/${connectionId}/resources`, {
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
      locationService.push(`/org/connections/edit/${connectionId}/resources`);
    }
  };

  return (
    <Page
      navId="billing-connections"
      pageNav={pageNav}
      actions={<LinkButton href={`org/connections/edit/${connectionId}/resources`}>Back</LinkButton>}
    >
      <Page.Contents>
        <Form
          onSubmit={(dto: CreateConnectionResourceDTO) => create(dto)}
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
                <Button type="submit" variant="primary">
                  Create
                </Button>
                <LinkButton href={`org/connections/edit/${connectionId}/resources`}>Back</LinkButton>
              </Stack>
            </>
          )}
        </Form>
      </Page.Contents>
    </Page>
  );
};

export default CreateResource;
