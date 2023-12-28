import { css } from '@emotion/css';
import React, { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import {
  Column,
  CellProps,
  DeleteButton,
  Badge,
  Button,
  FilterInput,
  InlineField,
  Pagination,
  useStyles2,
  Stack,
  Tooltip,
  InteractiveTable,
} from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { Page } from 'app/core/components/Page/Page';
import { contextSrv } from 'app/core/services/context_srv';
import { StoreState } from 'app/types';
import { CsvEntry, csvEntriesPageLimit } from 'app/types/devicemanagement/fileloader';

import Upload from './Upload';
import { changeCsvEntriesPage, changeCsvEntriesQuery, deleteCsvEntry, loadCsvEntries } from './state/actions';
import {
  getCsvEntriesSearchQuery,
  getCsvEntries,
  getCsvEntriesCount,
  getCsvEntriesSearchPage,
} from './state/selectors';

type Cell<T extends keyof CsvEntry = keyof CsvEntry> = CellProps<CsvEntry, CsvEntry[T]>;
export interface OwnProps {}
const skeletonData: CsvEntry[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  updated_at: '',
  filename: '',
  initiated: 0,
  processed: 0,
  errors: 0,
}));

export const CsvEntryList = ({
  csvEntries,
  csvEntriesCount,
  searchQuery,
  searchPage,
  hasFetched,
  loadCsvEntries,
  deleteCsvEntry,
  changeQuery,
  changePage,
}: Props) => {
  const styles = useStyles2(getStyles);
  const totalPages = Math.ceil(csvEntriesCount / csvEntriesPageLimit);
  const [noCsvEntries, setNoCsvEntries] = useState<boolean>(true);
  const [upload, setUpload] = useState<boolean>(false);

  useEffect(() => {
    loadCsvEntries();
  }, [loadCsvEntries]);

  useEffect(() => {
    if (csvEntries.length !== 0 && noCsvEntries) {
      setNoCsvEntries(false);
    }
  }, [csvEntries]);

  const columns: Array<Column<CsvEntry>> = useMemo(
    () => [
      {
        id: 'filename',
        header: 'File',
        cell: ({ cell: { value } }: Cell<'filename'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'initiated',
        header: 'No of Loaded Records',
        cell: ({ cell: { value } }: Cell<'initiated'>) => {
          if (!hasFetched) {
            return <Skeleton width={60} />;
          }
          return value;
        },
        sortType: 'number',
      },
      {
        id: 'processed',
        header: 'No of Processed records',
        disableGrow: true,
        cell: ({ cell: { value } }: Cell<'processed'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return value;
        },
        sortType: 'number',
      },
      {
        id: 'updated_at',
        header: 'Created',
        cell: ({ cell: { value } }: Cell<'updated_at'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return (
            <div className={styles.text}>{value.startsWith('0001') ? '-' : value.slice(0, 19).replace('T', ' ')}</div>
          );
        },
        sortType: 'string',
      },
      {
        id: 'actions',
        header: '',
        disableGrow: true,
        cell: ({ row: { original } }: Cell) => {
          if (!hasFetched) {
            return (
              <Stack direction="row" justifyContent="flex-end" alignItems="center">
                <Skeleton containerClassName={styles.blockSkeleton} width={30} height={24} />
                <Skeleton containerClassName={styles.blockSkeleton} width={22} height={24} />
              </Stack>
            );
          }
          const errorsUrl = original.errors > 0 ? `/csventries/${original.id}/errors` : `#`;
          const canDelete = contextSrv.hasPermission('fileloaders.csv:delete');

          return (
            <Stack direction="row" justifyContent="flex-end">
              <Tooltip content={`Errors`}>
                {original.initiated > original.processed ? (
                  <Badge key="errors" color="blue" icon="hourglass" text="processing" />
                ) : original.errors > 0 ? (
                  <a href={errorsUrl} aria-label={`Errors`}>
                    <Badge
                      key="errors"
                      color="red"
                      icon="exclamation-circle"
                      text={`${original.errors} errors`}
                      tooltip={`${original.errors} errors`}
                    />
                  </a>
                ) : (
                  <Badge key="errors" color="green" icon="check" text="completed" />
                )}
              </Tooltip>
              <DeleteButton
                aria-label={`Delete ${original.filename}`}
                size="sm"
                disabled={!canDelete}
                onConfirm={() => deleteCsvEntry(original.id)}
              />
            </Stack>
          );
        },
      },
    ],
    [hasFetched, deleteCsvEntry, styles]
  );

  return (
    <Page
      navId="csventries"
      actions={
        <Button onClick={() => setUpload(true)} disabled={!contextSrv.hasPermission('fileloaders.csv:create')}>
          Upload csv
        </Button>
      }
    >
      <Page.Contents isLoading={!hasFetched}>
        {noCsvEntries ? (
          <>
            <EmptyListCTA
              title={`No entries are available.`}
              buttonIcon="upload-files"
              onClick={() => setUpload(true)}
              buttonTitle={`Upload csv`}
              buttonDisabled={!contextSrv.hasPermission('fileloaders.csv:create')}
            />
            <Upload isOpen={upload} onCancel={(open: boolean) => setUpload(open)} />
          </>
        ) : (
          <>
            <div className="page-action-bar">
              <InlineField grow>
                <FilterInput placeholder={`Search files`} value={searchQuery} onChange={changeQuery} />
              </InlineField>
            </div>
            <Stack direction={'column'} gap={2}>
              <InteractiveTable
                columns={columns}
                data={hasFetched ? csvEntries : skeletonData}
                getRowId={(csvEntry) => String(csvEntry.id)}
              />
              <Stack justifyContent="flex-end">
                <Pagination
                  hideWhenSinglePage
                  currentPage={searchPage}
                  numberOfPages={totalPages}
                  onNavigate={changePage}
                />
              </Stack>
            </Stack>
            <Upload isOpen={upload} onCancel={(open: boolean) => setUpload(open)} />
          </>
        )}
      </Page.Contents>
    </Page>
  );
};

function mapStateToProps(state: StoreState) {
  return {
    csvEntries: getCsvEntries(state.csvEntries),
    searchQuery: getCsvEntriesSearchQuery(state.csvEntries),
    searchPage: getCsvEntriesSearchPage(state.csvEntries),
    csvEntriesCount: getCsvEntriesCount(state.csvEntries),
    hasFetched: state.csvEntries.hasFetched,
  };
}

const mapDispatchToProps = {
  loadCsvEntries,
  deleteCsvEntry,
  changeQuery: changeCsvEntriesQuery,
  changePage: changeCsvEntriesPage,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(CsvEntryList);

const getStyles = (theme: GrafanaTheme2) => ({
  blockSkeleton: css({
    lineHeight: 1,
    display: 'flex',
  }),
  text: css`
    position: relative;
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    flex-shrink: 0;
    gap: 6px;
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.size.sm};
  `,
});
