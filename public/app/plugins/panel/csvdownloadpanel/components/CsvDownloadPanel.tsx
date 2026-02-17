import { saveAs } from 'file-saver';
import React, { useState, useRef } from 'react';
import { lastValueFrom, isObservable } from 'rxjs';

import {
  PanelProps,
  dateTimeFormat,
  toCSV,
  DataFrame,
  CSVConfig,
  DataQueryRequest,
  CoreApp,
  FieldType,
  getFieldDisplayName,
  stringToJsRegex,
} from '@grafana/data';
import { getTemplateSrv, getDataSourceSrv } from '@grafana/runtime';
import { Button, useTheme2, Icon, Tooltip } from '@grafana/ui';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';

import { Query } from '../../../datasource/grafoservice/types';
import { CsvDownloadOptions, getStyles, FieldFilterOptions, TransformOptions } from '../types';

interface Props extends PanelProps<CsvDownloadOptions> {}

export const CsvDownloadPanel: React.FC<Props> = ({ id, options, data, height, timeRange }) => {
  const theme = useTheme2();
  const styles = getStyles(height, theme);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Ref to prevent duplicate download calls
  const isDownloadingRef = useRef(false);

  const PER_PAGE = options.perPage || 100;

  // Apply field filtering to a dataframe
  const applyFieldFilter = (dataFrame: DataFrame, filter?: FieldFilterOptions): DataFrame => {
    if (!filter || (!filter.fieldNames?.length && !filter.pattern)) {
      return dataFrame;
    }

    const fieldsToInclude: string[] = [];

    if (filter.pattern) {
      // Use regex pattern for filtering
      try {
        const regex = stringToJsRegex(filter.pattern);
        for (const field of dataFrame.fields) {
          const fieldName = getFieldDisplayName(field, dataFrame);
          const matches = regex.test(fieldName);
          if ((filter.mode === 'include' && matches) || (filter.mode === 'exclude' && !matches)) {
            fieldsToInclude.push(field.name);
          }
        }
      } catch (e) {
        console.error('Invalid regex pattern:', e);
        return dataFrame;
      }
    } else {
      // Use field names list for filtering
      for (const field of dataFrame.fields) {
        const fieldName = getFieldDisplayName(field, dataFrame);
        const isInList = filter.fieldNames.includes(fieldName);
        if ((filter.mode === 'include' && isInList) || (filter.mode === 'exclude' && !isInList)) {
          fieldsToInclude.push(field.name);
        }
      }
    }

    // Create new dataframe with filtered fields
    const filteredFields = dataFrame.fields.filter((f) => fieldsToInclude.includes(f.name));

    return {
      ...dataFrame,
      fields: filteredFields,
    };
  };

  // Merge multiple dataframes into one, matching fields by name (not position)
  const mergeDataFrames = (dataFrames: DataFrame[]): DataFrame => {
    if (dataFrames.length === 0) {
      return { fields: [], length: 0 };
    }
    
    if (dataFrames.length === 1) {
      return dataFrames[0];
    }

    // Use the first frame's structure as template
    const firstFrame = dataFrames[0];
    
    // Merge all field values by matching field names
    const mergedFields = firstFrame.fields.map((field) => {
      const fieldName = field.name;
      // Start with values from first frame
      const allValues: any[] = [...field.values];
      
      // Collect values from all other frames for the same field BY NAME
      for (let i = 1; i < dataFrames.length; i++) {
        const frame = dataFrames[i];
        // Find matching field by name (not by index position)
        const matchingField = frame.fields.find((f) => f.name === fieldName);
        if (matchingField && matchingField.values) {
          allValues.push(...matchingField.values);
        }
      }
      
      return {
        ...field,
        values: allValues,
      };
    });

    return {
      ...firstFrame,
      fields: mergedFields,
      length: mergedFields[0]?.values.length || 0,
    };
  };

  // Apply transformations to a dataframe
  const applyTransformations = (dataFrame: DataFrame, transforms?: TransformOptions): DataFrame => {
    if (!transforms) {
      return dataFrame;
    }

    // Deep copy the fields array and each field object
    const fieldsCopy = dataFrame.fields.map((f) => ({
      ...f,
      values: [...f.values],
      config: f.config ? { ...f.config } : {},
    }));

    const transformedFields = [...fieldsCopy];

    // Apply field renames - match by either field.name or displayName since editor uses getFieldDisplayName
    if (transforms.renameFields?.length) {
      for (const rename of transforms.renameFields) {
        if (rename.from && rename.to) {
          // Find field by name or display name (the editor uses getFieldDisplayName which may differ from field.name)
          const fieldIndex = transformedFields.findIndex((f) => {
            const displayName = getFieldDisplayName(f, dataFrame);
            return f.name === rename.from || displayName === rename.from;
          });
          
          if (fieldIndex >= 0) {
            // Update the field name - this will be the CSV column header
            transformedFields[fieldIndex] = {
              ...transformedFields[fieldIndex],
              name: rename.to,
              config: {
                ...transformedFields[fieldIndex].config,
                displayName: rename.to,
              },
            };
          }
        }
      }
    }

    // Apply type conversions
    if (transforms.convertTypes?.length) {
      for (const convert of transforms.convertTypes) {
        if (convert.field && convert.type) {
          const fieldIndex = transformedFields.findIndex((f) => f.name === convert.field);
          
          if (fieldIndex >= 0) {
            const field = transformedFields[fieldIndex];
            const newValues = field.values.map((v: any) => {
              switch (convert.type) {
                case 'string':
                  return String(v ?? '');
                case 'number':
                  return Number(v);
                case 'boolean':
                  return Boolean(v);
                case 'time':
                  if (typeof v === 'string' || typeof v === 'number') {
                    return new Date(v).getTime();
                  }
                  return v;
                default:
                  return v;
              }
            });

            let newType = FieldType.string;
            switch (convert.type) {
              case 'number':
                newType = FieldType.number;
                break;
              case 'boolean':
                newType = FieldType.boolean;
                break;
              case 'time':
                newType = FieldType.time;
                break;
            }

            transformedFields[fieldIndex] = {
              ...field,
              values: newValues,
              type: newType,
            };
          }
        }
      }
    }

    return {
      ...dataFrame,
      fields: transformedFields,
    };
  };

  // Apply sorting to dataframes
  const applySorting = (dataFrames: DataFrame[], sortBy?: { field: string; order: 'asc' | 'desc' }): DataFrame[] => {
    if (!sortBy?.field) {
      return dataFrames;
    }

    // For sorting, we need to merge all dataframes into one, sort, then potentially split
    // For simplicity, we'll sort each dataframe individually
    return dataFrames.map((frame) => {
      const fieldIndex = frame.fields.findIndex((f) => {
        const displayName = getFieldDisplayName(f, frame);
        return displayName === sortBy.field || f.name === sortBy.field;
      });

      if (fieldIndex < 0) {
        return frame;
      }

      const sortField = frame.fields[fieldIndex];
      const indices = Array.from({ length: sortField.values.length }, (_, i) => i);

      indices.sort((a, b) => {
        const valA = sortField.values[a];
        const valB = sortField.values[b];
        let comparison = 0;

        if (valA < valB) comparison = -1;
        if (valA > valB) comparison = 1;

        return sortBy.order === 'desc' ? -comparison : comparison;
      });

      // Reorder all fields based on sorted indices
      const sortedFields = frame.fields.map((field) => ({
        ...field,
        values: indices.map((i) => field.values[i]),
      }));

      return {
        ...frame,
        fields: sortedFields,
      };
    });
  };

  const fetchDataPage = async (page: number, scopedVars: Record<string, any>): Promise<DataFrame[]> => {
    const dataSourceSrv = getDataSourceSrv();
    const datasourceName = options.datasource;

    if (!datasourceName) {
      throw new Error('Datasource not configured. Please select a datasource in panel options.');
    }

    const ds = await dataSourceSrv.get(datasourceName);
    const templateSrv = getTemplateSrv();

    // Build query arguments with template variable replacement
    // Filter out existing page/perPage arguments as we'll add our own for pagination
    const excludedPageKeys = ['page', 'perPage', 'Page', 'PerPage'];
    const queryArguments = (options.queryArguments || [])
      .filter((arg) => excludedPageKeys.indexOf(arg.key) === -1)
      .map((arg) => ({
        key: arg.key,
        value: templateSrv.replace(arg.value, scopedVars),
      }));

    // Add pagination arguments
    queryArguments.push({ key: 'Page', value: String(page) });
    queryArguments.push({ key: 'PerPage', value: String(PER_PAGE) });

    // Get application and API from appApi object
    const appApi = options.appApi || { queryApplication: '', queryAPI: '' };

    const query: Query = {
      refId: 'A',
      queryApplication: appApi.queryApplication || '',
      queryAPI: appApi.queryAPI || '',
      queryArguments: queryArguments,
    };

    // Use the timeRange directly - pass raw values that dateMath.parse can handle
    // Ensure rangeRaw contains values that dateMath.parse can handle (strings or DateTime)
    const rangeRawFrom = typeof timeRange.raw.from === 'string' ? timeRange.raw.from : timeRange.from.toISOString();
    const rangeRawTo = typeof timeRange.raw.to === 'string' ? timeRange.raw.to : timeRange.to.toISOString();

    const request: DataQueryRequest<Query> = {
      requestId: `csvdownload-${id}-${page}`,
      targets: [query],
      range: timeRange,
      rangeRaw: {
        from: rangeRawFrom,
        to: rangeRawTo,
      },
      timezone: 'browser',
      interval: '1s',
      intervalMs: 1000,
      scopedVars: scopedVars,
      startTime: Date.now(),
      maxDataPoints: PER_PAGE,
      app: CoreApp.Dashboard,
    };

    const result = ds.query(request as any);

    // Handle both Observable and Promise responses
    const response = isObservable(result) ? await lastValueFrom(result) : await result;
    return response.data;
  };

  const downloadCsv = async () => {
    // Prevent duplicate calls by checking if already downloading
    if (downloading || isDownloadingRef.current) {
      return;
    }

    isDownloadingRef.current = true;
    setDownloading(true);
    setError(null);
    setProgress(0);
    setCurrentPage(0);
    setTotalRecords(0);

    const allDataFrames: DataFrame[] = [];
    let page = 1;
    let hasMoreData = true;
    let consecutiveEmptyPages = 0;
    const maxEmptyPages = 2; // Safety limit for consecutive empty pages
    let totalRecordCount = 0;

    try {
      // Get panel scoped variables for template replacement
      const panel = getDashboardSrv().getCurrent()?.getPanelById(id);
      const scopedVars = panel?.scopedVars || {};

      while (hasMoreData) {
        // Update progress before fetching
        setCurrentPage(page);
        setTotalRecords(totalRecordCount);
        setProgress(Math.min((page / (page + 10)) * 100, 95));

        const dataFrames = await fetchDataPage(page, scopedVars);

        if (!dataFrames || dataFrames.length === 0) {
          consecutiveEmptyPages++;
          if (consecutiveEmptyPages >= maxEmptyPages) {
            hasMoreData = false;
          } else {
            page++;
          }
          continue;
        }

        // Check if we have actual data in the dataframes
        let hasRecords = false;
        for (const df of dataFrames) {
          if (df.fields && df.fields.length > 0) {
            const fieldLength = df.fields[0].values.length;
            if (fieldLength > 0) {
              hasRecords = true;
              allDataFrames.push(df);
              totalRecordCount += fieldLength;
            }
          }
        }

        if (!hasRecords) {
          consecutiveEmptyPages++;
          if (consecutiveEmptyPages >= maxEmptyPages) {
            hasMoreData = false;
          }
        } else {
          consecutiveEmptyPages = 0;
        }

        // Safety limit: max 10000 pages (2 million records with 100 per page)
        if (page >= 10000) {
          hasMoreData = false;
        }

        page++;
      }

      if (allDataFrames.length === 0) {
        setError('No data found to download.');
        setDownloading(false);
        return;
      }

      // Apply field filtering to all dataframes
      let processedFrames = allDataFrames.map((frame) => applyFieldFilter(frame, options.fieldFilter));

      // Apply transformations to all dataframes
      processedFrames = processedFrames.map((frame) => applyTransformations(frame, options.transformations));

      // Apply sorting if configured
      if (options.transformations?.sortBy) {
        processedFrames = applySorting(processedFrames, options.transformations.sortBy);
      }

      // Merge all dataframes into one to avoid multiple headers in CSV
      // Only merge if they have the same field structure
      const mergedFrame = mergeDataFrames(processedFrames);

      // Format numbers to 3 decimal places before generating CSV
      const formattedFrame = {
        ...mergedFrame,
        fields: mergedFrame.fields.map((field) => {
          // Only format number fields
          if (field.type === FieldType.number) {
            return {
              ...field,
              values: field.values.map((v: any) => {
                if (v !== null && v !== undefined && !isNaN(v)) {
                  return Number(v).toFixed(3);
                }
                return v;
              }),
            };
          }
          return field;
        }),
      };

      // Generate CSV from merged dataframe
      const csvConfig: CSVConfig = { useExcelHeader: options.useExcelHeader };
      const csvContent = toCSV([formattedFrame], csvConfig);

      // Create and download the file
      const blob = new Blob([String.fromCharCode(0xfeff), csvContent], {
        type: 'text/csv;charset=utf-8',
      });

      const fileStr = getTemplateSrv().replace(options.filename || 'download', scopedVars || {});
      const fileName = `${fileStr}-${dateTimeFormat(new Date())}.csv`;

      saveAs(blob, fileName);
      setProgress(100);
    } catch (err: any) {
      console.error('CSV Download error:', err);
      setError(err.message || 'An error occurred while downloading data.');
    } finally {
      setDownloading(false);
      isDownloadingRef.current = false;
    }
  };

  return (
    <div className={styles.resultsContainer}>
      {error && (
        <Tooltip content={error} placement="left">
          <div className={styles.errorIcon}>
            <Icon name="exclamation-triangle" size="lg" />
          </div>
        </Tooltip>
      )}

      <div className={styles.wrapper}>
        <Button onClick={downloadCsv} disabled={downloading} variant="primary">
          {downloading ? 'Downloading...' : options.heading || 'Download CSV'}
        </Button>

        {downloading && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.progressText}>
              Fetching page {currentPage}... ({totalRecords} records)
            </div>
          </div>
        )}

        {!downloading && totalRecords > 0 && (
          <div className={styles.progressText}>Last download: {totalRecords} records</div>
        )}
      </div>
    </div>
  );
};
