import React, { ChangeEvent } from 'react';

import { Button, InlineField, InlineFieldRow, Input, useTheme2} from '@grafana/ui';

import { getStyles } from '../../styles';
import { LayoutSection } from '../../types';

/**
 * Properties
 */
interface Props {
  sections: LayoutSection[]
  onChange: (value?: LayoutSection[]) => void;
}

/**
 * Layout Section Editor
 */
export const LayoutSectionsEditor: React.FC<Props> = ({ sections, onChange }) => {
  const theme = useTheme2();
  const styles = getStyles(theme);

  if (!sections || !sections.length) {
    sections = [];
  }

  /**
   * Return
   */
  return (
    <div>
      {sections.map((section, id) => (
        <InlineFieldRow key={id} className={styles.collapsableSection}>
          <InlineField label="Name" grow labelWidth={8} invalid={section.name === ''}>
            <Input
              placeholder="name"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                section.name = event.target.value;
                onChange(sections);
              }}
              value={section.name}
            />
          </InlineField>
          <Button
            variant="secondary"
            onClick={(e) => {
              sections = sections?.filter((s) => s.name !== section.name);
              onChange(sections);
            }}
            icon="trash-alt"
          ></Button>
        </InlineFieldRow>
      ))}

      <Button
        variant="secondary"
        onClick={(e) => {
          sections.push({ name: '' });
          onChange(sections);
        }}
        icon="plus"
      >
        Add Section
      </Button>
    </div>
  );
};
