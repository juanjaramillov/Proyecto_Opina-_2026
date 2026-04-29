/**
 * Code Connect mapping · StatTile (Figma ComponentSet) ↔ StatTile.tsx
 *
 * Figma master: "StatTile" (node-id 35-68)
 * Variants Figma: trendDirection=up|down|neutral
 *
 * Este archivo NO se importa en runtime.
 */
import figma from '@figma/code-connect';
import { StatTile } from './StatTile';

// trendDirection = "up"
figma.connect(StatTile, 'https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-68', {
  variant: { trendDirection: 'up' },
  props: {
    label: figma.string('label'),
    value: figma.string('value'),
    supportingText: figma.string('supportingText'),
  },
  example: ({ label, value, supportingText }) => (
    <StatTile
      label={label}
      value={value}
      supportingText={supportingText}
      icon="trending_up"
      trend={{ value: '+12%', direction: 'up' }}
    />
  ),
});

// trendDirection = "down"
figma.connect(StatTile, 'https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-68', {
  variant: { trendDirection: 'down' },
  props: {
    label: figma.string('label'),
    value: figma.string('value'),
    supportingText: figma.string('supportingText'),
  },
  example: ({ label, value, supportingText }) => (
    <StatTile
      label={label}
      value={value}
      supportingText={supportingText}
      icon="trending_down"
      trend={{ value: '-3%', direction: 'down' }}
    />
  ),
});

// trendDirection = "neutral"
figma.connect(StatTile, 'https://www.figma.com/design/ZYVcwfVvaNkpzPbkML94z7/?node-id=35-68', {
  variant: { trendDirection: 'neutral' },
  props: {
    label: figma.string('label'),
    value: figma.string('value'),
    supportingText: figma.string('supportingText'),
  },
  example: ({ label, value, supportingText }) => (
    <StatTile
      label={label}
      value={value}
      supportingText={supportingText}
      icon="insights"
      trend={{ value: '0%', direction: 'neutral' }}
    />
  ),
});
