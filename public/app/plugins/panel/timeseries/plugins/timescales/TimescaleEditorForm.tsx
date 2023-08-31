import { css, cx } from '@emotion/css';
import React, { HTMLAttributes, useRef, useState, useCallback } from 'react';
import useClickAway from 'react-use/lib/useClickAway';

import { GrafanaTheme2 } from '@grafana/data';
import { Button, Field, HorizontalGroup, Select, useStyles2 } from '@grafana/ui';
import { NumberInput } from 'app/core/components/OptionsUI/NumberInput';
import { useAppNotification } from 'app/core/copy/appNotification';

export interface TimescaleEditFormDTO {
  description: string;
  min: number;
  max: number;
  scale: string;
}

interface TimescaleEditorFormProps extends HTMLAttributes<HTMLDivElement> {
  onSave: (data: TimescaleEditFormDTO) => void;
  onDismiss: () => void;
  scales: string[];
}

export const TimescaleEditorForm = React.forwardRef<HTMLDivElement, TimescaleEditorFormProps>(
  ({ onSave, onDismiss, className, scales, ...otherProps }, ref) => {
    const styles = useStyles2(getStyles);
    const clickAwayRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<TimescaleEditFormDTO>({ description: '', min: 0, max: 0, scale: scales.length ? scales[0] : '' });
    const notifyApp = useAppNotification();

    useClickAway(clickAwayRef, () => {
      onDismiss();
    });

    const onSubmit = useCallback(
      async (data: TimescaleEditFormDTO) => {
        setIsLoading(true);
        try {
          await onSave(data);
        } catch (error: any) {
          setIsLoading(false);
          notifyApp.error('Update scale Error', error);
        }
      },
      [onSave, notifyApp]
    );

    const form = (
      <div // Timescale editor
        ref={ref}
        className={cx(styles.editor, className)}
        {...otherProps}
      >
        <div className={styles.header}>
          <HorizontalGroup justify={'space-between'} align={'center'}>
            <div className={styles.title}>Update scale</div>
          </HorizontalGroup>
        </div>
        <div className={styles.editorForm}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(formData);
            }}
          >
            <Field label={'Min'}>
              <NumberInput
                value={formData.min}
                min={0}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    min: value || 0,
                  });
                }}
              />
            </Field>
            <Field label={'Max'}>
              <NumberInput
                value={formData.max}
                min={0}
                onChange={(value) => {
                  setFormData({
                    ...formData,
                    max: value || 0,
                  });
                }}
              />
            </Field>
            <Field label={'Scale'}>
              <Select
                value={formData.scale}
                options= {
                  scales.map((value: string) => ({value, label: value}))
                }
                onChange={(value: any) => {
                  setFormData({
                    ...formData,
                    scale: value.value,
                  });
                }}
              />
            </Field>
            <HorizontalGroup justify={'flex-end'}>
              <Button size={'sm'} variant="secondary" onClick={onDismiss} fill="outline">
                Cancel
              </Button>
              <Button size={'sm'} type={'submit'} disabled={isLoading}>
                {isLoading ? 'Saving' : 'Save'}
              </Button>
            </HorizontalGroup>
          </form>
        </div>
      </div>
    );

    return (
      <>
        <div className={styles.backdrop} />
        <div ref={clickAwayRef}>{form}</div>
      </>
    );
  }
);

TimescaleEditorForm.displayName = 'TimescaleEditorForm';

const getStyles = (theme: GrafanaTheme2) => {
  return {
    backdrop: css`
      label: backdrop;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      z-index: ${theme.zIndex.navbarFixed};
    `,
    editor: css`
      background: ${theme.colors.background.primary};
      box-shadow: ${theme.shadows.z3};
      z-index: ${theme.zIndex.dropdown};
      border: 1px solid ${theme.colors.border.weak};
      border-radius: ${theme.shape.borderRadius()};
      width: 460px;
    `,
    editorForm: css`
      padding: ${theme.spacing(1)};
    `,
    header: css`
      border-bottom: 1px solid ${theme.colors.border.weak};
      padding: ${theme.spacing(1.5, 1)};
    `,
    title: css`
      font-weight: ${theme.typography.fontWeightMedium};
    `,
  };
};