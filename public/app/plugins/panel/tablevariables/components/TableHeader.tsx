import React, { memo, useMemo, useRef } from 'react';
import {
  useAbsoluteLayout,
  useFilters,
  useResizeColumns,
  useSortBy,
  useTable,
} from 'react-table';

import { TableCellHeight } from '@grafana/schema';
import { CustomScrollbar, useTheme2 } from '@grafana/ui';
import { HeaderRow } from '@grafana/ui/src/components/Table/HeaderRow';
import { useFixScrollbarContainer } from '@grafana/ui/src/components/Table/hooks';
import { getInitialState, useTableStateReducer } from '@grafana/ui/src/components/Table/reducer';
import { useTableStyles } from '@grafana/ui/src/components/Table/styles';
import {  Props } from '@grafana/ui/src/components/Table/types';
import { getColumns, sortCaseInsensitive, sortNumber } from '@grafana/ui/src/components/Table/utils';

const COLUMN_MIN_WIDTH = 150;

export const TableHeader = memo((props: Props) => {
  const {
    ariaLabel,
    data,
    height,
    width,
    columnMinWidth = COLUMN_MIN_WIDTH,
    noHeader,
    resizable = true,
    initialSortBy,
    showTypeIcons,
    cellHeight = TableCellHeight.Sm,
  } = props;

  const tableDivRef = useRef<HTMLDivElement>(null);
  const variableSizeListScrollbarRef = useRef<HTMLDivElement>(null);
  const theme = useTheme2();
  const tableStyles = useTableStyles(theme, cellHeight);

  const memoizedData = useMemo(() => {
    if (!data.fields.length) {
      return [];
    }
    return Array(data.length).fill(0);
  }, [data]);

  const memoizedColumns = useMemo(
    () => getColumns(data, width, columnMinWidth, false),
    [data, width, columnMinWidth]
  );

  const stateReducer = useTableStateReducer({
    ...props,
    onSortByChange: (state) => {
      if (props.onSortByChange) {
        props.onSortByChange(state);
      }
    },
  });

  const options: any = useMemo(
    () => ({
      columns: memoizedColumns,
      data: memoizedData,
      disableResizing: !resizable,
      stateReducer: stateReducer,
      autoResetPage: false,
      initialState: getInitialState(initialSortBy, memoizedColumns),
      autoResetFilters: false,
      sortTypes: {
        number: sortNumber,
        'alphanumeric-insensitive': sortCaseInsensitive,
      },
    }),
    [initialSortBy, memoizedColumns, memoizedData, resizable, stateReducer]
  );

  const {
    getTableProps,
    headerGroups,
    totalColumnsWidth,
  } = useTable(options, useFilters, useSortBy, useAbsoluteLayout, useResizeColumns);


  useFixScrollbarContainer(variableSizeListScrollbarRef, tableDivRef);

  return (
    <div
      {...getTableProps()}
      className={tableStyles.table}
      aria-label={ariaLabel}
      role="table"
      ref={tableDivRef}
      style={{ width, height }}
    >
      <CustomScrollbar hideVerticalTrack={true}>
        <div className={tableStyles.tableContentWrapper(totalColumnsWidth)}>
          {!noHeader && (
            <HeaderRow headerGroups={headerGroups} showTypeIcons={showTypeIcons} tableStyles={tableStyles} />
          )}
        </div>
      </CustomScrollbar>
    </div>
  );
});

TableHeader.displayName = 'TableHeader';
