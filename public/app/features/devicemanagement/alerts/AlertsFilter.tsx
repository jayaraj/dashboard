import { css, cx } from '@emotion/css';
import { debounce } from 'lodash';
import React, { FormEvent, useState } from 'react';

import { GrafanaTheme, SelectableValue } from '@grafana/data';
import { Button, Field, Icon, Input, Label, RadioButtonGroup, Stack, useStyles, Tooltip } from '@grafana/ui';
import { useQueryParams } from 'app/core/hooks/useQueryParams';
import { AlertingState } from 'app/types';
import { alertStateToReadable, getFiltersFromUrlParams } from './utils';

const ViewOptions: SelectableValue[] = [
  {
    icon: 'folder',
    label: 'Grouped',
    value: 'grouped',
  },
  {
    icon: 'heart-rate',
    label: 'State',
    value: 'state',
  },
];

const AlertsFilter = () => {
  const [queryParams, setQueryParams] = useQueryParams();
  const [filterKey, setFilterKey] = useState<number>(Math.floor(Math.random() * 100));
  const queryStringKey = `queryString-${filterKey}`;
  const { alertState, queryString } = getFiltersFromUrlParams(queryParams);
  const styles = useStyles(getStyles);
  const stateOptions = Object.entries(AlertingState).map(([key, value]) => ({
    label: alertStateToReadable(value),
    value,
  }));

  const handleViewChange = (view: string) => {
    setQueryParams({ view });
  };

  const handleQueryStringChange = debounce((e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setQueryParams({ queryString: target.value || null });
  }, 600);

  const handleAlertStateChange = (value: string) => {
    setQueryParams({ alertState: value });
  };

  const handleClearFiltersClick = () => {
    setQueryParams({ queryString: null, alertState: null });
    setTimeout(() => setFilterKey(filterKey + 1), 100);
  };

  const searchIcon = <Icon name={'search'} />;
  return (
    <div className={styles.container}>
      <div className={cx(styles.flexRow, styles.spaceBetween)}>
        <div className={styles.flexRow}>
          <Field
            className={styles.rowChild}
            label={
              <Label>
                <Stack gap={0.5}>
                  <span>Search</span>
                  <Tooltip
                    content={
                      <div>
                        Filter alerts by name in grouped view or 
                        name or uuid of a resource or name of an alert in state view
                      </div>
                    }
                  >
                    <Icon name="info-circle" size="sm" />
                  </Tooltip>
                </Stack>
              </Label>
            }
          >
            <Input
              key={queryStringKey}
              className={styles.inputWidth}
              prefix={searchIcon}
              onChange={handleQueryStringChange}
              defaultValue={queryString}
              placeholder="Search"
              data-testid="search-query-input"
            />
          </Field>
          <div className={styles.rowChild}>
            <Label>State</Label>
            <RadioButtonGroup options={stateOptions} value={alertState} onChange={handleAlertStateChange} />
          </div>
          <div className={styles.rowChild}>
            <Label>View as</Label>
            <RadioButtonGroup
              options={ViewOptions}
              value={String(queryParams['view'] ?? ViewOptions[0].value)}
              onChange={handleViewChange}
            />
          </div>
        </div>
        {(alertState || queryString) && (
          <div className={styles.flexRow}>
            <Button
              className={styles.clearButton}
              fullWidth={false}
              icon="times"
              variant="secondary"
              onClick={handleClearFiltersClick}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      padding-bottom: ${theme.spacing.sm};
      margin-bottom: ${theme.spacing.sm};
    `,
    inputWidth: css`
      width: 340px;
      flex-grow: 0;
    `,
    flexRow: css`
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      width: 100%;
      flex-wrap: wrap;
    `,
    spaceBetween: css`
      justify-content: space-between;
    `,
    rowChild: css`
      margin: 0 ${theme.spacing.sm} 0 0;
    `,
    clearButton: css`
      margin-top: ${theme.spacing.sm};
    `,
  };
};

export default AlertsFilter;