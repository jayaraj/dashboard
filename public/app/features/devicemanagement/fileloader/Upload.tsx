import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { SelectableValue } from '@grafana/data';
import { Modal, Select, VerticalGroup, FileDropzone, Button, HorizontalGroup, InlineField } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';

import { FileDropzoneCustomChildren } from '../../dimensions/editors/FileUploader';

import { loadCsvEntries } from './state/actions';

export interface OwnProps {
  isOpen: boolean;
  onCancel: (open: boolean) => void;
}

const ObjectTypes: Array<SelectableValue<string>> = [
  {
    label: 'Inventories',
    value: 'Inventories',
  },
  {
    label: 'Assets',
    value: 'Resources',
  },
  {
    label: 'Groups',
    value: 'Groups',
  },
  {
    label: 'Connections',
    value: 'Connections',
  },
];

const FunctionTypes: Array<SelectableValue<string>> = [
  {
    label: 'Create',
    value: 'create',
  },
];

interface ErrorResponse {
  message: string;
}

export const Upload = ({ isOpen, onCancel, loadCsvEntries }: Props) => {
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [error, setError] = useState<ErrorResponse>({} as ErrorResponse);
  const [uploaded, setUploaded] = useState<ErrorResponse>({} as ErrorResponse);
  const [object, setObject] = useState<string>('');
  const [operation, setOperation] = useState<string>('');
  const canCreate = contextSrv.hasPermission('fileloaders.csv:create');

  const onSubmit = () => {
    formData.append('object', object);
    formData.append('operation', operation);
    setError({} as ErrorResponse);
    setUploaded({} as ErrorResponse);
    fetch('/api/csventries', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (res.status >= 400) {
          res.json().then((data) => setError(data));
          loadCsvEntries();
          onCancel(false);
          return;
        }
        res.json().then((data) => setUploaded(data));
        loadCsvEntries();
        onCancel(false);
        return res.json();
      })
      .catch((err) => console.error(err));
  };

  return (
    <Modal
      title="Upload csv files"
      icon="upload-files"
      isOpen={isOpen}
      closeOnEscape={true}
      onDismiss={() => {
        onCancel(false);
      }}
      onClickBackdrop={() => {
        onCancel(false);
      }}
      iconTooltip="upload file"
    >
      <VerticalGroup spacing="xs">
        <HorizontalGroup>
          <InlineField label="Object">
            <Select
              width={30}
              onChange={(value) => {
                setObject(value.value ? value.value : '');
              }}
              options={ObjectTypes}
            />
          </InlineField>
          <InlineField label="Function">
            <Select
              width={30}
              onChange={(value) => {
                setOperation(value.value ? value.value : '');
              }}
              options={FunctionTypes}
            />
          </InlineField>
        </HorizontalGroup>
        <FileDropzone
          readAs="readAsBinaryString"
          options={{
            accept: ['.csv'],
            multiple: false,
            onDrop: (acceptedFiles: File[]) => {
              let formData = new FormData();
              formData.append('file', acceptedFiles[0]);
              setFormData(formData);
            },
          }}
        >
          {error && error.message && error.message !== '' && (
            <p style={{ color: 'red', textAlign: 'center' }}>{error.message}</p>
          )}
          {uploaded && uploaded.message && uploaded.message !== '' && (
            <p style={{ color: 'green', textAlign: 'center' }}>Uploaded</p>
          )}
          <FileDropzoneCustomChildren />
        </FileDropzone>
      </VerticalGroup>
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
          disabled={!canCreate}
        >
          Submit
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};

const mapDispatchToProps = {
  loadCsvEntries,
};

const connector = connect(null, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(Upload);
