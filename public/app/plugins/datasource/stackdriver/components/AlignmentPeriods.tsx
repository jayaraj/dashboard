import React, { SFC } from 'react';
import _ from 'lodash';

import kbn from 'app/core/utils/kbn';
import { MetricSelect } from 'app/core/components/Select/MetricSelect';
import { alignmentPeriods, alignOptions } from '../constants';

export interface Props {
  onChange: (alignmentPeriod) => void;
  templateSrv: any;
  alignmentPeriod: string;
  perSeriesAligner: string;
  usedAlignmentPeriod: string;
}

export const AlignmentPeriods: SFC<Props> = ({
  alignmentPeriod,
  templateSrv,
  onChange,
  perSeriesAligner,
  usedAlignmentPeriod,
}) => {
  const alignment = alignOptions.find(ap => ap.value === templateSrv.replace(perSeriesAligner));
  const formatAlignmentText = `${kbn.secondsToHms(usedAlignmentPeriod)} interval (${alignment ? alignment.text : ''})`;

  return (
    <>
      <div className="gf-form-inline">
        <div className="gf-form">
          <label className="gf-form-label query-keyword width-9">Alignment Period</label>
          <MetricSelect
            onChange={value => onChange(value)}
            value={alignmentPeriod}
            variables={templateSrv.variables}
            options={[
              {
                label: 'Alignment options',
                expanded: true,
                options: alignmentPeriods.map(ap => ({
                  ...ap,
                  label: ap.text,
                })),
              },
            ]}
            placeholder="Select Alignment"
            className="width-15"
          />
        </div>
        <div className="gf-form gf-form--grow">
          {usedAlignmentPeriod && <label className="gf-form-label gf-form-label--grow">{formatAlignmentText}</label>}
        </div>
      </div>
    </>
  );
};
