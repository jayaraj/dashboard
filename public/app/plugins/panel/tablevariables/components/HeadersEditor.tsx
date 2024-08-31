import React, { ChangeEvent, useState } from 'react';

import { StandardEditorProps } from '@grafana/data';
import {
  Button,
  ButtonGroup,
  CollapsableSection,
  IconButton,
  InlineField,
  InlineFieldRow,
  Input,
} from '@grafana/ui';

import { Header, HeaderDefault } from '../types';
import { MoveHeaders } from '../utils';

interface Props extends StandardEditorProps<Header[]> {}

export const HeadersEditor: React.FC<Props> = ({ value: headers, onChange }) => {

  const [newHeader, setNewHeader] = useState(HeaderDefault);
  
  if (!headers || !headers.length) {
    headers = [];
  }

  const onHeaderRemove = (id: string) => {
    const updated = headers.filter((e) => e.id !== id);
    onChange(updated);
  };

  const onHeaderAdd = () => {
    const updated = [...headers, newHeader];
    onChange(updated);
    setNewHeader(HeaderDefault);
  };

  return (
    <div>
      {headers.map((header, id) => (
        <CollapsableSection
          key={id}
          label={
            <ButtonGroup>
              {id > 0 && (
                <IconButton
                  name="arrow-up"
                  tooltip="Move Up"
                  onClick={(event) => {
                    MoveHeaders(headers, id, id - 1);
                    onChange(headers);
                    event.stopPropagation();
                  }}
                />
              )}
              {id < headers.length - 1 && (
                <IconButton
                  name="arrow-down"
                  tooltip="Move Down"
                  onClick={(event) => {
                    MoveHeaders(headers, id, id + 1);
                    onChange(headers);
                    event.stopPropagation();
                  }}
                />
              )}
              {header.title} [{header.id}]
            </ButtonGroup>
          }
          isOpen={false}
        >
          <InlineFieldRow>
            <InlineField label="Id" grow labelWidth={8} invalid={header.id === ''}>
              <Input
                placeholder="Id"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  header.id = event.target.value;
                  onChange(headers);
                }}
                value={header.id}
              />
            </InlineField>

            <Button variant="destructive" onClick={(e) => onHeaderRemove(header.id)} icon="trash-alt"></Button>
          </InlineFieldRow>

          <InlineFieldRow>
            <InlineField label="Label" grow labelWidth={8} invalid={header.title === ''}>
              <Input
                placeholder="Label"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  header.title = event.target.value;
                  onChange(headers);
                }}
                value={header.title}
              />
            </InlineField>
          </InlineFieldRow>

          <InlineFieldRow>
            <InlineField label="Width" grow labelWidth={8}>
              <Input 
                value={header.width} 
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  header.width = Number(event.target.value);
                  onChange(headers);
                }}
                type="number"
              />
            </InlineField>
          </InlineFieldRow>
        </CollapsableSection>
      ))}

      <hr />
      <CollapsableSection label="New Header" isOpen={true}>
        <InlineField label="Id" grow labelWidth={8} invalid={newHeader.id === ''}>
          <Input
            placeholder="Id"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setNewHeader({ ...newHeader, id: event.target.value });
            }}
            value={newHeader.id}
          />
        </InlineField>

        <InlineField label="Label" grow labelWidth={8} invalid={newHeader.title === ''}>
          <Input
            placeholder="Label"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setNewHeader({ ...newHeader, title: event.target.value });
            }}
            value={newHeader.title}
          />
        </InlineField>

        <InlineField label="Width" grow labelWidth={8} invalid={newHeader.width >= -1}>
          <Input
            placeholder="Width"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setNewHeader({ ...newHeader, width: Number(event.target.value) });
            }}
            value={newHeader.width}
          />
        </InlineField>

        <Button
          variant="secondary"
          onClick={(e) => onHeaderAdd()}
          disabled={!!!newHeader.id || !!!newHeader.title}
          icon="plus"
        >
          Add Header
        </Button>
      </CollapsableSection>
    </div>
  );
};
