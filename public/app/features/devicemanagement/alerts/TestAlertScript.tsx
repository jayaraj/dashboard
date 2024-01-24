import { css } from '@emotion/css';
import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';

import { GrafanaTheme2 } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { Modal, CodeEditor, Button, HorizontalGroup, useStyles2, FieldSet, Field } from '@grafana/ui';
import { AlertDefinition, testAlertScriptDTO } from 'app/types/devicemanagement/alert';

export interface OwnProps {
  definition: AlertDefinition;
  isOpen: boolean;
  onCancel: (open: boolean) => void;
}

const mapDispatchToProps = {};
const connector = connect(null, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const TestAlertScript = ({ definition, isOpen, onCancel }: Props) => {
  const [response, setResponse] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const styles = useStyles2(getStyles);

  useEffect(() => {
    setQuery(JSON.stringify(testAlertScriptDTO, null, 2));
    setResponse('');
  }, [isOpen]);

  const onSubmit = async () => {
    const body = JSON.parse(query);
    const response = await getBackendSrv().post(`/api/alertdefinitions/${definition.id}/test`, body);
    setResponse(JSON.stringify(response, null, 2));
  };

  return (
    <Modal
      title="Test Alert Script"
      isOpen={isOpen}
      closeOnEscape={true}
      onDismiss={() => {
        onCancel(false);
      }}
      onClickBackdrop={() => {
        onCancel(false);
      }}
      iconTooltip="test script"
    >
      <FieldSet>
        <HorizontalGroup align="center" justify="space-between" height="auto">
          <Field label="Test Request" description="Sample uplink request to validate script">
            <div className={styles.content}>
              <AutoSizer disableWidth>
                {({ height }) => (
                  <CodeEditor
                    width={300}
                    height={height}
                    value={query}
                    language="json"
                    showMiniMap={false}
                    onBlur={(query) => setQuery(query)}
                  />
                )}
              </AutoSizer>
            </div>
          </Field>

          <Field label="Response" description="Response of alert script">
            <div className={styles.content}>
              <AutoSizer disableWidth>
                {({ height }) => (
                  <CodeEditor
                    width={300}
                    height={height}
                    value={response}
                    language="json"
                    showMiniMap={false}
                    readOnly={true}
                    monacoOptions={{ formatOnPaste: true, formatOnType: true }}
                  />
                )}
              </AutoSizer>
            </div>
          </Field>
        </HorizontalGroup>
      </FieldSet>

      <Modal.ButtonRow>
        <Button
          variant="secondary"
          onClick={() => {
            onCancel(false);
          }}
          fill="outline"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => {
            onSubmit();
          }}
          variant="primary"
        >
          Test
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};

export default connector(TestAlertScript);

export const getStyles = (theme: GrafanaTheme2) => ({
  content: css`
    flex-grow: 1;
    height: 300px;
    padding-bottom: 10px;
    padding-bottom: 16px;
    margin-bottom: ${theme.spacing(2)};
  `,
});
