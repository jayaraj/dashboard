import _ from 'lodash';
import React, { PureComponent } from 'react';

import Graph from 'app/viz/Graph';
import { Switch } from 'app/core/components/Switch/Switch';

import { getTimeSeriesVMs } from 'app/viz/state/timeSeries';
import { PanelProps, PanelOptionsProps, NullValueMode } from 'app/types';

interface Options {
  showBars: boolean;
  showLines: boolean;
  showPoints: boolean;
}

interface Props extends PanelProps<Options> {}

export class Graph2 extends PureComponent<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { timeSeries, timeRange, width, height } = this.props;
    const { showLines, showBars, showPoints } = this.props.options;

    const vmSeries = getTimeSeriesVMs({
      timeSeries: timeSeries,
      nullValueMode: NullValueMode.Ignore,
    });

    return (
      <Graph
        timeSeries={vmSeries}
        timeRange={timeRange}
        showLines={showLines}
        showPoints={showPoints}
        showBars={showBars}
        width={width}
        height={height}
      />
    );
  }
}

export class GraphOptions extends PureComponent<PanelOptionsProps<Options>> {
  onToggleLines = () => {
    this.props.onChange({ ...this.props.options, showLines: !this.props.options.showLines });
  };

  onToggleBars = () => {
    this.props.onChange({ ...this.props.options, showBars: !this.props.options.showBars });
  };

  onTogglePoints = () => {
    this.props.onChange({ ...this.props.options, showPoints: !this.props.options.showPoints });
  };

  render() {
    const { showBars, showPoints, showLines } = this.props.options;

    return (
      <div>
        <div className="form-option-box">
          <div className="form-option-box__header">Display Options</div>
          <div className="section gf-form-group">
            <h5 className="section-heading">Draw Modes</h5>
            <Switch label="Lines" labelClass="width-5" checked={showLines} onChange={this.onToggleLines} />
            <Switch label="Bars" labelClass="width-5" checked={showBars} onChange={this.onToggleBars} />
            <Switch label="Points" labelClass="width-5" checked={showPoints} onChange={this.onTogglePoints} />
          </div>
          <div className="section gf-form-group">
            <h5 className="section-heading">Test Options</h5>
            <Switch label="Lines" labelClass="width-5" checked={showLines} onChange={this.onToggleLines} />
            <Switch label="Bars" labelClass="width-5" checked={showBars} onChange={this.onToggleBars} />
            <Switch label="Points" labelClass="width-5" checked={showPoints} onChange={this.onTogglePoints} />
          </div>
        </div>
        <div className="form-option-box">
          <div className="form-option-box__header">Axes</div>
        </div>
        <div className="form-option-box">
          <div className="form-option-box__header">Thresholds</div>
        </div>
      </div>
    );
  }
}

export { Graph2 as Panel, GraphOptions as PanelOptions };
