export type RegionKey = 'asia' | 'europe' | 'north_america' | 'south_america' | 'oceania' | 'africa';
export type DifficultyKey = 'easy' | 'moderate' | 'hard' | 'expert';
export type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter' | 'all_year';

export const REGION_OPTIONS: { key: RegionKey; zh: string; en: string }[] = [
  { key: 'asia', zh: '亚洲', en: 'Asia' },
  { key: 'europe', zh: '欧洲', en: 'Europe' },
  { key: 'north_america', zh: '北美洲', en: 'North America' },
  { key: 'south_america', zh: '南美洲', en: 'South America' },
  { key: 'oceania', zh: '大洋洲', en: 'Oceania' },
  { key: 'africa', zh: '非洲', en: 'Africa' },
];

const REGION_LABELS = REGION_OPTIONS.reduce<Record<string, { zh: string; en: string }>>((acc, option) => {
  acc[option.key] = { zh: option.zh, en: option.en };
  return acc;
}, {});

export function regionLabel(key: string | null | undefined, isZh: boolean) {
  if (!key) return '';
  const label = REGION_LABELS[key];
  return label ? (isZh ? label.zh : label.en) : key;
}

export function standardDifficulty(value: string | null | undefined): DifficultyKey {
  const text = String(value || '').toLowerCase();
  if (text.includes('expert') || text.includes('extreme') || text.includes('专家') || text.includes('极限')) return 'expert';
  if (text.includes('hard') || text.includes('advanced') || text.includes('困难') || text.includes('高级')) return 'hard';
  if (text.includes('easy') || text.includes('beginner') || text.includes('简单') || text.includes('入门')) return 'easy';
  return 'moderate';
}

export function difficultyBadge(value: string | null | undefined) {
  const key = standardDifficulty(value);
  const map: Record<DifficultyKey, string> = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    moderate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hard: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    expert: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return map[key];
}

export function seasonLabel(value: string | null | undefined, isZh: boolean, translate: (key: string, fallback: string) => string) {
  if (!value) return '';
  const text = String(value);
  if (['spring', 'summer', 'autumn', 'winter', 'all_year'].includes(text)) {
    return translate(`seasons.${text}`, text);
  }
  return isZh ? text : text;
}

export function locationLabel(trail: { region?: string | null; country?: string | null; normalizedRegion?: string | null }, isZh: boolean) {
  const local = [trail.region, trail.country].filter(Boolean).join(', ');
  return local || regionLabel(trail.normalizedRegion, isZh);
}
