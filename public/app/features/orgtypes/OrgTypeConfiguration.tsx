import { css } from '@emotion/css';
import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateMath, GrafanaTheme2 } from '@grafana/data';
import { Button, VerticalGroup, useTheme2 } from '@grafana/ui';
import { FormPanel } from 'app/core/components/CustomForm/components';
import { FormElementType } from 'app/core/components/CustomForm/constants';
import { FormElement } from 'app/core/components/CustomForm/types';
import { contextSrv } from 'app/core/core';
import { OrgType, AccessControlAction, ResourceConfiguration } from 'app/types';

import { updateOrgConfiguration } from './state/actions';

const mapDispatchToProps = {
  updateOrgConfiguration,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  orgType: OrgType;
  data: any;
}

export type Props = ConnectedProps<typeof connector> & OwnProps;

export const OrgTypeConfiguration: FC<Props> = ({ orgType, data, updateOrgConfiguration }) => {
  const theme = useTheme2();
  const styles = getStyles(theme);

  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourceTypesWrite, contextSrv.user.isGrafanaAdmin);
  let [configuration, setConfiguration] = useState<ResourceConfiguration>({
    elements: [],
    sections: [],
  });
  let [newData, setNewData] = useState<any>({});

  useEffect(() => {
    const elements = orgType.configuration? JSON.parse(JSON.stringify(orgType.configuration.elements)): [];
    const sections = orgType.configuration? JSON.parse(JSON.stringify(orgType.configuration.sections)): [];
    if (data) {
      elements?.forEach((element: FormElement) => {
        if (element.type === FormElementType.DATETIME) {
          element.value = dateMath.parse(data[element.id]);
        }
        if (element.type === FormElementType.SLIDER) {
          element.value = data[element.id]? data[element.id]: element.min;
        } else {
          element.value = data[element.id];
        }
      });
    }
    
    setNewData(data);
    setConfiguration({
      elements: [...elements],
      sections: [...sections],
    });
  }, [data, orgType]);

  const onChange = (elements?: FormElement[]) => {
    const update: any = {};
    elements?.forEach((element) => {
      update[element.id] = element.value;
    });
    setNewData(update);
    setConfiguration({
      ...configuration,
      elements: elements?elements:configuration.elements,
    });
  };

  return (
    <div
      className={styles.container}
    >
      <FormPanel configuration={configuration} disabled={!canWrite} onChange={onChange}></FormPanel>
      <VerticalGroup>
        <Button type="button"  variant="primary" onClick={() => updateOrgConfiguration(newData)} disabled={!canWrite}>
          Update
        </Button>
      </VerticalGroup>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  return {
    container: css`
      display: flex;
      margin: auto;
      padding: 10px;
      flex-direction: column;
    `,
  };
};

export default connector(OrgTypeConfiguration);
