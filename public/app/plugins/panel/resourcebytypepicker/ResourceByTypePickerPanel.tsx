import { debounce } from 'lodash';
import React, { useState, useEffect } from 'react';

import { PanelProps } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { Label } from '@grafana/ui';
import { ResourceByTypePicker } from 'app/core/components/ResourceByTypePicker/ResourceByTypePicker';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { Resource } from 'app/types/devicemanagement/resource';

import { getStyles, ResourceByTypePickerOptions } from './types';

interface Props extends PanelProps<ResourceByTypePickerOptions> {}
export const ResourceByTypePickerPanel: React.FC<Props> = ({ options, replaceVariables }) => {
  const styles = getStyles();
  const updateLocation = debounce((query) => locationService.partial(query, true), 100);
  const dashboard = getDashboardSrv().getCurrent();
  const refresh = debounce(() => dashboard?.startRefresh(), 1000);
  let resource: string | undefined = replaceVariables('${resource}');
  const [resourceId, setResourceId] = useState<Number>(resource === '${resource}' ? 0 : Number(resource));
  let grpPath: string | undefined = replaceVariables('${grouppath}');
  grpPath = grpPath === '${grouppath}' ? '0,' : grpPath;

  const onSelect = async (resource?: Resource) => {
    let query = {};
    if (resource) {
      query = { ...query, [`var-resource`]: resource.id };
    } else {
      query = { ...query, [`var-resource`]: undefined };
    }
    updateLocation(query);
    refresh();
  };

  const filterFunction = (r: Resource) => {
    if (options.filter !== '') {
      return r.type.toLowerCase().includes(options.filter.toLowerCase());
    }
    return true;
  };

  useEffect(() => {
    const query = { [`var-resource`]: undefined };
    updateLocation(query);
    setResourceId(0);
    refresh();
  }, [grpPath]);

  return (
    <div className={styles.wrapper}>
      {options.label !== '' && <Label>{options.label}</Label>}
      <ResourceByTypePicker
        onChange={onSelect}
        filterFunction={filterFunction}
        resourceId={resourceId}
        groupPath={grpPath}
        resourceType={options.filter}
      ></ResourceByTypePicker>
    </div>
  );
};
