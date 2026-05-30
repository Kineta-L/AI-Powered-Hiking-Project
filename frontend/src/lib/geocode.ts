import { apiFetch } from './api';

// Destination coordinates (offline, instant map positioning)
const COORDS: Record<string, { lat: number; lng: number; name: string }> = {
  'hutiaoxia': { lat: 27.178, lng: 100.054, name: 'Tiger Leaping Gorge' },
  'tiger leaping gorge': { lat: 27.178, lng: 100.054, name: 'Tiger Leaping Gorge' },
  'yubeng': { lat: 28.395, lng: 98.83, name: 'Yubeng, Yunnan' },
  'yading': { lat: 28.44, lng: 100.39, name: 'Yading, Sichuan' },
  'daocheng': { lat: 28.44, lng: 100.39, name: 'Yading, Sichuan' },
  'siguniang': { lat: 31.12, lng: 102.84, name: 'Siguniang, Sichuan' },
  'wugong': { lat: 27.45, lng: 114.16, name: 'Wugongshan, Jiangxi' },
  'meili': { lat: 28.44, lng: 98.68, name: 'Meili Snow Mountain' },
  'lijiang': { lat: 26.86, lng: 100.23, name: 'Lijiang, Yunnan' },
  'dali': { lat: 25.61, lng: 100.27, name: 'Dali, Yunnan' },
  'shangri-la': { lat: 27.83, lng: 99.70, name: 'Shangri-La, Yunnan' },
  'chengdu': { lat: 30.57, lng: 104.07, name: 'Chengdu, Sichuan' },
  'kunming': { lat: 25.04, lng: 102.71, name: 'Kunming, Yunnan' },
  'lhasa': { lat: 29.65, lng: 91.12, name: 'Lhasa, Tibet' },
  'zhangjiajie': { lat: 29.34, lng: 110.47, name: 'Zhangjiajie, Hunan' },
  'huangshan': { lat: 30.13, lng: 118.17, name: 'Huangshan, Anhui' },
  'taishan': { lat: 36.25, lng: 117.10, name: 'Taishan, Shandong' },
  'huashan': { lat: 34.48, lng: 110.09, name: 'Huashan, Shaanxi' },
  'emeishan': { lat: 29.52, lng: 103.33, name: 'Emeishan, Sichuan' },
  'lushan': { lat: 29.57, lng: 115.97, name: 'Lushan, Jiangxi' },
  'changbaishan': { lat: 42.01, lng: 128.07, name: 'Changbaishan, Jilin' },
  'kanas': { lat: 48.82, lng: 87.04, name: 'Kanas, Xinjiang' },
  'tianshan': { lat: 43.80, lng: 87.60, name: 'Tianshan, Xinjiang' },
  'everest': { lat: 27.988, lng: 86.925, name: 'Everest' },
  'kailash': { lat: 31.07, lng: 81.31, name: 'Kailash, Tibet' },
  'abc': { lat: 28.33, lng: 83.80, name: 'Annapurna Base Camp, Nepal' },
  'annapurna': { lat: 28.33, lng: 83.80, name: 'Annapurna, Nepal' },
  'ebc': { lat: 27.69, lng: 86.73, name: 'Everest Base Camp, Nepal' },
  'lukla': { lat: 27.687, lng: 86.730, name: 'Lukla, Nepal' },
  'namche': { lat: 27.804, lng: 86.713, name: 'Namche Bazaar, Nepal' },
  'nepal': { lat: 27.72, lng: 85.32, name: 'Nepal' },
  'pokhara': { lat: 28.21, lng: 83.96, name: 'Pokhara, Nepal' },
  'kathmandu': { lat: 27.72, lng: 85.32, name: 'Kathmandu, Nepal' },
  'tmb': { lat: 45.89, lng: 6.80, name: 'Tour du Mont Blanc' },
  'mont blanc': { lat: 45.89, lng: 6.80, name: 'Mont Blanc, France' },
  'chamonix': { lat: 45.92, lng: 6.87, name: 'Chamonix, France' },
  'gr20': { lat: 42.27, lng: 9.01, name: 'GR20, Corsica' },
  'alps': { lat: 46.50, lng: 8.50, name: 'Alps, Switzerland' },
  'dolomites': { lat: 46.54, lng: 11.86, name: 'Dolomites, Italy' },
  'west highland way': { lat: 56.52, lng: -4.77, name: 'West Highland Way, Scotland' },
  'scotland': { lat: 56.50, lng: -4.50, name: 'Scottish Highlands' },
  'kungsleden': { lat: 68.00, lng: 18.50, name: 'Kungsleden, Sweden' },
  'norway': { lat: 61.00, lng: 8.00, name: 'Norway' },
  'iceland': { lat: 64.96, lng: -19.02, name: 'Iceland' },
  'laugavegur': { lat: 63.92, lng: -19.30, name: 'Laugavegur Trail, Iceland' },
  'inca trail': { lat: -13.20, lng: -72.54, name: 'Inca Trail, Peru' },
  'machu picchu': { lat: -13.16, lng: -72.54, name: 'Machu Picchu, Peru' },
  'cusco': { lat: -13.53, lng: -71.97, name: 'Cusco, Peru' },
  'patagonia': { lat: -50.97, lng: -72.91, name: 'Torres del Paine, Chile' },
  'torres del paine': { lat: -50.97, lng: -72.91, name: 'Torres del Paine, Chile' },
  'fitz roy': { lat: -49.27, lng: -73.04, name: 'Fitz Roy, Argentina' },
  'peru': { lat: -12.04, lng: -77.04, name: 'Peru' },
  'chile': { lat: -33.45, lng: -70.67, name: 'Chile' },
  'yosemite': { lat: 37.87, lng: -119.54, name: 'Yosemite, USA' },
  'zion': { lat: 37.30, lng: -113.03, name: 'Zion, USA' },
  'grand canyon': { lat: 36.11, lng: -112.11, name: 'Grand Canyon, USA' },
  'yellowstone': { lat: 44.43, lng: -110.59, name: 'Yellowstone, USA' },
  'rocky mountain': { lat: 40.34, lng: -105.68, name: 'Rocky Mountain, USA' },
  'appalachian': { lat: 38.00, lng: -79.00, name: 'Appalachian Trail, USA' },
  'pct': { lat: 42.00, lng: -122.00, name: 'Pacific Crest Trail, USA' },
  'banff': { lat: 51.18, lng: -115.57, name: 'Banff, Canada' },
  'canada': { lat: 56.13, lng: -106.35, name: 'Canada' },
  'alaska': { lat: 63.07, lng: -149.02, name: 'Alaska, USA' },
  'fuji': { lat: 35.36, lng: 138.73, name: 'Mt Fuji, Japan' },
  'japan': { lat: 36.20, lng: 138.25, name: 'Japan' },
  'korea': { lat: 37.57, lng: 126.98, name: 'South Korea' },
  'jeju': { lat: 33.38, lng: 126.54, name: 'Jeju, Korea' },
  'kilimanjaro': { lat: -3.07, lng: 37.35, name: 'Kilimanjaro, Tanzania' },
  'overland track': { lat: -41.63, lng: 146.00, name: 'Overland Track, Tasmania' },
  'new zealand': { lat: -41.00, lng: 174.00, name: 'New Zealand' },
  'milford': { lat: -44.67, lng: 167.93, name: 'Milford Track, New Zealand' },
  'tongariro': { lat: -39.13, lng: 175.64, name: 'Tongariro, New Zealand' },
};


