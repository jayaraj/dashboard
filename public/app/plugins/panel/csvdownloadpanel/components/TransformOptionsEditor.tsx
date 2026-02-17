import React, { useState, useEffect } from 'react';

import { StandardEditorProps, SelectableValue } from '@grafana/data';
import { Input, InlineFieldRow, InlineField, Select, Button, IconButton } from '@grafana/ui';

import { CsvDownloadOptions, TransformOptions, SortByOption, FieldRename, FieldTypeConversion } from '../types';

interface Props extends StandardEditorProps<TransformOptions, CsvDownloadOptions> {}

interface FieldNameInfo {
  name: string;
}

export const TransformOptionsEditor: React.FC<Props> = ({ value, onChange, context }) => {
  const [fieldOptions, setFieldOptions] = useState<FieldNameInfo[]>([]);
  
  // Sort options
  const [sortField, setSortField] = useState<string>(value?.sortBy?.field || '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(value?.sortBy?.order || 'asc');
  
  // Rename options
  const [renameFields, setRenameFields] = useState<FieldRename[]>(value?.renameFields || []);
  
  // Type conversion options
  const [convertTypes, setConvertTypes] = useState<FieldTypeConversion[]>(value?.convertTypes || []);

  // Extract field names from data when context changes
  // Use field.name (actual field name) instead of display name for proper matching in transformations
  useEffect(() => {
    if (context?.data) {
      const allNames: FieldNameInfo[] = [];
      const byName: Record<string, FieldNameInfo> = {};

      for (const frame of context.data) {
        for (const field of frame.fields) {
          // Use field.name (actual internal name) for matching
          const fieldName = field.name;
          if (!byName[fieldName]) {
            byName[fieldName] = { name: fieldName };
            allNames.push(byName[fieldName]);
          }
        }
      }

      setFieldOptions(allNames);
    }
  }, [context?.data]);

  const updateOptions = (
    newSortBy?: SortByOption,
    newRenameFields?: FieldRename[],
    newConvertTypes?: FieldTypeConversion[]
  ) => {
    const opts: TransformOptions = {
      sortBy: newSortBy !== undefined ? newSortBy : (sortField ? { field: sortField, order: sortOrder } : undefined),
      renameFields: newRenameFields !== undefined ? newRenameFields : renameFields,
      convertTypes: newConvertTypes !== undefined ? newConvertTypes : convertTypes,
    };
    
    // Remove undefined/empty values
    if (!opts.sortBy?.field) delete opts.sortBy;
    if (!opts.renameFields?.length) delete opts.renameFields;
    if (!opts.convertTypes?.length) delete opts.convertTypes;
    
    onChange(Object.keys(opts).length ? opts : undefined);
  };

  const onSortFieldChange = (val: SelectableValue<string>) => {
    const newField = val.value || '';
    setSortField(newField);
    updateOptions(newField ? { field: newField, order: sortOrder } : undefined);
  };

  const onSortOrderChange = (val: SelectableValue<'asc' | 'desc'>) => {
    const newOrder = val.value || 'asc';
    setSortOrder(newOrder);
    if (sortField) {
      updateOptions({ field: sortField, order: newOrder });
    }
  };

  const onAddRenameField = () => {
    const newRenames = [...renameFields, { from: '', to: '' }];
    setRenameFields(newRenames);
    updateOptions(undefined, newRenames);
  };

  const onRemoveRenameField = (index: number) => {
    const newRenames = renameFields.filter((_, i) => i !== index);
    setRenameFields(newRenames);
    updateOptions(undefined, newRenames);
  };

  const onRenameFieldChange = (index: number, key: 'from' | 'to', val: string) => {
    const newRenames = [...renameFields];
    newRenames[index] = { ...newRenames[index], [key]: val };
    setRenameFields(newRenames);
    updateOptions(undefined, newRenames);
  };

  const onAddConvertType = () => {
    const newConverts = [...convertTypes, { field: '', type: 'string' as const }];
    setConvertTypes(newConverts);
    updateOptions(undefined, undefined, newConverts);
  };

  const onRemoveConvertType = (index: number) => {
    const newConverts = convertTypes.filter((_, i) => i !== index);
    setConvertTypes(newConverts);
    updateOptions(undefined, undefined, newConverts);
  };

  const onConvertTypeChange = (index: number, key: 'field' | 'type', val: string) => {
    const newConverts = [...convertTypes];
    newConverts[index] = { ...newConverts[index], [key]: val as any };
    setConvertTypes(newConverts);
    updateOptions(undefined, undefined, newConverts);
  };

  const fieldSelectOptions = fieldOptions.map((f) => ({ label: f.name, value: f.name }));
  const typeSelectOptions = [
    { label: 'String', value: 'string' },
    { label: 'Number', value: 'number' },
    { label: 'Time', value: 'time' },
    { label: 'Boolean', value: 'boolean' },
  ];
  const sortOrderOptions: SelectableValue<'asc' | 'desc'>[] = [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' },
  ];

  return (
    <div>
      {/* Sort Section */}
      <div style={{ marginBottom: '16px' }}>
        <h6 style={{ marginBottom: '8px' }}>Sort By</h6>
        <InlineFieldRow>
          <InlineField label="Field" grow>
            <Select
              value={sortField}
              options={fieldSelectOptions}
              onChange={onSortFieldChange}
              placeholder="Select field to sort by"
              isClearable
            />
          </InlineField>
          {sortField && (
            <InlineField label="Order">
              <Select
                value={sortOrder}
                options={sortOrderOptions}
                onChange={onSortOrderChange}
              />
            </InlineField>
          )}
        </InlineFieldRow>
      </div>

      {/* Rename Fields Section */}
      <div style={{ marginBottom: '16px' }}>
        <h6 style={{ marginBottom: '8px' }}>Rename Fields</h6>
        {renameFields.map((rename, index) => (
          <InlineFieldRow key={index} style={{ marginBottom: '4px' }}>
            <InlineField label="From">
              <Select
                value={rename.from}
                options={fieldSelectOptions}
                onChange={(val) => onRenameFieldChange(index, 'from', val.value || '')}
                placeholder="Field name"
              />
            </InlineField>
            <InlineField label="To">
              <Input
                value={rename.to}
                onChange={(e) => onRenameFieldChange(index, 'to', e.currentTarget.value)}
                placeholder="New name"
              />
            </InlineField>
            <IconButton name="trash-alt" onClick={() => onRemoveRenameField(index)} tooltip="Remove" />
          </InlineFieldRow>
        ))}
        <Button variant="secondary" size="sm" onClick={onAddRenameField} icon="plus">
          Add Rename
        </Button>
      </div>

      {/* Type Conversion Section */}
      <div style={{ marginBottom: '16px' }}>
        <h6 style={{ marginBottom: '8px' }}>Convert Field Types</h6>
        {convertTypes.map((convert, index) => (
          <InlineFieldRow key={index} style={{ marginBottom: '4px' }}>
            <InlineField label="Field">
              <Select
                value={convert.field}
                options={fieldSelectOptions}
                onChange={(val) => onConvertTypeChange(index, 'field', val.value || '')}
                placeholder="Field name"
              />
            </InlineField>
            <InlineField label="To Type">
              <Select
                value={convert.type}
                options={typeSelectOptions}
                onChange={(val) => onConvertTypeChange(index, 'type', val.value || 'string')}
              />
            </InlineField>
            <IconButton name="trash-alt" onClick={() => onRemoveConvertType(index)} tooltip="Remove" />
          </InlineFieldRow>
        ))}
        <Button variant="secondary" size="sm" onClick={onAddConvertType} icon="plus">
          Add Conversion
        </Button>
      </div>
    </div>
  );
};
