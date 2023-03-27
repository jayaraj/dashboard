import { SelectableValue } from '@grafana/data';

/**
 * Layout Variants
 */
export const enum LayoutVariant {
  NONE = 'none',
  SINGLE = 'single',
  SPLIT = 'split',
}



/**
 * Layout Variant Options
 */
export const LayoutVariantOptions: SelectableValue[] = [
  {
    value: LayoutVariant.SINGLE,
    description: 'All elements together.',
    label: 'Basic',
  },
  {
    value: LayoutVariant.NONE,
    description: 'Buttons only.',
    label: 'Buttons only',
  },
  {
    value: LayoutVariant.SPLIT,
    description: 'Elements split in separate sections.',
    label: 'Sections',
  },
];

/**
 * Level Variants
 */
export const enum LevelVariant {
  ORG = 'org',
  GROUP = 'group',
  RESOURCE = 'resource',
}

/**
 * Level Variant Options
 */
export const LevelVariantOptions: SelectableValue[] = [
  {
    value: LevelVariant.ORG,
    description: 'Org level configurations',
    label: 'Org',
  },
  {
    value: LevelVariant.GROUP,
    description: 'Group level configurations',
    label: 'Group',
  },
  {
    value: LevelVariant.RESOURCE,
    description: 'Resource level configurations',
    label: 'Resource',
  },
];