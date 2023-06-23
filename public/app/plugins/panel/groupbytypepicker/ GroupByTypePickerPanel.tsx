import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';

import { PanelProps } from '@grafana/data';
import { locationService, getTemplateSrv } from '@grafana/runtime';
import { Label } from '@grafana/ui';
import { GroupByTypePicker } from 'app/core/components/GroupByTypePicker/GroupByTypePicker';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { Group } from 'app/types';

import { getStyles, GroupByTypePickerOptions } from './types';

interface Props extends PanelProps<GroupByTypePickerOptions> {}
export const GroupByTypePickerPanel: React.FC<Props> = ({ id, options }) => {
  const styles = getStyles();
  const dashboard = getDashboardSrv().getCurrent();
  const refresh = debounce(() => dashboard?.startRefresh(), 1000);
  const updateLocation = debounce((query) => locationService.partial(query, true), 100);
  const [groupId, setGroupId] = useState(0);

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
      return g.type.toLowerCase().includes(options.filter.toLowerCase());
    }
    return true;
  };

  useEffect(() => {
    const panel = getDashboardSrv().getCurrent()?.getPanelById(id)!;
    const group = getTemplateSrv().replace('${group}', panel.scopedVars, 'regex');
    setGroupId((group !== '${group}')? Number(group): 0);
  }, []);

  return (
    <div className={styles.wrapper}>
      {(options.label !== '')&& (<Label>{options.label}</Label>)}
      <GroupByTypePicker onChange={onSelect} filterFunction={filterFunction} groupId={groupId} groupType={options.filter}></GroupByTypePicker>
    </div>
  );
};