// Chinese keyword to coordinate mapping
const CN_MAP: Record<string, string> = {
  '虎跳峡': 'hutiaoxia',
  '雨崩': 'yubeng',
  '稻城': 'yading',
  '亚丁': 'yading',
  '稻城亚丁': 'yading',
  '四姑娘山': 'siguniang',
  '武功山': 'wugong',
  '梅里': 'meili',
  '梅里雪山': 'meili',
  '丽江': 'lijiang',
  '大理': 'dali',
  '香格里拉': 'shangri-la',
  '成都': 'chengdu',
  '昆明': 'kunming',
  '拉萨': 'lhasa',
  '张家界': 'zhangjiajie',
  '黄山': 'huangshan',
  '泰山': 'taishan',
  '华山': 'huashan',
  '峨眉山': 'emeishan',
  '庐山': 'lushan',
  '长白山': 'changbaishan',
  '喀纳斯': 'kanas',
  '天山': 'tianshan',
  '珠峰': 'everest',
  '珠穆朗玛峰': 'everest',
  '冈仁波齐': 'kailash',
  '安娜普尔纳': 'annapurna',
  '尼泊尔': 'nepal',
  '博卡拉': 'pokhara',
  '加德满都': 'kathmandu',
  '勃朗峰': 'mont blanc',
  '阿尔卑斯': 'alps',
  '多洛米蒂': 'dolomites',
  '苏格兰': 'scotland',
  '苏格兰高地': 'scotland',
  '挪威': 'norway',
  '冰岛': 'iceland',
  '印加古道': 'inca trail',
  '马丘比丘': 'machu picchu',
  '百内': 'patagonia',
  '优胜美地': 'yosemite',
  '大峡谷': 'grand canyon',
  '落基山': 'rocky mountain',
  '富士山': 'fuji',
  '日本': 'japan',
  '韩国': 'korea',
  '济州岛': 'jeju',
  '乞力马扎罗': 'kilimanjaro',
  '新西兰': 'new zealand',
};

export async function geocode(query: string): Promise<{ lat: number; lng: number; name: string } | null> {
  if (!query.trim()) return null;
  const q = query.toLowerCase().trim();

  // 1. Check Chinese keyword mapping
  if (CN_MAP[q]) return COORDS[CN_MAP[q]];

  // 2. Exact match
  if (COORDS[q]) return COORDS[q];

  // 3. Partial match (English keys)
  for (const [key, val] of Object.entries(COORDS)) {
    if (q.includes(key) || key.includes(q)) return val;
  }

  // 3b. Partial match (Chinese keys)
  for (const [key, engKey] of Object.entries(CN_MAP)) {
    if (q.includes(key)) return COORDS[engKey];
  }

  // 3. Backend proxy
  try {
    const res = await apiFetch('/api/search/geocode?q=' + encodeURIComponent(query));
    if (res.ok) { const data = await res.json(); if (data.lat) return data; }
  } catch {}

  // 4. Direct Nominatim
  try {
    const res = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query) + '&format=json&limit=1');
    const data = await res.json();
    if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: data[0].display_name };
  } catch {}

  return null;
}
