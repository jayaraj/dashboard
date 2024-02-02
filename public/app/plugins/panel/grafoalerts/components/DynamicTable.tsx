import { css, cx } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Pagination, useStyles2 } from '@grafana/ui';

import { DynamicTableColumnProps, DynamicTableProps } from '../types';

export const DynamicTable = <T extends object>({ cols, items, pagination, paginationStyles }: DynamicTableProps<T>) => {
  const styles = useStyles2(getStyles(cols));
  const totalPages = Math.ceil(pagination.total / pagination.itemsPerPage);

  return (
    <>
      <div className={styles.container} data-testid="dynamic-table">
        <div className={styles.row} data-testid="header">
          {cols.map((col) => (
            <div className={styles.cell} key={col.id}>
              {col.label}
            </div>
          ))}
        </div>

        {items.map((item, index) => {
          return (
            <div className={styles.row} key={`${item.id}-${index}`} data-testid={'row'}>
              {cols.map((col) => (
                <div className={cx(styles.cell, styles.bodyCell)} data-column={col.label} key={`${item.id}-${col.id}`}>
                  {col.renderCell(item, index)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {pagination && (
        <Pagination
          className={cx(styles.defaultPagination, paginationStyles)}
          currentPage={pagination.page}
          numberOfPages={totalPages}
          onNavigate={pagination.onPageChange}
          hideWhenSinglePage
        />
      )}
    </>
  );
};

const getStyles = <T extends unknown>(cols: Array<DynamicTableColumnProps<T>>) => {
  const sizes = cols.map((col) => {
    if (!col.size) {
      return 'auto';
    }

    if (typeof col.size === 'number') {
      return `${col.size}fr`;
    }

    return col.size;
  });

  return (theme: GrafanaTheme2) => ({
    container: css`
      border: 1px solid ${theme.colors.border.strong};
      border-radius: 2px;
      color: ${theme.colors.text.secondary};
    `,
    row: css`
      display: grid;
      grid-template-columns: ${sizes.join(' ')};
      grid-template-rows: 1fr auto;

      &:nth-child(2n + 1) {
        background-color: ${theme.colors.background.secondary};
      }

      &:nth-child(2n) {
        background-color: ${theme.colors.background.primary};
      }

      ${theme.breakpoints.down('sm')} {
        grid-template-columns: auto 1fr;
        grid-template-areas: 'left right';
        padding: 0 ${theme.spacing(0.5)};

        &:first-child {
          display: none;
        }
      }
    `,
    footerRow: css`
      display: flex;
      padding: ${theme.spacing(1)};
    `,
    cell: css`
      align-items: center;
      padding: ${theme.spacing(1)};

      ${theme.breakpoints.down('sm')} {
        padding: ${theme.spacing(1)} 0;
        grid-template-columns: 1fr;
      }
    `,
    bodyCell: css`
      overflow: hidden;

      ${theme.breakpoints.down('sm')} {
        grid-column-end: right;
        grid-column-start: right;

        &::before {
          content: attr(data-column);
          display: block;
          color: ${theme.colors.text.primary};
        }
      }
    `,
    expandCell: css`
      justify-content: center;

      ${theme.breakpoints.down('sm')} {
        align-items: start;
        grid-area: left;
      }
    `,
    expandedContentRow: css`
      grid-column-end: ${sizes.length + 1};
      grid-column-start: 2;
      grid-row: 2;
      padding: 0 ${theme.spacing(3)} 0 ${theme.spacing(1)};
      position: relative;

      ${theme.breakpoints.down('sm')} {
        grid-column-start: 2;
        border-top: 1px solid ${theme.colors.border.strong};
        grid-row: auto;
        padding: ${theme.spacing(1)} 0 0 0;
      }
    `,
    expandButton: css`
      margin-right: 0;
      display: block;
    `,
    defaultPagination: css`
      float: none;
      display: flex;
      justify-content: flex-start;
      margin: ${theme.spacing(2, 0)};
    `,
  });
};
