import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { NavModel, SelectableValue } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Form, Field, Input, FieldSet, InputControl, Select } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { GroupType, StoreState } from 'app/types';

export interface Props {
  match: any;
  navModel: NavModel;
  parent: number;
}

interface State {
  types: Array<SelectableValue<string>>;
}

interface GroupDTO {
  name: string;
  type: SelectableValue<string>;
}

export class CreateGroup extends PureComponent<Props> {
  state: State = {
    types: [],
  };

  componentDidMount() {
    this.fetchGroupTypes();
  }

  fetchGroupTypes = async () => {
    const response = await getBackendSrv().get('/api/grouptypes/search', { query: '', page: 1, perPage: 10000 });
    this.setState({
      types: response.group_types.map(
        (type: GroupType): SelectableValue<string> => ({
          value: type.type,
          label: type.type,
          name: type.type,
        })
      ),
    });
  };

  create = async (formModel: GroupDTO) => {
    const result = await getBackendSrv().post('/api/groups', { name: formModel.name, type: formModel.type.value, parent: this.props.parent, configuration: {} });
    if (result.id) {
      if (this.props.parent) {
        locationService.push(`/org/groups/edit/${this.props.parent}/children`);
      } else {
        locationService.push(`/org/groups/edit/${result.id}`);
      }
    }
  };

  render() {
    const { navModel } = this.props;
    const { types } = this.state;

    return (
      <Page navModel={navModel}>
        <Page.Contents>
          <Form onSubmit={this.create}>
            {({ register, control, errors }) => (
              <FieldSet label="New Group">
                <Field label="Name" required invalid={!!errors.name} error="Name is required">
                  <Input {...register('name', { required: true })} id="group-name" width={60} />
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
  const parent = parseInt(props.match.params.id, 10);
  return {
    navModel: getNavModel(state.navIndex, 'resourcegroups'),
    parent: parent,
  };
}

export default connect(mapStateToProps)(CreateGroup);
