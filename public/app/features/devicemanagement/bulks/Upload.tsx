import React, { FC, useState } from 'react';
import { connect, ConnectedProps, useDispatch} from 'react-redux';

import { SelectableValue } from '@grafana/data';
import {  Modal, Select, VerticalGroup, FileDropzone, Button } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { AccessControlAction} from 'app/types';

import { FileDropzoneCustomChildren } from '../../dimensions/editors/FileUploader';

import { loadBulks } from './state/actions';

export interface OwnProps {
  isOpen: boolean
  onCancel: (open: boolean) => void;
}

const ACTION_TYPES: Array<SelectableValue<string>> = [
  {
    label: 'Create inventories',
    value: 'inventory',
    description: `Upload a file for creating inventories`,
  },
  {
    label: 'Create assets under groups',
    value: 'resource',
    description: `Upload a file for creating resources with in groups`,
  },
  {
    label: 'Create groups',
    value: 'group',
    description: `Upload a file for creating groups`,
  },
];

interface ErrorResponse {
  message: string;
}

const mapDispatchToProps = {
  loadBulks
};

const connector = connect(null, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;


export const Upload: FC<Props> = ({ isOpen, onCancel, loadBulks }) => {
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [error, setError] = useState<ErrorResponse>({} as ErrorResponse);
  const [uploaded, setUploaded] = useState<ErrorResponse>({} as ErrorResponse);
  const [action, setAction] = useState<string>('');
  const fallback = contextSrv.hasRole('ServerAdmin');
  const canCreate = contextSrv.hasAccess(AccessControlAction.ActionBulksCreate, fallback);
  const dispatch = useDispatch();

  const onSubmit = () => {
    formData.append('action', action);
    setError({} as ErrorResponse);
    setUploaded({} as ErrorResponse);
    fetch('/api/bulks', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (res.status >= 400) {
          res.json().then((data) => setError(data));
          dispatch(loadBulks('', 1));
          return;
        } else {
          res.json().then((data) => setUploaded(data));
          dispatch(loadBulks('', 1));
          return res.json();
        }
      })
      .catch((err) => console.error(err));
  };


  return (
    <Modal 
    title="Upload csv files"
    icon="upload-files"
    isOpen={isOpen}
    closeOnEscape={true}
    onDismiss={() => {onCancel(false)}}
    onClickBackdrop={() => {onCancel(false)}}
    iconTooltip="upload file"
    >
      <VerticalGroup spacing="xs">
        <Select onChange={(value) => {setAction(value.value?value.value:'');}} options={ACTION_TYPES} />
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
          { error && error.message && error.message !== '' && (
            <p style={{ color: 'red', textAlign: 'center' }}>{error.message}</p>
          )}
          {uploaded && uploaded.message && uploaded.message !== '' && (
            <p style={{ color: 'green', textAlign: 'center' }}>Uploaded</p>
          )}
          <FileDropzoneCustomChildren />
        </FileDropzone>
      </VerticalGroup>
      <Modal.ButtonRow>
        <Button variant="secondary" onClick={() => {onCancel(false)}} fill="outline">
          Cancel
        </Button>
        <Button type="button" onClick={() => {onSubmit()}} variant="primary" disabled={!canCreate}>
          Submit
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};

export default connector(Upload);
