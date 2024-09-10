import { debounce } from 'lodash';
import React from 'react';

import { PanelProps } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { Label } from '@grafana/ui';
import { GroupPicker } from 'app/core/components/GroupPicker/GroupPicker';
import { Group } from 'app/types/devicemanagement/group';

import { getStyles, GroupPickerOptions } from './types';

interface Props extends PanelProps<GroupPickerOptions> {}
export const GroupPickerPanel: React.FC<Props> = ({ options, replaceVariables }) => {
  const styles = getStyles();
  const updateLocation = debounce((query) => locationService.partial(query, true), 100);
  let grouppath: string | undefined = replaceVariables('${grouppath}');
  grouppath = grouppath === '${grouppath}' ? '0,' : grouppath;

  const onSelect = async (group?: Group) => {
    let query = {};
    if (group) {
      query = { ...query, [`var-group`]: group.id };
      query = { ...query, [`var-grouppath`]: group.path };
    } else {
      query = { ...query, [`var-group`]: undefined };
      query = { ...query, [`var-grouppath`]: undefined };
    }
    updateLocation(query);
  };

  const filterFunction = (g: Group) => {
    if (options.filter !== '') {
      return !g.type.toLowerCase().includes(options.filter.toLowerCase());
    }
    return true;
  };

  return (
    <div className={styles.wrapper}>
      {options.label !== '' && <Label>{options.label}</Label>}
      <GroupPicker onChange={onSelect} filterFunction={filterFunction} groupPath={grouppath}></GroupPicker>
    </div>
  );
};
