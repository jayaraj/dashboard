import React from 'react';
import renderer from 'react-test-renderer';
import PickerOption from './PickerOption';
import { OptionProps } from 'react-select/lib/components/Option';

const model: OptionProps<any> = {
  cx: jest.fn(),
  clearValue: jest.fn(),
  getStyles: jest.fn(),
  getValue: jest.fn(),
  hasValue: true,
  isMulti: false,
  options: [],
  selectOption: jest.fn(),
  selectProps: {},
  setValue: jest.fn(),
  isDisabled: false,
  isFocused: false,
  isSelected: false,
  innerRef: null,
  innerProps: {
    id: '',
    key: '',
    onClick: jest.fn(),
    onMouseOver: jest.fn(),
    tabIndex: 1,
  },
  label: 'Option label',
  type: 'option',
  children: 'Model title',
  className: 'class-for-user-picker',
};

describe('PickerOption', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(
        <PickerOption
          {...model}
          data={{
            imgUrl: 'url/to/avatar',
          }}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
