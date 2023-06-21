import { defaults, isString } from 'lodash';
import React, { ChangeEvent, PureComponent } from 'react';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { InlineField, InlineFieldRow, Input, Select } from '@grafana/ui';
import { defaultQuery, queryFormats } from '../../constants';
import { DataSource } from '../../datasource';
import { API, Application, DataSourceOptions, Query, Target } from '../../types';
import { Api } from '../../api';
import { stringToSelectableValue, stringsToSelectableValues } from 'app/features/alerting/unified/utils/amroutes';

/**
 * Editor Properties
 */
type Props = QueryEditorProps<DataSource, Query, DataSourceOptions>;

interface State {
  target: Target;
  selectedApplication: Application;
  selectedAPI: API;
  applications: SelectableValue<string>[];
  apis : SelectableValue<string>[];
}

/**
 * Query Editor
 */
export class QueryEditor extends PureComponent<Props, State> {
  /**
   * Api
   *
   * @type {Api} api
   */
  api: Api;
  state: State = { target: {} as Target, selectedApplication: {} as Application,
                  selectedAPI: {} as API, applications: stringsToSelectableValues([]as string[]),
                  apis: stringsToSelectableValues([]as string[])};

  constructor(props: Props) {
    super(props);
    const { datasource } = props;
    this.api = datasource.api;
  }

  componentDidMount() {
    this.fetchOptions();
  }

  async fetchOptions() {
    const response =  await this.api.getOptions();
    const { query } = this.props;
    const selectedApplication = response.data.targets.find((target: Application) => target.application === query.queryModule);
    this.setState({ 
      target: response.data,
      applications: response.data.targets.map((a: Application) => stringToSelectableValue(a.application)),
      selectedApplication: selectedApplication,
      apis: selectedApplication? selectedApplication.apis.map((a: API) => stringToSelectableValue(a.name)): [],
    }); 
  }

  /**
   * Query Module
   */
  onQueryModuleChange = (selectable: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    const { target } = this.state;
    if (!selectable || !isString(selectable.value)) {
      return onChange({ ...query, queryModule: defaultQuery.queryModule });
    }
    const selectedApplication = target.targets.find((target) => target.application === selectable.value);
    if (selectedApplication) {
      this.setState({
        apis: selectedApplication.apis.map((a: API) => stringToSelectableValue(a.name)),
        selectedApplication: selectedApplication,
      });
    }
    onChange({ ...query, queryModule: selectable.value });
    onChange({ ...query, queryArguments: defaultQuery.queryArguments });
  };
  /**
   * Query API
   */
  onQueryAPIChange = (selectable: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    const { selectedApplication } = this.state;
    if (!selectable || !isString(selectable.value)) {
      return onChange({ ...query, queryAPI: defaultQuery.queryAPI });
    }
    const selectedApi = selectedApplication.apis.find((api: API) => api.name === selectable.value);
    if (selectedApi) {
      this.setState({
        selectedAPI: selectedApi,
      });
    }
    onChange({ ...query, queryAPI: selectable.value });
    onChange({ ...query, queryArguments: [...selectedApi!.data] });
  };
  /**
   * Query Arguments
   */
  onQueryArgumentsChange = (value: string, index: number ) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryArguments: [...query.queryArguments!.map((d,i) => {
      if (i === index) {
        return {key: d.key, value: value};
      }
      return d;
    })] });
  };
  /**
   * Query Format
   */
  onQueryFormatChange = (selectable: SelectableValue<string>) => {
    const { onChange, query } = this.props;
    if (!selectable || !isString(selectable.value)) {
      return onChange({ ...query, format: defaultQuery.format });
    }
    return onChange({ ...query, format: selectable.value });
  };

  /**
   * Render
   */
  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { applications, apis } = this.state;
    return (
      <>
        <InlineFieldRow>
          <InlineField label="Module" labelWidth={14} grow>
            <Select onChange={this.onQueryModuleChange} value={query.queryModule} options={applications} width={30}/>
          </InlineField>
          {query.queryModule !== '' && (
            <InlineField label="API" labelWidth={14} grow>
              <Select onChange={this.onQueryAPIChange} value={query.queryAPI} options={apis} width={30}/>
            </InlineField>
          )}
        </InlineFieldRow>
        <InlineFieldRow>
          { query.queryArguments!.map((data, i) =>(
            <InlineField label={data.key} labelWidth={14} grow>
              <Input type="text" value={data.value} onChange={(e: ChangeEvent<HTMLInputElement>) => this.onQueryArgumentsChange(e.target.value, i)} />
            </InlineField>
          ))}
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField label="Format" labelWidth={14} grow>
            <Select onChange={this.onQueryFormatChange} value={query.format} options={queryFormats} width={30}/>
          </InlineField>
        </InlineFieldRow>
      </>
    );
  }
}

