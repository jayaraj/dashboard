import { css } from '@emotion/css';
import debouncePromise from 'debounce-promise';
import React, { useEffect, useState, useCallback } from 'react';

import { SelectableValue } from '@grafana/data';
import { AsyncSelect, CustomScrollbar, useStyles, stylesFactory, HorizontalGroup, Spinner } from '@grafana/ui';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { Group } from 'app/types';

export interface Props {
  onChange: (group?: Group) => void;
  filterFunction: (group: Group) => boolean;
  groupPath?: string; 
}
export const GroupPicker = ({groupPath, onChange, filterFunction}: Props): JSX.Element | null => {
  const [loading, setLoading] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<SelectableValue<Group>>({});
  const [parents, setParents] = useState<Array<{id: number, selectedId: number}>>([]);
  const loadOptions = useCallback(
    async (query: string, parent: number) => {
      const response = await getBackendSrv().get(`/api/groups?query=${query}&parent=${parent}&perPage=${1000}&page=${1}`);
      const filteredGroups = response.groups.filter((g: Group) => filterFunction(g));
      return filteredGroups.map((g: Group) => ({value: g, label: g.name}));
    },[filterFunction]);
  const debouncedLoadOptions = debouncePromise(loadOptions, 300, { leading: true });
  const loadGroup = async (parent: number, id: number) => {
    const response = await getBackendSrv().get(`/api/groups/${id}`);
    setSelectedGroups(prevItems => ({...prevItems, [`${parent}`]: {value: response, label: response.name}}));
    return {value: response, label: response.name}
  }

  useEffect(() => {
    if (groupPath && groupPath !== '' && groupPath.includes(',')) {
      setLoading(true);
      const groupsIds = groupPath.split(',');
      let paths: Array<{id: number, selectedId: number}> = [];
      groupsIds.forEach((id, index) => {
        if (id === '0') {
          paths = [{ id: -1, selectedId: Number(groupsIds[index + 1])}];
          loadGroup(-1, Number(groupsIds[index + 1]));
        } else {
          if (index + 1 < groupsIds.length - 1) {
            paths.push({id: Number(id), selectedId: Number(groupsIds[index + 1])});
            loadGroup(Number(id), Number(groupsIds[index + 1]));
          }
        }
        setParents([...paths]);
      });
      setLoading(false);
    } else {
      if (parents.length === 0) {
        setParents(prevItems => [...prevItems, { id: -1, selectedId: 0}]);
      } 
    }
  }, [groupPath]);

  const onSelected = (value: SelectableValue<Group>, index: number) => {
    setParents([
      ...parents.slice(0, index + 1)
    ]);
    if (value) {
      if (value.value?.child) {
        setParents([
          ...parents.slice(0, index),
          {...parents[index], selectedId: value.value.id},
          { id: value.value.id, selectedId: 0},
        ]);
      }
      setSelectedGroups(prevItems => ({...prevItems, [`${parents[index].id}`]: value}));
      if (onChange) {
        onChange(value.value);
      }
    } else {
      if (index !== 0) {
        onChange(selectedGroups[parents[index-1].id].value);
        setParents([
          ...parents.slice(0, index),
          {id: selectedGroups[parents[index-1].id].value.id, selectedId: 0},
        ]);
      } else {
        onChange();
        setParents([{id: -1, selectedId: 0}]);
      }
      let filteredGroups = {}
      Object.values(selectedGroups).map((p) =>{
        for (let i = 0; i < index; i++) {
          if (parents[i].id === p.value.parent) {
            filteredGroups[p.value.parent] = p
          }
        }
        return p;
      })
      setSelectedGroups(prevItems => ({...filteredGroups}));
    }
  };

  const onMenu = (index: number) => {
    setParents([
      ...parents.slice(0, index + 1)
    ]);
  }

  const styles = useStyles(getStyles);

  if (loading) {
    return <Spinner className={styles.spinner} />;
  }

  return (
    <CustomScrollbar>
      <div className={styles.container}>
        <HorizontalGroup>
          {parents.map((parent, index) => {
            return(
              <AsyncSelect
                key={`${parent.id}`}
                loadingMessage="Loading ..."
                width={25}
                cacheOptions={false}
                isClearable
                value={selectedGroups[`${parent.id}`]}
                defaultOptions={true}
                loadOptions={(query: string) => debouncedLoadOptions(query, parent.id)}
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
  `,
  spinner: css`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
  `,
}));
