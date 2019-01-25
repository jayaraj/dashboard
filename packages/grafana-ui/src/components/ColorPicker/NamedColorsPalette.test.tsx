import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { NamedColorsPalette } from './NamedColorsPalette';
import { ColorSwatch } from './NamedColorsGroup';
import { BasicGreen } from '../../utils';
import { GrafanaTheme } from '../../types';

describe('NamedColorsPalette', () => {
  describe('theme support for named colors', () => {
    let wrapper: ReactWrapper, selectedSwatch;

    afterEach(() => {
      wrapper.unmount();
    });

    it('should render provided color variant specific for theme', () => {
      wrapper = mount(<NamedColorsPalette color={BasicGreen.name} theme={GrafanaTheme.Dark} onChange={() => {}} />);
      selectedSwatch = wrapper.find(ColorSwatch).findWhere(node => node.key() === BasicGreen.name);
      expect(selectedSwatch.prop('color')).toBe(BasicGreen.variants.dark);

      wrapper.unmount();
      wrapper = mount(<NamedColorsPalette color={BasicGreen.name} theme={GrafanaTheme.Light} onChange={() => {}} />);
      selectedSwatch = wrapper.find(ColorSwatch).findWhere(node => node.key() === BasicGreen.name);
      expect(selectedSwatch.prop('color')).toBe(BasicGreen.variants.light);
    });

    it('should render dar variant of provided color when theme not provided', () => {
      wrapper = mount(<NamedColorsPalette color={BasicGreen.name} onChange={() => {}} />);
      selectedSwatch = wrapper.find(ColorSwatch).findWhere(node => node.key() === BasicGreen.name);
      expect(selectedSwatch.prop('color')).toBe(BasicGreen.variants.dark);
    });
  });
});
