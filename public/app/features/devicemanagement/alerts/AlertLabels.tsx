import React from 'react';

import { TagList } from '@grafana/ui';

type Props = { labels: Record<string, string>; className?: string };

export const AlertLabels = ({ labels, className }: Props) => {
  const pairs = Object.entries(labels);
  return (
    <div className={className}>
      <TagList className={className} tags={Object.values(pairs).map(([label, value]) => `${label}=${value}`)} />
    </div>
  );
};
