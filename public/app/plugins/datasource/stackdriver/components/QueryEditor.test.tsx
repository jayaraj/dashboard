import React from 'react';
import renderer from 'react-test-renderer';
import { QueryEditor, Props, DefaultTarget } from './QueryEditor';

const props: Props = {
  onQueryChange: target => {},
  onExecuteQuery: () => {},
  target: DefaultTarget,
  events: { on: () => {} },
  datasource: {
    templateSrv: { variables: [] },
    getDefaultProject: () => 'project',
    getMetricTypes: () => [],
  },
};

describe('QueryEditor', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<QueryEditor {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
