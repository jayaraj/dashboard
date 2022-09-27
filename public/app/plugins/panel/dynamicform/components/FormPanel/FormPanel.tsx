import { css, cx } from '@emotion/css';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';

import { PanelProps, dateMath } from '@grafana/data';
import { getTemplateSrv, locationService, RefreshEvent, getBackendSrv } from '@grafana/runtime';
import { Alert, Button, ButtonGroup, ConfirmModal, FieldSet, useTheme2 } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { AccessControlAction } from 'app/types';

import { ButtonVariant, LayoutVariant } from '../../constants';
import { getStyles } from '../../styles';
import { FormElement, PanelOptions } from '../../types';
import { FormElements } from '../FormElements';

/**
 * Properties
 */
interface Props extends PanelProps<PanelOptions> {}

/**
 * Panel
 */
export const FormPanel: React.FC<Props> = ({
  options,
  width,
  height,
  onOptionsChange,
  eventBus,
  replaceVariables,
  data,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [initial, setInitial] = useState<{ [id: string]: any }>({});
  const [updateConfirmation, setUpdateConfirmation] = useState(false);
  const [updated, setUpdated] = useState(false);
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, contextSrv.hasRole('Editor'));
  const dashboard = getDashboardSrv().getCurrent();
  const refresh = debounce(() => dashboard?.startRefresh(), 500);

  /**
   * Theme and Styles
   */
  const theme = useTheme2();
  const styles = getStyles();

  /**
   * Template Service
   */
  const templateSrv: any = getTemplateSrv();

  /**
   * Execute Custom Code
   */
  const executeCustomCode = (code: string, response: Response | void) => {
    if (!code) {
      return;
    }

    const f = new Function(
      'options',
      'data',
      'response',
      'elements',
      'locationService',
      'templateService',
      replaceVariables(code)
    );

    try {
      f(options, data, response, options.elements, locationService, templateSrv);
    } catch (error: any) {
      console.error(error);
      setError(error.toString());
    }
  };

  /**
   * Update Request
   */
  const updateRequest = async () => {
    const body: any = {};

    /**
     * Loading
     */
    setLoading(true);

    /**
     * Set elements
     */
    options.elements.forEach((element) => {
      body[element.id] = element.value;
    });

    const resource = replaceVariables('${resource}');
    const group = replaceVariables('${grp}');
    const payload = JSON.parse(replaceVariables(JSON.stringify(body)));

    /**
     * Fetch
     */
    const response = await getBackendSrv()
      .put(`/api/resources/${resource}/configurations/${options.configuration}`, { group_id: Number(group), configuration: payload })
      .catch((error: Error) => {
        console.error(error);
        setError(error.toString());
      });

    /**
     * Check Response
     */
    if (response?.ok) {
      setTitle(response.toString());
    }

    /**
     * Execute Custom Code and reset Loading
     */
    if (options.customcode) {
      executeCustomCode(options.update.code, response);
    }
    setUpdated(false);
    refresh();
    setLoading(false);
  };

  /**
   * Initial Request
   */
  const initialRequest = async () => {
    const resource = replaceVariables('${resource}');
    const group = replaceVariables('${grp}');

    /**
     * Fetch
     */
    const response = await getBackendSrv().get(
      `/api/resources/${resource}/configurations/${options.configuration}?group_id=${group}`,
      {}
    );

    /**
     * Set Element values
     */
    options.elements.forEach((element) => {
      switch (element.type) {
        case 'datetime':
          element.value = dateMath.parse(response[element.id]);
          break;
        default:
          element.value = response[element.id];
      }
    });

    /**
     * Update values
     */
    onOptionsChange(options);
    setInitial(response);
    setTitle('Values updated.');

    /**
     * Execute Custom Code and reset Loading
     */
    if (options.customcode) {
      executeCustomCode(options.initial.code, response);
    }
    setLoading(false);
    setUpdated(true);
  };

  /**
   * Execute Initial Request
   */
  useEffect(() => {
    /**
     * On Load
     */
    initialRequest();

    /**
     * On Refresh
     */
    const subscriber = eventBus.getStream(RefreshEvent).subscribe((event) => {
      initialRequest();
    });

    return () => {
      subscriber.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Check Form Elements
   */
  if (!options.elements || !options.elements.length) {
    return (
      <Alert severity="info" title="Form Elements">
        Please add elements in Panel Options.
      </Alert>
    );
  }

  /**
   * Return
   */
  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
      <table className={styles.table}>
        <tbody>
          {options.layout.variant === LayoutVariant.SINGLE && (
            <tr>
              <td>
                <FormElements
                  options={options}
                  onOptionsChange={onOptionsChange}
                  initial={initial}
                  section={null}
                ></FormElements>
              </td>
            </tr>
          )}

          {options.layout.variant === LayoutVariant.SPLIT && (
            <tr>
              {options.layout?.sections?.map((section, id) => {
                return (
                  <td className={styles.td} key={id}>
                    <FieldSet label={section.name}>
                      <FormElements
                        options={options}
                        onOptionsChange={onOptionsChange}
                        initial={initial}
                        section={section}
                      ></FormElements>
                    </FieldSet>
                  </td>
                );
              })}
            </tr>
          )}
          <tr>
            <td colSpan={options.layout?.sections?.length}>
              <ButtonGroup className={cx(styles.button[options.buttonGroup.orientation])}>
                <Button
                  className={cx(styles.margin)}
                  variant={options.submit.variant as any}
                  icon={options.submit.icon}
                  title={title}
                  style={
                    options.submit.variant === ButtonVariant.CUSTOM
                      ? {
                          background: 'none',
                          border: 'none',
                          backgroundColor: theme.visualization.getColorByName(options.submit.backgroundColor),
                          color: theme.visualization.getColorByName(options.submit.foregroundColor),
                        }
                      : {}
                  }
                  disabled={loading || !updated || !canWrite}
                  onClick={
                    options.update.confirm
                      ? () => {
                          setUpdateConfirmation(true);
                        }
                      : updateRequest
                  }
                  size={options.buttonGroup.size}
                >
                  {options.submit.text}
                </Button>

                {options.reset.variant !== ButtonVariant.HIDDEN && (
                  <Button
                    className={cx(styles.margin)}
                    variant={options.reset.variant as any}
                    icon={options.reset.icon}
                    style={
                      options.reset.variant === ButtonVariant.CUSTOM
                        ? {
                            background: 'none',
                            border: 'none',
                            backgroundColor: theme.visualization.getColorByName(options.reset.backgroundColor),
                            color: theme.visualization.getColorByName(options.reset.foregroundColor),
                          }
                        : {}
                    }
                    disabled={loading || !canWrite}
                    onClick={initialRequest}
                    size={options.buttonGroup.size}
                  >
                    {options.reset.text}
                  </Button>
                )}
              </ButtonGroup>
            </td>
          </tr>
        </tbody>
      </table>

      {error && (
        <Alert severity="error" title="Request">
          {error}
        </Alert>
      )}

      <ConfirmModal
        isOpen={!!updateConfirmation}
        title="Confirm update request"
        body={
          <div>
            <h4>Please confirm to update changed values?</h4>
            <table className={styles.confirmTable}>
              <thead>
                <tr className={styles.confirmTable}>
                  <td className={styles.confirmTableTd}>
                    <b>Id</b>
                  </td>
                  <td className={styles.confirmTableTd}>
                    <b>Old Value</b>
                  </td>
                  <td className={styles.confirmTableTd}>
                    <b>New Value</b>
                  </td>
                </tr>
              </thead>
              <tbody>
                {options.elements.map((element: FormElement) => {
                  if (element.value === initial[element.id]) {
                    return;
                  }

                  return (
                    <tr className={styles.confirmTable} key={element.id}>
                      <td className={styles.confirmTableTd}>{element.id}</td>
                      <td className={styles.confirmTableTd}>{initial[element.id]}</td>
                      <td className={styles.confirmTableTd}>{element.value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        }
        confirmText="Confirm"
        onConfirm={() => {
          updateRequest();
          setUpdateConfirmation(false);
        }}
        onDismiss={() => setUpdateConfirmation(false)}
      />
    </div>
  );
};
