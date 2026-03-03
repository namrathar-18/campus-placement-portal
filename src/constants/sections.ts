export const SECTION_OPTIONS = ['A', 'B', 'MSc AI/ML'] as const;

export type SectionOption = (typeof SECTION_OPTIONS)[number];

export const isSectionOption = (value?: string | null): value is SectionOption => {
  if (!value) return false;
  return SECTION_OPTIONS.includes(value.trim() as SectionOption);
};
