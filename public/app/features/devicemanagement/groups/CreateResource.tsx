import React, { useEffect, useState  } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Select, Form, Field, Input, FieldSet, InputControl, Themeable2, withTheme2} from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import config from 'app/core/config';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { stringToSelectableValue, stringsToSelectableValues } from 'app/features/alerting/unified/utils/amroutes';
import { ConfigurationType, CreateResourceDTO, StoreState } from 'app/types';
import { getPageNav } from './state/navModel';


interface OwnProps extends GrafanaRouteComponentProps<{ id: string }>, Themeable2 {}
function mapStateToProps(state: StoreState, props: OwnProps) {
  const groupId = parseInt(props.match.params.id, 10);
  const pageName = 'groups';
  const groupLoadingNav = getPageNav(pageName as string);
  const pageNav = getNavModel(state.navIndex, `group-${pageName}-${groupId}`, groupLoadingNav).main;

  return {
    groupId,
    pageNav,
  };
}
const mapDispatchToProps = {};
const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const CreateResource = ({groupId, pageNav}: Props): JSX.Element => {
  const label = 'Create ' + config.resourceLabel;
  let [types, setTypes] = useState(stringsToSelectableValues([]as string[]));

  useEffect(() => {
    typesRequest();
  }, []);

  const typesRequest = async () => {
    const response = await getBackendSrv().get('/api/configurationtypes/association/resource', { measurement: true, query: '', page: 1, perPage: 1000 });
    response.configuration_types.map((type: ConfigurationType) => setTypes((opts) => [...opts, stringToSelectableValue(type.type)]))
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
    });
    if (result.id) {
      locationService.push(`/org/resources/edit/${result.id}`);
    }
  };

  return (
    <Page navId="resourcegroups" pageNav={pageNav}>
      <Page.Contents>
        <Form onSubmit={(dto: CreateResourceDTO) => create(dto)}>
          {({ register, control, errors }) => (
            <FieldSet label={label}>
              <Field label="Name" required invalid={!!errors.name} error="Name is required">
                <Input {...register('name', { required: true })} id="resource-name" width={40} />
              </Field>
              <Field label="UUID" required invalid={!!errors.uuid} error="UUID is required">
                <Input {...register('uuid', { required: true })} id="resource-uuid" width={40} />
              </Field>
              <Field label="Type" required invalid={!!errors.type} error="Type is required">
                <InputControl name="type" control={control} rules={{ required: true }}
                  render={({field: {onChange, ...field}}) => <Select {...field} onChange={(value) => onChange(value.value)} options={types} width={40}/>}
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

export default connector(withTheme2(CreateResource));
