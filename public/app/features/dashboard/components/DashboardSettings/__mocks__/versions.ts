export const versions = [
  {
    id: 249,
    dashboardId: 74,
    parentVersion: 10,
    restoredFrom: 0,
    version: 11,
    created: '2021-01-15T14:44:44+01:00',
    createdBy: 'admin',
    message: 'testing changes...',
  },
  {
    id: 247,
    dashboardId: 74,
    parentVersion: 9,
    restoredFrom: 0,
    version: 10,
    created: '2021-01-15T10:19:17+01:00',
    createdBy: 'admin',
    message: '',
  },
  {
    id: 246,
    dashboardId: 74,
    parentVersion: 8,
    restoredFrom: 0,
    version: 9,
    created: '2021-01-15T10:18:12+01:00',
    createdBy: 'admin',
    message: '',
  },
  {
    id: 245,
    dashboardId: 74,
    parentVersion: 7,
    restoredFrom: 0,
    version: 8,
    created: '2021-01-15T10:11:16+01:00',
    createdBy: 'admin',
    message: '',
  },
  {
    id: 239,
    dashboardId: 74,
    parentVersion: 6,
    restoredFrom: 0,
    version: 7,
    created: '2021-01-14T15:14:25+01:00',
    createdBy: 'admin',
    message: '',
  },
  {
    id: 237,
    dashboardId: 74,
    parentVersion: 5,
    restoredFrom: 0,
    version: 6,
    created: '2021-01-14T14:55:29+01:00',
    createdBy: 'admin',
    message: '',
  },
  {
    id: 236,
    dashboardId: 74,
    parentVersion: 4,
    restoredFrom: 0,
    version: 5,
    created: '2021-01-14T14:28:01+01:00',
    createdBy: 'admin',
    message: '',
  },
  {
    id: 218,
    dashboardId: 74,
    parentVersion: 3,
    restoredFrom: 0,
    version: 4,
    created: '2021-01-08T10:45:33+01:00',
    createdBy: 'admin',
    message: '',
  },
  {
    id: 217,
    dashboardId: 74,
    parentVersion: 2,
    restoredFrom: 0,
    version: 3,
    created: '2021-01-05T15:41:33+01:00',
    createdBy: 'admin',
    message: '',
  },
  {
    id: 216,
    dashboardId: 74,
    parentVersion: 1,
    restoredFrom: 0,
    version: 2,
    created: '2021-01-05T15:01:50+01:00',
    createdBy: 'admin',
    message: '',
  },
  {
    id: 215,
    dashboardId: 74,
    parentVersion: 1,
    restoredFrom: 0,
    version: 1,
    created: '2021-01-05T14:59:15+01:00',
    createdBy: 'admin',
    message: '',
  },
];

export const diffs = {
  lhs: {
    data: {
      annotations: {
        list: [
          {
            builtIn: 1,
            datasource: '-- Datasource --',
            enable: true,
            hide: true,
            iconColor: 'rgba(0, 211, 255, 1)',
            name: 'Annotations & Alerts',
            type: 'dashboard',
          },
        ],
      },
      editable: true,
      gnetId: null,
      graphTooltip: 0,
      id: 141,
      links: [],
      panels: [
        {
          type: 'graph',
          id: 4,
        },
      ],
      schemaVersion: 27,
      style: 'dark',
      tags: ['the tag'],
      templating: {
        list: [],
      },
      time: {
        from: 'now-6h',
        to: 'now',
      },
      timepicker: {},
      timezone: '',
      title: 'test dashboard',
      uid: '_U4zObQMz',
      version: 2,
    },
  },
  rhs: {
    data: {
      annotations: {
        list: [
          {
            builtIn: 1,
            datasource: '-- Datasource --',
            enable: true,
            hide: true,
            iconColor: 'rgba(0, 211, 255, 1)',
            name: 'Annotations & Alerts',
            type: 'dashboard',
          },
        ],
      },
      description: 'The dashboard description',
      editable: true,
      gnetId: null,
      graphTooltip: 0,
      id: 141,
      links: [],
      panels: [
        {
          type: 'graph',
          title: 'panel title',
          id: 6,
        },
      ],
      schemaVersion: 27,
      style: 'dark',
      tags: [],
      templating: {
        list: [],
      },
      time: {
        from: 'now-6h',
        to: 'now',
      },
      timepicker: {
        refresh_intervals: ['5s'],
      },
      timezone: '',
      title: 'test dashboard',
      uid: '_U4zObQMz',
      version: 11,
    },
  },
};
