import React, { useState, useEffect, useRef } from 'react';
import { ChangeEvent } from 'react';

import { StandardEditorProps } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import { InlineField, Input, InlineFieldRow, VerticalGroup } from '@grafana/ui';

import { Data } from '../../../datasource/grafoservice/types';
import { CsvDownloadOptions, QueryArgument } from '../types';

interface Props extends StandardEditorProps<QueryArgument[], CsvDownloadOptions> {}

export const QueryArgumentsEditor: React.FC<Props> = ({ value, onChange, context }) => {
  const [args, setArgs] = useState<QueryArgument[]>(value || []);

  // Track what we've already loaded to prevent repeated refreshes
  const loadedRef = useRef<string>('');

  // Get options from context which has all panel options
  const options = context.options as CsvDownloadOptions;
  const datasourceName = options?.datasource || '';
  const appApi = options?.appApi || { queryApplication: '', queryAPI: '' };

  // Create a key to track what combination we've loaded
  const loadKey = `${datasourceName}::${appApi.queryApplication}::${appApi.queryAPI}`;

  // Load arguments only when datasource/application/api changes
  useEffect(() => {
    // Skip if we've already loaded this combination
    if (loadedRef.current === loadKey) {
      return;
    }

    if (!datasourceName || !appApi.queryApplication || !appApi.queryAPI) {
      setArgs([]);
      loadedRef.current = '';
      return;
    }

    const loadArguments = async () => {
      try {
        const dsSrv = getDataSourceSrv();
        const ds: any = await dsSrv.get(datasourceName);
        if (ds && ds.api) {
          const response = await ds.api.getOptions();
          const applications = response.data.targets || [];
          const selectedApp = applications.find((a: any) => a.application === appApi.queryApplication);
          if (selectedApp) {
            const selectedApi = selectedApp.apis?.find((a: any) => a.name === appApi.queryAPI);
            if (selectedApi && selectedApi.data) {
              // Set arguments from API's data, preserving any existing values
              const currentArgs = value || [];
              const newArgs = selectedApi.data.map((d: Data) => {
                const existing = currentArgs.find((a) => a.key === d.key);
                return {
                  key: d.key,
                  value: existing?.value || d.value || '',
                };
              });
              setArgs(newArgs);
              onChange(newArgs);
              loadedRef.current = loadKey;
              return;
            }
          }
        }
      } catch (err) {
        console.error('Error loading arguments:', err);
      }
      setArgs([]);
      loadedRef.current = '';
    };

    loadArguments();
  }, [datasourceName, appApi.queryApplication, appApi.queryAPI, loadKey, value, onChange]);

  const onArgumentChange = (index: number, newValue: string) => {
    const updatedArgs = args.map((arg, i) => {
      if (i === index) {
        return { ...arg, value: newValue };
      }
      return arg;
    });
    setArgs(updatedArgs);
    onChange(updatedArgs);
  };

  if (!datasourceName || !appApi.queryApplication || !appApi.queryAPI) {
    return (
      <div style={{ color: '#999', fontStyle: 'italic' }}>Please select Data Source, Application, and API first</div>
    );
  }

  if (args.length === 0) {
    return <div style={{ color: '#999', fontStyle: 'italic' }}>No query arguments available for this API</div>;
  }

  return (
    <InlineFieldRow>
      <VerticalGroup>
        {args.map((arg, i) => (
          <InlineField key={i} label={arg.key} labelWidth={16}>
            <Input
              type="text"
              value={arg.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onArgumentChange(i, e.target.value)}
              width={30}
              placeholder={`Enter value for ${arg.key}`}
            />
          </InlineField>
        ))}
      </VerticalGroup>
    </InlineFieldRow>
  );
};
