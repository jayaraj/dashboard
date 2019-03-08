import { toTableData } from './processTimeSeries';

describe('toTableData', () => {
  it('converts timeseries to table skipping nulls', () => {
    const input1 = {
      target: 'Field Name',
      datapoints: [[100, 1], [200, 2]],
    };
    const input2 = {
      // without target
      target: '',
      datapoints: [[100, 1], [200, 2]],
    };
    const data = toTableData([null, input1, input2, null, null]);
    expect(data.length).toBe(2);
    expect(data[0].columns[0].text).toBe(input1.target);
    expect(data[0].rows).toBe(input1.datapoints);

    // Default name
    expect(data[1].columns[0].text).toEqual('Value');
  });

  it('keeps tableData unchanged', () => {
    const input = {
      columns: [{ text: 'A' }, { text: 'B' }, { text: 'C' }],
      rows: [[100, 'A', 1], [200, 'B', 2], [300, 'C', 3]],
    };
    const data = toTableData([null, input, null, null]);
    expect(data.length).toBe(1);
    expect(data[0]).toBe(input);
  });

  it('supports null values OK', () => {
    expect(toTableData([null, null, null, null])).toEqual([]);
    expect(toTableData(undefined)).toEqual([]);
    expect(toTableData((null as unknown) as any[])).toEqual([]);
    expect(toTableData([])).toEqual([]);
  });
});
