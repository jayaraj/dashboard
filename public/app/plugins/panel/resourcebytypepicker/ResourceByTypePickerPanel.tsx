import { debounce } from 'lodash';
import React, { useState, useEffect, useRef } from 'react';

import { PanelProps } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { Label } from '@grafana/ui';
import { ResourceByTypePicker } from 'app/core/components/ResourceByTypePicker/ResourceByTypePicker';
import { Resource } from 'app/types/devicemanagement/resource';

import { getStyles, ResourceByTypePickerOptions } from './types';

interface Props extends PanelProps<ResourceByTypePickerOptions> {}
export const ResourceByTypePickerPanel: React.FC<Props> = React.memo(({ options, replaceVariables }) => {
  const styles = getStyles();
  const updateLocation = debounce((query) => locationService.partial(query, true), 100);
  let resource: string | undefined = replaceVariables('${resource}');
  const [resourceId, setResourceId] = useState<number>(resource === '${resource}' ? 0 : Number(resource));
  let grpPath: string | undefined = replaceVariables('${grouppath}');
  grpPath = grpPath === '${grouppath}' ? '0,' : grpPath;
  const isNotFirstRender = useRef(false);

  const onSelect = async (resource?: Resource) => {
    let query = {};
    if (resource) {
      query = { ...query, [`var-resource`]: resource.id };
    } else {
      query = { ...query, [`var-resource`]: undefined };
    }
    setResourceId(resource ? resource.id : 0);
    updateLocation(query);
  };

  const filterFunction = (r: Resource) => {
    if (options.filter !== '') {
      return r.type.toLowerCase().includes(options.filter.toLowerCase());
    }
    return true;
  };

  useEffect(() => {
    if (isNotFirstRender.current) {
      const query = { [`var-resource`]: undefined };
      updateLocation(query);
      setResourceId(0);
      return;
    }
    isNotFirstRender.current = true;
  }, [grpPath]);

  return (
    <div className={styles.wrapper}>
      {options.label !== '' && <Label>{options.label}</Label>}
      <ResourceByTypePicker
        key={grpPath}
        onChange={onSelect}
        filterFunction={filterFunction}
        resourceId={resourceId}
        groupPath={grpPath}
        resourceType={options.filter}
      ></ResourceByTypePicker>
    </div>
  );
});
