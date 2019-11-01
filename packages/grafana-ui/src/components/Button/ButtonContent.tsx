import React from 'react';
import cx from 'classnames';
import { css } from 'emotion';
import { stylesFactory } from '../../themes';

const getStyles = stylesFactory(() => ({
  content: css`
    white-space: nowrap;
  `,
}));

type Props = {
  icon?: string;
  className?: string;
  iconClassName?: string;
  children: React.ReactNode;
};
export function ButtonContent(props: Props) {
  const { icon, className, iconClassName, children } = props;
  const styles = getStyles();
  return icon ? (
    <span className={cx(styles.content, className)}>
      <i className={cx([icon, iconClassName])} />
      &nbsp; &nbsp;
      <span>{children}</span>
    </span>
  ) : (
    <span className={styles.content}>{children}</span>
  );
}
