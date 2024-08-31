import { css } from '@emotion/css';
import React, { useEffect, useState, useCallback } from 'react';

import { SelectableValue } from '@grafana/data';
import { AsyncSelect, CustomScrollbar, useStyles, stylesFactory, HorizontalGroup, Spinner } from '@grafana/ui';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { Group } from 'app/types/devicemanagement/group';

export interface Props {
  groupPath?: string;
  onChange: (group?: Group) => void;
  filterFunction: (group: Group) => boolean;
}
export const GroupPicker = ({ groupPath, onChange, filterFunction }: Props): JSX.Element | null => {
  const [loading, setLoading] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<SelectableValue<Group>>({});
  const [parents, setParents] = useState<Array<{ parentId: number; selectedId: number }>>([]);
  const loadOptions = useCallback(
    async (query: string, parents: Array<{ parentId: number; selectedId: number }>, parent: number, index: number) => {
      const response = await getBackendSrv().get(
        `/api/groups?query=${query}&parent=${parent}&perPage=${1000}&page=${1}`
      );
      const filteredGroups = response.groups.filter((g: Group) => filterFunction(g));
      if (filteredGroups.length > 0) {
        if (index < parents.length && parents[index].parentId === parent) {
          if (parents[index].selectedId !== 0) {
            const grp = filteredGroups.find((g: Group) => g.id === parents[index].selectedId);
            setSelectedGroups((prevItems) => ({ ...prevItems, [`${parent}`]: { value: grp, label: grp!.name } }));
            if (grp!.child && index + 1 >= parents.length) {
              setParents([...parents.slice(0, index + 1), { parentId: grp.id, selectedId: 0 }]);
            }
          } else {
            setSelectedGroups((prevItems) => ({
              ...prevItems,
              [`${parent}`]: { value: filteredGroups[0], label: filteredGroups[0].name },
            }));
            if (filteredGroups[0].child && index + 1 >= parents.length) {
              setParents([...parents.slice(0, index + 1), { parentId: filteredGroups[0].id, selectedId: 0 }]);
            }
          }
        }
      }
      return filteredGroups.map((g: Group) => ({ value: g, label: g.name }));
    },
    [filterFunction]
  );

  useEffect(() => {
    if (groupPath && groupPath !== '') {
      let parents: Array<{ parentId: number; selectedId: number }> = [{ parentId: -1, selectedId: 0 }];
      if (groupPath.includes(',')) {
        setLoading(true);
        const groupsIds = groupPath.split(',');
        groupsIds.forEach((id, index) => {
          if (index >= groupsIds.length - 2) {
            return;
          }
          if (id !== '') {
            if (id === '0') {
              parents = [{ parentId: Number(-1), selectedId: Number(groupsIds[index + 1]) }];
              return;
            }
            parents.push({ parentId: Number(id), selectedId: Number(groupsIds[index + 1]) });
          }
        });
        setLoading(false);
      }
      setParents([...parents]);
    } else {
      setParents([{ parentId: -1, selectedId: 0 }]);
    }
  }, [groupPath]);

  useEffect(() => {
    if (onChange && parents.length > 0) {
      const grp = selectedGroups[parents[parents.length - 1].parentId];
      if (grp) {
        onChange(grp.value);
      }
    }
  }, [selectedGroups]);

  const onSelected = (value: SelectableValue<Group>, index: number) => {
    setParents([...parents.slice(0, index + 1)]);
    if (value) {
      if (value.value?.child) {
        setParents([
          ...parents.slice(0, index),
          { ...parents[index], selectedId: value.value.id },
          { parentId: value.value.id, selectedId: 0 },
        ]);
      }
      setSelectedGroups((prevItems) => ({ ...prevItems, [`${parents[index].parentId}`]: value }));
    }
  };

  const onMenu = (index: number) => {
    setParents([...parents.slice(0, index + 1)]);
  };

  const styles = useStyles(getStyles);

  if (loading) {
    return <Spinner className={styles.spinner} />;
  }

  return (
    <CustomScrollbar>
      <div className={styles.container}>
        <HorizontalGroup>
          {parents.map((parent, index) => {
            return (
              <AsyncSelect
                key={`${parent.parentId}`}
                loadingMessage="Loading ..."
                width={25}
                cacheOptions={false}
                value={selectedGroups[`${parent.parentId}`]}
                defaultOptions={true}
                loadOptions={(query: string) => loadOptions(query, parents, parent.parentId, index)}
                onChange={(value: SelectableValue<Group>) => onSelected(value, index)}
                placeholder="Start typing to search"
                noOptionsMessage="No groups found"
                aria-label="Group picker"
                onOpenMenu={() => onMenu(index)}
              />
            );
          })}
        </HorizontalGroup>
      </div>
    </CustomScrollbar>
  );
};

const getStyles = stylesFactory(() => ({
  container: css`
    overflow-x: auto;
    height: 100%;
    width: 100%;
    padding: 5px 5px;
  `,
  spinner: css`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
  `,
}));
