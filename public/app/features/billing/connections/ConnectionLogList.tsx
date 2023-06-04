import React, { FC, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { CallToActionCard, Select, VerticalGroup, HorizontalGroup, Pagination } from '@grafana/ui';
import { ConnectionLog, StoreState, connectionLogPageLimit, connectionStatusTypes } from 'app/types';
import { loadConnectionLogs } from './state/actions';
import { getConnectionLogsSearchPage, getConnectionLogs, getConnectionLogsCount } from './state/selectors';

export interface OwnProps {
  connectionLogs: ConnectionLog[];
  connectionLogsCount: number;
  searchPage: number;
  hasFetched: boolean;
}

const mapDispatchToProps = {
  loadConnectionLogs: loadConnectionLogs
};

function mapStateToProps(state: StoreState) {
  return {
    connectionLogs: getConnectionLogs(state.connectionLogs),
    searchPage: getConnectionLogsSearchPage(state.connectionLogs),
    connectionLogsCount: getConnectionLogsCount(state.connectionLogs),
    hasFetched: state.connectionLogs.hasFetched
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
export type Props = OwnProps & ConnectedProps<typeof connector>;

export const ConnectionLogList: FC<Props> = ({
  connectionLogs, 
  connectionLogsCount,
  searchPage,
  hasFetched,
  loadConnectionLogs,
}) => {

  useEffect(() => {
    loadConnectionLogs(1);
  }, []);

  const renderLog = (log: ConnectionLog) => {
    return (
      <tr key={log.id}>
        <td className="link-td text-center">{log.updated_at.split("T")[0]}</td>
        <td className="link-td"><Select value={log.status} options={connectionStatusTypes} disabled={true} onChange={()=>{}} width={40}/></td>
        <td className="link-td">{log.comments}</td>
        <td className="link-td">{log.login}</td>
      </tr>
    );
  }

  const onNavigate = async (page: number) => {
    loadConnectionLogs(page);
  };

  const renderEmptyList = () => {
    return <CallToActionCard callToActionElement={<div />} message="No Logs found." />;
  }

  const renderConnectionLogList = () => {
    const totalPages = Math.ceil(connectionLogsCount / connectionLogPageLimit);
    return (
      <>
        <div className="admin-list-table">
          <VerticalGroup spacing="md">
            <table className="filter-table filter-table--hover form-inline">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Comments</th>
                  <th>Updated By</th>
                </tr>
              </thead>
              <tbody>{connectionLogs.map((log) => renderLog(log))}</tbody>
            </table>
            <HorizontalGroup justify="flex-end">
              <Pagination
                onNavigate={onNavigate}
                currentPage={searchPage}
                numberOfPages={totalPages}
                hideWhenSinglePage={true}
              />
            </HorizontalGroup>
          </VerticalGroup>
        </div>
      </>
    );
  }

  const renderList = () => {
    if (!hasFetched) {
      return null;
    }
    if (connectionLogsCount > 0) {
      return renderConnectionLogList();
    } else {
      return renderEmptyList();
    }
  }
  return renderList();
};

export default connector(ConnectionLogList);
