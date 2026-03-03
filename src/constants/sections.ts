export const SECTION_OPTIONS = ['A', 'B', 'AI/ML'] as const;

export type SectionOption = (typeof SECTION_OPTIONS)[number];

const LEGACY_SECTION_ALIASES: Record<string, SectionOption> = {
  'MSc AI/ML': 'AI/ML',
};

export const normalizeSection = (value?: string | null): string => {
  const trimmed = (value || '').trim();
  return LEGACY_SECTION_ALIASES[trimmed] || trimmed;
};

export const isSectionOption = (value?: string | null): value is SectionOption => {
  const normalized = normalizeSection(value);
  if (!normalized) return false;
  return SECTION_OPTIONS.includes(normalized as SectionOption);
};
