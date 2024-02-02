import { css } from '@emotion/css';
import React, { FormEvent } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Label, Tooltip, Input, Icon, useStyles2, Stack } from '@grafana/ui';

interface Props {
  className?: string;
  queryString?: string;
  defaultQueryString?: string;
  onFilterChange: (filterString: string) => void;
}

export const MatcherFilter = ({ className, onFilterChange, defaultQueryString, queryString }: Props) => {
  const styles = useStyles2(getStyles);
  const handleSearchChange = (e: FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    onFilterChange(target.value);
  };
  const searchIcon = <Icon name={'search'} />;
  return (
    <div className={className}>
      <Label>
        <Stack gap={0.5}>
          <span>Search</span>
          <Tooltip content={<div>Filter Labels with name or uuid</div>}>
            <Icon className={styles.icon} name="info-circle" size="sm" />
          </Tooltip>
        </Stack>
      </Label>
      <Input
        placeholder="Search"
        defaultValue={defaultQueryString}
        value={queryString}
        onChange={handleSearchChange}
        data-testid="search-query-input"
        prefix={searchIcon}
        className={styles.inputWidth}
      />
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  icon: css`
    margin-right: ${theme.spacing(0.5)};
  `,
  inputWidth: css`
    width: 200px;
    flex-grow: 0;
  `,
});
