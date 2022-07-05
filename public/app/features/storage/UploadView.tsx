import { css } from '@emotion/css';
import React, { useState } from 'react';
import SVG from 'react-inlinesvg';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, ButtonGroup, Field, FileDropzone, useStyles2 } from '@grafana/ui';

import { getGrafanaStorage } from './helper';
import { UploadReponse } from './types';

interface Props {
  folder: string;
  onUpload: (rsp: UploadReponse) => void;
}

interface ErrorResponse {
  message: string;
}

const FileDropzoneCustomChildren = ({ secondaryText = 'Drag and drop here or browse' }) => {
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.iconWrapper}>
      <small className={styles.small}>{secondaryText}</small>
    </div>
  );
};

export const UploadView = ({ folder, onUpload }: Props) => {
  const [file, setFile] = useState<File | undefined>(undefined);

  const styles = useStyles2(getStyles);

  const [error, setError] = useState<ErrorResponse>({ message: '' });

  const Preview = () => {
    if (!file) {
      return <></>;
    }
    const isImage = file.type?.startsWith('image/');
    const isSvg = file.name?.endsWith('.svg');

    const src = URL.createObjectURL(file);
    return (
      <Field label="Preview">
        <div className={styles.iconPreview}>
          {isSvg && <SVG src={src} className={styles.img} />}
          {isImage && !isSvg && <img src={src} className={styles.img} />}
        </div>
      </Field>
    );
  };

  const doUpload = async () => {
    if (!file) {
      setError({ message: 'please select a file' });
      return;
    }

    const rsp = await getGrafanaStorage().upload(folder, file);
    if (rsp.status !== 200) {
      setError(rsp);
    } else {
      onUpload(rsp);
    }
  };

  return (
    <div>
      <FileDropzone
        readAs="readAsBinaryString"
        onFileRemove={() => {
          setFile(undefined);
        }}
        options={{
          accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
          multiple: false,
          onDrop: (acceptedFiles: File[]) => {
            setFile(acceptedFiles[0]);
          },
        }}
      >
        {error.message !== '' ? <p>{error.message}</p> : Boolean(file) ? <Preview /> : <FileDropzoneCustomChildren />}
      </FileDropzone>

      <ButtonGroup>
        <Button className={styles.button} variant={'primary'} disabled={!file} onClick={doUpload}>
          Upload
        </Button>
      </ButtonGroup>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  resourcePickerPopover: css`
    border-radius: ${theme.shape.borderRadius()};
    box-shadow: ${theme.shadows.z3};
    background: ${theme.colors.background.primary};
    border: 1px solid ${theme.colors.border.medium};
  `,
  resourcePickerPopoverContent: css`
    width: 315px;
    font-size: ${theme.typography.bodySmall.fontSize};
    min-height: 184px;
    padding: ${theme.spacing(1)};
    display: flex;
    flex-direction: column;
  `,
  button: css`
    margin: 12px 20px 5px;
  `,
  iconPreview: css`
    width: 238px;
    height: 198px;
    border: 1px solid ${theme.colors.border.medium};
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  img: css`
    width: 147px;
    height: 147px;
    fill: ${theme.colors.text.primary};
  `,
  iconWrapper: css`
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  small: css`
    color: ${theme.colors.text.secondary};
    margin-bottom: ${theme.spacing(2)};
  `,
});
