import { defaults, isString, debounce } from 'lodash';
import React, { ChangeEvent, useState, useEffect } from 'react';

import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { InlineField, Input, Select, HorizontalGroup, VerticalGroup, InlineFieldRow } from '@grafana/ui';
import { stringsToSelectableValues, stringToSelectableValue } from 'app/features/alerting/unified/utils/amroutes';

import { DataSource } from '../datasource';
import { API, Application, DEFAULT_QUERY, DataSourceOptions, Query } from '../types';

type Props = QueryEditorProps<DataSource, Query, DataSourceOptions>;

export function QueryEditor({ datasource, query, onChange, onRunQuery }: Props) {
  const propagateOnRunQuery = debounce(onRunQuery, 2000);
  const { api } = datasource;
  const { queryApplication, queryAPI, queryArguments } = defaults(query, DEFAULT_QUERY);
  const [applications, setApplications] = useState<Application[]>();
  const [apis, setApis] = useState<API[]>();
  let [selectApis, setSelectApis] = useState(stringsToSelectableValues([] as string[]));
  let [selectApplications, setSelectApplications] = useState(stringsToSelectableValues([] as string[]));

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    const response = await api.getOptions();
    const applications = response.data.targets;
    setApplications(applications);
    const selectAppications = applications.map((a: Application) => stringToSelectableValue(a.application));
    setSelectApplications(selectAppications);
    const selectedApplication = applications!.find((target: Application) => target.application === queryApplication);
    const apis = selectedApplication ? selectedApplication.apis : [];
    setApis(apis);
    const selectApis = selectedApplication
      ? selectedApplication.apis.map((a: API) => stringToSelectableValue(a.name))
      : [];
    setSelectApis(selectApis);
  };

  const onQueryApplicationChange = (selectable: SelectableValue<string>) => {
    if (!selectable || !isString(selectable.value)) {
      return onChange({ ...query, queryApplication: DEFAULT_QUERY.queryApplication });
    }
    const selectedApplication = applications!.find((target: Application) => target.application === selectable.value);
    if (selectedApplication) {
      setApis(selectedApplication.apis);
      const selectApis = selectedApplication.apis.map((a: API) => stringToSelectableValue(a.name));
      setSelectApis(selectApis);
      onChange({
        ...query,
        queryApplication: selectedApplication.application,
        queryAPI: DEFAULT_QUERY.queryAPI,
        queryArguments: DEFAULT_QUERY.queryArguments,
      });
    }
  };

  const onQueryApiChange = (selectable: SelectableValue<string>) => {
    if (!selectable || !isString(selectable.value)) {
      return onChange({ ...query, queryAPI: DEFAULT_QUERY.queryAPI, queryArguments: DEFAULT_QUERY.queryArguments });
    }
    const selectedApi = apis!.find((api: API) => api.name === selectable.value);
    if (selectedApi) {
      const data = selectedApi!.data ? selectedApi!.data : [];
      onChange({ ...query, queryAPI: selectedApi.name, queryArguments: [...data] });
    }
    propagateOnRunQuery();
  };

  const onQueryArgumentsChange = (value: string, index: number) => {
    const arg = queryArguments!.map((pair, i) => {
      if (i === index) {
        return { key: pair.key, value: value };
      }
      return pair;
    });
    onChange({ ...query, queryArguments: arg });
    propagateOnRunQuery();
  };

  return (
    <div>
      <InlineFieldRow>
        <HorizontalGroup spacing="lg">
          <InlineField label="Application" labelWidth={16} grow>
            <Select
              onChange={onQueryApplicationChange}
              value={queryApplication}
              options={selectApplications}
              width={30}
            />
          </InlineField>
          {queryApplication !== '' && (
            <InlineField label="API" labelWidth={16} grow>
              <Select onChange={onQueryApiChange} value={queryAPI} options={selectApis} width={30} />
            </InlineField>
          )}
        </HorizontalGroup>
      </InlineFieldRow>
      <InlineFieldRow>
        <VerticalGroup>
          {queryArguments!.map((data, i) => (
            <InlineField key={i} label={data.key} labelWidth={16}>
              <Input
                type="text"
                value={data.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onQueryArgumentsChange(e.target.value, i)}
                width={30}
              />
            </InlineField>
          ))}
        </VerticalGroup>
      </InlineFieldRow>
    </div>
  );
}
