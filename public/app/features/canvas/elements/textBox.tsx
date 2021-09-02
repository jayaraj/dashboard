import React, { PureComponent } from 'react';
import { ColorDimensionEditor } from 'app/features/dimensions/editors/ColorDimensionEditor';
import { TextDimensionEditor } from 'app/features/dimensions/editors/TextDimensionEditor';
import { ColorDimensionConfig, TextDimensionConfig } from 'app/features/dimensions/types';

import { CanvasElementItem, CanvasElementProps } from '../element';
import { css } from '@emotion/css';
import { stylesFactory } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { config } from 'app/core/config';
import { DimensionContext } from 'app/features/dimensions/context';

export enum Align {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export enum VAlign {
  Top = 'top',
  Middle = 'middle',
  Bottom = 'bottom',
}

interface TextBoxData {
  text?: string;
  color?: string;
  size?: number; // 0 or missing will "auto size"
  align: Align;
  valign: VAlign;
}

interface TextBoxConfig {
  text?: TextDimensionConfig;
  color?: ColorDimensionConfig;
  size?: number; // 0 or missing will "auto size"
  align: Align;
  valign: VAlign;
}

class TextBoxDisplay extends PureComponent<CanvasElementProps<TextBoxConfig, TextBoxData>> {
  render() {
    const { data } = this.props;
    const styles = getStyles(config.theme2, data);
    return (
      <div className={styles.container}>
        <span className={styles.span}>{data?.text}</span>
      </div>
    );
  }
}
const getStyles = stylesFactory((theme: GrafanaTheme2, data) => ({
  container: css`
    position: absolute;
    height: 100%;
    width: 100%;
    display: table;
  `,
  span: css`
    display: table-cell;
    vertical-align: ${data.valign};
    text-align: ${data.align};
    font-size: ${data?.size}px;
    color: ${data?.color};
  `,
}));
export const textBoxItem: CanvasElementItem<TextBoxConfig, TextBoxData> = {
  id: 'text-box',
  name: 'Text',
  description: 'Text box',

  display: TextBoxDisplay,

  defaultConfig: {
    align: Align.Left,
    valign: VAlign.Middle,
  },

  defaultSize: {
    width: 240,
    height: 160,
  },

  // Called when data changes
  prepareData: (ctx: DimensionContext, cfg: TextBoxConfig) => {
    const data: TextBoxData = {
      text: cfg.text ? ctx.getText(cfg.text).value() : '',
      align: cfg.align ?? Align.Center,
      valign: cfg.valign ?? VAlign.Middle,
      size: cfg.size,
    };
    if (cfg.color) {
      data.color = ctx.getColor(cfg.color).value();
    }
    return data;
  },

  // Heatmap overlay options
  registerOptionsUI: (builder) => {
    builder
      .addCustomEditor({
        id: 'textSelector',
        path: 'config.text',
        name: 'Text',
        editor: TextDimensionEditor,
      })
      .addCustomEditor({
        id: 'config.color',
        path: 'config.color',
        name: 'Text color',
        editor: ColorDimensionEditor,
        settings: {},
        defaultValue: {},
      })
      .addRadio({
        path: 'config.align',
        name: 'Align text',
        settings: {
          options: [
            { value: Align.Left, label: 'Left' },
            { value: Align.Center, label: 'Center' },
            { value: Align.Right, label: 'Right' },
          ],
        },
        defaultValue: Align.Left,
      })
      .addRadio({
        path: 'config.valign',
        name: 'Vertical align',
        settings: {
          options: [
            { value: VAlign.Top, label: 'Top' },
            { value: VAlign.Middle, label: 'Middle' },
            { value: VAlign.Bottom, label: 'Bottom' },
          ],
        },
        defaultValue: VAlign.Middle,
      })
      .addNumberInput({
        path: 'config.size',
        name: 'Text size',
        settings: {
          placeholder: 'Auto',
        },
      });
  },
};
