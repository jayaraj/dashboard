import React, { useEffect, useState } from 'react';

import { PanelProps } from '@grafana/data';
import { getTemplateSrv, RefreshEvent } from '@grafana/runtime';
import { useTheme } from '@grafana/ui';

import SelectTableComponent from './SelectTableComponent';
import { getStyles, RuntimeVariableModel, RuntimeVariableOption, VariableTableOptions } from './types';

interface Props extends PanelProps<VariableTableOptions> {}

export const VariableTablePanel: React.FC<Props> = ({ options, data, width, height, eventBus, ...rest }) => {
  const theme = useTheme();
  const styles = getStyles(height, theme);
  const [tableData, setTableData] = useState<any>(null);
  const [heading, setHeading] = useState<string>('');
  const [isMulti, setMulti] = useState<boolean>(false);

  useEffect(() => {
    refresh();
  }, [options]);

  useEffect(() => {
    const subscriber = eventBus.getStream(RefreshEvent).subscribe((event) => {
      refresh();
    });
    return () => {
      subscriber.unsubscribe();
    };
  }, [eventBus]);


  const refresh = () => {
    const dashbboardVariables = getTemplateSrv().getVariables();
    if (!dashbboardVariables) {
      return;
    }

    const selectedVariables = options['selectedVariables'] || [];
    const filterVariables = dashbboardVariables.filter((dv: any) => selectedVariables.includes(dv.name));
    const runtimeVariables: RuntimeVariableModel[] = [...filterVariables] as any as RuntimeVariableModel[];

    if (runtimeVariables.length <= 0) {
      return
    }
    const { multi } = runtimeVariables[0] as any;
    setMulti(multi);
    setHeading(selectedVariables[0]);
    const data: RuntimeVariableOption[] = runtimeVariables[0].options.map((data, i) => {
      return {
        id: i,
        value: data.value,
        text: data.text,
        selected: false,
      };
    });
    setTableData(data);
  };

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.wrapper}>
        {tableData && <SelectTableComponent data={tableData} heading={heading} isMulti={isMulti}/>}
      </div>
    </div>
  );
};
