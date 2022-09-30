import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { NavModel } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, Form, Field, Input, FieldSet } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

export interface Props {
  match: any;
  navModel: NavModel;
  parent: number;
}

interface GroupDTO {
  name: string;
  type: string;
}

export class CreateGroup extends PureComponent<Props> {
  create = async (formModel: GroupDTO) => {
    const result = await getBackendSrv().post('/api/groups', { name: formModel.name, type: formModel.type, parent: this.props.parent });
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
    return (
      <Page navModel={navModel}>
        <Page.Contents>
          <Form onSubmit={this.create}>
            {({ register, errors }) => (
              <FieldSet label="New Group">
                <Field label="Name" required invalid={!!errors.name} error="Name is required">
                  <Input {...register('name', { required: true })} id="group-name" width={60} />
                </Field>
                <Field label="Type" required invalid={!!errors.type} error="Type is required">
                  <Input {...register('type', { required: true })} id="group-type" width={60} />
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
