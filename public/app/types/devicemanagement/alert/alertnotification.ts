export interface Notification {
  id: number;
  updated_at: string;
  name: string;
  alert_definition_id: number;
  org_id: number;
  configuration: any;
}

export interface UpdateNotificationDTO {
  alert_definition_id: number;
  name: string;
  configuration: any;
}

export interface NotificationState {
  alertNotification: Notification;
}
