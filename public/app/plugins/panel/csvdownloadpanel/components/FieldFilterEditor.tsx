import React, { useState, useEffect } from 'react';

import { StandardEditorProps, getFieldDisplayName, stringToJsRegex, SelectableValue } from '@grafana/data';
import { Input, FilterPill, InlineFieldRow, InlineField, InlineSwitch, Select, Button } from '@grafana/ui';

import { CsvDownloadOptions, FieldFilterOptions } from '../types';

interface Props extends StandardEditorProps<FieldFilterOptions, CsvDownloadOptions> {}

interface FieldNameInfo {
  name: string;
  count: number;
}

export const FieldFilterEditor: React.FC<Props> = ({ value, onChange, context }) => {
  const [options, setOptions] = useState<FieldNameInfo[]>([]);
  const [selected, setSelected] = useState<string[]>(value?.fieldNames || []);
  const [pattern, setPattern] = useState<string>(value?.pattern || '');
  const [mode, setMode] = useState<'include' | 'exclude'>(value?.mode || 'include');
  const [isRegexValid, setIsRegexValid] = useState(true);
  const [usePattern, setUsePattern] = useState(!!value?.pattern);

  // Extract field names from data when context changes
  useEffect(() => {
    if (context?.data) {
      const allNames: FieldNameInfo[] = [];
      const byName: Record<string, FieldNameInfo> = {};

      for (const frame of context.data) {
        for (const field of frame.fields) {
          const displayName = getFieldDisplayName(field, frame, context.data);
          let v = byName[displayName];

          if (!v) {
            v = byName[displayName] = {
              name: displayName,
              count: 0,
            };
            allNames.push(v);
          }
          v.count++;
        }
      }

      setOptions(allNames);

      // If no fields are selected yet, select all by default
      if (!value?.fieldNames?.length && !value?.pattern) {
        setSelected(allNames.map((n) => n.name));
      }
    }
  }, [context?.data, value?.fieldNames, value?.pattern]);

  const updateOptions = (newSelected: string[], newPattern?: string, newMode?: 'include' | 'exclude', newUsePattern?: boolean) => {
    const actualUsePattern = newUsePattern !== undefined ? newUsePattern : usePattern;
    const opts: FieldFilterOptions = {
      mode: newMode || mode,
      fieldNames: actualUsePattern ? [] : newSelected,
      pattern: actualUsePattern ? (newPattern !== undefined ? newPattern : pattern) : undefined,
    };
    onChange(opts);
  };

  const onFieldToggle = (fieldName: string) => {
    let newSelected: string[];
    if (selected.indexOf(fieldName) > -1) {
      newSelected = selected.filter((s) => s !== fieldName);
    } else {
      newSelected = [...selected, fieldName];
    }
    setSelected(newSelected);
    updateOptions(newSelected);
  };

  const onSelectAll = () => {
    const allNames = options.map((o) => o.name);
    setSelected(allNames);
    updateOptions(allNames);
  };

  const onClearAll = () => {
    setSelected([]);
    updateOptions([]);
  };

  const onPatternBlur = () => {
    let valid = true;
    try {
      if (pattern) {
        stringToJsRegex(pattern);
      }
    } catch (e) {
      valid = false;
    }
    setIsRegexValid(valid);

    if (valid) {
      updateOptions(selected, pattern);
    }
  };

  const onModeChange = (newMode: 'include' | 'exclude') => {
    setMode(newMode);
    updateOptions(selected, pattern, newMode);
  };

  const onUsePatternChange = (e: React.FormEvent<HTMLInputElement>) => {
    const val = e.currentTarget.checked;
    setUsePattern(val);
    if (!val) {
      // Switching to field selection mode - use current selected fields
      updateOptions(selected, '', mode, false);
    } else {
      // Switching to pattern mode - clear field names and use pattern
      updateOptions([], pattern, mode, true);
    }
  };

  return (
    <div>
      <InlineFieldRow>
        <InlineField label="Filter Mode" grow>
          <Select
            value={mode}
            options={[
              { label: 'Include selected fields', value: 'include' },
              { label: 'Exclude selected fields', value: 'exclude' },
            ]}
            onChange={(val: SelectableValue) => onModeChange(val.value)}
          />
        </InlineField>
      </InlineFieldRow>

      <InlineFieldRow>
        <InlineField label="Use regex pattern">
          <InlineSwitch value={usePattern} onChange={onUsePatternChange} />
        </InlineField>
      </InlineFieldRow>

      {usePattern ? (
        <InlineFieldRow>
          <InlineField
            label="Pattern"
            invalid={!isRegexValid}
            error={!isRegexValid ? 'Invalid regex pattern' : undefined}
            grow
          >
            <Input
              placeholder="Regular expression pattern"
              value={pattern}
              onChange={(e) => setPattern(e.currentTarget.value)}
              onBlur={onPatternBlur}
            />
          </InlineField>
        </InlineFieldRow>
      ) : (
        <>
          <InlineFieldRow>
            <Button variant="secondary" size="sm" onClick={onSelectAll} style={{ marginRight: '8px' }}>
              Select All
            </Button>
            <Button variant="secondary" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
          </InlineFieldRow>

          <div style={{ marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {options.length === 0 ? (
              <div style={{ color: '#999', fontStyle: 'italic' }}>
                No fields available. Run a query to see field options.
              </div>
            ) : (
              options.map((o, i) => {
                const label = `${o.name}${o.count > 1 ? ' (' + o.count + ')' : ''}`;
                const isSelected = selected.indexOf(o.name) > -1;
                return (
                  <FilterPill
                    key={`${o.name}/${i}`}
                    onClick={() => onFieldToggle(o.name)}
                    label={label}
                    selected={isSelected}
                  />
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
