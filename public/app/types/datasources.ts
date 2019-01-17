import { LayoutMode } from '../core/components/LayoutSelector/LayoutSelector';
import { Plugin, PluginMeta } from './plugins';
import { PluginExports } from '@grafana/ui';

export interface DataSource {
  id: number;
  orgId: number;
  name: string;
  typeLogoUrl: string;
  type: string;
  access: string;
  url: string;
  password: string;
  user: string;
  database: string;
  basicAuth: boolean;
  basicAuthPassword: string;
  basicAuthUser: string;
  isDefault: boolean;
  jsonData: { authType: string; defaultRegion: string };
  readOnly: boolean;
  withCredentials: boolean;
  meta?: PluginMeta;
  pluginExports?: PluginExports;
}

export interface DataSourceSelectItem {
  name: string;
  value: string | null;
  meta: PluginMeta;
  sort: string;
}

export interface DataSourcesState {
  dataSources: DataSource[];
  searchQuery: string;
  dataSourceTypeSearchQuery: string;
  layoutMode: LayoutMode;
  dataSourcesCount: number;
  dataSourceTypes: Plugin[];
  dataSource: DataSource;
  dataSourceMeta: Plugin;
  hasFetched: boolean;
}
