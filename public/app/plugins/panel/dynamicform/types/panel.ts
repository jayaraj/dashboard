import { LevelVariant } from '../constants';
import { ButtonGroupOptions, ButtonOptions } from './button';
import { FormElement } from './form-element';
import { LayoutOptions } from './layout';
import { RequestOptions } from './request';

export interface ConfigurationOptions {
  type: string;
  external: boolean;
  level: LevelVariant;
}

/**
 * Panel Options
 */
export interface PanelOptions {
  configuration: ConfigurationOptions;
  /**
   * Initial Values
   *
   * @type {RequestOptions}
   */
  initial: RequestOptions;

  /**
   * Update Values
   *
   * @type {RequestOptions}
   */
  update: RequestOptions;

  /**
   * Button Group
   *
   * @type {ButtonGroupOptions}
   */
  buttonGroup: ButtonGroupOptions;

  /**
   * Submit Button
   *
   * @type {ButtonOptions}
   */
  submit: ButtonOptions;

  /**
   * Reset Button
   *
   * @type {ButtonOptions}
   */
  reset: ButtonOptions;

  /**
   * Form Elements
   *
   * @type {FormElement[]}
   */
  elements: FormElement[];

  /**
   * Layout
   *
   * @type {LayoutOptions}
   */
  layout: LayoutOptions;
}