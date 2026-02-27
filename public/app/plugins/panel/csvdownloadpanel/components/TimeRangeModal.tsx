import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2, RawTimeRange, SelectableValue } from '@grafana/data';
import { useStyles2, Modal, Button, Select } from '@grafana/ui';

interface TimeRangeOption {
  label: string;
  value: string;
  getRange: () => RawTimeRange;
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  {
    label: 'Last 2 days',
    value: 'last2d',
    getRange: () => ({ from: 'now-2d', to: 'now' }),
  },
  {
    label: 'Last 7 days',
    value: 'last7d',
    getRange: () => ({ from: 'now-7d', to: 'now' }),
  },
  {
    label: 'Last 14 days',
    value: 'last14d',
    getRange: () => ({ from: 'now-14d', to: 'now' }),
  },
  {
    label: 'Last 30 days',
    value: 'last30d',
    getRange: () => ({ from: 'now-30d', to: 'now' }),
  },
  {
    label: 'Last 60 days',
    value: 'last60d',
    getRange: () => ({ from: 'now-60d', to: 'now' }),
  },
  {
    label: 'Last 90 days',
    value: 'last90d',
    getRange: () => ({ from: 'now-90d', to: 'now' }),
  },
  {
    label: 'Previous week',
    value: 'prevWeek',
    getRange: () => ({ from: 'now-1w/w', to: 'now-1w/w+1w' }),
  },
  {
    label: 'Previous month',
    value: 'prevMonth',
    getRange: () => ({ from: 'now-1M/M', to: 'now-1M/M+1M' }),
  },
  {
    label: 'Previous quarter',
    value: 'prevQuarter',
    getRange: () => ({ from: 'now-1q/q', to: 'now-1q/q+1q' }),
  },
  {
    label: 'This week',
    value: 'thisWeek',
    getRange: () => ({ from: 'now/w', to: 'now/w' }),
  },
  {
    label: 'This month',
    value: 'thisMonth',
    getRange: () => ({ from: 'now/M', to: 'now/M' }),
  },
];

// Convert options for Select component with grouping
const getSelectOptions = () => {
  const relativeOptions = TIME_RANGE_OPTIONS.filter((opt) => opt.value.startsWith('last'));
  const previousOptions = TIME_RANGE_OPTIONS.filter((opt) => opt.value.startsWith('prev'));
  const thisOptions = TIME_RANGE_OPTIONS.filter((opt) => opt.value.startsWith('this'));

  return [
    {
      label: 'Relative Ranges',
      options: relativeOptions.map((opt) => ({ label: opt.label, value: opt.value })),
    },
    {
      label: 'Previous Periods',
      options: previousOptions.map((opt) => ({ label: opt.label, value: opt.value })),
    },
    {
      label: 'Current Periods',
      options: thisOptions.map((opt) => ({ label: opt.label, value: opt.value })),
    },
  ];
};

interface TimeRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (range: RawTimeRange, label: string) => void;
  onDownload: () => void;
  currentTimeRangeLabel?: string;
}

export const TimeRangeModal: React.FC<TimeRangeModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onDownload,
  currentTimeRangeLabel,
}) => {
  const styles = useStyles2(getStyles);

  // Track currently selected option
  const [selectedValue, setSelectedValue] = React.useState<string | null>(null);

  const handleSelectChange = (selected: SelectableValue<string>) => {
    if (selected && selected.value) {
      setSelectedValue(selected.value);
      const option = TIME_RANGE_OPTIONS.find((opt) => opt.value === selected.value);
      if (option) {
        onSelect(option.getRange(), option.label);
      }
    }
  };

  const handleDownload = () => {
    onDownload();
    onClose();
  };

  // Find the currently selected option for the Select component
  const selectedOption = selectedValue
    ? { label: TIME_RANGE_OPTIONS.find((opt) => opt.value === selectedValue)?.label || '', value: selectedValue }
    : null;

  return (
    <Modal title="Select Time Range for CSV Download" isOpen={isOpen} onDismiss={onClose} className={styles.modal}>
      <div className={styles.container}>
        {currentTimeRangeLabel && (
          <div className={styles.currentRange}>
            <span className={styles.label}>Current selection:</span>
            <span className={styles.value}>{currentTimeRangeLabel}</span>
          </div>
        )}

        <div className={styles.section}>
          <label className={styles.sectionTitle}>Time Range</label>
          <Select
            options={getSelectOptions()}
            value={selectedOption}
            onChange={handleSelectChange}
            placeholder="Select a time range..."
            isSearchable={true}
            isClearable={false}
            width={40}
          />
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDownload} disabled={!selectedValue}>
            Download CSV
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  modal: css`
    width: 500px;
    max-width: 90vw;
  `,
  container: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 0;
  `,
  currentRange: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background-color: ${theme.colors.background.secondary};
    border-radius: ${theme.shape.radius.default};
  `,
  label: css`
    font-size: 14px;
    color: ${theme.colors.text.secondary};
  `,
  value: css`
    font-size: 14px;
    font-weight: 500;
    color: ${theme.colors.primary.main};
  `,
  section: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  sectionTitle: css`
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    color: ${theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,
  footer: css`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid ${theme.colors.border.weak};
  `,
});
