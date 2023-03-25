import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { NavModel } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { Button, LegacyForms, Label, VerticalGroup } from '@grafana/ui';
import { FormElementsEditor, LayoutSectionsEditor } from 'app/core/components/CustomForm/components';
import { FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { Page } from 'app/core/components/Page/Page';
const { FormField } = LegacyForms;
import config from 'app/core/config';
import { getNavModel } from 'app/core/selectors/navModel';
import { ResourceConfiguration, StoreState } from 'app/types';

export interface Props {
  navModel: NavModel;
}

interface State {
  type: string;
  configuration: ResourceConfiguration;
}

export class CreateResourceType extends PureComponent<Props, State> {
  state: State = {
    type: '',
    configuration: {
      elements: [],
      sections: [],
    }
  };

  create = async () => {
    const { type, configuration } = this.state;
    const result = await getBackendSrv().post('/api/resourcetypes', {
      type,
      configuration,
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

  onElementsChange = (value?: FormElement[]) => {
    const v = value? value: [];
    this.setState(prevState => ({
      configuration: {             
          ...prevState.configuration, 
          elements: [...v],  
      }
  }));
  };

  onSectionsChange = (value?: LayoutSection[]) => {
    const v = value? value: [];
    this.setState(prevState => ({
      configuration: {             
          ...prevState.configuration, 
          sections: [...v], 
      }
    }));
  };

  render() {
    const { navModel } = this.props;
    const { type, configuration } = this.state;
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
                <FormField
                  className="gf-form"
                  labelWidth={10}
                  inputWidth={20}
                  label="Configuration"
                  inputEl={
                    <VerticalGroup className="gf-form-input">
                      <Label>Layouts</Label>
                      <LayoutSectionsEditor onChange={this.onSectionsChange} sections={configuration.sections} ></LayoutSectionsEditor>
                      <Label>Elements</Label>
                      <FormElementsEditor elements={configuration.elements} onChange={this.onElementsChange} sections={configuration.sections} ></FormElementsEditor>
                    </VerticalGroup>
                  }
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
