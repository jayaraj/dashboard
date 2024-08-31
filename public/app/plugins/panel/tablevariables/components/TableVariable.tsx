import { css } from '@emotion/css';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';

import { PanelProps, GrafanaTheme2, DataFrame, Field, FieldType } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { useStyles2, CustomScrollbar, InlineField, Stack, FilterInput, Pagination, Table } from '@grafana/ui';
import { TableSortByFieldState } from '@grafana/ui/src/components/Table/types';

import { Header, TableVariablesOptions } from '../types';

interface Props extends PanelProps<TableVariablesOptions> {}

export const TableVariables: React.FC<Props> = ({ replaceVariables, data, width, options, onOptionsChange }) => {
  const styles = useStyles2(getStyles);
  let search: string | undefined = replaceVariables(`${options.search}`);
  search = search === `${options.search}` ? '' : search;
  const [searchQuery, setSearchQuery] = useState<string>(search);
  let page: string | undefined = replaceVariables(`${options.page}`);
  page = page === `${options.page}` ? '1' : page;
  const [selectedPage, setSelectedPage] = useState<number>(Number(page));
  const updateLocation = debounce((query) => locationService.partial(query, true), 500);
  
  
  const getHeaders = (headers: Header[]): DataFrame => {
    const df: DataFrame = { fields: [], length: 0};
    if (headers) {
      for (const header of headers) {
        let config = { displayName: header.title, custom: {}};
        
        if (header.width > 0) {
          config.custom = { width: header.width };
        }
        df.fields.push(
          { 
            name: header.id, 
            config: config, 
            values:[], 
            type: FieldType.other }
        );
      }
    }
    return  df;
  };

  const getCount = (frames: DataFrame[]) => {
    const field = frames.reduce((acc: Field | undefined, { fields }) => {
      const field = fields?.find((field: Field) => field.name === 'Count');
      if (field) {
        return field;
      }
      return acc;
    }, undefined);
    if (field) {
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
    const query = { [`var-${options.search}`]: searchQuery, [`var-${options.page}`]: 1 };
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

  function onSortByChange(sortBy: TableSortByFieldState[]) {
    if (sortBy.length === 0) {
      const query = { [`var-${options.sortBy}`]: undefined, [`var-${options.desc}`]: undefined, [`var-${options.page}`]: 1 };
      updateLocation(query);
      return;
    }
    const header = options.headers.find((o) => o.title === sortBy[0].displayName);
    if (header) {
      const query = { [`var-${options.sortBy}`]: header.id, [`var-${options.desc}`]: (sortBy[0].desc)? "true": "false", [`var-${options.page}`]: 1 };
      updateLocation(query);
    }
  }

  function onColumnResize(fieldDisplayName: string, width: number) {
    const headers = options.headers.map((header) => {
      if (header.title === fieldDisplayName) {
        return { ...header, width: width };
      }
      return header;
    });
    onOptionsChange({
      ...options,
      headers: headers,
    });
  }

  return (
    <CustomScrollbar autoHeightMax="100%" autoHeightMin="100%">
      <section className={styles.container}>
        <div className={styles.actionBar}>
          <InlineField grow>
            <FilterInput placeholder={`Search`} value={searchQuery} onChange={setSearchQuery} />
          </InlineField>
          <Stack justifyContent="flex-end" wrap="wrap" alignItems="center">
            <Pagination currentPage={selectedPage} numberOfPages={totalPages} onNavigate={setSelectedPage} />
          </Stack>
        </div>
        {(options.showHeaders) && (
          <div className={styles.table}>
            <Table
              height={30}
              width={width}
              data={getHeaders(options.headers)}
              noHeader={!options.showHeaders}
              resizable={true}
              onSortByChange={(sortBy) => onSortByChange(sortBy)}
              onColumnResize={(displayName, resizedWidth) => onColumnResize(displayName, resizedWidth)}
            />
          </div>
        )}
      </section>
    </CustomScrollbar>
  );
};

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      margin: 10px;
    `,
    table: css({
      paddingTop: theme.spacing(2),
    }),
    actionBar: css({
      display: 'flex',
      alignItems: 'flex-start',
      gap: theme.spacing(2),
    }),
  };
};
