import React, { useEffect, useState, forwardRef } from 'react';

import { SelectableValue } from '@grafana/data';
import { Select, Button } from '@grafana/ui';

export interface VariableOption {
  value: string;
  label: string;
}

export interface VariablePickerProps {
  value?: string;
  onChange?: (value?: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  options?: VariableOption[];
  enableCreate?: boolean;
}

export const VariablePicker = forwardRef<HTMLDivElement, VariablePickerProps>(({
  value,
  onChange,
  placeholder = 'Search variables...',
  style,
  options = [],
  enableCreate = false,
}, ref) => {
  const [variableOptions, setVariableOptions] = useState<Array<SelectableValue<string>>>([]);
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    const formattedOptions = options.map((opt) => ({ value: opt.value, label: opt.label }));
    setVariableOptions(formattedOptions);
  }, [options]);

  const handleChange = (item?: SelectableValue<string>) => {
    onChange?.(item?.value);
    setInputValue('');
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<Element>) => {
    if (
      e.key === 'Enter' &&
      inputValue &&
      !variableOptions.find((opt) => opt.value === inputValue)
    ) {
      if (enableCreate) {
        const newOption: SelectableValue<string> = { value: inputValue, label: inputValue };
        setVariableOptions((prev) => [...prev, newOption]);
        onChange?.(inputValue);
      }
      setInputValue('');
    }
  };

  const handleAddOption = () => {
    if (inputValue && !variableOptions.find((opt) => opt.value === inputValue)) {
      const newOption: SelectableValue<string> = { value: inputValue, label: inputValue };
      setVariableOptions((prev) => [...prev, newOption]);
      onChange?.(inputValue);
      setInputValue('');
    }
  };

  const selectedValue = variableOptions.find((opt) => opt.value === value) ?? { value, label: value };

  return (
    <div ref={ref} style={{ width: '100%', ...style }}>
      <Select
        style={{ width: '100%'}}
        allowCustomValue
        isClearable
        value={selectedValue}
        options={variableOptions}
        onChange={handleChange}
        onInputChange={handleInputChange}
        inputValue={inputValue}
        placeholder={placeholder}
        onKeyDown={handleInputKeyDown}
        menuPlacement="bottom"
      />

      {enableCreate &&
        inputValue &&
        !variableOptions.find((opt) => opt.value === inputValue) && (
          <Button
            variant="secondary"
            icon="plus"
            fullWidth
            onClick={handleAddOption}
            style={{ marginTop: 6 }}
          >
            Add
          </Button>
        )}
    </div>
  );
});

VariablePicker.displayName = 'VariablePicker';

export default VariablePicker;
