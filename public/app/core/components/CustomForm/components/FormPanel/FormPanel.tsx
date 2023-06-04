import { css, cx } from '@emotion/css';
import React from 'react';

import { FieldSet, useTheme2 } from '@grafana/ui';
import { Configuration } from 'app/types';

import { getStyles } from '../../styles';
import { FormElement } from '../../types';
import { FormElements } from '../FormElements';

interface Props {
  configuration: Configuration;
  onChange: (value?: FormElement[]) => void;
  disabled: boolean;
}

export const FormPanel: React.FC<Props> = ({configuration, onChange, disabled}) => {
  const theme = useTheme2();
  const styles = getStyles(theme);
  const length = configuration.sections.length;
  const width = (length <= 1)? 30: (length <= 2)? 65: (length <= 3)? 90: 100;

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}%;
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
