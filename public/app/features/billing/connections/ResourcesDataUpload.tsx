import { css } from '@emotion/css';
import Papa from 'papaparse';
import React, { FormEvent, useEffect, useState } from 'react';

import { NavModelItem, GrafanaTheme2, SelectableValue } from '@grafana/data';
import {
  Button,
  FileUpload,
  useStyles2,
  Alert,
  LinkButton,
  CallToActionCard,
  FieldSet,
  HorizontalGroup,
  VerticalGroup,
  Field,
  InputControl,
  Segment,
  Form,
  Icon,
  SegmentSection,
} from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';

const pageNav: NavModelItem = {
  icon: 'group-type',
  id: 'upload-csv',
  text: `Upload data`,
  subTitle: '',
  hideFromBreadcrumbs: true,
};

function toOption(value: string) {
  return {
    label: `${value}`,
    value: `{{${value}}}`,
  };
}

export const ResourcesDataUpload = (): JSX.Element => {
  const [fileInfo, setFileInfo] = useState<{ file: File | null; headers: string[] }>({ file: null, headers: [] });
  const [options, setOptions] = useState<SelectableValue<string>>([]);
  const styles = useStyles2(getStyles);

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
              setFileInfo({ file: fileToUpload, headers: (result.data as string[][])[0] });
              const opts = (result.data as string[][])[0].map(toOption);
              setOptions(opts);
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

  const onUpdate = (update: string) => {};

  const ctaElement = (
    <FileUpload accept=".csv" onFileUpload={onFileUpload} showFileName={false} className={styles.uploadButton}>
      Upload
    </FileUpload>
  );

  const footer = <></>;

  const addButton = (
    <span className="gf-form-label query-part">
      <Icon name="plus-circle" />
    </span>
  );

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
          <>
            <Form defaultValues={{}} onSubmit={onUpdate}>
              {({ register, control }) => (
                <FieldSet>
                  <HorizontalGroup align="normal">
                    <VerticalGroup>
                      <Field label="Status">
                        <InputControl
                          name="test"
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { onChange, ...field } }) => (
                            <SegmentSection label="Segment">
                              <Segment Component={addButton} onChange={() => {}} options={options} />
                            </SegmentSection>
                          )}
                        />
                      </Field>
                    </VerticalGroup>
                    <div style={{ padding: '0 50px' }} />
                    <VerticalGroup>
                      <Field label="Status">
                        <InputControl
                          name="test1"
                          control={control}
                          rules={{ required: true }}
                          render={({ field: { onChange, ...field } }) => (
                            <SegmentSection label="Segment">
                              <Segment Component={addButton} onChange={() => {}} options={options} />
                            </SegmentSection>
                          )}
                        />
                      </Field>
                    </VerticalGroup>
                  </HorizontalGroup>
                  <HorizontalGroup>
                    <Button type="submit"> Update </Button>
                  </HorizontalGroup>
                </FieldSet>
              )}
            </Form>
          </>
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
