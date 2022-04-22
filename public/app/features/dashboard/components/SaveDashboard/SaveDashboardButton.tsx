import React from 'react';

import { selectors } from '@grafana/e2e-selectors';
import { Button, ButtonVariant, ModalsController, FullWidthButtonContainer } from '@grafana/ui';
import { DashboardModel } from 'app/features/dashboard/state';

import { SaveDashboardProxy } from './SaveDashboardProxy';

interface SaveDashboardButtonProps {
  dashboard: DashboardModel;
  onSaveSuccess?: () => void;
}

export const SaveDashboardButton: React.FC<SaveDashboardButtonProps> = ({ dashboard, onSaveSuccess }) => {
  return (
    <ModalsController>
      {({ showModal, hideModal }) => {
        return (
          <Button
            onClick={() => {
              showModal(SaveDashboardProxy, {
                dashboard,
                onSaveSuccess,
                onDismiss: hideModal,
              });
            }}
            aria-label={selectors.pages.Dashboard.Settings.General.saveDashBoard}
          >
            Save dashboard
          </Button>
        );
      }}
    </ModalsController>
  );
};

export const SaveDashboardAsButton: React.FC<SaveDashboardButtonProps & { variant?: ButtonVariant }> = ({
  dashboard,
  onSaveSuccess,
  variant,
}) => {
  return (
    <ModalsController>
      {({ showModal, hideModal }) => {
        return (
          <FullWidthButtonContainer>
            <Button
              onClick={() => {
                showModal(SaveDashboardProxy, {
                  dashboard,
                  onSaveSuccess,
                  onDismiss: hideModal,
                  isCopy: true,
                });
              }}
              variant={variant}
              aria-label={selectors.pages.Dashboard.Settings.General.saveAsDashBoard}
            >
              Save As...
            </Button>
          </FullWidthButtonContainer>
        );
      }}
    </ModalsController>
  );
};
