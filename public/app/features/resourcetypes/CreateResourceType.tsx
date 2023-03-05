import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { NavModel } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, LegacyForms } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
const { FormField } = LegacyForms;
import config from 'app/core/config';
import { getNavModel } from 'app/core/selectors/navModel';
import { StoreState } from 'app/types';

export interface Props {
  navModel: NavModel;
}

interface State {
  type: string;
}

export class CreateResourceType extends PureComponent<Props, State> {
  state: State = {
    type: '',
  };

  create = async () => {
    const { type } = this.state;
    const result = await getBackendSrv().post('/api/resourcetypes', {
      type,
    });
    if (result.id) {
      locationService.push(`/org/resourcetypes/edit/${result.id}`);
    }
  };

  onTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      type: event.target.value,
    });
  };

  render() {
    const { navModel } = this.props;
    const { type } = this.state;
    return (
      <Page navModel={navModel}>
        <Page.Contents>
          <div>
            <h3 className="page-sub-heading">New {config.resourceLabel}Type</h3>

            <div className="gf-form-group">
              <div className="gf-form-group">
                <FormField
                  className="gf-form"
                  label="Type"
                  value={type}
                  onChange={this.onTypeChange}
                  inputWidth={20}
                  labelWidth={10}
                />
              </div>
              <div className="gf-form-button-row">
                <Button variant="secondary" onClick={this.create}>
                  Create
                </Button>
              </div>
            </div>
          </div>
        </Page.Contents>
      </Page>
    );
  }
}

function mapStateToProps(state: StoreState) {
  return {
    navModel: getNavModel(state.navIndex, 'resourcetypes'),
  };
}

export default connect(mapStateToProps)(CreateResourceType);
