import { css } from '@emotion/css';
import debouncePromise from 'debounce-promise';
import React, { useEffect, useState, useCallback } from 'react';


import { AsyncSelect, CustomScrollbar, useStyles, stylesFactory, HorizontalGroup, SelectValue } from '@grafana/ui';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { Group } from 'app/types';

export interface Props {
  onChange: (group?: Group) => void;
  filterFunction: (group: Group) => boolean;
}
export const GroupPicker = ({onChange, filterFunction}: Props): JSX.Element | null => {
  const [parents, setParents] = useState<Array<{id: number}>>([]);
  const loadOptions = useCallback(
    async (query: string, parent: number) => {
      const response = await getBackendSrv().get(`/api/groups?query=${query}&parent=${parent}&perPage=${1000}&page=${1}`);
      const filteredGroups = response.groups.filter((g: Group) => filterFunction(g));
      return filteredGroups.map((g: Group) => ({value: g, label: g.name}));
    },[filterFunction]);
  const debouncedLoadOptions = debouncePromise(loadOptions, 300, { leading: true });

  useEffect(() => {
    if (parents.length === 0) {
      setParents(prevItems => [...prevItems, { id: -1}]);
    } 
  }, []);

  const onSelected = (value: SelectValue<Group>, index: number) => {
    setParents([
      ...parents.slice(0, index + 1)
    ]);
    if (value) {
      if (value.value.child) {
        setParents([
          ...parents.slice(0, index + 1),
          { id: value.value.id},
        ]);
      }
      if (onChange) {
        onChange(value.value);
      }
      // locationService.partial({ 'var-group': value.value.id,  'var-grouppath': value.value.path,}, true);
    } else {
      onChange();
    }
  };

  const onMenu = (index: number) => {
    setParents([
      ...parents.slice(0, index + 1)
    ]);
  }

  const styles = useStyles(getStyles);
  return (
    <CustomScrollbar>
      <div className={styles.container}>
        <HorizontalGroup>
          {parents.map((parent, index) => {
            return(
              <AsyncSelect
                key={`${parent}`}
                loadingMessage="Loading ..."
                cacheOptions={false}
                isClearable
                defaultOptions={true}
                loadOptions={(query: string) => debouncedLoadOptions(query, parent.id)}
                onChange={(value: SelectValue<Group>) => onSelected(value, index)}
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
  `,
}));
