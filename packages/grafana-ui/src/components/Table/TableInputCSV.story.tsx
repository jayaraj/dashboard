import React from 'react';

import { storiesOf } from '@storybook/react';
import TableInputCSV, { ParseResults } from './TableInputCSV';

const TableInputStories = storiesOf('UI/Table/Input', module);

TableInputStories.add('default', () => {
  return (
    <div>
      <TableInputCSV
        width={'90%'}
        height={'90vh'}
        onTableParsed={(results: ParseResults) => {
          console.log('GOT', results);
        }}
      />
    </div>
  );
});
