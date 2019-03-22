// Library
import React from 'react';

import { DataPanel, getProcessedTableData } from './DataPanel';

describe('DataPanel', () => {
  let dataPanel: DataPanel;

  beforeEach(() => {
    dataPanel = new DataPanel({
      queries: [],
      panelId: 1,
      widthPixels: 100,
      refreshCounter: 1,
      datasource: 'xxx',
      children: r => {
        return <div>hello</div>;
      },
      onError: (message, error) => {},
    });
  });

  it('starts with unloaded state', () => {
    expect(dataPanel.state.isFirstLoad).toBe(true);
  });

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
    const data = getProcessedTableData([null, input1, input2, null, null]);
    expect(data.length).toBe(2);
    expect(data[0].columns[0].text).toBe(input1.target);
    expect(data[0].rows).toBe(input1.datapoints);

    // Default name
    expect(data[1].columns[0].text).toEqual('Value');

    // Every colun should have a name and a type
    for (const table of data) {
      for (const column of table.columns) {
        expect(column.text).toBeDefined();
        expect(column.type).toBeDefined();
      }
    }
  });

  it('supports null values from query OK', () => {
    expect(getProcessedTableData([null, null, null, null])).toEqual([]);
    expect(getProcessedTableData(undefined)).toEqual([]);
    expect(getProcessedTableData((null as unknown) as any[])).toEqual([]);
    expect(getProcessedTableData([])).toEqual([]);
  });
});
