import { css } from '@emotion/css';
import debouncePromise from 'debounce-promise';
import React, { useEffect, useState, useCallback } from 'react';

import { SelectableValue } from '@grafana/data';
import { AsyncSelect, CustomScrollbar, useStyles, stylesFactory, HorizontalGroup, Spinner } from '@grafana/ui';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { Group } from 'app/types';

export interface Props {
  onChange: (group?: Group) => void;
  groupId?: number;
  filterFunction: (group: Group) => boolean;
  groupType: string; 
}
export const GroupByTypePicker = ({groupId, groupType, onChange, filterFunction}: Props): JSX.Element | null => {
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SelectableValue<Group>>();
  const loadOptions = useCallback(
    async (query: string) => {
      const response = await getBackendSrv().get(`/api/groups/searchbytype?type=${groupType}&query=${query}&parent=${parent}&perPage=${1000}&page=${1}`);
      const filteredGroups = response.groups.filter((g: Group) => filterFunction(g));
      return filteredGroups.map((g: Group) => ({value: g, label: g.name}));
    },[filterFunction]);
  const debouncedLoadOptions = debouncePromise(loadOptions, 300, { leading: true });
  const loadGroup = async (id: number) => {
    const response = await getBackendSrv().get(`/api/groups/${id}`);
    if ( response.type === groupType ) {
      setSelectedGroup({value: response, label: response.name});
    }
    return {}
  }

  useEffect(() => {
    if (groupId && groupId !== 0) {
      setLoading(true);
        loadGroup(groupId);
      setLoading(false);
    }
  }, [groupId]);

  const onSelected = (value: SelectableValue<Group>) => {
    if (value) {
      setSelectedGroup(value);
      if (onChange) {
        onChange(value.value);
      }
    } else {
      onChange();
      setSelectedGroup();
    }
  };

  const onMenu = () => {
    setSelectedGroup();
  }

  const styles = useStyles(getStyles);

  if (loading) {
    return <Spinner className={styles.spinner} />;
  }

  return (
    <CustomScrollbar>
      <div className={styles.container}>
        <HorizontalGroup>
          <AsyncSelect
            loadingMessage="Loading ..."
            width={25}
            cacheOptions={false}
            isClearable
            value={selectedGroup}
            defaultOptions={true}
            loadOptions={(query: string) => debouncedLoadOptions(query)}
            onChange={(value: SelectableValue<Group>) => onSelected(value)}
            placeholder="Start typing to search"
            noOptionsMessage="No groups found"
            aria-label="Group picker"
            onOpenMenu={() => onMenu()}
          />
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
