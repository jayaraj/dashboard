/**
 * Request Options
 */
export interface RequestOptions {
  /**
   * Custom Code
   *
   * @type {string}
   */
  code: string;

  /**
   * Highlight updated values
   *
   * @type {boolean}
   */
  highlight: boolean;

  /**
   * Highlight Color
   *
   * @type {string}
   */
  highlightColor: string;

  /**
   * Ask for confirmation
   *
   * @type {boolean}
   */
  confirm: boolean;
}
