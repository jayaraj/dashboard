import { debounce } from 'lodash';
import Tree, { TreeNode } from 'rc-tree';
import React, { useEffect, useState } from 'react';

import { PanelProps } from '@grafana/data';
import { getBackendSrv, locationService, RefreshEvent } from '@grafana/runtime';
import { useTheme, Spinner, CustomScrollbar } from '@grafana/ui';
import { Group } from 'app/types';

import { ActionRow } from './ActionRow';
import { getStyles, GroupNavigatorOptions, TreeState } from './types';
import './assets/index.css';

interface Props extends PanelProps<GroupNavigatorOptions> {}
export const GroupNavigatorPanel: React.FC<Props> = ({ height, eventBus }) => {
  const [loading, setLoading] = useState(true);
  const [treeState, setTreeState] = useState(TreeState.Collapsed);
  const [expanded, setExpanded] = useState(false);
  const [groups, setGroupsState] = useState([] as Group[]);
  const theme = useTheme();
  const styles = getStyles(height, theme);
  const ht = height - 80 + 'px';
  const updateLocation = debounce((query) => locationService.partial(query), 300);

  const loop = (groups: Group[]) =>
    groups.map((group) => {
      if (group.groups && group.groups.length > 0) {
        return (
          <TreeNode key={group.id} title={group.name}>
            {loop(group.groups)}
          </TreeNode>
        );
      }
      return <TreeNode key={group.id} title={group.name} />;
    });

  const initialRequest = async () => {
    setLoading(true);
    const response = await getBackendSrv().get('/api/groups', {});
    setGroupsState(response.groups);
    setLoading(false);
  };

  const onTreeChange = (type: TreeState) => {
    type === TreeState.Expanded ? setExpanded(true) : setExpanded(false);
    setTreeState(type);
  };

  const onSelect = async (_: any, info: any) => {
    let query = {};
    for (let i = 1; i <= 20; i++) {
      query = { ...query, [`var-grplevel_${i}`]: undefined };
    }
    if (info.selected) {
      query = { ...query, [`var-grp`]: info.node.key };
      const response = await getBackendSrv().get(`/api/groups/${info.node.key}/parent`, {});
      const update = getGroupLevels(response);
      query = { ...query, ...update };
    } else {
      query = { ...query, [`var-grp`]: undefined };
    }
    updateLocation(query);
    eventBus.publish(new RefreshEvent());
  };

  const getGroupLevels = (group: Group) => {
    let query = {};
    if ( group.groups && (group.groups.length > 0)) {
      query = getGroupLevels(group.groups[0]);
    }
    return { ...query, [`var-grplevel_${group.level}`]: group.id };
  };

  useEffect(() => {
    initialRequest();
  }, []);

  if (loading) {
    return <Spinner className={styles.spinner} />;
  }

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.wrapper}>
        <div className={styles.search}>
          <ActionRow {...{ treeState, onTreeChange: onTreeChange }} />
          <CustomScrollbar autoHeightMax={ht}>
            {expanded && (
              <Tree defaultExpandAll expandAction="click" onSelect={onSelect} showIcon={false} showLine>
                {loop(groups)}
              </Tree>
            )}
            {!expanded && (
              <Tree expandAction="click" onSelect={onSelect} showIcon={false} showLine>
                {loop(groups)}
              </Tree>
            )}
          </CustomScrollbar>
        </div>
      </div>
    </div>
  );
};
