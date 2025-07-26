import { debounce } from 'lodash';
import React, { useEffect, useState, useMemo } from 'react';
import { Select, Button } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';

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

export const VariablePicker: React.FC<VariablePickerProps> = ({
  value,
  onChange,
  placeholder = 'Search variables...',
  style,
  options = [],
  enableCreate = false,
}) => {
  const [variableOptions, setVariableOptions] = useState<Array<SelectableValue<string>>>([]);
  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    const formattedOptions = options.map((opt) => ({ value: opt.value, label: opt.label }));
    setVariableOptions(formattedOptions);
  }, [options]);

  const handleSearch = useMemo(
    () =>
      debounce((q: string) => {
        setInputValue(q);
      }, 300),
    []
  );

  const handleChange = (item?: SelectableValue<string>) => {
    onChange?.(item?.value);
    setInputValue('');
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
    <div style={{ width: '100%', minWidth: 200, ...style }}>
      <Select
        allowCustomValue
        isClearable
        value={selectedValue}
        options={variableOptions}
        onChange={handleChange}
        onInputChange={handleSearch}
        inputValue={inputValue}
        placeholder={placeholder}
        onKeyDown={handleInputKeyDown}
        menuPlacement="bottom"
        width="auto"
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
};

export default VariablePicker;