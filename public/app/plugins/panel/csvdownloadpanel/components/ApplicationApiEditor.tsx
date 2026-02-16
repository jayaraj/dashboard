import React, { useState, useEffect, useCallback } from 'react';

import { SelectableValue, StandardEditorProps } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import { InlineField, Select, InlineFieldRow, HorizontalGroup } from '@grafana/ui';
import { stringsToSelectableValues } from 'app/features/alerting/unified/utils/amroutes';

import { Application, API } from '../../../datasource/grafoservice/types';
import { CsvDownloadOptions } from '../types';

// This editor manages both application and API as a combined object
interface AppApiValue {
  queryApplication: string;
  queryAPI: string;
}

interface Props extends StandardEditorProps<AppApiValue, CsvDownloadOptions> {}

export const ApplicationApiEditor: React.FC<Props> = ({ value, onChange, context }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [apis, setApis] = useState<API[]>([]);

  // Get options from context which has all panel options
  const options = context.options as CsvDownloadOptions;
  const datasourceName = options?.datasource || '';

  const currentValue = value || { queryApplication: '', queryAPI: '' };
  const [selectedApplication, setSelectedApplication] = useState<string>(currentValue.queryApplication);
  const [selectedApi, setSelectedApi] = useState<string>(currentValue.queryAPI);

  // Load applications when datasource changes
  const loadApplications = useCallback(async (dsName: string) => {
    if (!dsName) {
      setApplications([]);
      setApis([]);
      return;
    }
    try {
      const dsSrv = getDataSourceSrv();
      const ds: any = await dsSrv.get(dsName);
      if (ds && ds.api) {
        const response = await ds.api.getOptions();
        const apps = response.data.targets || [];
        setApplications(apps);
        return apps;
      }
    } catch (err) {
      console.error('Error loading applications:', err);
    }
    setApplications([]);
    setApis([]);
    return [];
  }, []);

  // Load applications when datasource changes
  useEffect(() => {
    if (datasourceName) {
      loadApplications(datasourceName);
    } else {
      setApplications([]);
      setApis([]);
    }
  }, [datasourceName, loadApplications]);

  // Set APIs when application changes
  useEffect(() => {
    if (selectedApplication && applications.length > 0) {
      const app = applications.find((a) => a.application === selectedApplication);
      if (app) {
        setApis(app.apis || []);
      } else {
        setApis([]);
      }
    } else {
      setApis([]);
    }
  }, [selectedApplication, applications]);

  const onApplicationChange = (selectable: SelectableValue<string>) => {
    const appName = selectable.value || '';
    setSelectedApplication(appName);
    setSelectedApi('');

    // Update APIs for the selected application
    const app = applications.find((a) => a.application === appName);
    if (app) {
      setApis(app.apis || []);
    }

    // Update both application and reset API
    onChange({
      queryApplication: appName,
      queryAPI: '',
    });
  };

  const onApiChange = (selectable: SelectableValue<string>) => {
    const apiName = selectable.value || '';
    setSelectedApi(apiName);

    // Update both application and API together
    onChange({
      queryApplication: selectedApplication,
      queryAPI: apiName,
    });
  };

  const applicationOptions = stringsToSelectableValues(applications.map((a) => a.application));
  const apiOptions = stringsToSelectableValues(apis.map((a) => a.name));

  if (!datasourceName) {
    return <div style={{ color: '#999', fontStyle: 'italic' }}>Please set the Data Source Name first</div>;
  }

  return (
    <div>
      <InlineFieldRow>
        <HorizontalGroup spacing="lg">
          <InlineField label="Application" labelWidth={16} grow>
            <Select
              onChange={onApplicationChange}
              value={selectedApplication}
              options={applicationOptions}
              placeholder="Select application"
              width={30}
            />
          </InlineField>
        </HorizontalGroup>
      </InlineFieldRow>

      {selectedApplication && (
        <InlineFieldRow>
          <HorizontalGroup spacing="lg">
            <InlineField label="API" labelWidth={16} grow>
              <Select
                onChange={onApiChange}
                value={selectedApi}
                options={apiOptions}
                placeholder="Select API"
                width={30}
              />
            </InlineField>
          </HorizontalGroup>
        </InlineFieldRow>
      )}
    </div>
  );
};
