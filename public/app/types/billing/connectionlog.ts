export const connectionLogPageLimit = 50;

export interface ConnectionLog {
  id: number;
  updated_at: string;
  connection_ext: number;
  connection_id: number;
  status: string;
  comments: string;
  login: string;
}

export interface ConnectionLogsState {
  connectionLogs: ConnectionLog[];
  connectionLogsCount: number;
  searchPage: number;
  hasFetched: boolean;
}