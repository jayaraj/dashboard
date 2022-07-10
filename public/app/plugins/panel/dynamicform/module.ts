import { PanelPlugin, SelectableValue } from '@grafana/data';
import { getAvailableIcons } from '@grafana/ui';

import { CustomCodeEditor, FormElementsEditor, FormPanel, LayoutSectionsEditor } from './components';
import {
  ButtonOrientation,
  ButtonOrientationOptions,
  ButtonSize,
  ButtonSizeOptions,
  ButtonVariant,
  ButtonVariantHiddenOption,
  ButtonVariantOptions,
  CodeEditorDefault,
  CodeLanguage,
  InitialHighlightColorDefault,
  LayoutVariant,
  LayoutVariantOptions,
  ResetBackgroundColorDefault,
  ResetForegroundColorDefault,
  ResetIconDefault,
  ResetTextDefault,
  SubmitBackgroundColorDefault,
  SubmitForegroundColorDefault,
  SubmitIconDefault,
  SubmitTextDefault,
} from './constants';
import { PanelOptions } from './types';

/**
 * Panel Plugin
 */
export const plugin = new PanelPlugin<PanelOptions>(FormPanel).setPanelOptions((builder) => {
  /**
   * Elements
   */
  builder.addCustomEditor({
    id: 'elements',
    path: 'elements',
    name: 'Form Elements',
    category: ['Form Elements'],
    description: 'Form Elements',
    editor: FormElementsEditor,
  });

  /**
   * Initial Values
   */
  builder
    .addTextInput({
      path: 'configuration',
      name: 'Configuration',
      category: ['Configuration'],
      description: 'configuration type for the resource',
      settings: {
        placeholder: 'controller',
      },
    })
    .addRadio({
      path: 'customcode',
      name: 'Execute Custom Code',
      description: 'execute custom code',
      category: ['Configuration'],
      settings: {
        options: [
          {
            value: false,
            label: 'No',
          },
          {
            value: true,
            label: 'Yes',
          },
        ],
      },
      defaultValue: false,
    })
    .addCustomEditor({
      id: 'initial.code',
      path: 'initial.code',
      name: 'Custom Code',
      description: 'Custom code to execute after initial request',
      editor: CustomCodeEditor,
      category: ['Initial Request'],
      settings: {
        language: CodeLanguage.JAVASCRIPT,
      },
      defaultValue: CodeEditorDefault,
    })
    .addRadio({
      path: 'initial.highlight',
      name: 'Highlight changed values',
      description: 'Some elements are not supporting highlighting.',
      category: ['Initial Request'],
      settings: {
        options: [
          {
            value: false,
            label: 'No',
          },
          {
            value: true,
            label: 'Highlight',
          },
        ],
      },
      defaultValue: false,
    })
    .addColorPicker({
      path: 'initial.highlightColor',
      name: 'Highlight Color',
      category: ['Initial Request'],
      defaultValue: InitialHighlightColorDefault,
      settings: {
        disableNamedColors: true,
      },
      showIf: (config: any) => config.initial.highlight,
    });

  /**
   * Update Values
   */
  builder
    .addCustomEditor({
      id: 'update.code',
      path: 'update.code',
      name: 'Custom Code',
      description: 'Custom code to execute after update request',
      editor: CustomCodeEditor,
      category: ['Update Request'],
      settings: {
        language: CodeLanguage.JAVASCRIPT,
      },
      defaultValue: CodeEditorDefault,
    })
    .addRadio({
      path: 'update.confirm',
      name: 'Require Confirmation',
      description: 'Will ask to confirm updated values.',
      category: ['Update Request'],
      settings: {
        options: [
          {
            value: false,
            label: 'No',
          },
          {
            value: true,
            label: 'Require',
          },
        ],
      },
      defaultValue: false,
    });

  /**
   * Layout
   */
  builder
    .addRadio({
      path: 'layout.variant',
      name: 'Layout',
      category: ['Layout'],
      settings: {
        options: LayoutVariantOptions,
      },
      defaultValue: LayoutVariant.SINGLE,
    })
    .addCustomEditor({
      id: 'layout.sections',
      path: 'layout.sections',
      name: 'Sections',
      category: ['Layout'],
      editor: LayoutSectionsEditor,
      showIf: (config: any) => config.layout.variant === LayoutVariant.SPLIT,
    });

  /**
   * Buttons
   */
  builder
    .addRadio({
      path: 'buttonGroup.orientation',
      name: 'Orientation',
      category: ['Buttons'],
      description: 'Buttons orientation on the form',
      settings: {
        options: ButtonOrientationOptions,
      },
      defaultValue: ButtonOrientation.CENTER,
    })
    .addRadio({
      path: 'buttonGroup.size',
      name: 'Size',
      category: ['Buttons'],
      description: 'Buttons size on the form',
      settings: {
        options: ButtonSizeOptions,
      },
      defaultValue: ButtonSize.MEDIUM,
    });

  /**
   * Submit Button
   */
  builder
    .addRadio({
      path: 'submit.variant',
      name: 'Submit Button',
      category: ['Submit Button'],
      description: 'Button variant',
      settings: {
        options: ButtonVariantOptions,
      },
      defaultValue: ButtonVariant.PRIMARY,
    })
    .addColorPicker({
      path: 'submit.foregroundColor',
      name: 'Foreground Color',
      category: ['Submit Button'],
      description: 'Foreground color of the button',
      defaultValue: SubmitForegroundColorDefault,
      settings: {
        disableNamedColors: true,
      },
      showIf: (config: any) => config.submit.variant === ButtonVariant.CUSTOM,
    })
    .addColorPicker({
      path: 'submit.backgroundColor',
      name: 'Background Color',
      category: ['Submit Button'],
      description: 'Background color of the button',
      defaultValue: SubmitBackgroundColorDefault,
      settings: {
        disableNamedColors: true,
      },
      showIf: (config: any) => config.submit.variant === ButtonVariant.CUSTOM,
    })
    .addSelect({
      path: 'submit.icon',
      name: 'Icon',
      category: ['Submit Button'],
      settings: {
        options: getAvailableIcons().map((icon): SelectableValue => {
          return {
            value: icon,
            label: icon,
          };
        }),
      },
      defaultValue: SubmitIconDefault,
    })
    .addTextInput({
      path: 'submit.text',
      name: 'Text',
      category: ['Submit Button'],
      description: 'The text on the button',
      defaultValue: SubmitTextDefault,
    });

  /**
   * Reset Button
   */
  builder
    .addRadio({
      path: 'reset.variant',
      name: 'Reset Button',
      category: ['Reset Button'],
      description: 'Button variant',
      settings: {
        options: [...ButtonVariantHiddenOption, ...ButtonVariantOptions],
      },
      defaultValue: ButtonVariant.HIDDEN,
    })
    .addColorPicker({
      path: 'reset.foregroundColor',
      name: 'Foreground Color',
      category: ['Reset Button'],
      description: 'Foreground color of the button',
      defaultValue: ResetForegroundColorDefault,
      settings: {
        disableNamedColors: true,
      },
      showIf: (config: any) => config.reset.variant === ButtonVariant.CUSTOM,
    })
    .addColorPicker({
      path: 'reset.backgroundColor',
      name: 'Background Color',
      category: ['Reset Button'],
      description: 'Background color of the button',
      defaultValue: ResetBackgroundColorDefault,
      settings: {
        disableNamedColors: true,
      },
      showIf: (config: any) => config.reset.variant === ButtonVariant.CUSTOM,
    })
    .addSelect({
      path: 'reset.icon',
      name: 'Icon',
      category: ['Reset Button'],
      settings: {
        options: getAvailableIcons().map((icon): SelectableValue => {
          return {
            value: icon,
            label: icon,
          };
        }),
      },
      defaultValue: ResetIconDefault,
      showIf: (config: any) => config.reset.variant !== ButtonVariant.HIDDEN,
    })
    .addTextInput({
      path: 'reset.text',
      name: 'Text',
      category: ['Reset Button'],
      description: 'The text on the button',
      defaultValue: ResetTextDefault,
      showIf: (config: any) => config.reset.variant !== ButtonVariant.HIDDEN,
    });

  return builder;
});
