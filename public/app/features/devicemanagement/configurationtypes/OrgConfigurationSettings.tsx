import { css } from '@emotion/css';
import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateMath, GrafanaTheme2 } from '@grafana/data';
import { Button, VerticalGroup, useTheme2 } from '@grafana/ui';
import { FormPanel } from 'app/core/components/CustomForm/components';
import { FormElement } from 'app/core/components/CustomForm/types';
import { contextSrv } from 'app/core/core';
import { ConfigurationType, StoreState } from 'app/types';

import { loadOrgConfiguration, updateOrgConfiguration } from './state/actions';
import { getOrgConfigurations } from 'app/features/billing/connections/state/selectors';
import { FormElementType } from 'app/core/components/CustomForm/constants';

export interface OwnProps {
  configurationType: ConfigurationType;
}
function mapStateToProps(state: StoreState, props: OwnProps) {
  const orgConfiguration = getOrgConfigurations(state.orgConfiguration, contextSrv.user.orgId, props.configurationType.type);
  return {
    orgConfiguration: orgConfiguration? orgConfiguration.configuration: {},
  };
}
const mapDispatchToProps = {
  loadOrgConfiguration,
  updateOrgConfiguration,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector> & OwnProps;

export const OrgConfigurationSettings: FC<Props> = ({ configurationType, orgConfiguration, loadOrgConfiguration, updateOrgConfiguration }) => {
  const theme = useTheme2();
  const styles = getStyles(theme);
  const canWrite = contextSrv.hasRole('ServerAdmin') || contextSrv.hasRole('Admin');
  let [updatedOrgConfiguration, setUpdatedOrgConfiguration] = useState<any>({});
  let [elements, setElements] = useState<FormElement[]>([]);
  
  useEffect(() => {
    getOrgConfiguration();
  }, []);

  const getOrgConfiguration = async ( ) => {
    await loadOrgConfiguration();
  };

  const update = async (configuration: any) => {
    await updateOrgConfiguration(configuration);
  };

  useEffect(() => {
    const elements = configurationType.configuration? JSON.parse(JSON.stringify(configurationType.configuration.elements)): [];
    if (orgConfiguration) {
      elements?.forEach((element: FormElement) => {
        if (element.type === FormElementType.DATETIME) {
          element.value = dateMath.parse(orgConfiguration[element.id]);
        }
        if (element.type === FormElementType.SLIDER) {
          element.value = orgConfiguration[element.id]? orgConfiguration[element.id]: element.min;
        } else {
          element.value = orgConfiguration[element.id];
        }
      });
    }
    setUpdatedOrgConfiguration(orgConfiguration);
    setElements(elements);
  }, [configurationType, orgConfiguration]);

  const onChange = (formElements?: FormElement[]) => {
    const configurations: any = {};
    formElements?.forEach((element) => {configurations[element.id] = element.value});
    setUpdatedOrgConfiguration(configurations);
    if (formElements) {
      setElements(formElements);
    }
  };

  return (
    <div className={styles.container}>
      <FormPanel configuration={{sections: configurationType.configuration.sections, elements: elements}}  disabled={!canWrite} onChange={onChange}></FormPanel>
      <VerticalGroup>
        <Button type="button"  variant="primary" onClick={() => update(updatedOrgConfiguration?updatedOrgConfiguration:{})} disabled={!canWrite}>
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

export default connector(OrgConfigurationSettings);