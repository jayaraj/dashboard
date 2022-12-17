import { saveAs } from 'file-saver';
import React from 'react';

import { PanelProps, dateTimeFormat, toCSV, DataFrame, CSVConfig } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { Button, useTheme } from '@grafana/ui';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';

import { CsvButtonOptions, getStyles } from './types';

interface Props extends PanelProps<CsvButtonOptions> {}

export const CsvButtonPanel: React.FC<Props> = ({ id, options, data, width, height, eventBus, ...rest }) => {
  const theme = useTheme();
  const styles = getStyles(height, theme);

  const exportCsv = (dataFrame: DataFrame, csvConfig: CSVConfig = {}) => {
    const dataFrameCsv = toCSV([dataFrame], csvConfig);
    const blob = new Blob([String.fromCharCode(0xfeff), dataFrameCsv], {
      type: 'text/csv;charset=utf-8',
    });
    const panel = getDashboardSrv().getCurrent()?.getPanelById(id)!;
    const fileStr = getTemplateSrv().replace(options['filename'], panel.scopedVars);
    const fileName = `${fileStr}-${dateTimeFormat(new Date())}.csv`;
    saveAs(blob, fileName);
  };

  const onClick = () => {
    exportCsv(data.series[0], { useExcelHeader: options['useExcelHeader'] });
  };

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.wrapper}>
        <Button onClick={() => onClick()}>{options['heading']}</Button>
      </div>
    </div>
  );
};
