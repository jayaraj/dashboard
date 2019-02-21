/* tslint:disable:max-line-length */

import { GrafanaTheme } from '../types';
import { renderGeneratedFileBanner } from '../utils/generatedFileBanner';

export const darkThemeVarsTemplate = (theme: GrafanaTheme) =>
  `${renderGeneratedFileBanner('grafana-ui/src/themes/dark.ts', 'grafana-ui/src/themes/_variables.dark.scss.tmpl.ts')}
// Global values
// --------------------------------------------------

$theme-name: dark;

// New Colors
// -------------------------
$sapphire-faint: #041126;
$sapphire-light: #5794f2;
$sapphire-base: #3274d9;
$sapphire-shade: #1f60c4;
$lobster-base: #e02f44;
$lobster-shade: #c4162a;
$forest-light: #96d98d;
$green-base: #299c46;
$green-shade: #23843b;

// Grays
// -------------------------
$black: #000;
$dark-1: #141414;
$dark-2: #161719;
$dark-3: #1f1f20;
$dark-4: #212124;
$dark-5: #222426;
$dark-6: #262628;
$dark-7: #292a2d;
$dark-8: #2f2f32;
$dark-9: #343436;
$dark-10: #424345;
$gray-1: #555555;
$gray-2: #8e8e8e;
$gray-3: #b3b3b3;
$gray-4: #d8d9da;
$gray-5: #ececec;

$gray-blue: #212327;
$input-black: #09090b;

$white: ${theme.colors.white};

// Accent colors
// -------------------------
$blue: ${theme.colors.blue};
$green: #299c46;
$red: $lobster-base;
$yellow: #ecbb13;
$purple: #9933cc;
$variable: #32d1df;
$orange: #eb7b18;

$brand-primary: $orange;
$brand-success: $green-base;
$brand-warning: $brand-primary;
$brand-danger: $lobster-base;

$query-red: $lobster-base;
$query-green: $forest-light;
$query-purple: #fe85fc;
$query-keyword: #66d9ef;
$query-orange: $orange;

// Status colors
// -------------------------
$online: $green-base;
$warn: #f79520;
$critical: $lobster-base;

// Scaffolding
// -------------------------
$body-bg: $dark-2;
$page-bg: $dark-2;

$body-color: $gray-4;
$text-color: $gray-4;
$text-color-strong: $white;
$text-color-weak: $gray-2;
$text-color-faint: $dark-10;
$text-color-emphasis: $gray-5;

$text-shadow-faint: 1px 1px 4px rgb(45, 45, 45);
$textShadow: none;

// gradients
$brand-gradient: linear-gradient(
  to right,
  rgba(255, 213, 0, 0.7) 0%,
  rgba(255, 68, 0, 0.7) 99%,
  rgba(255, 68, 0, 0.7) 100%
);

$page-gradient: linear-gradient(180deg, $dark-5 10px, dark-2 100px);
$edit-gradient: linear-gradient(180deg, $dark-2 50%, $input-black);

// Links
// -------------------------
$link-color: darken($white, 11%);
$link-color-disabled: darken($link-color, 30%);
$link-hover-color: $white;
$external-link-color: $sapphire-light;

// Typography
// -------------------------
$headings-color: darken($white, 11%);
$abbr-border-color: $gray-2 !default;
$text-muted: $text-color-weak;

$hr-border-color: $dark-9;

// Panel
// -------------------------
$panel-bg: $dark-4;
$panel-border: solid 1px $dark-1;
$panel-header-hover-bg: $dark-9;
$panel-corner: $panel-bg;

// page header
$page-header-bg: linear-gradient(90deg, $dark-7, $black);
$page-header-shadow: inset 0px -4px 14px $dark-3;
$page-header-border-color: $dark-9;

$divider-border-color: $gray-1;

// Graphite Target Editor
$tight-form-func-bg: $dark-9;
$tight-form-func-highlight-bg: $dark-10;

$modal-backdrop-bg: #353c42;
$code-tag-bg: $dark-1;
$code-tag-border: $dark-9;

// cards
$card-background: linear-gradient(135deg, $dark-8, $dark-6);
$card-background-hover: linear-gradient(135deg, $dark-9, $dark-6);
$card-shadow: -1px -1px 0 0 hsla(0, 0%, 100%, 0.1), 1px 1px 0 0 rgba(0, 0, 0, 0.3);

// Lists
$list-item-bg: $card-background;
$list-item-hover-bg: $card-background-hover;
$list-item-link-color: $text-color;
$list-item-shadow: $card-shadow;

$empty-list-cta-bg: $gray-blue;

// Scrollbars
$scrollbarBackground: #404357;
$scrollbarBackground2: $dark-10;
$scrollbarBorder: black;

// Tables
// -------------------------
$table-bg-accent: $dark-6; // for striping
$table-border: $dark-6; // table and cell border

$table-bg-odd: $dark-3;
$table-bg-hover: $dark-6;

// Buttons
// -------------------------
$btn-secondary-bg: $sapphire-base;
$btn-secondary-bg-hl: $sapphire-shade;

$btn-primary-bg: $green-base;
$btn-primary-bg-hl: $green-shade;

$btn-success-bg: $green-base;
$btn-success-bg-hl: $green-shade;

$btn-danger-bg: $lobster-base;
$btn-danger-bg-hl: $lobster-shade;

$btn-inverse-bg: $dark-6;
$btn-inverse-bg-hl: lighten($dark-6, 4%);
$btn-inverse-text-color: $link-color;
$btn-inverse-text-shadow: 0px 1px 0 rgba(0, 0, 0, 0.1);

$btn-link-color: $gray-3;

$iconContainerBackground: $black;

$btn-divider-left: $dark-9;
$btn-divider-right: $dark-3;

$btn-drag-image: '../img/grab_dark.svg';

// Forms
// -------------------------
$input-bg: $input-black;
$input-bg-disabled: $dark-6;

$input-color: $gray-4;
$input-border-color: $dark-6;
$input-box-shadow: inset 1px 0px 0.3rem 0px rgba(150, 150, 150, 0.1);
$input-border-focus: $dark-6 !default;
$input-box-shadow-focus: $sapphire-light !default;
$input-color-placeholder: $gray-1 !default;
$input-label-bg: $gray-blue;
$input-label-border-color: $dark-6;
$input-color-select-arrow: $white;

// Input placeholder text color
$placeholderText: darken($text-color, 25%);

// Search
$search-shadow: 0 0 30px 0 $black;
$search-filter-box-bg: $gray-blue;

// Typeahead
$typeahead-shadow: 0 5px 10px 0 $black;
$typeahead-selected-bg: $dark-9;
$typeahead-selected-color: $yellow;

// Dropdowns
// -------------------------
$dropdownBackground: $dark-6;
$dropdownBorder: rgba(0, 0, 0, 0.2);
$dropdownDividerTop: transparent;
$dropdownDividerBottom: #444;

$dropdownLinkColor: $text-color;
$dropdownLinkColorHover: $white;
$dropdownLinkColorActive: $white;

$dropdownLinkBackgroundHover: $dark-9;

// Horizontal forms & lists
// -------------------------
$horizontalComponentOffset: 180px;

// Navbar
// -------------------------
$navbarHeight: 55px;

$navbarBackground: $panel-bg;
$navbarBorder: 1px solid $dark-6;

$navbarButtonBackground: $navbarBackground;
$navbarButtonBackgroundHighlight: $body-bg;

$navbar-button-border: #2f2f32;

// Sidemenu
// -------------------------
$side-menu-bg: $black;
$side-menu-bg-mobile: $side-menu-bg;
$side-menu-item-hover-bg: $dark-3;
$side-menu-shadow: 0 0 20px black;
$side-menu-link-color: $link-color;

// Menu dropdowns
// -------------------------
$menu-dropdown-bg: $body-bg;
$menu-dropdown-hover-bg: $dark-3;
$menu-dropdown-shadow: 5px 5px 20px -5px $black;

// Tabs
// -------------------------
$tab-border-color: $dark-9;

// Toolbar
$toolbar-bg: $input-black;

// Form states and alerts
// -------------------------
$warning-text-color: $warn;
$error-text-color: #e84d4d;
$success-text-color: $forest-light;

$alert-error-bg: linear-gradient(90deg, $lobster-base, $lobster-shade);
$alert-success-bg: linear-gradient(90deg, $green-base, $green-shade);
$alert-warning-bg: linear-gradient(90deg, $lobster-base, $lobster-shade);
$alert-info-bg: linear-gradient(100deg, $sapphire-base, $sapphire-shade);

// popover
$popover-bg: $dark-2;
$popover-color: $text-color;
$popover-border-color: $dark-9;
$popover-shadow: 0 0 20px black;

$popover-help-bg: $btn-secondary-bg;
$popover-help-color: $text-color;

$popover-error-bg: $btn-danger-bg;

// Tooltips and popovers
// -------------------------
$tooltipColor: $popover-help-color;
$tooltipArrowWidth: 5px;
$tooltipLinkColor: $link-color;
$graph-tooltip-bg: $dark-1;

$tooltipBackground: $black;
$tooltipColor: $gray-4;
$tooltipArrowColor: $tooltipBackground;
$tooltipBackgroundError: $brand-danger;

// images
$checkboxImageUrl: '../img/checkbox.png';

// info box
$info-box-border-color: $sapphire-base;

// footer
$footer-link-color: $gray-2;
$footer-link-hover: $gray-4;

// json-explorer
$json-explorer-default-color: $text-color;
$json-explorer-string-color: #23d662;
$json-explorer-number-color: $variable;
$json-explorer-boolean-color: $variable;
$json-explorer-null-color: #eec97d;
$json-explorer-undefined-color: rgb(239, 143, 190);
$json-explorer-function-color: #fd48cb;
$json-explorer-rotate-time: 100ms;
$json-explorer-toggler-opacity: 0.6;
$json-explorer-bracket-color: #9494ff;
$json-explorer-key-color: #23a0db;
$json-explorer-url-color: #027bff;

// Changelog and diff
// -------------------------
$diff-label-bg: $dark-3;
$diff-label-fg: $white;

$diff-group-bg: $dark-9;
$diff-arrow-color: $white;

$diff-json-bg: $dark-9;
$diff-json-fg: $gray-5;

$diff-json-added: $sapphire-shade;
$diff-json-deleted: $lobster-shade;

$diff-json-old: #a04338;
$diff-json-new: #457740;

$diff-json-changed-fg: $gray-5;
$diff-json-changed-num: $text-color;

$diff-json-icon: $gray-5;

//Submenu
$variable-option-bg: $dropdownLinkBackgroundHover;

//Switch Slider
// -------------------------
$switch-bg: $input-bg;
$switch-slider-color: $dark-3;
$switch-slider-off-bg: $gray-1;
$switch-slider-on-bg: linear-gradient(90deg, #eb7b18, #d44a3a);
$switch-slider-shadow: 0 0 3px black;

//Checkbox
// -------------------------
$checkbox-bg: $dark-1;
$checkbox-border: 1px solid $gray-1;
$checkbox-checked-bg: linear-gradient(0deg, #eb7b18, #d44a3a);
$checkbox-color: $dark-1;

//Panel Edit
// -------------------------
$panel-editor-shadow: 0 0 20px black;
$panel-editor-side-menu-shadow: drop-shadow(0 0 10px $black);
$panel-editor-viz-item-shadow: 0 0 8px $dark-10;
$panel-editor-viz-item-border: 1px solid $dark-10;
$panel-editor-viz-item-shadow-hover: 0 0 4px $sapphire-light;
$panel-editor-viz-item-border-hover: 1px solid $sapphire-light;
$panel-editor-viz-item-bg: $input-black;
$panel-editor-tabs-line-color: #e3e3e3;

$panel-editor-viz-item-bg-hover: darken($sapphire-base, 46%);

$panel-options-group-border: none;
$panel-options-group-header-bg: $gray-blue;

$panel-grid-placeholder-bg: $sapphire-faint;
$panel-grid-placeholder-shadow: 0 0 4px $sapphire-shade;

// logs
$logs-color-unkown: $gray-2;

// toggle-group
$button-toggle-group-btn-active-bg: linear-gradient(90deg, #eb7b18, #d44a3a);
$button-toggle-group-btn-active-shadow: inset 0 0 4px $black;
$button-toggle-group-btn-seperator-border: 1px solid $dark-2;

$vertical-resize-handle-bg: $dark-10;
$vertical-resize-handle-dots: $gray-1;
$vertical-resize-handle-dots-hover: $gray-2;
`;
