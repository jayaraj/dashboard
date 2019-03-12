import { getValueProcessor, getColorFromThreshold, ValueProcessor, DisplayValue } from './valueProcessor';
import { MappingType, ValueMapping } from '../types/panel';

function assertSame(input: any, processor: ValueProcessor, match: DisplayValue) {
  const value = processor(input);
  expect(value.text).toEqual(match.text);
  if (match.hasOwnProperty('numeric')) {
    expect(value.numeric).toEqual(match.numeric);
  }
}

describe('Process simple display values', () => {
  const processor = getValueProcessor();

  it('support null', () => {
    assertSame(null, processor, { text: '', numeric: NaN });
  });

  it('support undefined', () => {
    assertSame(undefined, processor, { text: '', numeric: NaN });
  });

  it('support NaN', () => {
    assertSame(NaN, processor, { text: 'NaN', numeric: NaN });
  });
  it('Simple Float', () => {
    assertSame(1.23456, processor, { text: '1.23456', numeric: 1.23456 });
  });

  it('Integer', () => {
    assertSame(3, processor, { text: '3', numeric: 3 });
  });

  it('Text', () => {
    assertSame('3', processor, { text: '3', numeric: 3 });
  });

  it('Simple String', () => {
    assertSame('hello', processor, { text: 'hello', numeric: NaN });
  });

  it('empty array', () => {
    assertSame([], processor, { text: '', numeric: NaN });
  });
  it('array of text', () => {
    assertSame(['a', 'b', 'c'], processor, { text: 'a,b,c', numeric: NaN });
  });
  it('array of numbers', () => {
    assertSame([1, 2, 3], processor, { text: '1,2,3', numeric: NaN });
  });
  it('empty object', () => {
    assertSame({}, processor, { text: '[object Object]', numeric: NaN });
  });

  it('boolean true', () => {
    assertSame(true, processor, { text: 'true', numeric: 1 });
  });
  it('boolean false', () => {
    assertSame(false, processor, { text: 'false', numeric: 0 });
  });
});

describe('Get color from threshold', () => {
  it('should get first threshold color when only one threshold', () => {
    const thresholds = [{ index: 0, value: -Infinity, color: '#7EB26D' }];
    expect(getColorFromThreshold(49, thresholds)).toEqual('#7EB26D');
  });

  it('should get the threshold color if value is same as a threshold', () => {
    const thresholds = [
      { index: 2, value: 75, color: '#6ED0E0' },
      { index: 1, value: 50, color: '#EAB839' },
      { index: 0, value: -Infinity, color: '#7EB26D' },
    ];
    expect(getColorFromThreshold(50, thresholds)).toEqual('#EAB839');
  });

  it('should get the nearest threshold color between thresholds', () => {
    const thresholds = [
      { index: 2, value: 75, color: '#6ED0E0' },
      { index: 1, value: 50, color: '#EAB839' },
      { index: 0, value: -Infinity, color: '#7EB26D' },
    ];
    expect(getColorFromThreshold(55, thresholds)).toEqual('#EAB839');
  });
});

describe('Format value', () => {
  it('should return if value isNaN', () => {
    const valueMappings: ValueMapping[] = [];
    const value = 'N/A';
    const instance = getValueProcessor({ mappings: valueMappings });

    const result = instance(value);

    expect(result.text).toEqual('N/A');
  });

  it('should return formatted value if there are no value mappings', () => {
    const valueMappings: ValueMapping[] = [];
    const value = '6';

    const instance = getValueProcessor({ mappings: valueMappings, decimals: 1 });

    const result = instance(value);

    expect(result.text).toEqual('6.0');
  });

  it('should return formatted value if there are no matching value mappings', () => {
    const valueMappings: ValueMapping[] = [
      { id: 0, operator: '', text: 'elva', type: MappingType.ValueToText, value: '11' },
      { id: 1, operator: '', text: '1-9', type: MappingType.RangeToText, from: '1', to: '9' },
    ];
    const value = '10';
    const instance = getValueProcessor({ mappings: valueMappings, decimals: 1 });

    const result = instance(value);

    expect(result.text).toEqual('10.0');
  });

  it('should return mapped value if there are matching value mappings', () => {
    const valueMappings: ValueMapping[] = [
      { id: 0, operator: '', text: '1-20', type: MappingType.RangeToText, from: '1', to: '20' },
      { id: 1, operator: '', text: 'elva', type: MappingType.ValueToText, value: '11' },
    ];
    const value = '11';
    const instance = getValueProcessor({ mappings: valueMappings, decimals: 1 });

    expect(instance(value).text).toEqual('1-20');
  });
});
