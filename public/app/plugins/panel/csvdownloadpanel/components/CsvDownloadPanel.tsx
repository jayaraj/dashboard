import { saveAs } from 'file-saver';
import React, { useState, useRef } from 'react';
import { lastValueFrom, isObservable } from 'rxjs';

import { PanelProps, dateTimeFormat, toCSV, DataFrame, CSVConfig, DataQueryRequest, CoreApp } from '@grafana/data';
import { getTemplateSrv, getDataSourceSrv } from '@grafana/runtime';
import { Button, useTheme2, Icon, Tooltip } from '@grafana/ui';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';

import { Query } from '../../../datasource/grafoservice/types';
import { CsvDownloadOptions, getStyles } from '../types';

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
    const progressUpdateInterval = 5; // Update progress every 5 pages to reduce re-renders

    try {
      // Get panel scoped variables for template replacement
      const panel = getDashboardSrv().getCurrent()?.getPanelById(id);
      const scopedVars = panel?.scopedVars || {};

      while (hasMoreData) {
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

        // Only update UI state periodically to reduce re-renders and improve speed
        if (page % progressUpdateInterval === 0 || !hasMoreData) {
          setCurrentPage(page);
          setTotalRecords(totalRecordCount);
          setProgress(Math.min((page / (page + 10)) * 100, 95));
        }

        page++;
      }

      if (allDataFrames.length === 0) {
        setError('No data found to download.');
        setDownloading(false);
        return;
      }

      // Generate CSV from all dataframes
      const csvConfig: CSVConfig = { useExcelHeader: options.useExcelHeader };
      const csvContent = toCSV(allDataFrames, csvConfig);

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
