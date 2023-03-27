import { css, cx } from '@emotion/css';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';

import { PanelProps, dateMath, AlertPayload, AppEvents, AlertErrorPayload } from '@grafana/data';
import {  getAppEvents, getTemplateSrv, locationService, RefreshEvent, getBackendSrv } from '@grafana/runtime';
import { Alert, Button, ButtonGroup, ConfirmModal, FieldSet, useTheme2 } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { AccessControlAction } from 'app/types';

import { ButtonVariant, LayoutVariant, RequestMethod, FormElementType, LevelVariant } from '../../constants';
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
  const styles = getStyles(theme);

  /**
   * Template Service
   */
  const templateSrv: any = getTemplateSrv();

  /**
   * Events
   */
  const appEvents = getAppEvents();
  const notifySuccess = (payload: AlertPayload) => appEvents.publish({ type: AppEvents.alertSuccess.name, payload });
  const notifyError = (payload: AlertErrorPayload) => appEvents.publish({ type: AppEvents.alertError.name, payload });

  /**
   * Execute Custom Code
   */
  const executeCustomCode = (code: string, initial: any, response: Response | void) => {
    if (!code) {
      return;
    }

    /**
     * Function
     */
    const f = new Function(
      'options',
      'data',
      'response',
      'elements',
      'locationService',
      'templateService',
      'onOptionsChange',
      'initialRequest',
      'setInitial',
      'json',
      'initial',
      'notifyError',
      'notifySuccess',
      replaceVariables(code)
    );

    try {
      f(
        options,
        data,
        response,
        options.elements,
        locationService,
        templateSrv,
        onOptionsChange,
        initialRequest,
        setInitial,
        initial,
        initial,
        notifyError,
        notifySuccess
      );
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
     * Execute Custom Code
     */
    if (options.update.method === RequestMethod.NONE && options.configuration.external === true) {
      executeCustomCode(options.update.code, initial);
      setLoading(false);

      return;
    }

    /**
     * Set Content Type
     */
    const headers: HeadersInit = new Headers();
    headers.set('Content-Type', options.update.contentType);

    /**
     * Set elements
     */
    options.elements?.forEach((element) => {
      if (!options.update.updatedOnly) {
        body[element.id] = element.value;
        return;
      }

      /**
       * Skip not updated elements
       */
      if (element.value === initial[element.id]) {
        return;
      }

      /**
       * Skip Disabled elements
       */
      if (element.type === FormElementType.DISABLED) {
        return;
      }
      body[element.id] = element.value;
    });

    if (options.configuration.external) {
      /**
       * Set Header
       */
      options.update.header?.forEach((parameter) => {
        const name = replaceVariables(parameter.name);
        if (!name) {
          setError(`All request parameters should be defined. Remove empty parameters.`);
          return;
        }

        headers.set(name, replaceVariables(parameter.value));
      });

      /**
       * Fetch
       */
      const response = await fetch(replaceVariables(options.update.url), {
        method: options.update.method,
        headers,
        body: replaceVariables(JSON.stringify(body)),
      }).catch((error: Error) => {
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
      executeCustomCode(options.update.code, initial, response);
    } else {
      
      let url = `/api/orgs/configurations/${options.configuration.type}`
      if (options.configuration.level === LevelVariant.GROUP) {
        const group = replaceVariables('${grp}');
        url = `/api/groups/${group}/configurations/${options.configuration.type}`
      }
      if (options.configuration.level === LevelVariant.RESOURCE) {
        const resource = replaceVariables('${resource}');
        url = `/api/resources/${resource}/configurations/${options.configuration.type}`
      }
      const payload = JSON.parse(replaceVariables(JSON.stringify(body)));
  
      /**
       * Fetch
       */
      const response = await getBackendSrv()
        .put(`${url}`, { configuration: payload })
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
      executeCustomCode(options.update.code, initial, response);
    }

    // setUpdated(false);
    refresh();
    setLoading(false);
  };

  /**
   * Initial Request
   */
  const initialRequest = async () => {
    /**
     * Check Elements
     */
    if (
      options.configuration.external === true &&
      (!options.initial.url ||
      options.initial.method === RequestMethod.NONE)
    ) {
      /**
       * Execute Custom Code and reset Loading
       */
      executeCustomCode(options.initial.code, initial);
      setLoading(false);

      return;
    }

    if (options.configuration.external) {
      /**
       * Set Content Type
       */
      const headers: HeadersInit = new Headers();
      if (options.initial.method === RequestMethod.POST) {
        headers.set('Content-Type', options.initial.contentType);
      }
      /**
       * Set Header
       */
      options.initial.header?.forEach((parameter) => {
        const name = replaceVariables(parameter.name);
        if (!name) {
          setError(`All request parameters should be defined. Remove empty parameters.`);
          return;
        }

        headers.set(name, replaceVariables(parameter.value));
      });

      /**
       * Fetch
       */
      const response = await fetch(replaceVariables(options.initial.url), {
        method: options.initial.method,
        headers,
      }).catch((error: Error) => {
        console.error(error);
        setError(error.toString());
      });

      /**
       * CORS
       */
      if (response?.type === 'opaque') {
        setError('CORS prevents access to the response for Initial values.');
      }
      /**
       * OK
       */
      let json: any = null;
      if (response?.ok) {
        json = await response.json();

        /**
         * Set Element values
         */
        options.elements?.forEach((element) => {
          element.value = json[element.id];
        });

        /**
         * Update values
         */
        onOptionsChange(options);
        setInitial(json);
        setTitle('Values updated.');
      }

      /**
       * Execute Custom Code and reset Loading
       */
      executeCustomCode(options.initial.code, json, response);

    } else {
      let url = `/api/orgs/configurations/${options.configuration.type}`
      if (options.configuration.level === LevelVariant.GROUP) {
        const group = replaceVariables('${grp}');
        url = `/api/groups/${group}/configurations/${options.configuration.type}`
      }
      if (options.configuration.level === LevelVariant.RESOURCE) {
        const resource = replaceVariables('${resource}');
        url = `/api/resources/${resource}/configurations/${options.configuration.type}`
      }
      /**
       * Fetch
       */
      const response = await getBackendSrv().get(
        `${url}`,
        {}
      );
      /**
       * Set Element values
       */
      options.elements?.forEach((element) => {
        switch (element.type) {
          case FormElementType.DATETIME:
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
      executeCustomCode(options.initial.code, response);

    }

    //setUpdated(true);
    setLoading(false);
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
   * Check updated values
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setUpdated(false);

    options.elements?.map((element) => {
      if (element.value !== initial[element.id]) {
        setUpdated(true);
      }
    });
  });


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
      {(!options.elements || !options.elements.length) && options.layout.variant !== LayoutVariant.NONE && (
        <Alert severity="info" title="Form Elements">
          Please add elements in Panel Options or Custom Code.
        </Alert>
      )}

      <table className={styles.table}>
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
                disabled={!canWrite || loading || (!updated && options.layout.variant !== LayoutVariant.NONE)}
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
                    <b>Label</b>
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
                {options.elements?.map((element: FormElement) => {
                  if (element.value === initial[element.id]) {
                    return;
                  }

                  /**
                   * Skip Disabled elements, which can be updated in the custom code as previous values
                   */
                  if (element.type === FormElementType.DISABLED) {
                    return;
                  }

                  /**
                   * Skip Password elements
                   */
                  if (element.type === FormElementType.PASSWORD) {
                    return (
                      <tr className={styles.confirmTable} key={element.id}>
                        <td className={styles.confirmTableTd}>{element.title || element.tooltip}</td>
                        <td className={styles.confirmTableTd}>*********</td>
                        <td className={styles.confirmTableTd}>*********</td>
                      </tr>
                    );
                  }

                  return (
                    <tr className={styles.confirmTable} key={element.id}>
                      <td className={styles.confirmTableTd}>{element.title || element.tooltip}</td>
                      <td className={styles.confirmTableTd}>
                        {initial[element.id] === undefined ? '' : String(initial[element.id])}
                      </td>
                      <td className={styles.confirmTableTd}>
                        {element.value === undefined ? '' : String(element.value)}
                      </td>
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
