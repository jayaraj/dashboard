import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';

import { PanelProps } from '@grafana/data';
import { locationService, getTemplateSrv } from '@grafana/runtime';
import { Label } from '@grafana/ui';
import { GroupPicker } from 'app/core/components/GroupPicker/GroupPicker';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { Group } from 'app/types';

import { getStyles, GroupPickerOptions } from './types';

interface Props extends PanelProps<GroupPickerOptions> {}
export const GroupPickerPanel: React.FC<Props> = ({ id, options }) => {
  const styles = getStyles();
  const dashboard = getDashboardSrv().getCurrent();
  const refresh = debounce(() => dashboard?.startRefresh(), 1000);
  const updateLocation = debounce((query) => locationService.partial(query, true), 100);
  const [groupPath, setGroupPath] = useState('');

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
    refresh();
  };

  const filterFunction = (g: Group) => {
    if (options.filter !== '') {
      return !g.type.toLowerCase().includes(options.filter.toLowerCase());
    }
    return true;
  };

  useEffect(() => {
    const panel = getDashboardSrv().getCurrent()?.getPanelById(id)!;
    const grouppath = getTemplateSrv().replace('${grouppath}', panel.scopedVars, 'regex');
    setGroupPath((grouppath !== '${grouppath}')?grouppath: '');
  }, []);

  return (
    <div className={styles.wrapper}>
      {(options.label !== '')&& (<Label>{options.label}</Label>)}
      <GroupPicker onChange={onSelect} filterFunction={filterFunction} groupPath={groupPath}></GroupPicker>
    </div>
  );
};
