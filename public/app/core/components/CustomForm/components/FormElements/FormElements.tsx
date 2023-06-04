import { cx } from '@emotion/css';
import Slider from 'rc-slider';
import React, { ChangeEvent } from 'react';

import { dateTime, DateTime, SelectableValue } from '@grafana/data';
import {
  CodeEditor,
  DateTimePicker,
  InlineField,
  InlineFieldRow,
  InlineLabel,
  Input,
  RadioButtonGroup,
  Select,
  TextArea,
  useTheme2,
} from '@grafana/ui';
import { Configuration } from 'app/types';

import {
  BooleanElementOptions,
  CodeEditorHeight,
  CodeLanguage,
  FormElementType,
} from '../../constants';
import { getStyles } from '../../styles';
import { FormElement, LayoutSection } from '../../types';

interface Props {
  configuration: Configuration;
  onChange: (value?: FormElement[]) => void;
  section: LayoutSection | null;
  disabled: boolean;
}

export const FormElements: React.FC<Props> = ({ configuration, onChange, section, disabled }) => {
  const theme = useTheme2();
  const styles = getStyles(theme);
  const elements = configuration.elements;

  return (
    <div>
      {elements.map((element) => {
        if (section && element.section !== section.name) {
          return;
        }

        return (
          <InlineFieldRow key={element.id}>
            {element.type === FormElementType.NUMBER && (
              <InlineField
                label={element.title}
                grow={!!!element.width}
                labelWidth={element.labelWidth}
                tooltip={element.tooltip}
                transparent={!!!element.title}
                disabled={disabled}
              >
                <Input
                  value={element.value}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    element.value = event.target.value;
                    if (element.max !== undefined && element.max !== null) {
                      element.value = Math.min(element.max, Number(element.value));
                    }
                    if (element.min !== undefined && element.min !== null) {
                      element.value = Math.max(element.min, Number(element.value));
                    }
                    onChange(elements);
                  }}
                  type="number"
                  width={element.width}
                  min={element.min !== null ? element.min : ''}
                  max={element.max !== null ? element.max : ''}
                />
              </InlineField>
            )}

            {element.type === FormElementType.STRING && (
              <InlineField
                label={element.title}
                grow={!!!element.width}
                labelWidth={element.labelWidth}
                tooltip={element.tooltip}
                transparent={!!!element.title}
                disabled={disabled}
              >
                <Input
                  value={element.value}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    element.value = event.target.value;
                    onChange(elements);
                  }}
                  width={element.width}
                  type="text"
                />
              </InlineField>
            )}

            {element.type === FormElementType.PASSWORD && (
              <InlineField
                label={element.title}
                grow={!!!element.width}
                labelWidth={element.labelWidth}
                tooltip={element.tooltip}
                transparent={!!!element.title}
                disabled={disabled}
              >
                <Input
                  value={element.value}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    element.value = event.target.value;
                    onChange(elements);
                  }}
                  width={element.width}
                  type="password"
                />
              </InlineField>
            )}

            {element.type === FormElementType.DISABLED && (
              <InlineField
                label={element.title}
                grow={!!!element.width}
                labelWidth={element.labelWidth}
                tooltip={element.tooltip}
                disabled
                transparent={!!!element.title}
              >
                <Input
                  value={
                    !element.options?.length
                      ? element.value
                      : element.options.find((option) => option.value === element.value)?.label
                  }
                  type="text"
                  width={element.width}
                />
              </InlineField>
            )}

            {element.type === FormElementType.TEXTAREA && (
              <InlineField
                label={element.title}
                grow={!!!element.width}
                labelWidth={element.labelWidth}
                tooltip={element.tooltip}
                transparent={!!!element.title}
                disabled={disabled}
              >
                <TextArea
                  value={element.value}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
                    element.value = event.target.value;
                    onChange(elements);
                  }}
                  cols={element.width}
                  rows={element.rows}
                />
              </InlineField>
            )}

            {element.type === FormElementType.CODE && (
              <InlineField
                label={element.title}
                grow={!!!element.width}
                labelWidth={element.labelWidth}
                tooltip={element.tooltip}
                transparent={!!!element.title}
                disabled={disabled}
              >
                <CodeEditor
                  language={element.language || CodeLanguage.JAVASCRIPT}
                  showLineNumbers={true}
                  showMiniMap={(element.value && element.value.length) > 100}
                  value={element.value}
                  height={element.height || `${CodeEditorHeight}px`}
                  width={element.width}
                  onBlur={(code) => {
                    element.value = code;
                    onChange(elements);
                  }}
                  monacoOptions={{ formatOnPaste: true, formatOnType: true }}
                />
              </InlineField>
            )}

            {element.type === FormElementType.BOOLEAN && (
              <InlineField
                label={element.title}
                grow={!!!element.width}
                labelWidth={element.labelWidth}
                tooltip={element.tooltip}
                transparent={!!!element.title}
                disabled={disabled}
              >
                <RadioButtonGroup
                  value={element.value}
                  onChange={(value: Boolean) => {
                    element.value = value;
                    onChange(elements);
                  }}
                  fullWidth={!!!element.width}
                  options={BooleanElementOptions}
                />
              </InlineField>
            )}

            {element.type === FormElementType.DATETIME && (
              <InlineField
                label={element.title}
                grow={!!!element.width}
                labelWidth={element.labelWidth}
                tooltip={element.tooltip}
                transparent={!!!element.title}
                disabled={disabled}
              >
                <DateTimePicker
                  date={dateTime(element.value)}
                  onChange={(dateTime: DateTime) => {
                    element.value = dateTime;
                    onChange(elements);
                  }}
                />
              </InlineField>
            )}

            {element.type === FormElementType.SLIDER && element.value != null && (
              <>
                <InlineField
                  label={element.title}
                  grow={!!!element.width}
                  labelWidth={element.labelWidth}
                  tooltip={element.tooltip}
                  transparent={!!!element.title}
                  className={cx(styles.slider)}
                  disabled={disabled}
                >
                  <Slider
                    value={element.value || 0}
                    onChange={(value: number | number[]) => {
                      element.value = value;
                      onChange(elements);
                    }}
                    min={element.min || 0}
                    max={element.max || 0}
                    step={element.step || 0}
                  />
                </InlineField>
                <InlineField className={cx(styles.sliderInput)} disabled={disabled}>
                  <Input
                    type="number"
                    width={8}
                    min={element.min || 0}
                    max={element.max || 0}
                    value={element.value || 0}
                    onChange={(e) => {
                      element.value = Math.max(
                        element.min || 0,
                        Math.min(element.max || 0, Number(e.currentTarget.value))
                      );
                      onChange(elements);
                    }}
                  ></Input>
                </InlineField>
              </>
            )}

            {element.type === FormElementType.RADIO && (
              <InlineField
                label={element.title}
                grow={!!!element.width}
                labelWidth={element.labelWidth}
                tooltip={element.tooltip}
                transparent={!!!element.title}
                disabled={disabled}
              >
                <RadioButtonGroup
                  value={element.value}
                  onChange={(value: any) => {
                    element.value = value;
                    onChange(elements);
                  }}
                  fullWidth={!!!element.width}
                  options={element.options || []}
                />
              </InlineField>
            )}

            {element.type === FormElementType.SELECT && (
              <InlineField
                label={element.title}
                grow={!!!element.width}
                labelWidth={element.labelWidth}
                tooltip={element.tooltip}
                transparent={!!!element.title}
                disabled={disabled}
              >
                <Select
                  value={element.value}
                  onChange={(event: SelectableValue) => {
                    element.value = event?.value;
                    onChange(elements);
                  }}
                  width={element.width}
                  options={element.options || []}
                />
              </InlineField>
            )}

            {element.unit && (
              <InlineLabel transparent width={4}>
                {element.unit}
              </InlineLabel>
            )}
          </InlineFieldRow>
        );
      })}
    </div>
  );
};
