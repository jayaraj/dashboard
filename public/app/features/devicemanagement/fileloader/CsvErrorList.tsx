import React, { useEffect, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { Column, CellProps, LinkButton, Pagination, Stack, InteractiveTable, TagList } from '@grafana/ui';
import { Page } from 'app/core/components/Page/Page';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { StoreState } from 'app/types';
import { CsvError, csvErrorsPageLimit } from 'app/types/devicemanagement/fileloader';

import { changeCsvErrorsPage, loadCsvErrors } from './state/actions';
import { getCsvErrors, getCsvErrorsCount, getCsvErrorsSearchPage } from './state/selectors';

type Cell<T extends keyof CsvError = keyof CsvError> = CellProps<CsvError, CsvError[T]>;
export interface OwnProps extends GrafanaRouteComponentProps<{ id: string }> {}
const skeletonData: CsvError[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  updated_at: '',
  csv_entry_id: 0,
  configuration: {},
  error: '',
}));

export const CsvErrorList = ({
  csvEntryId,
  csvErrors,
  csvErrorsCount,
  searchPage,
  hasFetched,
  loadCsvErrors,
  changePage,
}: Props) => {
  const totalPages = Math.ceil(csvErrorsCount / csvErrorsPageLimit);

  useEffect(() => {
    loadCsvErrors(csvEntryId);
  }, [loadCsvErrors]);

  const columns: Array<Column<CsvError>> = useMemo(
    () => [
      {
        id: 'error',
        header: 'Errors',
        cell: ({ cell: { value } }: Cell<'error'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'configuration',
        header: 'References',
        cell: ({ cell: { value } }: Cell<'configuration'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          const pairs = Object.entries(value);
          return <TagList tags={Object.values(pairs).map(([label, value]) => `${label}=${value}`)} />;
        },
      },
    ],
    [hasFetched]
  );

  return (
    <Page navId="csventries" actions={<LinkButton href="csventries/">Back</LinkButton>}>
      <Page.Contents isLoading={!hasFetched}>
        <Stack direction={'column'} gap={2}>
          <InteractiveTable
            columns={columns}
            data={hasFetched ? csvErrors : skeletonData}
            getRowId={(csvError) => String(csvError.id)}
          />
          <Stack justifyContent="flex-end">
            <Pagination
              hideWhenSinglePage
              currentPage={searchPage}
              numberOfPages={totalPages}
              onNavigate={(page) => changePage(csvEntryId, page)}
            />
          </Stack>
        </Stack>
      </Page.Contents>
    </Page>
  );
};

function mapStateToProps(state: StoreState, props: OwnProps) {
  return {
    csvEntryId: parseInt(props.match.params.id, 10),
    csvErrors: getCsvErrors(state.csvErrors),
    searchPage: getCsvErrorsSearchPage(state.csvErrors),
    csvErrorsCount: getCsvErrorsCount(state.csvErrors),
    hasFetched: state.csvErrors.hasFetched,
  };
}

const mapDispatchToProps = {
  loadCsvErrors,
  changePage: changeCsvErrorsPage,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(CsvErrorList);
