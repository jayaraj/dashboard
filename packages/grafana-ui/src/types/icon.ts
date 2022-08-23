import { Field, FieldType } from '@grafana/data';

import { ComponentSize } from './size';

export type IconType = 'mono' | 'default' | 'solid';
export type IconSize = ComponentSize | 'xl' | 'xxl' | 'xxxl';

export const getAvailableIcons = () =>
  [
    'anchor',
    'angle-double-down',
    'angle-double-right',
    'angle-double-up',
    'angle-down',
    'angle-left',
    'angle-right',
    'angle-up',
    'apps',
    'arrow',
    'arrow-down',
    'arrow-from-right',
    'arrow-left',
    'arrow-random',
    'arrow-right',
    'arrow-up',
    'arrows-h',
    'arrows-v',
    'backward',
    'bars',
    'bell',
    'bell-slash',
    'bolt',
    'book',
    'bookmark',
    'book-open',
    'brackets-curly',
    'building',
    'bug',
    'building',
    'calculator-alt',
    'calendar-alt',
    'camera',
    'capture',
    'channel-add',
    'chart-line',
    'check',
    'check-circle',
    'circle',
    'clipboard-alt',
    'clock-nine',
    'cloud',
    'cloud-download',
    'cloud-upload',
    'code-branch',
    'cog',
    'columns',
    'comment-alt',
    'comment-alt-message',
    'comment-alt-share',
    'comments-alt',
    'compass',
    'copy',
    'credit-card',
    'cube',
    'dashboard',
    'database',
    'document-info',
    'download-alt',
    'draggabledots',
    'edit',
    'ellipsis-v',
    'envelope',
    'exchange-alt',
    'exclamation-triangle',
    'exclamation-circle',
    'external-link-alt',
    'eye',
    'eye-slash',
    'ellipsis-h',
    'fa fa-spinner',
    'favorite',
    'file-alt',
    'file-blank',
    'file-copy-alt',
    'filter',
    'folder',
    'font',
    'fire',
    'folder-open',
    'folder-plus',
    'folder-upload',
    'forward',
    'gf-bar-alignment-after',
    'gf-bar-alignment-before',
    'gf-bar-alignment-center',
    'gf-grid',
    'gf-interpolation-linear',
    'gf-interpolation-smooth',
    'gf-interpolation-step-after',
    'gf-interpolation-step-before',
    'gf-landscape',
    'gf-layout-simple',
    'gf-logs',
    'gf-portrait',
    'grafana',
    'graph-bar',
    'heart',
    'heart-break',
    'history',
    'home',
    'home-alt',
    'horizontal-align-center',
    'horizontal-align-left',
    'horizontal-align-right',
    'hourglass',
    'import',
    'info',
    'info-circle',
    'key-skeleton-alt',
    'keyboard',
    'layer-group',
    'library-panel',
    'line-alt',
    'link',
    'list-ui-alt',
    'list-ul',
    'lock',
    'map-marker',
    'message',
    'minus',
    'minus-circle',
    'mobile-android',
    'monitor',
    'palette',
    'panel-add',
    'pause',
    'pen',
    'percentage',
    'play',
    'plug',
    'plus',
    'plus-circle',
    'plus-square',
    'power',
    'presentation-play',
    'process',
    'question-circle',
    'record-audio',
    'repeat',
    'rocket',
    'rss',
    'ruler-combined',
    'save',
    'search',
    'search-minus',
    'search-plus',
    'share-alt',
    'shield',
    'shield-exclamation',
    'signal',
    'signin',
    'signout',
    'sitemap',
    'slack',
    'sliders-v-alt',
    'sort-amount-down',
    'sort-amount-up',
    'square-shape',
    'star',
    'step-backward',
    'stopwatch-slash',
    'sync',
    'table',
    'tag-alt',
    'text-fields',
    'times',
    'toggle-on',
    'trash-alt',
    'unlock',
    'upload',
    'user',
    'users-alt',
    'vertical-align-bottom',
    'vertical-align-center',
    'vertical-align-top',
    'wrap-text',
    'rss',
    'x',
  ] as const;

type BrandIconNames = 'google' | 'microsoft' | 'github' | 'gitlab' | 'okta';

export type IconName = ReturnType<typeof getAvailableIcons>[number] | BrandIconNames;

/** Get the icon for a given field type */
export function getFieldTypeIcon(field?: Field): IconName {
  if (field) {
    switch (field.type) {
      case FieldType.time:
        return 'clock-nine';
      case FieldType.string:
        return 'font';
      case FieldType.number:
        return 'calculator-alt';
      case FieldType.boolean:
        return 'toggle-on';
      case FieldType.trace:
        return 'info-circle';
      case FieldType.geo:
        return 'map-marker';
      case FieldType.other:
        return 'brackets-curly';
    }
  }
  return 'question-circle';
}
