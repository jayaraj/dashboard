import { css } from '@emotion/css';
import { Parser } from 'expr-eval';
import Papa from 'papaparse';
import React, { FormEvent, useState, useEffect } from 'react';

import { NavModelItem, GrafanaTheme2, InternalTimeZones, getTimeZoneInfo } from '@grafana/data';
import {
  Button,
  FileUpload,
  useStyles2,
  Alert,
  LinkButton,
  CallToActionCard,
  FieldSet,
  Card,
  VerticalGroup,
  Field,
  InputControl,
  Form,
  TimeZonePicker,
} from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { VariablePicker, VariableOption } from 'app/core/components/VariablePicker/VariablePicker'; 
import store from 'app/core/store';

const pageNav: NavModelItem = {
  icon: 'group-type',
  id: 'upload-csv',
  text: `Upload data`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

function sanitizeHeader(header: string): string {
  return header
    .replace(/[()]/g, '')         // Remove only the parentheses characters, not content inside
    .replace(/[^\w\s]/g, '')      // Remove other non-word characters (punctuation, etc.)
    .trim()                       // Trim leading/trailing whitespace
    .replace(/\s+/g, '_');        // Replace internal spaces with underscores
}

function toOption(value: string): VariableOption {
  const sanitized = sanitizeHeader(value);
  return {
    label: value,
    value: `{{${sanitized}}}`,
  };
}

function cleanExpression(expr: string): string {
  return expr.replace(/{{\s*(.*?)\s*}}/g, (_, key) => sanitizeHeader(key));
}

function validateExpression(expr: string, knownHeaders: string[]): true | string {
  try {
    
    if (expr === undefined) {return true};
    const trimmedExpr = expr.trim();
    if (trimmedExpr === "") {
      return true;
    }
    const cleaned = cleanExpression(trimmedExpr);
    const parser = new Parser();
    const parsed = parser.parse(cleaned);

    const usedVars = parsed.variables();
    const unknownVars = usedVars.filter(v => !knownHeaders.includes(v));
    if (unknownVars.length > 0) {
      return "Unknown header";
    }

    // Dummy evaluation to check runtime validity
    const dummyContext: Record<string, number> = {};
    usedVars.forEach(v => {
      dummyContext[v] = 1;
    });
    parsed.evaluate(dummyContext);
    return true;
  } catch (err: any) {
    return "Invalid expression";
  }
}

type HistoricalDataMapping = {
  timezone: string;
  time: string;
  uuid: string;
  battery: string;
  batteryvoltage: string;
  counter: string;
  drssi: string;
  dsnr: string;
  temperature: string;
  fwdcounter: string;
  revcounter: string;
};

export const ResourcesDataUpload = (): JSX.Element => {
  const [fileInfo, setFileInfo] = useState<{ file: File | null; headers: string[] }>({ file: null, headers: [] });
  const [options, setOptions] = useState<VariableOption[]>([]);
  const [sanitizedHeaders, setSanitizedHeaders] = useState<string[]>([]);
  const styles = useStyles2(getStyles);
  const [timezone, setTimezone] = useState<string | undefined>(InternalTimeZones.default);
  const CSV_MAPPING_KEY = 'connections.csv.mappings';
  const CSV_TIMEZONE_KEY = 'connections.csv.timezone';
  const mappingKeysLeft: Array<keyof HistoricalDataMapping> = [
    'time',
    'uuid',
    'battery',
    'batteryvoltage',
    'counter',
  ];
  const mappingKeysRight: Array<keyof HistoricalDataMapping> = [
    'drssi',
    'dsnr',
    'temperature',
    'fwdcounter',
    'revcounter',
  ];
  const [defaultValues, setDefaultValues] = useState<HistoricalDataMapping>({
    timezone: '',
    time: '',
    uuid: '',
    battery: '',
    batteryvoltage: '',
    counter: '',
    drssi: '',
    dsnr:'',
    temperature: '',
    fwdcounter: '',
    revcounter: '',
  });

  useEffect(() => {
    const values: HistoricalDataMapping = store.getObject(CSV_MAPPING_KEY, {
      timezone: '',
      time: '',
      uuid: '',
      battery: '',
      batteryvoltage: '',
      counter: '',
      drssi: '',
      dsnr:'',
      temperature: '',
      fwdcounter: '',
      revcounter: '',
    });
    const tz: string = store.getObject(CSV_TIMEZONE_KEY, InternalTimeZones.default);
    setDefaultValues(values);
    setTimezone(tz);
  }, []);



  const onFileUpload = (event: FormEvent<HTMLInputElement>) => {
    const fileToUpload =
      event.currentTarget.files && event.currentTarget.files.length > 0 && event.currentTarget.files[0]
        ? event.currentTarget.files[0]
        : undefined;
    if (fileToUpload) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvData = e.target?.result;
        Papa.parse(csvData as string, {
          preview: 1,
          skipEmptyLines: true,
          complete: (result) => {
            if (result && result.data && result.data.length) {
              const rawHeaders = (result.data as string[][])[0];
              const sanitized = rawHeaders.map(sanitizeHeader);
              setFileInfo({ file: fileToUpload, headers: rawHeaders }); // for display
              setOptions(sanitized.map(toOption));
              setSanitizedHeaders(sanitized);
            } else {
              <Alert severity="error" title="Failed to parse the CSV file" />;
            }
          },
          error: () => {
            <Alert severity="error" title="Failed parsing the CSV file" />;
          },
        });
      };
      reader.onerror = () => {
        <Alert severity="error" title="Failed reading the file" />;
      };
      reader.readAsText(fileToUpload);
    }
  };

  const onUpdate = (update: HistoricalDataMapping) => {
    if (!fileInfo.file) {
      console.error('No file selected');
      return;
    }
    const info = getTimeZoneInfo(timezone || InternalTimeZones.default, Date.now());
    update.timezone = info?.ianaName || '';
    store.setObject(CSV_MAPPING_KEY, update);
    setDefaultValues(update);
    store.setObject(CSV_TIMEZONE_KEY, timezone);
    const formData = new FormData();
    formData.append('file', fileInfo.file);
     formData.append('mapping', JSON.stringify(update));
    fetch('/api/resources/historicaldata', { method: 'POST', body: formData })
    .then((res) => {
      if (res.status >= 400) {
        return;
      }
      setFileInfo({ file: null, headers: [] });
      return res.json();
    }).catch((err) => console.error(err));
  };

  const ctaElement = (
    <FileUpload accept=".csv" onFileUpload={onFileUpload} showFileName={false} className={styles.uploadButton}>
      Upload
    </FileUpload>
  );

  const footer = <></>;

  return (
    <Page
      navId="billing-connections"
      pageNav={pageNav}
      actions={<LinkButton href={`org/connections`}>Back</LinkButton>}
    >
      <Page.Contents>
        {fileInfo.file === null ? (
          <CallToActionCard
            className={ctaStyle}
            message={'Upload a csv file for updating '}
            footer={footer}
            callToActionElement={ctaElement}
          />
        ) : (
          <div>
            <Card>
              <Card.Heading><div style={{ textAlign: 'center' }}>Map CSV Column Headers</div></Card.Heading>
              <Card.Description>
                {`Map your column headers with required data for each asset. You can add expressions like "{{<Column Header>}} * 100".`}
              </Card.Description>
            </Card>
            <Form<HistoricalDataMapping> defaultValues={defaultValues}  onSubmit={onUpdate}>
              {({ register, control }) => (
                <FieldSet>
                  <div style={{ width: '100%', display: 'flex', marginBottom: 16 }}>
                    <Field label="Timezone" style={{ width: '100%' }}>
                      <TimeZonePicker onChange={setTimezone} includeInternal={true} value={timezone}/>
                    </Field>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, width: '100%' }}>
                    <VerticalGroup style={{ width: '100%' }}>
                      {mappingKeysLeft.map((key) => (
                        <InputControl<HistoricalDataMapping>
                          key={key}
                          name={key}
                          control={control}
                          rules={{
                            validate: (value) => validateExpression(value, sanitizedHeaders),
                          }}
                          render={({ field: { onChange, ...field }, fieldState }) => (
                            <Field label={key} key={key} style={{ width: '100%' }} invalid={fieldState.error ? true : undefined} error={fieldState.error?.message}>
                              <div style={{ width: '100%' }}>
                                <VariablePicker {...field} onChange={(val) => onChange(val ?? "")} options={options} />
                              </div>
                            </Field>
                          )}
                        />
                      ))}
                    </VerticalGroup>
                    <VerticalGroup style={{ width: '100%' }}>
                      {mappingKeysRight.map((key) => (
                        <InputControl<HistoricalDataMapping>
                          name={key}
                          key={key}
                          control={control}
                          rules={{
                            validate: (value) => validateExpression(value, sanitizedHeaders),
                          }}
                          render={({ field: { onChange, ...field }, fieldState  }) => (
                            <Field label={key} key={key} style={{ width: '100%' }} invalid={fieldState.error ? true : undefined} error={fieldState.error?.message}>
                              <div style={{ width: '100%' }}>
                                <VariablePicker {...field} onChange={(val) => onChange(val ?? "")} options={options} />
                              </div>
                            </Field>
                          )}
                        />
                      ))}
                    </VerticalGroup>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                    <Button type="submit"> Update </Button>
                  </div>
                </FieldSet>
              )}
            </Form>
          </div>
        )}
      </Page.Contents>
    </Page>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  uploadButton: css`
    margin-right: ${theme.spacing(2)};
  `,
});

const ctaStyle = css({
  textAlign: 'center',
});

export default ResourcesDataUpload;
