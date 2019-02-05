import _ from 'lodash';
import { AppNotification, AppNotificationSeverity, AppNotificationTimeout } from 'app/types';

const defaultSuccessNotification: AppNotification = {
  title: '',
  text: '',
  severity: AppNotificationSeverity.Success,
  icon: 'fa fa-check',
  timeout: AppNotificationTimeout.Success,
};

const defaultWarningNotification: AppNotification = {
  title: '',
  text: '',
  severity: AppNotificationSeverity.Warning,
  icon: 'fa fa-exclamation',
  timeout: AppNotificationTimeout.Warning,
};

const defaultErrorNotification: AppNotification = {
  title: '',
  text: '',
  severity: AppNotificationSeverity.Error,
  icon: 'fa fa-exclamation-triangle',
  timeout: AppNotificationTimeout.Error,
};

export const createSuccessNotification = (title: string, text?: string): AppNotification => ({
  ...defaultSuccessNotification,
  title: title,
  text: text,
  id: Date.now(),
});

export const createErrorNotification = (title: string, text?: any): AppNotification => {
  // Handling if text is an error object
  if (text && !_.isString(text)) {
    if (text.message) {
      text = text.message;
    } else if (text.data && text.data.message) {
      text = text.data.message;
    } else {
      text = text.toString();
    }
  }

  return {
    ...defaultErrorNotification,
    title: title,
    text: text,
    id: Date.now(),
  };
};

export const createWarningNotification = (title: string, text?: string): AppNotification => ({
  ...defaultWarningNotification,
  title: title,
  text: text,
  id: Date.now(),
});
