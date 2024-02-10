import { css } from '@emotion/css';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';

import { PanelProps, GrafanaTheme2, DataFrame, Field } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { useStyles2, CustomScrollbar, InlineField, Stack, FilterInput, Pagination } from '@grafana/ui';

import { TableVariablesOptions } from '../types';

interface Props extends PanelProps<TableVariablesOptions> {}

export const TableVariables: React.FC<Props> = ({ replaceVariables, data, options }) => {
  const styles = useStyles2(getStyles);
  let search: string | undefined = replaceVariables(`${options.search}`);
  search = search === `${options.search}` ? '' : search;
  const [searchQuery, setSearchQuery] = useState<string>(search);
  let page: string | undefined = replaceVariables(`${options.page}`);
  page = page === `${options.page}` ? '1' : page;
  const [selectedPage, setSelectedPage] = useState<number>(Number(page));

  const updateLocation = debounce((query) => locationService.partial(query, true), 500);
  const getCount = (frames: DataFrame[]) => {
    const field = frames.reduce((acc: Field | undefined, { fields }) => {
      const field = fields?.find((field: Field) => field.name === 'Count');
      if (field) {
        return field;
      }
      return acc;
    }, undefined);
    if (field) {
      // eslint-disable-next-line deprecation/deprecation
      const values = field.values.toArray ? field.values.toArray() : field.values;
      if (values.length > 0) {
        return values[0];
      }
    }
    return 0;
  };
  const count = getCount(data.series);
  const totalPages = Math.ceil(count / options.perPageLimit);

  useEffect(() => {
    const query = { [`var-${options.page}`]: selectedPage };
    updateLocation(query);
  }, [selectedPage]);

  useEffect(() => {
    const query = { [`var-${options.search}`]: searchQuery };
    updateLocation(query);
  }, [searchQuery]);

  useEffect(() => {
    const query = {
      [`var-${options.search}`]: '',
      [`var-${options.page}`]: 1,
      [`var-${options.perPage}`]: options.perPageLimit,
    };
    locationService.partial(query, true);
  }, []);

  return (
    <CustomScrollbar autoHeightMax="100%" autoHeightMin="100%">
      <section className={styles.container}>
        <div className="page-action-bar">
          <InlineField grow>
            <FilterInput placeholder={`Search`} value={searchQuery} onChange={setSearchQuery} />
          </InlineField>
          <Stack justifyContent="flex-end" wrap="wrap" alignItems="center">
            <Pagination currentPage={selectedPage} numberOfPages={totalPages} onNavigate={setSelectedPage} />
          </Stack>
        </div>
      </section>
    </CustomScrollbar>
  );
};

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      margin: 10px;
    `,
  };
};
