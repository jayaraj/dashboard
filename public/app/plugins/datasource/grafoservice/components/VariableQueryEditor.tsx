import { defaults, isString } from 'lodash';
import React, { ChangeEvent, useState, useEffect } from 'react';

import { SelectableValue } from '@grafana/data';
import { InlineField, Input, Select, HorizontalGroup, VerticalGroup, InlineFieldRow } from '@grafana/ui';
import { stringsToSelectableValues, stringToSelectableValue } from 'app/features/alerting/unified/utils/amroutes';

import { DataSource } from '../datasource';
import { API, Application, DEFAULT_VARIABLEQUERY, VariableQuery } from '../types';

interface Props {
  datasource: DataSource;
  query: VariableQuery;
  onChange: (query: VariableQuery, definition: string) => void;
}

export const VariableQueryEditor = ({ datasource, onChange, query }: Props) => {
  const { api: Api } = datasource;
  const { application, api, arguments: args } = defaults(query, DEFAULT_VARIABLEQUERY);
  const [applications, setApplications] = useState<Application[]>();
  const [apis, setApis] = useState<API[]>();
  let [selectApis, setSelectApis] = useState(stringsToSelectableValues([] as string[]));
  let [selectApplications, setSelectApplications] = useState(stringsToSelectableValues([] as string[]));

  const onQueryApplicationChange = (selectable: SelectableValue<string>) => {
    if (!selectable || !isString(selectable.value)) {
      return onChange(
        { ...query, application: DEFAULT_VARIABLEQUERY.application! },
        `${DEFAULT_VARIABLEQUERY.application} ${DEFAULT_VARIABLEQUERY.api}`
      );
    }
    const selectedApplication = applications!.find((target: Application) => target.application === selectable.value);
    if (selectedApplication) {
      setApis(selectedApplication.apis);
      const selectApis = selectedApplication.apis.map((a: API) => stringToSelectableValue(a.name));
      setSelectApis(selectApis);
      onChange(
        {
          ...query,
          application: selectedApplication.application,
          api: DEFAULT_VARIABLEQUERY.api!,
          arguments: DEFAULT_VARIABLEQUERY.arguments!,
        },
        `${selectedApplication.application} ${DEFAULT_VARIABLEQUERY.api}`
      );
    }
  };

  const onQueryApiChange = (selectable: SelectableValue<string>) => {
    if (!selectable || !isString(selectable.value)) {
      return onChange(
        { ...query, api: DEFAULT_VARIABLEQUERY.api!, arguments: DEFAULT_VARIABLEQUERY.arguments! },
        `${query.application} ${DEFAULT_VARIABLEQUERY.api}`
      );
    }
    const selectedApi = apis!.find((api: API) => api.name === selectable.value);
    if (selectedApi) {
      const data = selectedApi!.data ? selectedApi!.data : [];
      onChange({ ...query, api: selectedApi.name, arguments: [...data] }, `${query.application} ${selectedApi.name}`);
    }
  };

  const onQueryArgumentsChange = (value: string, index: number) => {
    const arg = args!.map((pair, i) => {
      if (i === index) {
        return { key: pair.key, value: value };
      }
      return pair;
    });
    onChange({ ...query, arguments: arg }, `${query.application} ${query.api}`);
  };

  useEffect(() => {
    const fetchOptions = async () => {
      const response = await Api.getOptions();
      const applications = response.data.targets;
      setApplications(applications);
      const selectAppications = applications.map((a: Application) => stringToSelectableValue(a.application));
      setSelectApplications(selectAppications);
      const selectedApplication = applications!.find((target: Application) => target.application === application);
      const apis = selectedApplication ? selectedApplication.apis : [];
      setApis(apis);
      const selectApis = selectedApplication
        ? selectedApplication.apis.map((a: API) => stringToSelectableValue(a.name))
        : [];
      setSelectApis(selectApis);
    };
    fetchOptions();
  }, [Api, application]);

  return (
    <div>
      <InlineFieldRow>
        <HorizontalGroup spacing="lg">
          <InlineField label="Application" labelWidth={16} grow>
            <Select onChange={onQueryApplicationChange} value={application} options={selectApplications} width={30} />
          </InlineField>
          {application !== '' && (
            <InlineField label="API" labelWidth={16} grow>
              <Select onChange={onQueryApiChange} value={api} options={selectApis} width={30} />
            </InlineField>
          )}
        </HorizontalGroup>
      </InlineFieldRow>
      <InlineFieldRow>
        <VerticalGroup>
          {args!.map((data, i) => (
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
};
