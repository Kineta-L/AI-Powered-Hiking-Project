type TrailLike = {
  titleZh?: string | null;
  titleEn?: string | null;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  difficulty?: string | null;
  season?: string | null;
  region?: string | null;
  country?: string | null;
};

export type RegionKey = 'asia' | 'europe' | 'north_america' | 'south_america' | 'oceania' | 'africa';
export type DifficultyKey = 'easy' | 'moderate' | 'hard' | 'expert';
export type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter' | 'all_year';

const REGION_ALIASES: Record<RegionKey, string[]> = {
  asia: ['asia', '亚洲', '中国', 'china', 'yunnan', '云南', 'sichuan', '四川', 'xinjiang', '新疆', 'beijing', '北京', 'anhui', '安徽', 'jiangxi', '江西', 'nepal', '尼泊尔', 'annapurna', '安娜普尔纳', 'khumbu', '昆布', 'japan', '日本', 'yamanashi', '山梨', 'shizuoka', '静冈', 'wakayama', '和歌山'],
  europe: ['europe', '欧洲', 'france', '法国', 'italy', '意大利', 'switzerland', '瑞士', 'alps', '阿尔卑斯', 'uk', 'united kingdom', 'britain', '英国', 'scotland', '苏格兰', 'norway', '挪威'],
  north_america: ['north america', '北美', '北美洲', 'usa', 'us', 'united states', 'america', '美国', 'california', '加利福尼亚', 'arizona', '亚利桑那'],
  south_america: ['south america', '南美', '南美洲', 'peru', '秘鲁', 'cusco', '库斯科', 'chile', '智利', 'patagonia', '巴塔哥尼亚'],
  oceania: ['oceania', '大洋洲', 'new zealand', '新西兰', 'north island', '北岛'],
  africa: ['africa', '非洲'],
};

const CONTINENT_ALIASES: Record<RegionKey, string[]> = {
  asia: ['asia', '亚洲'],
  europe: ['europe', '欧洲'],
  north_america: ['north america', 'north_america', '北美', '北美洲'],
  south_america: ['south america', 'south_america', '南美', '南美洲'],
  oceania: ['oceania', '大洋洲'],
  africa: ['africa', '非洲'],
};

const SEARCH_ALIASES: Record<string, string[]> = {
  china: ['中国', 'cn', 'yunnan', '云南', 'sichuan', '四川', 'xinjiang', '新疆'],
  nepal: ['尼泊尔', 'annapurna', '安娜普尔纳', 'khumbu', '昆布'],
  japan: ['日本', '山梨', '静冈', '和歌山'],
  tiger: ['虎跳峡', 'tiger leaping gorge', 'hutiaoxia'],
  'tiger leaping gorge': ['虎跳峡', 'tiger', 'hutiaoxia'],
  虎跳峡: ['tiger leaping gorge', 'tiger', 'hutiaoxia'],
  europe: ['欧洲', '阿尔卑斯', 'alps'],
  peru: ['秘鲁', 'cusco', '库斯科', 'inca', '印加'],
  chile: ['智利', 'patagonia', '巴塔哥尼亚'],
  usa: ['美国', 'united states', 'america'],
};

export function normalizeText(value: unknown) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(value: string, aliases: string[]) {
  const normalizedAliases = aliases.map(normalizeText);
  return normalizedAliases.some(alias => value.includes(alias));
}

export function standardizeDifficulty(value: unknown): DifficultyKey {
  const text = normalizeText(value);
  if (hasAny(text, ['expert', 'extreme', 'very hard', '专家', '极限', '高难'])) return 'expert';
  if (hasAny(text, ['hard', 'advanced', 'difficult', '困难', '进阶', '高级'])) return 'hard';
  if (hasAny(text, ['easy', 'beginner', '简单', '轻松', '入门'])) return 'easy';
  return 'moderate';
}

export function standardizeSeasons(value: unknown): SeasonKey[] {
  const text = normalizeText(value);
  const seasons = new Set<SeasonKey>();

  if (!text) return [];
  if (hasAny(text, ['all year', 'year round', '全年', '四季'])) seasons.add('all_year');
  if (hasAny(text, ['spring', '春', '3-5', '3月', '4月', '5月', 'march', 'april', 'may'])) seasons.add('spring');
  if (hasAny(text, ['summer', '夏', '6月', '7月', '8月', 'june', 'july', 'august', 'dry season', '旱季', '干季'])) seasons.add('summer');
  if (hasAny(text, ['autumn', 'fall', '秋', '9月', '10月', '11月', 'september', 'october', 'november'])) seasons.add('autumn');
  if (hasAny(text, ['winter', '冬', '12月', '1月', '2月', 'december', 'january', 'february'])) seasons.add('winter');

  if (seasons.has('all_year')) return ['all_year', 'spring', 'summer', 'autumn', 'winter'];
  return Array.from(seasons);
}

export function standardizeRegion(trail: TrailLike): RegionKey | undefined {
  const text = normalizeText([trail.region, trail.country, trail.titleZh, trail.titleEn].filter(Boolean).join(' '));
  return (Object.keys(REGION_ALIASES) as RegionKey[]).find(key => hasAny(text, REGION_ALIASES[key]));
}

function expandedSearchText(trail: TrailLike) {
  const base = [
    trail.titleZh,
    trail.titleEn,
    trail.descriptionZh,
    trail.descriptionEn,
    trail.region,
    trail.country,
    trail.difficulty,
    trail.season,
  ].filter(Boolean).join(' ');

  const additions: string[] = [];
  const normalizedBase = normalizeText(base);
  Object.entries(SEARCH_ALIASES).forEach(([key, aliases]) => {
    if (normalizedBase.includes(normalizeText(key)) || hasAny(normalizedBase, aliases)) {
      additions.push(key, ...aliases);
    }
  });

  const region = standardizeRegion(trail);
  if (region) additions.push(region);

  return normalizeText([base, ...additions].join(' '));
}

export function trailMatchesSearch(trail: TrailLike, query: unknown) {
  const q = normalizeText(query);
  if (!q) return true;

  const haystack = expandedSearchText(trail);
  const queryAliases = SEARCH_ALIASES[q] || [];
  const regionMatch = (Object.keys(CONTINENT_ALIASES) as RegionKey[]).some(key =>
    hasAny(q, CONTINENT_ALIASES[key]) && standardizeRegion(trail) === key
  );

  return regionMatch || haystack.includes(q) || queryAliases.some(alias => haystack.includes(normalizeText(alias)));
}

export function trailMatchesFilters(trail: TrailLike, filters: { region?: string; difficulty?: string; season?: string }) {
  if (filters.region && standardizeRegion(trail) !== normalizeText(filters.region)) return false;
  if (filters.difficulty && standardizeDifficulty(trail.difficulty) !== standardizeDifficulty(filters.difficulty)) return false;
  if (filters.season) {
    const requested = normalizeText(filters.season) as SeasonKey;
    if (!standardizeSeasons(trail.season).includes(requested)) return false;
  }
  return true;
}

export function standardizeTrailForResponse<T extends TrailLike>(trail: T) {
  return {
    ...trail,
    difficulty: standardizeDifficulty(trail.difficulty),
    normalizedDifficulty: standardizeDifficulty(trail.difficulty),
    normalizedRegion: standardizeRegion(trail) || null,
    normalizedSeasons: standardizeSeasons(trail.season),
  };
}
