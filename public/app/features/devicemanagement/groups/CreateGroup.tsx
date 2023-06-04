import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Form, Field, Input, FieldSet, InputControl, Select, Themeable2, withTheme2 } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { stringToSelectableValue, stringsToSelectableValues } from 'app/features/alerting/unified/utils/amroutes';
import { ConfigurationType, CreateGroupDTO, StoreState } from 'app/types';

function mapStateToProps(state: StoreState) {
  return {
  };
}
const mapDispatchToProps = {};
const connector = connect(mapStateToProps, mapDispatchToProps);
interface OwnProps extends GrafanaRouteComponentProps<{ id: string }>, Themeable2  {}
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const CreateGroup = ({match}: Props): JSX.Element => {
  const parent = parseInt(match.params.id, 10);
  let [types, setTypes] = useState(stringsToSelectableValues([]as string[]));

  useEffect(() => {
    typesRequest();
  }, []);

  const typesRequest = async () => {
    const response = await getBackendSrv().get('/api/configurationtypes/association/group', { query: '', page: 1, perPage: 1000 });
    response.configuration_types.map((type: ConfigurationType) => setTypes((opts) => [...opts, stringToSelectableValue(type.type)]))
  };

  const create = async (dto: CreateGroupDTO) => {
    const result = await getBackendSrv().post('/api/groups', {
      name: dto.name,
      type: dto.type,
      parent: parent,
      configuration: {}
    });

    if (result.id) {
      if (parent) {
        locationService.push(`/org/groups/edit/${parent}/children`);
      } else {
        locationService.push(`/org/groups/edit/${result.id}`);
      }
    }
  };

  return (
    <Page navId="resourcegroups">
      <Page.Contents>
        <Form onSubmit={(dto: CreateGroupDTO) => create(dto)}>
          {({ register, control, errors }) => (
            <FieldSet label="New Group">
              <Field label="Name" required invalid={!!errors.name} error="Name is required">
                <Input {...register('name', { required: true })} id="group-name" width={40} />
              </Field>
              <Field label="Type" required invalid={!!errors.type} error="Type is required">
                <InputControl name="type" control={control} rules={{ required: true, }}
                  render={({field: {onChange, ...field}}) => <Select {...field} onChange={(value) => onChange(value.value)} options={types} width={40}/>}
                />
              </Field>
              <div className="gf-form-button-row">
                <Button type="submit" variant="primary">
                  Create
                </Button>
              </div>
            </FieldSet>
          )}
        </Form>
      </Page.Contents>
    </Page>
  );
}

export default connector(withTheme2(CreateGroup));
