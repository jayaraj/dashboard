import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryEditor } from '.';
import { ElasticDatasource } from '../../datasource';
import { ElasticsearchQuery } from '../../types';

const noop = () => void 0;

describe('QueryEditor', () => {
  describe('Alias Field', () => {
    it('Should correctly render and trigger changes on blur', () => {
      const alias = '{{metric}}';
      const query: ElasticsearchQuery = {
        refId: 'A',
        query: '',
        alias,
        metrics: [
          {
            id: '1',
            type: 'raw_data',
          },
        ],
        bucketAggs: [],
      };

      const onChange = jest.fn<void, [ElasticsearchQuery]>();

      render(<QueryEditor query={query} datasource={{} as ElasticDatasource} onChange={onChange} onRunQuery={noop} />);

      let aliasField = screen.getByLabelText('Alias') as HTMLInputElement;

      // The Query should have an alias field
      expect(aliasField).toBeInTheDocument();

      // its value should match the one in the query
      expect(aliasField.value).toBe(alias);

      // We change value and trigger a blur event to trigger an update
      const newAlias = 'new alias';
      fireEvent.change(aliasField, { target: { value: newAlias } });
      fireEvent.blur(aliasField);

      // the onChange handler should have been called correctly, and the resulting
      // query state should match what expected
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0].alias).toBe(newAlias);
    });

    it('Should be disabled if last bucket aggregation is not Date Histogram', () => {
      const query: ElasticsearchQuery = {
        refId: 'A',
        query: '',
        metrics: [
          {
            id: '1',
            type: 'avg',
          },
        ],
        bucketAggs: [{ id: '2', type: 'terms' }],
      };

      render(<QueryEditor query={query} datasource={{} as ElasticDatasource} onChange={noop} onRunQuery={noop} />);

      expect(screen.getByLabelText('Alias')).toBeDisabled();
    });

    it('Should be enabled if last bucket aggregation is Date Histogram', () => {
      const query: ElasticsearchQuery = {
        refId: 'A',
        query: '',
        metrics: [
          {
            id: '1',
            type: 'avg',
          },
        ],
        bucketAggs: [{ id: '2', type: 'date_histogram' }],
      };

      render(<QueryEditor query={query} datasource={{} as ElasticDatasource} onChange={noop} onRunQuery={noop} />);

      expect(screen.getByLabelText('Alias')).toBeEnabled();
    });
  });
});
