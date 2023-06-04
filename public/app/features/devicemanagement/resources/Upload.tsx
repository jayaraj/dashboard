import React, { FC, useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import {  Modal, VerticalGroup, FileDropzone, Button } from '@grafana/ui';
import { contextSrv } from 'app/core/services/context_srv';
import { AccessControlAction, Resource} from 'app/types';

import { FileDropzoneCustomChildren } from '../../dimensions/editors/FileUploader';

export interface OwnProps {
  resource: Resource;
  isOpen: boolean
  onCancel: (open: boolean) => void;
  onUpload: (location: string) => void;
}

interface ErrorResponse {
  message: string;
}

const mapDispatchToProps = {
};

const connector = connect(null, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const Upload: FC<Props> = ({ isOpen, onCancel, resource, onUpload }) => {
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [error, setError] = useState<ErrorResponse>({} as ErrorResponse);
  const [uploaded, setUploaded] = useState<ErrorResponse>({} as ErrorResponse);
  const canWrite = contextSrv.hasAccess(AccessControlAction.ActionResourcesWrite, contextSrv.user.isGrafanaAdmin);

  useEffect(() => {
    setUploaded({} as ErrorResponse);
    setError({} as ErrorResponse);
  }, [isOpen]);

  const onSubmit = () => {
    setError({} as ErrorResponse);
    setUploaded({} as ErrorResponse);
    fetch(`/api/storage/image`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (res.status === 200) {
          res.json().then((data) => onUpload(data.location));
          setUploaded({message : "Updated"});
          onCancel(false)
        }
        if (res.status >= 400) {
          res.json().then((data) => setError(data));
        }
        return;
      })
      .catch((err) => console.error(err));
  };

  return (
    <Modal 
    title="Upload Image files"
    icon="upload-files"
    isOpen={isOpen}
    closeOnEscape={true}
    onDismiss={() => {onCancel(false)}}
    onClickBackdrop={() => {onCancel(false)}}
    iconTooltip="upload file"
    >
      <VerticalGroup spacing="xs">
        <FileDropzone
          readAs="readAsBinaryString"
          options={{
            accept: { 'image/*': ['.jpeg', '.png'] },
            multiple: false,
            onDrop: (acceptedFiles: File[]) => {
              let formData = new FormData();
              const extension = acceptedFiles[0].name.substring(acceptedFiles[0].name.lastIndexOf('.'));
              const file = new File([acceptedFiles[0]], `r-${resource.id}${extension}`, { type: acceptedFiles[0].type });
              formData.append('file', file);
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
        <Button type="button" onClick={() => {onSubmit()}} variant="primary" disabled={!canWrite}>
          Submit
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};

export default connector(Upload);
