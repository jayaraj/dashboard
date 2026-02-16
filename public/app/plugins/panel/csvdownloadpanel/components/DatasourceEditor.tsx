import React, { useState, useEffect } from 'react';

import { SelectableValue, StandardEditorProps } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { InlineField, Select } from '@grafana/ui';

import { CsvDownloadOptions } from '../types';

interface Props extends StandardEditorProps<string, CsvDownloadOptions> {}

export const DatasourceEditor: React.FC<Props> = ({ value, onChange }) => {
  const [datasources, setDatasources] = useState<Array<SelectableValue<string>>>([]);
  const [selectedDs, setSelectedDs] = useState<string>(value || '');

  // Load all grafoservice datasources on mount
  useEffect(() => {
    const loadDatasources = async () => {
      try {
        const dsList = await getBackendSrv().get('/api/datasources');
        const grafoserviceDS = dsList
          .filter((ds: any) => ds.type === 'grafoservice')
          .map((ds: any) => ({
            label: ds.name,
            value: ds.name,
            description: ds.type,
          }));
        setDatasources(grafoserviceDS);
      } catch (err) {
        console.error('Error loading datasources:', err);
      }
    };
    loadDatasources();
  }, []);

  const onDatasourceChange = (selectable: SelectableValue<string>) => {
    const dsName = selectable.value || '';
    setSelectedDs(dsName);
    onChange(dsName);
  };

  return (
    <InlineField label="Data Source" labelWidth={16} grow>
      <Select
        onChange={onDatasourceChange}
        value={selectedDs}
        options={datasources}
        placeholder="Select grafoservice datasource"
        width={30}
        isClearable
      />
    </InlineField>
  );
};
