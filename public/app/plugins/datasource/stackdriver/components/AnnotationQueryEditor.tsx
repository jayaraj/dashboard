import React from 'react';
import _ from 'lodash';

import { Metrics } from './Metrics';
import { Filter } from './Filter';
import { AnnotationTarget } from '../types';
import { AnnotationsHelp } from './AnnotationsHelp';

export interface Props {
  onQueryChange: (target: AnnotationTarget) => void;
  target: AnnotationTarget;
  datasource: any;
}

interface State extends AnnotationTarget {
  [key: string]: any;
}

const DefaultTarget: State = {
  defaultProject: 'loading project...',
  metricType: '',
  filters: [],
  metricKind: '',
  valueType: '',
  refId: 'annotationQuery',
  title: '',
  text: '',
};

export class AnnotationQueryEditor extends React.Component<Props, State> {
  state: State = DefaultTarget;

  componentDidMount() {
    this.setState({
      ...this.props.target,
    });
  }

  onMetricTypeChange({ valueType, metricKind, type, unit }) {
    const { onQueryChange } = this.props;
    this.setState(
      {
        metricType: type,
        unit,
        valueType,
        metricKind,
      },
      () => {
        onQueryChange(this.state);
      }
    );
  }

  onChange(prop, value) {
    this.setState({ [prop]: value }, () => {
      this.props.onQueryChange(this.state);
    });
  }

  render() {
    const { defaultProject, metricType, filters, refId, title, text } = this.state;
    const { datasource } = this.props;

    return (
      <>
        <Metrics
          defaultProject={defaultProject}
          metricType={metricType}
          templateSrv={datasource.templateSrv}
          datasource={datasource}
          onChange={value => this.onMetricTypeChange(value)}
        >
          {metric => (
            <>
              <Filter
                filtersChanged={value => this.onChange('filters', value)}
                filters={filters}
                refId={refId}
                hideGroupBys={true}
                templateSrv={datasource.templateSrv}
                datasource={datasource}
                metricType={metric ? metric.type : ''}
              />
            </>
          )}
        </Metrics>
        <div className="gf-form gf-form-inline">
          <div className="gf-form">
            <span className="gf-form-label query-keyword width-9">Title</span>
            <input
              type="text"
              className="gf-form-input width-20"
              value={title}
              onChange={e => this.onChange('title', e.target.value)}
            />
          </div>
          <div className="gf-form">
            <span className="gf-form-label query-keyword width-9">Text</span>
            <input
              type="text"
              className="gf-form-input width-20"
              value={text}
              onChange={e => this.onChange('text', e.target.value)}
            />
          </div>
          <div className="gf-form gf-form--grow">
            <div className="gf-form-label gf-form-label--grow" />
          </div>
        </div>

        <AnnotationsHelp />
      </>
    );
  }
}
