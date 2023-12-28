import { css } from '@emotion/css';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { dateMath, GrafanaTheme2 } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Button, VerticalGroup, useTheme2, Form, FieldSet, Field, Select } from '@grafana/ui';
import { FormPanel } from 'app/core/components/CustomForm/components';
import { FormElementType } from 'app/core/components/CustomForm/constants';
import { FormElement, LayoutSection } from 'app/core/components/CustomForm/types';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/core';
import { stringsToSelectableValues, stringToSelectableValue } from 'app/features/alerting/unified/utils/amroutes';
import { StoreState } from 'app/types';
import { ConfigurationType } from 'app/types/devicemanagement/configuration';

import { loadOrgConfiguration, updateOrgConfiguration } from './state/actions';
import { getOrgConfiguration } from './state/selectors';

export const OrgConfigurations = ({ orgConfiguration, loadOrgConfiguration, updateOrgConfiguration }: Props) => {
  const theme = useTheme2();
  const styles = getStyles(theme);
  const canWrite = contextSrv.hasPermission('configurations.org:write');
  let [updatedOrgConfiguration, setUpdatedOrgConfiguration] = useState<any>({});
  let [elements, setElements] = useState<FormElement[]>([]);
  let [configurationType, setConfigurationType] = useState<ConfigurationType>({
    configuration: { sections: [] as LayoutSection[], elements: [] as FormElement[] },
  } as ConfigurationType);
  let [type, setType] = useState<string>('');
  let [types, setTypes] = useState(stringsToSelectableValues([] as string[]));
  let [isLoading, setIsLoading] = useState<boolean>(false);

  const configurationTypeRequest = async (type: string) => {
    const response = await getBackendSrv().get(`/api/configurationtypes/association/org/type/${type}`);
    setConfigurationType(response);
  };

  const typesRequest = async () => {
    const response = await getBackendSrv().get('/api/configurationtypes/association/org', {
      query: '',
      page: 1,
      perPage: 1000,
    });
    response.configuration_types.map((type: ConfigurationType) =>
      setTypes((opts) => [...opts, stringToSelectableValue(type.type)])
    );
  };

  const onSelect = async (type: string) => {
    configurationTypeRequest(type);
    loadOrgConfiguration(type);
    setType(type);
  };

  useEffect(() => {
    if (types.length > 0) {
      setType(types[0].value!);
      configurationTypeRequest(types[0].value!);
      loadOrgConfiguration(types[0].value!);
    }
    setIsLoading(false);
  }, [types]);

  useEffect(() => {
    setIsLoading(true);
    typesRequest();
  }, []);

  useEffect(() => {
    const elements = configurationType.configuration
      ? JSON.parse(JSON.stringify(configurationType.configuration.elements))
      : [];
    if (orgConfiguration) {
      elements?.forEach((element: FormElement) => {
        if (element.type === FormElementType.DATETIME) {
          element.value = dateMath.parse(orgConfiguration[element.id]);
        }
        if (element.type === FormElementType.SLIDER) {
          element.value = orgConfiguration[element.id] ? orgConfiguration[element.id] : element.min;
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
    formElements?.forEach((element) => {
      configurations[element.id] = element.value;
    });
    setUpdatedOrgConfiguration(configurations);
    if (formElements) {
      setElements(formElements);
    }
  };

  return (
    <Page.Contents isLoading={isLoading}>
      <VerticalGroup>
        <Form onSubmit={() => updateOrgConfiguration(type, updatedOrgConfiguration)} disabled={!canWrite}>
          {({}) => (
            <FieldSet>
              <Field label="Configuration Type">
                <Select width={40} options={types} onChange={(value) => onSelect(value?.value!)} value={type} />
              </Field>
              <div className={styles.container}>
                <FormPanel
                  configuration={{ sections: configurationType.configuration.sections, elements: elements }}
                  disabled={!canWrite}
                  onChange={onChange}
                ></FormPanel>
              </div>
              <Button type="submit" disabled={!canWrite}>
                Update
              </Button>
            </FieldSet>
          )}
        </Form>
      </VerticalGroup>
    </Page.Contents>
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

function mapStateToProps(state: StoreState) {
  return {
    orgConfiguration: getOrgConfiguration(state.orgConfiguration).configuration,
  };
}
const mapDispatchToProps = {
  loadOrgConfiguration,
  updateOrgConfiguration,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = ConnectedProps<typeof connector>;
export default connector(OrgConfigurations);
