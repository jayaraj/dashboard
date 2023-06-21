import React, { ChangeEvent, PureComponent } from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { FieldSet, InlineField, InlineFieldRow, Input, LegacyForms } from '@grafana/ui';
import { DataSourceOptions, SecureJsonData } from '../../types';

/**
 * Editor Properties
 */
interface Props extends DataSourcePluginOptionsEditorProps<DataSourceOptions> {}

/**
 * State
 */
interface State {}

/**
 * Config Editor
 */
export class ConfigEditor extends PureComponent<Props, State> {
  /**
   * Url Change
   */
  onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      jsonData: {
        ...options.jsonData,
        url: event.target.value,
      },
    });
  };

  /**
   * Token Change
   * Secure fields only sent to the backend
   */
  onTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        token: event.target.value,
      },
    });
  };

  /**
   * Token Reset
   */
  onResetToken = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        token: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        token: '',
      },
    });
  };

  /**
   * Render
   */
  render() {
    const { options } = this.props;
    const { jsonData, secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as SecureJsonData;

    return (
      <FieldSet>
        <InlineFieldRow>
          <InlineField label="URL" labelWidth={14}>
            <Input type="text" value={jsonData.url} width={40} onChange={this.onUrlChange} />
          </InlineField>
        </InlineFieldRow>

        <InlineFieldRow>
          <LegacyForms.SecretFormField
            isConfigured={(secureJsonFields && secureJsonFields.token) as boolean}
            value={secureJsonData.token || ''}
            label="Token"
            labelWidth={7}
            inputWidth={20}
            onReset={this.onResetToken}
            onChange={this.onTokenChange}
          />
        </InlineFieldRow>
      </FieldSet>
    );
  }
}
