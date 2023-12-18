import { css, cx } from '@emotion/css';
import React from 'react';

import { FieldSet, useTheme2 } from '@grafana/ui';

import { getStyles } from '../../styles';
import { FormElement, Configuration } from '../../types';
import { FormElements } from '../FormElements';

interface Props {
  configuration: Configuration;
  onChange: (value?: FormElement[]) => void;
  disabled: boolean;
}

export const FormPanel: React.FC<Props> = ({ configuration, onChange, disabled }) => {
  const theme = useTheme2();
  const styles = getStyles(theme);

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          height: 100%;
          margin-bottom: 20px;
        `
      )}
    >
      <table className={styles.table}>
        <tbody>
          {configuration.sections.length === 0 && (
            <tr>
              <td>
                <FormElements
                  configuration={configuration}
                  onChange={onChange}
                  section={null}
                  disabled={disabled}
                ></FormElements>
              </td>
            </tr>
          )}

          {configuration.sections.length >= 0 && (
            <tr>
              {configuration.sections?.map((section, id) => {
                return (
                  <td className={styles.td} key={id}>
                    <FieldSet label={section.name}>
                      <FormElements
                        configuration={configuration}
                        onChange={onChange}
                        section={section}
                        disabled={disabled}
                      ></FormElements>
                    </FieldSet>
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
