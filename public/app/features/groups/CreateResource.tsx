import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { NavModel, SelectableValue } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Select, Form, Field, Input, FieldSet, InputControl, Themeable2, withTheme2} from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import config from 'app/core/config';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getNavModel } from 'app/core/selectors/navModel';
import { ResourceType, StoreState } from 'app/types';

interface GroupPageRouteParams {
  id: string;
}

export interface Props extends GrafanaRouteComponentProps<GroupPageRouteParams> , Themeable2 {
  groupId: number;
  navModel: NavModel;
}

interface State {
  types: Array<SelectableValue<string>>;
}

interface ResourceDTO {
  type: SelectableValue<string>;
  uuid: string;
  name: string;
  latitude: number;
  longitude: number;
}

export class CreateResource extends PureComponent<Props, State> {
  state: State = {
    types: [],
  };

  componentDidMount() {
    this.fetchResourceTypes();
  }

  fetchResourceTypes = async () => {
    const response = await getBackendSrv().get('/api/resourcetypes/search', { query: '', page: 1, perPage: 10000 });
    this.setState({
      types: response.resource_types.map(
        (type: ResourceType): SelectableValue<string> => ({
          value: type.type,
          label: type.type,
          name: type.type,
        })
      ),
    });
  };

  create = async (formModel: ResourceDTO) => {
    const { groupId } = this.props;
    const result = await getBackendSrv().post(`/api/groups/${groupId}/resources`, {
      latitude: Number(formModel.latitude),
      longitude: Number(formModel.longitude),
      name: formModel.name,
      type: formModel.type.value,
      uuid: formModel.uuid,
      configuration: {},
    });
    if (result.id) {
      locationService.push(`/org/resources/edit/${result.id}`);
    }
  };

  render() {
    const { navModel } = this.props;
    const { types } = this.state;
    const label = 'New ' + config.resourceLabel;
    return (
      <Page navModel={navModel}>
        <Page.Contents>
          <Form onSubmit={this.create}>
            {({ register, control, errors }) => (
              <FieldSet label={label}>
                <Field label="Name" required invalid={!!errors.name} error="Name is required">
                  <Input {...register('name', { required: true })} id="resource-name" width={60} />
                </Field>
                <Field label="UUID" required invalid={!!errors.uuid} error="UUID is required">
                  <Input {...register('uuid', { required: true })} id="resource-uuid" width={60} />
                </Field>
                <Field label="Type" required invalid={!!errors.type} error="Type is required">
                  <InputControl
                    name="type"
                    control={control}
                    rules={{
                      required: true,
                    }}
                    render={({ field }) => <Select {...field} options={types} width={60} />}
                  />
                </Field>
                <Field label="Latitude" invalid={!!errors.latitude} error="latitude is invalid">
                  <Input {...register('latitude')} type="number" id="resource-latitude" width={60} />
                </Field>
                <Field label="Longitude" invalid={!!errors.longitude} error="longitude is invalid">
                  <Input {...register('longitude')} type="number" id="resource-longitude" width={60} />
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
}

function mapStateToProps(state: StoreState, props: Props) {
  const groupId = parseInt(props.match.params.id, 10);
  return {
    groupId: groupId,
    navModel: getNavModel(state.navIndex, 'resourcegroups'),
  };
}

export default connect(mapStateToProps)(withTheme2(CreateResource));
