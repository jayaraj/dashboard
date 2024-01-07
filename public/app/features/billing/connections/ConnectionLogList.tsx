import React, { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { connect, ConnectedProps } from 'react-redux';

import { Column, CellProps, Pagination, Stack, CallToActionCard, Select, InteractiveTable } from '@grafana/ui';
import PageLoader from 'app/core/components/PageLoader/PageLoader';
import { StoreState } from 'app/types';
import { ConnectionLog, connectionLogsPageLimit, connectionStatusTypes } from 'app/types/billing/connection';

import { changeConnectionLogsPage, loadConnectionLogs } from './state/actions';
import { getConnectionLogsSearchPage, getConnectionLogs, getConnectionLogsCount } from './state/selectors';

type Cell<T extends keyof ConnectionLog = keyof ConnectionLog> = CellProps<ConnectionLog, ConnectionLog[T]>;
export interface OwnProps {}

const skeletonData: ConnectionLog[] = new Array(3).fill(null).map((_, index) => ({
  id: index,
  updated_at: '',
  connection_ext: 0,
  connection_id: 0,
  status: '',
  comments: '',
  login: '',
}));

export const ConnectionLogList = ({
  connectionLogs,
  connectionLogsCount,
  searchPage,
  hasFetched,
  loadConnectionLogs,
  changePage,
}: Props) => {
  const totalPages = Math.ceil(connectionLogsCount / connectionLogsPageLimit);
  const [noConnectionLogs, setNoConnectionLogs] = useState<boolean>(true);

  useEffect(() => {
    loadConnectionLogs();
  }, []);

  useEffect(() => {
    if (connectionLogs.length !== 0 && noConnectionLogs) {
      setNoConnectionLogs(false);
    }
  }, [connectionLogs]);

  const columns: Array<Column<ConnectionLog>> = useMemo(
    () => [
      {
        id: 'updated_at',
        header: 'Date',
        cell: ({ cell: { value } }: Cell<'updated_at'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value ? value.split('T')[0] : '';
        },
        sortType: 'string',
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ cell: { value } }: Cell<'status'>) => {
          if (!hasFetched) {
            return <Skeleton width={40} />;
          }
          return <Select value={value} options={connectionStatusTypes} disabled={true} onChange={() => {}} />;
        },
      },
      {
        id: 'comments',
        header: 'Comments',
        cell: ({ cell: { value } }: Cell<'comments'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value;
        },
        sortType: 'string',
      },
      {
        id: 'login',
        header: 'Updated By',
        cell: ({ cell: { value } }: Cell<'login'>) => {
          if (!hasFetched) {
            return <Skeleton width={100} />;
          }
          return value;
        },
        sortType: 'string',
      },
    ],
    [hasFetched]
  );

  if (!hasFetched) {
    return <PageLoader />;
  }
  if (noConnectionLogs) {
    return (
      <>
        <CallToActionCard callToActionElement={<div />} message={`No logs are available.`} />
      </>
    );
  }
  return (
    <>
      <Stack direction={'column'} gap={2}>
        <InteractiveTable
          columns={columns}
          data={hasFetched ? connectionLogs : skeletonData}
          getRowId={(connectionLog) => String(connectionLog.id)}
        />
        <Stack justifyContent="flex-end">
          <Pagination hideWhenSinglePage currentPage={searchPage} numberOfPages={totalPages} onNavigate={changePage} />
        </Stack>
      </Stack>
    </>
  );
};

function mapStateToProps(state: StoreState) {
  return {
    connectionLogs: getConnectionLogs(state.connectionLogs),
    searchPage: getConnectionLogsSearchPage(state.connectionLogs),
    connectionLogsCount: getConnectionLogsCount(state.connectionLogs),
    hasFetched: state.connectionLogs.hasFetched,
  };
}
const mapDispatchToProps = {
  loadConnectionLogs: loadConnectionLogs,
  changePage: changeConnectionLogsPage,
};
const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;
export default connector(ConnectionLogList);
