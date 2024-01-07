import React, { useEffect, useState } from 'react';

import { NavModelItem } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Form, Field, Input, FieldSet, InputControl, Select, LinkButton, Stack } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { TagFilter } from 'app/core/components/TagFilter/TagFilter';
import config from 'app/core/config';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { stringToSelectableValue, stringsToSelectableValues } from 'app/features/alerting/unified/utils/amroutes';
import { ConfigurationType } from 'app/types/devicemanagement/configuration';
import { CreateGroupDTO } from 'app/types/devicemanagement/group';

const pageNav: NavModelItem = {
  icon: 'layer-group',
  id: 'group-new',
  text: `New ${config.groupTitle.toLowerCase()}`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

interface Props extends GrafanaRouteComponentProps<{ id: string }> {}

export const CreateGroup = ({ match }: Props): JSX.Element => {
  const parent = parseInt(match.params.id, 10);
  let [types, setTypes] = useState(stringsToSelectableValues([] as string[]));
  const backUrl = (parent > 0)? `/org/groups/edit/${parent}/groups`: `/org/groups`;

  useEffect(() => {
    typesRequest();
  }, []);

  const typesRequest = async () => {
    const response = await getBackendSrv().get('/api/configurationtypes/association/group', {
      query: '',
      page: 1,
      perPage: 1000,
    });
    response.configuration_types.map((type: ConfigurationType) =>
      setTypes((opts) => [...opts, stringToSelectableValue(type.type)])
    );
  };

  const create = async (dto: CreateGroupDTO) => {
    const result = await getBackendSrv().post('/api/groups', {
      name: dto.name,
      type: dto.type,
      tags: dto.tags,
      parent: parent,
      configuration: {},
    });

    if (result.id) {
      if (parent) {
        locationService.push(`/org/groups/edit/${parent}/children`);
      } else {
        locationService.push(`/org/groups/edit/${result.id}`);
      }
    }
  };

  const getTags = async () => {
    const response = await getBackendSrv().get('/api/tags/group', { page: 1, perPage: 1000 });
    return response.tags.map(({ tag }: { tag: string }) => ({
      term: tag,
      count: 1,
    }));
  };

  return (
    <Page navId="devicemanagement-groups" pageNav={pageNav} actions={
      <LinkButton href={backUrl} >Back</LinkButton>
    }>
      <Page.Contents>
        <Form
          onSubmit={(dto: CreateGroupDTO) => create(dto)}
          defaultValues={{ name: '', type: '', tags: [], parent: -1 }}
        >
          {({ register, control, errors }) => (
            <>
              <FieldSet>
                <Field label="Name" required invalid={!!errors.name} error="Name is required">
                  <Input {...register('name', { required: true })} id="group-name" width={40} />
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
              </FieldSet>
              <Stack gap={1} direction="row">
                <Button type="submit" variant="primary">Create</Button>
                <LinkButton href={backUrl} >Back</LinkButton>
              </Stack>
            </>
          )}
        </Form>
      </Page.Contents>
    </Page>
  );
};

export default CreateGroup;
