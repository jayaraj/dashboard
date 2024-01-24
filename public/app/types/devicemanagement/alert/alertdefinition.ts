import { OrgRole, SelectableValue } from '@grafana/data';
import { Configuration } from 'app/core/components/CustomForm/types';

export const alertDefinitionsPageLimit = 50;
export const severityTypes: Array<SelectableValue<string>> = [
  {
    label: 'Minor',
    value: 'minor',
    description: `Minor Alert`,
  },
  {
    label: 'Major',
    value: 'major',
    description: `Major Alert`,
  },
  {
    label: 'Critical',
    value: 'critical',
    description: `Critical Alert`,
  },
];

export interface TestAlertScriptDTO {
  measurement: string;
  uuid?: string;
  name?: string;
  resource_id?: number;
  group_path?: string;
  previous: any;
  data: any;
}

export const testAlertScriptDTO: TestAlertScriptDTO = {
  measurement: '',
  uuid: '',
  name: '',
  resource_id: 0,
  group_path: '0,',
  previous: {
    data1: '',
  },
  data: {
    data1: '',
  },
};

export interface AlertStats {
  count: number;
  alerting: number;
  pending: number;
  normal: number;
}

export interface AlertDefinition {
  id: number;
  updated_at: string;
  name: string;
  description: string;
  alerting_msg: string;
  ok_msg: string;
  associated_with: string;
  role: OrgRole;
  severity: string;
  for: number;
  ticket_enabled: boolean;
  configuration: Configuration;
  code: string;
  builtin: boolean;
  alerting: number;
  pending: number;
  normal: number;
  onEdit?: () => void;
}

export interface CreateAlertDefinitionDTO {
  name: string;
  description: string;
  alerting_msg: string;
  ok_msg: string;
  associated_with: string;
  role: OrgRole;
  severity: string;
  for: number;
  ticket_enabled: boolean;
  configuration: Configuration;
  code: string;
}

export interface UpdateAlertDefinitionDTO {
  name: string;
  description: string;
  alerting_msg: string;
  ok_msg: string;
  associated_with: string;
  role: OrgRole;
  severity: string;
  for: number;
  ticket_enabled: boolean;
  configuration: Configuration;
  code: string;
}

export interface AlertDefinitionsState {
  alertDefinitions: AlertDefinition[];
  alertDefinitionsStats: AlertStats;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface AlertDefinitionState {
  alertDefinition: AlertDefinition;
}

export interface AlertDefinitionDTO {
  page: number;
  association?: string;
  associationReference?: string | number;
  state?: string;
  query?: string;
}

export const defaultCode = `
//result object  expected as response 
//state = PENDING will skip alert execution
var result = { err: '', state: PENDING };

//uplink object recieved
var msg = getMessage();
if (msg.Error !== "") {
  result.err = msg.Error
  return result;
}

//alert instance for the uplink recieved
var alert = getAlert();
if (alert.Error !== "") {
  result.err = alert.Error
  return result;
}

//check for any configuration required for alert validation
if (!alert.Result.Configuration || !alert.Result.Configuration.thershold) {
  result.err = 'configuration not found';
  return result;
}
var thershold = alert.Result.Configuration.thershold;

//group filter from the uplink recieved
var grpFilter = getGroupFilter();
if (grpFilter.Error !== "") {
  result.err = grpFilter.Error;
  return result;
}

//Read data from influx if required
var query = "";

var readData = readRawData(query);
if (readData.Error !== "") {
  result.err = readData.Error;
  return result;
}

//validate weather result is valid
if (!readData.Result.hasOwnProperty('consumption')) {
  //Do nothing
  return result;
}

//get group from uplink recieved
var group = getGroup();
if (group.Error !== "") {
  result.err = group.Error;
  return result;
}

//check alert here
result.state = OK;
if (Number(readData.Result.consumption) > Number(thershold)) {
  result.state = ALERTING;
  setContext('consumption', readData.Result.consumption)
}
return result;
`;
