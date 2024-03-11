import { css } from '@emotion/css';
import debouncePromise from 'debounce-promise';
import React, { useEffect, useState, useCallback } from 'react';

import { SelectableValue } from '@grafana/data';
import { AsyncSelect, CustomScrollbar, useStyles, stylesFactory, HorizontalGroup, Spinner } from '@grafana/ui';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { Resource } from 'app/types/devicemanagement/resource';

export interface Props {
  onChange: (resource?: Resource) => void;
  resourceId?: number;
  groupPath?: string;
  filterFunction: (resource: Resource) => boolean;
  resourceType: string;
}
export const ResourceByTypePicker = ({
  resourceId,
  groupPath,
  resourceType,
  onChange,
  filterFunction,
}: Props): JSX.Element | null => {
  const [loading, setLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<SelectableValue<Resource>>();
  const [defaultResource, setDefaultResource] = useState<Resource>();
  const loadOptions = useCallback(
    async (query: string) => {
      const response = await getBackendSrv().get(
        `/api/resources/searchbytype?type=${resourceType}&query=${query}&group=${
          groupPath ? groupPath : '0,'
        }&perPage=${1000}&page=${1}`
      );
      const filteredResources = response.resources.filter((r: Resource) => filterFunction(r));
      if (filteredResources.length > 0) {
        setDefaultResource(filteredResources[0]);
      }
      const resources = filteredResources.map((r: Resource) => ({ value: r, label: r.name }));
      return resources;
    },
    [filterFunction, resourceType]
  );
  const debouncedLoadOptions = debouncePromise(loadOptions, 300, { leading: true });
  const loadResource = useCallback(
    async (id: number) => {
      const response = await getBackendSrv().get(`/api/resources/${id}`);
      if (response.type === resourceType) {
        setSelectedResource({ value: response, label: response.name });
        if (onChange) {
          onChange(response);
        }
      }
      return {};
    },
    [resourceType]
  );

  useEffect(() => {
    if (resourceId && resourceId !== 0) {
      setLoading(true);
      loadResource(resourceId);
      setLoading(false);
    } else {
      if (defaultResource) {
        setSelectedResource({ value: defaultResource, label: defaultResource.name });
        if (onChange) {
          onChange(defaultResource);
        }
      }
    }
  }, [resourceId, defaultResource, loadResource]);

  const onSelected = (value: SelectableValue<Resource>) => {
    if (value) {
      setSelectedResource(value);
      if (onChange) {
        onChange(value.value);
      }
    } else {
      if (defaultResource) {
        setSelectedResource({ value: defaultResource, label: defaultResource.name });
        if (onChange) {
          onChange(defaultResource);
        }
      } else {
        if (onChange) {
          onChange();
        }
        setSelectedResource(undefined);
      }
    }
  };

  const onMenu = () => {
    if (defaultResource) {
      setSelectedResource({ value: defaultResource, label: defaultResource.name });
    }
  };

  const styles = useStyles(getStyles);

  if (loading) {
    return <Spinner className={styles.spinner} />;
  }

  return (
    <CustomScrollbar>
      <div className={styles.container}>
        <HorizontalGroup>
          <AsyncSelect
            key={groupPath}
            loadingMessage="Loading ..."
            width={25}
            cacheOptions={false}
            isClearable
            value={selectedResource}
            defaultOptions={true}
            loadOptions={(query: string) => debouncedLoadOptions(query)}
            onChange={(value: SelectableValue<Resource>) => onSelected(value)}
            placeholder="Start typing to search"
            noOptionsMessage="No resources found"
            aria-label="Resource picker"
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
