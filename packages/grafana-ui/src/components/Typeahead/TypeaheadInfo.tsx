import React, { useContext } from 'react';
import { css, cx } from 'emotion';

import { CompletionItem, selectThemeVariant, ThemeContext, GrafanaTheme } from '../..';

const getStyles = (theme: GrafanaTheme, height: number, visible: boolean) => {
  return {
    typeaheadItem: css`
      label: type-ahead-item;
      padding: ${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.md};
      border-radius: ${theme.border.radius.md};
      border: ${selectThemeVariant(
        { light: `solid 1px ${theme.colors.gray5}`, dark: `solid 1px ${theme.colors.dark1}` },
        theme.type
      )};
      overflow-y: scroll;
      overflow-x: hidden;
      outline: none;
      background: ${selectThemeVariant({ light: theme.colors.white, dark: theme.colors.dark4 }, theme.type)};
      color: ${theme.colors.text};
      box-shadow: ${selectThemeVariant(
        { light: `0 5px 10px 0 ${theme.colors.gray5}`, dark: `0 5px 10px 0 ${theme.colors.black}` },
        theme.type
      )};
      visibility: ${visible === true ? 'visible' : 'hidden'};
      width: 250px;
      height: ${height + parseInt(theme.spacing.xxs, 10)}px;
      position: relative;
    `,
  };
};

interface Props {
  item: CompletionItem;
  height: number;
}

export const TypeaheadInfo: React.FC<Props> = ({ item, height }) => {
  const visible = item && !!item.documentation;
  const label = item ? item.label : '';
  const documentation = item && item.documentation ? item.documentation : '';
  const theme = useContext(ThemeContext);
  const styles = getStyles(theme, height, visible);

  return (
    <div className={cx([styles.typeaheadItem])}>
      <b>{label}</b>
      <hr />
      <span>{documentation}</span>
    </div>
  );
};
