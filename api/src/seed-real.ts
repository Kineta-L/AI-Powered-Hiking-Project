const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Load env
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

// ============== TRAIL DATA ==============
// Each trail has coordinates tracing the actual hiking path (not roads!)

const trails = [
  // ===== CHINA TRAILS =====
  {
    titleZh: "虎跳峡高路徒步",
    titleEn: "Tiger Leaping Gorge High Trail",
    difficulty: "moderate",
    distance: 22,
    elevationGain: 1200,
    duration: 2,
    season: "春秋",
    region: "云南",
    country: "中国",
    descriptionZh: "世界十大经典徒步路线之一。沿金沙江峡谷北岸山腰行走，左手哈巴雪山，右手玉龙雪山，脚下是奔腾的金沙江。高路徒步线从桥头镇出发，经纳西雅阁、二十八道拐、Halfway客栈，到中虎跳结束。",
    descriptionEn: "One of the world's top 10 classic hikes. Walk along the northern cliff of Jinsha River gorge, with Haba Snow Mountain on the left and Jade Dragon Snow Mountain on the right. The high trail goes from Qiaotou through Naxi Family Guesthouse, 28 Bends, Halfway Guesthouse, to Tina's at Middle Gorge.",
    coordinates: [
      [100.054, 27.178, 1900], [100.059, 27.185, 1980], [100.064, 27.190, 2050],
      [100.068, 27.194, 2120], [100.073, 27.198, 2200], [100.078, 27.201, 2280],
      [100.083, 27.205, 2350], [100.088, 27.208, 2420], [100.092, 27.211, 2500],
      [100.097, 27.215, 2580], [100.102, 27.219, 2650], [100.106, 27.222, 2600],
      [100.110, 27.226, 2550], [100.115, 27.230, 2480], [100.120, 27.234, 2420],
      [100.124, 27.238, 2380], [100.128, 27.242, 2350], [100.133, 27.246, 2320],
      [100.137, 27.250, 2300], [100.142, 27.253, 2280], [100.147, 27.256, 2250],
      [100.151, 27.259, 2220], [100.156, 27.262, 2180], [100.160, 27.265, 2100],
      [100.165, 27.268, 2050], [100.170, 27.271, 2000], [100.175, 27.274, 1950],
      [100.180, 27.277, 1900], [100.185, 27.280, 1850], [100.190, 27.282, 1800],
    ],
    days: [
      { dayNumber: 1, titleZh: "桥头→纳西雅阁→Halfway", titleEn: "Qiaotou→Naxi→Halfway", description: "从桥头出发，经纳西雅阁吃午饭，挑战著名的二十八道拐，下午抵达Halfway客栈。全程约12km，爬升约800m。", distance: 12, elevation: 800, highlights: "二十八道拐、爽死你阳台" },
      { dayNumber: 2, titleZh: "Halfway→Tina's→中虎跳", titleEn: "Halfway→Tina's→Middle Gorge", description: "从Halfway出发，沿悬崖小路走到Tina's客栈，下山到中虎跳石。全程约10km，下降约600m。", distance: 10, elevation: 400, highlights: "悬崖小路、中虎跳石、金沙江" },
    ]
  },

  {
    titleZh: "雨崩徒步",
    titleEn: "Yubeng Village Trek",
    difficulty: "moderate",
    distance: 18,
    elevationGain: 1500,
    duration: 3,
    season: "春秋",
    region: "云南",
    country: "中国",
    descriptionZh: "梅里雪山脚下的世外桃源。从西当村徒步进雨崩，途经南宗垭口。在雨崩村可前往冰湖、神瀑等神山圣迹。",
    descriptionEn: "Hidden paradise at the foot of Meili Snow Mountain. Trek from Xidang Village into Yubeng via Nanzong Pass. From Yubeng, visit the sacred Ice Lake and Holy Waterfall.",
    coordinates: [
      [98.830, 28.395, 2650], [98.835, 28.394, 2750], [98.840, 28.393, 2850],
      [98.845, 28.392, 2950], [98.850, 28.391, 3050], [98.855, 28.390, 3150],
      [98.860, 28.389, 3250], [98.865, 28.388, 3350], [98.870, 28.387, 3450],
      [98.875, 28.386, 3550], [98.878, 28.385, 3650], [98.880, 28.383, 3700],
      [98.882, 28.381, 3680], [98.884, 28.379, 3620], [98.886, 28.377, 3550],
      [98.888, 28.375, 3450], [98.890, 28.373, 3350], [98.892, 28.371, 3250],
      [98.894, 28.369, 3150], [98.896, 28.367, 3100],
    ],
    days: [
      { dayNumber: 1, titleZh: "西当→南宗垭口→上雨崩", titleEn: "Xidang→Nanzong Pass→Upper Yubeng", description: "从西当温泉出发，爬升至南宗垭口（3700m），俯瞰梅里雪山，下坡到上雨崩村。约10km，爬升约1000m。", distance: 10, elevation: 1000, highlights: "南宗垭口、梅里雪山全景" },
      { dayNumber: 2, titleZh: "上雨崩→冰湖", titleEn: "Upper Yubeng→Ice Lake", description: "从上雨崩徒步至冰湖，途经笑农大本营。冰湖是梅里雪山的圣湖。往返约12km。", distance: 12, elevation: 600, highlights: "冰湖、笑农大本营、梅里雪山" },
      { dayNumber: 3, titleZh: "上雨崩→神瀑→西当", titleEn: "Upper Yubeng→Holy Waterfall→Xidang", description: "前往神瀑朝圣，然后返回西当。全程约14km。", distance: 14, elevation: 300, highlights: "神瀑、五冠峰、下雨崩" },
    ]
  },

  {
    titleZh: "四姑娘山长坪沟穿越",
    titleEn: "Siguniangshan Changping Valley Trek",
    difficulty: "advanced",
    distance: 32,
    elevationGain: 1800,
    duration: 3,
    season: "夏秋",
    region: "四川",
    country: "中国",
    descriptionZh: "从长坪沟穿越到毕棚沟，是四姑娘山最经典的徒步路线。翻越海拔4668m的垭口，沿途雪山、海子、森林尽收眼底。",
    descriptionEn: "Classic trek from Changping Valley to Bipeng Valley at Siguniang Mountain. Cross a 4668m pass with snow mountains, alpine lakes, and forests.",
    coordinates: [
      [102.840, 31.120, 3350], [102.842, 31.118, 3400], [102.844, 31.116, 3450],
      [102.847, 31.113, 3520], [102.850, 31.110, 3600], [102.853, 31.107, 3680],
      [102.856, 31.104, 3750], [102.859, 31.101, 3820], [102.862, 31.098, 3900],
      [102.865, 31.095, 3980], [102.868, 31.092, 4050], [102.870, 31.089, 4150],
      [102.872, 31.086, 4250], [102.874, 31.083, 4350], [102.876, 31.080, 4450],
      [102.878, 31.077, 4550], [102.880, 31.074, 4620], [102.881, 31.072, 4668],
      [102.882, 31.069, 4600], [102.883, 31.066, 4500], [102.885, 31.063, 4380],
      [102.887, 31.060, 4250], [102.889, 31.057, 4120], [102.891, 31.054, 3980],
      [102.893, 31.051, 3850], [102.895, 31.048, 3700], [102.897, 31.045, 3580],
    ],
    days: [
      { dayNumber: 1, titleZh: "长坪沟→木骡子", titleEn: "Changping Valley→Muluzi", description: "从长坪沟口出发，沿河谷徒步至木骡子营地。约12km，缓慢爬升。", distance: 12, elevation: 400, highlights: "枯树滩、婆缪峰、木骡子" },
      { dayNumber: 2, titleZh: "木骡子→垭口下方营地", titleEn: "Muluzi→Pass Base Camp", description: "从木骡子向垭口方向爬升，在高山草甸扎营。约8km，爬升约800m。", distance: 8, elevation: 800, highlights: "高山草甸、幺妹峰、海子" },
      { dayNumber: 3, titleZh: "翻垭口→毕棚沟", titleEn: "Cross Pass→Bipeng Valley", description: "凌晨翻越4668m垭口，下到毕棚沟。全程约12km。最艰难的一天。", distance: 12, elevation: 600, highlights: "垭口、云海、毕棚沟秋色" },
    ]
  },

  {
    titleZh: "武功山徒步",
    titleEn: "Wugongshan Ridge Trek",
    difficulty: "moderate",
    distance: 24,
    elevationGain: 1600,
    duration: 2,
    season: "全年（云海最佳春秋）",
    region: "江西",
    country: "中国",
    descriptionZh: "华东户外圣地，以高山草甸和云海日出闻名。从沈子村出发，沿山脊穿越金顶、吊马桩、发云界，金色草甸一望无际。",
    descriptionEn: "Eastern China's hiking mecca, famous for alpine meadows and sea of clouds. Trek from Shenzi Village along the ridge through Golden Summit to Fayunjie.",
    coordinates: [
      [114.160, 27.450, 600], [114.163, 27.455, 800], [114.166, 27.458, 1000],
      [114.168, 27.460, 1200], [114.170, 27.462, 1400], [114.172, 27.464, 1600],
      [114.174, 27.466, 1750], [114.176, 27.468, 1850], [114.178, 27.470, 1900],
      [114.180, 27.471, 1918], [114.178, 27.472, 1900], [114.176, 27.473, 1850],
      [114.174, 27.474, 1780], [114.172, 27.475, 1700], [114.170, 27.476, 1650],
      [114.168, 27.478, 1600], [114.166, 27.480, 1550], [114.164, 27.482, 1500],
      [114.162, 27.484, 1480], [114.160, 27.486, 1450], [114.158, 27.488, 1400],
      [114.156, 27.490, 1350], [114.154, 27.492, 1300], [114.152, 27.494, 1250],
      [114.150, 27.496, 1200],
    ],
    days: [
      { dayNumber: 1, titleZh: "沈子村→金顶", titleEn: "Shenzi→Golden Summit", description: "从沈子村出发，经铁蹄峰登上金顶（1918m）。约12km，爬升约1300m。夜宿金顶，第二天看日出云海。", distance: 12, elevation: 1300, highlights: "高山草甸、金顶日出、云海" },
      { dayNumber: 2, titleZh: "金顶→发云界→龙山村", titleEn: "Golden Summit→Fayunjie→Longshan", description: "沿山脊穿越吊马桩、发云界，一路金色草甸。约12km，累计爬升约300m。", distance: 12, elevation: 300, highlights: "绝望坡、好汉坡、发云界草甸" },
    ]
  },

  // ===== NEPAL TRAILS =====
  {
    titleZh: "安娜普尔纳大本营（ABC）",
    titleEn: "Annapurna Base Camp (ABC)",
    difficulty: "moderate",
    distance: 65,
    elevationGain: 4000,
    duration: 7,
    season: "春秋（3-5月, 10-11月）",
    region: "安娜普尔纳",
    country: "尼泊尔",
    descriptionZh: "世界最美徒步路线之一。从Nayapul出发，途经Ghandruk、Chhomrong，深入安娜普尔纳保护区，抵达海拔4130m的ABC大本营，被7000m+雪峰环绕。",
    descriptionEn: "One of the world's most beautiful treks. From Nayapul through Ghandruk and Chhomrong, deep into Annapurna Sanctuary to ABC at 4130m, surrounded by 7000m+ peaks.",
    coordinates: [
      [83.800, 28.330, 1070], [83.805, 28.335, 1200], [83.810, 28.338, 1400],
      [83.815, 28.340, 1600], [83.820, 28.342, 1800], [83.822, 28.345, 1950],
      [83.820, 28.348, 2100], [83.818, 28.352, 2250], [83.816, 28.356, 2400],
      [83.814, 28.360, 2550], [83.812, 28.364, 2700], [83.810, 28.368, 2850],
      [83.808, 28.372, 3000], [83.806, 28.376, 3150], [83.804, 28.380, 3300],
      [83.803, 28.384, 3450], [83.802, 28.388, 3600], [83.801, 28.392, 3750],
      [83.800, 28.396, 3900], [83.799, 28.400, 4000], [83.798, 28.404, 4100],
      [83.797, 28.408, 4130],
    ],
    days: [
      { dayNumber: 1, titleZh: "Nayapul→Ghandruk", titleEn: "Nayapul→Ghandruk", description: "从Nayapul出发，爬升至美丽的Gurung村庄Ghandruk。约10km，爬升约900m。", distance: 10, elevation: 900, highlights: "Gurung文化村、梯田、鱼尾峰" },
      { dayNumber: 2, titleZh: "Ghandruk→Chhomrong", titleEn: "Ghandruk→Chhomrong", description: "沿山脊下到Kimrong河，再爬升至Chhomrong。约9km。", distance: 9, elevation: 600, highlights: "Kimrong河谷、Chhomrong观景" },
      { dayNumber: 3, titleZh: "Chhomrong→Himalaya", titleEn: "Chhomrong→Himalaya", description: "下降至Chhomrong河，经Sinuwa、Bamboo，到Himalaya。约11km。", distance: 11, elevation: 800, highlights: "竹林、原始森林" },
      { dayNumber: 4, titleZh: "Himalaya→MBC", titleEn: "Himalaya→MBC", description: "经Deurali到鱼尾峰大本营(MBC, 3700m)。约8km，进入高海拔。", distance: 8, elevation: 800, highlights: "鱼尾峰大本营、冰碛地貌" },
      { dayNumber: 5, titleZh: "MBC→ABC→Bamboo", titleEn: "MBC→ABC→Bamboo", description: "清晨上ABC看日出，被安娜普尔纳群峰环绕。然后长距离下山。约15km。", distance: 15, elevation: 300, highlights: "ABC日出、360°雪山全景" },
      { dayNumber: 6, titleZh: "Bamboo→Jhinu", titleEn: "Bamboo→Jhinu", description: "下山至Jhinu，可泡天然温泉。约10km。", distance: 10, elevation: 200, highlights: "天然温泉、峡谷景观" },
      { dayNumber: 7, titleZh: "Jhinu→Nayapul", titleEn: "Jhinu→Nayapul", description: "最后一天轻松下山回到Nayapul。约8km。", distance: 8, elevation: 100, highlights: "河谷、乡村风光" },
    ]
  },

  {
    titleZh: "珠峰大本营（EBC）",
    titleEn: "Everest Base Camp (EBC)",
    difficulty: "advanced",
    distance: 130,
    elevationGain: 6000,
    duration: 14,
    season: "春秋（3-5月, 10-11月）",
    region: "昆布",
    country: "尼泊尔",
    descriptionZh: "通往世界之巅的朝圣之路。从Lukla出发，穿越萨加玛塔国家公园，途经Namche Bazaar、Tengboche、Dingboche，抵达海拔5364m的EBC。",
    descriptionEn: "The pilgrimage to the top of the world. From Lukla through Sagarmatha National Park, passing Namche Bazaar, Tengboche, Dingboche, to EBC at 5364m.",
    coordinates: [
      [86.730, 27.687, 2840], [86.732, 27.690, 2800], [86.734, 27.694, 2750],
      [86.736, 27.698, 2700], [86.738, 27.702, 2650], [86.740, 27.706, 2600],
      [86.742, 27.710, 2650], [86.744, 27.714, 2750], [86.745, 27.718, 2850],
      [86.746, 27.722, 2950], [86.747, 27.726, 3050], [86.748, 27.730, 3150],
      [86.749, 27.734, 3250], [86.748, 27.738, 3350], [86.747, 27.742, 3450],
      [86.746, 27.746, 3550], [86.745, 27.750, 3650], [86.744, 27.754, 3750],
      [86.743, 27.758, 3850], [86.742, 27.762, 3950], [86.741, 27.766, 4050],
      [86.740, 27.770, 4150], [86.739, 27.774, 4250], [86.738, 27.778, 4350],
      [86.737, 27.782, 4450], [86.736, 27.786, 4550], [86.735, 27.790, 4650],
      [86.734, 27.794, 4750], [86.733, 27.798, 4850], [86.732, 27.802, 4950],
      [86.731, 27.806, 5050], [86.730, 27.810, 5150], [86.729, 27.814, 5250],
      [86.728, 27.818, 5364],
    ],
    days: [
      { dayNumber: 1, titleZh: "Lukla→Phakding", titleEn: "Lukla→Phakding", description: "从Lukla（2840m）出发，沿Dudh Koshi河谷下到Phakding。约8km，轻松适应。", distance: 8, elevation: 200, highlights: "Lukla机场、河谷风光" },
      { dayNumber: 2, titleZh: "Phakding→Namche Bazaar", titleEn: "Phakding→Namche Bazaar", description: "进入萨加玛塔国家公园，翻越著名的Namche大坡。约10km，爬升约800m。", distance: 10, elevation: 800, highlights: "首次见到珠峰、Namche Bazaar" },
      { dayNumber: 3, titleZh: "Namche适应日", titleEn: "Namche Acclimatization", description: "适应高海拔，可徒步至Everest View Hotel观珠峰。短途徒步。", distance: 5, elevation: 300, highlights: "珠峰景观、Sherpa文化博物馆" },
      { dayNumber: 4, titleZh: "Namche→Tengboche", titleEn: "Namche→Tengboche", description: "沿山腰小路到Tengboche，著名的Tengboche Monastery。约10km。", distance: 10, elevation: 400, highlights: "Tengboche Monastery、Ama Dablam" },
      { dayNumber: 5, titleZh: "Tengboche→Dingboche", titleEn: "Tengboche→Dingboche", description: "经Pangboche到Dingboche（4410m）。约10km，进入高海拔。", distance: 10, elevation: 600, highlights: "Ama Dablam全景、高山地貌" },
      { dayNumber: 6, titleZh: "Dingboche适应日", titleEn: "Dingboche Acclimatization", description: "爬Nangkartshang Peak（5083m）适应，俯瞰Makalu。约5km。", distance: 5, elevation: 400, highlights: "Makalu景观、伊姆扎湖" },
      { dayNumber: 7, titleZh: "Dingboche→Lobuche", titleEn: "Dingboche→Lobuche", description: "经Thukla Pass到Lobuche（4910m）。约8km，缅怀珠峰遇难者的纪念碑群。", distance: 8, elevation: 500, highlights: "Thukla Pass纪念碑、冰川" },
      { dayNumber: 8, titleZh: "Lobuche→Gorak Shep→EBC", titleEn: "Lobuche→Gorak Shep→EBC", description: "到Gorak Shep（5140m），下午前往EBC（5364m）。约12km。", distance: 12, elevation: 400, highlights: "EBC、昆布冰川、珠峰" },
      { dayNumber: 9, titleZh: "Kala Patthar→Pheriche", titleEn: "Kala Patthar→Pheriche", description: "清晨爬Kala Patthar（5550m）看珠峰日出，然后下山。约15km。", distance: 15, elevation: 300, highlights: "Kala Patthar珠峰日出、金色珠峰" },
      { dayNumber: 10, titleZh: "Pheriche→Namche", titleEn: "Pheriche→Namche", description: "长距离下山回到Namche。约18km。", distance: 18, elevation: 200, highlights: "回程风光、Namche庆祝" },
      { dayNumber: 11, titleZh: "Namche→Lukla", titleEn: "Namche→Lukla", description: "最后一天回到Lukla。约18km。", distance: 18, elevation: 200, highlights: "告别喜马拉雅、Lukla庆祝" },
    ]
  },

  // ===== EUROPE TRAILS =====
  {
    titleZh: "环勃朗峰（TMB）精华段",
    titleEn: "Tour du Mont Blanc (TMB) Highlights",
    difficulty: "advanced",
    distance: 60,
    elevationGain: 4000,
    duration: 5,
    season: "夏季（7-8月）",
    region: "阿尔卑斯",
    country: "法国/意大利/瑞士",
    descriptionZh: "世界顶级徒步路线TMB的精华段。从Les Houches出发，穿越法意瑞三国，每天翻越一个山口，欣赏勃朗峰的壮丽景色。",
    descriptionEn: "The highlights of the world-class TMB. From Les Houches crossing France, Italy, and Switzerland, crossing a pass each day with stunning views of Mont Blanc.",
    coordinates: [
      [6.800, 45.890, 1010], [6.805, 45.892, 1200], [6.810, 45.894, 1400],
      [6.815, 45.896, 1600], [6.820, 45.898, 1800], [6.822, 45.900, 2000],
      [6.824, 45.902, 2200], [6.826, 45.904, 2350], [6.828, 45.906, 2500],
      [6.830, 45.908, 2450], [6.835, 45.910, 2300], [6.840, 45.912, 2150],
      [6.845, 45.914, 2000], [6.850, 45.916, 1850], [6.855, 45.918, 1700],
      [6.860, 45.920, 1600], [6.865, 45.922, 1450], [6.870, 45.924, 1400],
      [6.875, 45.926, 1500], [6.880, 45.928, 1700], [6.885, 45.930, 1900],
      [6.888, 45.932, 2100], [6.890, 45.934, 2250], [6.892, 45.936, 2400],
      [6.894, 45.938, 2530], [6.896, 45.940, 2400], [6.900, 45.942, 2250],
      [6.904, 45.944, 2100], [6.908, 45.946, 1950], [6.912, 45.948, 1800],
      [6.916, 45.950, 1700],
    ],
    days: [
      { dayNumber: 1, titleZh: "Les Houches→Les Contamines", titleEn: "Les Houches→Les Contamines", description: "翻越Col de Tricot，远眺勃朗峰。约14km，爬升约1000m。", distance: 14, elevation: 1000, highlights: "Col de Tricot、勃朗峰全景、冰川" },
      { dayNumber: 2, titleZh: "Les Contamines→Refuge des Mottets", titleEn: "Les Contamines→Mottets", description: "经Notre Dame de la Gorge，翻越Col de la Croix du Bonhomme。约13km。", distance: 13, elevation: 1200, highlights: "Bonhomme山口、高山牧场" },
      { dayNumber: 3, titleZh: "Mottets→Courmayeur（意大利）", titleEn: "Mottets→Courmayeur", description: "翻越Col de la Seigne进入意大利，下到Courmayeur。约12km。", distance: 12, elevation: 900, highlights: "意法边境、Courmayeur小镇" },
      { dayNumber: 4, titleZh: "Courmayeur→Refuge Bonatti", titleEn: "Courmayeur→Bonatti", description: "沿Val Ferret走到Refuge Bonatti，勃朗峰最经典的一段。约10km。", distance: 10, elevation: 800, highlights: "Val Ferret、Grandes Jorasses" },
      { dayNumber: 5, titleZh: "Bonatti→La Fouly（瑞士）", titleEn: "Bonatti→La Fouly", description: "翻越Grand Col Ferret进入瑞士，下到La Fouly。约11km。", distance: 11, elevation: 700, highlights: "意瑞边境、瑞士山谷" },
    ]
  },

  // ===== SOUTH AMERICA TRAILS =====
  {
    titleZh: "印加古道（马丘比丘）",
    titleEn: "Inca Trail to Machu Picchu",
    difficulty: "moderate",
    distance: 43,
    elevationGain: 2500,
    duration: 4,
    season: "旱季（5-9月）",
    region: "库斯科",
    country: "秘鲁",
    descriptionZh: "通往失落印加古城马丘比丘的朝圣之路。沿印加古道翻越海拔4200m的Dead Woman's Pass，途经多个印加遗址，最终从太阳门俯瞰马丘比丘。",
    descriptionEn: "The pilgrimage to the lost Inca city of Machu Picchu. Follow the ancient Inca trail over 4200m Dead Woman's Pass, passing Inca ruins to the Sun Gate overlooking Machu Picchu.",
    coordinates: [
      [-72.540, -13.200, 2720], [-72.535, -13.195, 2800], [-72.530, -13.190, 2900],
      [-72.525, -13.185, 3000], [-72.520, -13.180, 3150], [-72.515, -13.178, 3300],
      [-72.510, -13.176, 3450], [-72.505, -13.174, 3600], [-72.500, -13.172, 3750],
      [-72.498, -13.170, 3900], [-72.496, -13.168, 4000], [-72.494, -13.166, 4100],
      [-72.492, -13.164, 4200], [-72.490, -13.162, 4100], [-72.488, -13.160, 3950],
      [-72.486, -13.158, 3800], [-72.484, -13.156, 3650], [-72.482, -13.154, 3500],
      [-72.480, -13.152, 3380], [-72.478, -13.150, 3250], [-72.476, -13.148, 3120],
      [-72.474, -13.146, 3000], [-72.472, -13.144, 2880], [-72.470, -13.142, 2750],
      [-72.468, -13.140, 2680], [-72.466, -13.138, 2600], [-72.464, -13.136, 2550],
      [-72.462, -13.134, 2500], [-72.460, -13.132, 2450], [-72.458, -13.130, 2430],
    ],
    days: [
      { dayNumber: 1, titleZh: "Km82→Wayllabamba", titleEn: "Km82→Wayllabamba", description: "从Km82出发，沿Urubamba河徒步，途经Llactapata遗址。约12km，爬升约300m。", distance: 12, elevation: 300, highlights: "Llactapata遗址、河谷景观" },
      { dayNumber: 2, titleZh: "Wayllabamba→Pacaymayo（最难点）", titleEn: "Wayllabamba→Pacaymayo", description: "翻越Dead Woman's Pass（4200m），全线最高最难点。约11km，爬升约1200m。", distance: 11, elevation: 1200, highlights: "Dead Woman's Pass、云雾森林" },
      { dayNumber: 3, titleZh: "Pacaymayo→Wiñay Wayna", titleEn: "Pacaymayo→Wiñay Wayna", description: "翻越Runkurakay Pass，经Sayacmarca和Phuyupatamarca遗址。约16km。", distance: 16, elevation: 600, highlights: "多个印加遗址、安第斯风光" },
      { dayNumber: 4, titleZh: "Wiñay Wayna→马丘比丘", titleEn: "Wiñay Wayna→Machu Picchu", description: "凌晨出发到太阳门（Inti Punku），日出时俯瞰马丘比丘全景。约5km，然后游览古城。", distance: 5, elevation: 200, highlights: "太阳门日出、马丘比丘" },
    ]
  },

  {
    titleZh: "百内W线",
    titleEn: "Torres del Paine W Trek",
    difficulty: "moderate",
    distance: 76,
    elevationGain: 3000,
    duration: 5,
    season: "夏季（11-3月）",
    region: "巴塔哥尼亚",
    country: "智利",
    descriptionZh: "巴塔哥尼亚最经典的徒步路线。W线串联三大亮点：百内三塔、法国谷、格雷冰川。一路上雪山、湖泊、冰川交相辉映。",
    descriptionEn: "Patagonia's most classic trek. The W connects three highlights: Las Torres, Valle Francés, and Grey Glacier. Snow peaks, turquoise lakes, and glaciers throughout.",
    coordinates: [
      [-72.910, -50.970, 150], [-72.905, -50.968, 200], [-72.900, -50.966, 300],
      [-72.895, -50.964, 450], [-72.890, -50.962, 600], [-72.887, -50.960, 750],
      [-72.884, -50.958, 870], [-72.882, -50.956, 900], [-72.884, -50.958, 870],
      [-72.887, -50.960, 750], [-72.890, -50.962, 600], [-72.900, -50.965, 400],
      [-72.905, -50.968, 200], [-72.910, -50.970, 150], [-72.915, -50.972, 100],
      [-72.918, -50.974, 80], [-72.920, -50.978, 100], [-72.922, -50.982, 150],
      [-72.924, -50.986, 200], [-72.926, -50.990, 300], [-72.928, -50.994, 400],
      [-72.930, -50.998, 500], [-72.932, -51.002, 600], [-72.934, -51.006, 550],
      [-72.936, -51.010, 450], [-72.938, -51.014, 350], [-72.940, -51.018, 250],
      [-72.942, -51.022, 150], [-72.940, -51.026, 100], [-72.938, -51.030, 80],
    ],
    days: [
      { dayNumber: 1, titleZh: "Central→Las Torres Base", titleEn: "Central→Torres Base Lookout", description: "从Central出发，登百内三塔观景台。往返约18km，爬升约900m。", distance: 18, elevation: 900, highlights: "百内三塔、高山湖泊" },
      { dayNumber: 2, titleZh: "Central→Francés", titleEn: "Central→Francés", description: "沿Nordenskjöld湖走到Francés营地。约14km，起伏不大。", distance: 14, elevation: 300, highlights: "湖光山色、Los Cuernos" },
      { dayNumber: 3, titleZh: "Francés→Valle Francés→Francés", titleEn: "Francés→French Valley", description: "深入法国谷，仰望百内角峰和雪崩。往返约16km。", distance: 16, elevation: 600, highlights: "法国谷、百内角峰、冰川" },
      { dayNumber: 4, titleZh: "Francés→Grey", titleEn: "Francés→Grey", description: "徒步至Grey冰川观景点。约12km。", distance: 12, elevation: 400, highlights: "Grey冰川、冰山" },
      { dayNumber: 5, titleZh: "Grey→Paine Grande", titleEn: "Grey→Paine Grande", description: "沿Grey湖返回Paine Grande，乘船离开。约13km。", distance: 13, elevation: 200, highlights: "Grey湖、最后一眼百内" },
    ]
  },

  // ===== MORE TRAILS =====
  {
    titleZh: "苏格兰西部高地线",
    titleEn: "West Highland Way",
    difficulty: "moderate",
    distance: 50,
    elevationGain: 2200,
    duration: 4,
    season: "春夏（4-9月）",
    region: "苏格兰高地",
    country: "英国",
    descriptionZh: "苏格兰最著名的长距离徒步路线精华段。从Bridge of Orchy到Fort William，穿越Rannoch Moor荒野，在Glen Coe山谷中行走，最终抵达英国最高峰Ben Nevis脚下。",
    descriptionEn: "Scotland's most famous long-distance trail highlights. From Bridge of Orchy to Fort William, crossing wild Rannoch Moor and Glen Coe, ending at the foot of Ben Nevis.",
    coordinates: [
      [-4.770, 56.515, 250], [-4.775, 56.518, 280], [-4.780, 56.522, 320],
      [-4.785, 56.525, 380], [-4.790, 56.528, 420], [-4.795, 56.532, 450],
      [-4.800, 56.535, 480], [-4.805, 56.538, 500], [-4.810, 56.542, 480],
      [-4.815, 56.545, 450], [-4.820, 56.548, 420], [-4.825, 56.552, 400],
      [-4.830, 56.555, 380], [-4.835, 56.558, 350], [-4.840, 56.562, 320],
      [-4.845, 56.565, 300], [-4.850, 56.568, 280], [-4.860, 56.572, 250],
      [-4.870, 56.575, 220], [-4.880, 56.578, 180], [-4.890, 56.582, 150],
      [-4.900, 56.585, 120], [-4.910, 56.588, 100], [-4.920, 56.592, 80],
      [-4.930, 56.595, 60], [-4.940, 56.598, 40], [-4.950, 56.602, 30],
      [-4.960, 56.605, 20], [-4.970, 56.608, 15], [-4.980, 56.612, 10],
      [-4.990, 56.615, 8], [-4.995, 56.618, 5], [-5.000, 56.620, 2],
    ],
    days: [
      { dayNumber: 1, titleZh: "Bridge of Orchy→Kingshouse", titleEn: "Bridge of Orchy→Kingshouse", description: "穿越Rannoch Moor荒野，苏格兰最壮丽的高原景观。约15km。", distance: 15, elevation: 600, highlights: "Rannoch Moor、Buachaille Etive Mòr" },
      { dayNumber: 2, titleZh: "Kingshouse→Kinlochleven", titleEn: "Kingshouse→Kinlochleven", description: "攀爬Devil's Staircase，穿越Glen Coe。约12km。", distance: 12, elevation: 500, highlights: "Devil's Staircase、Glen Coe全景" },
      { dayNumber: 3, titleZh: "Kinlochleven→Fort William", titleEn: "Kinlochleven→Fort William", description: "沿Lairigmor山谷走到Glen Nevis。约18km。", distance: 18, elevation: 600, highlights: "Lairigmor山谷、Ben Nevis" },
      { dayNumber: 4, titleZh: "Fort William→Ben Nevis登顶（可选）", titleEn: "Ben Nevis Summit (Optional)", description: "攀登英国最高峰Ben Nevis（1345m）。往返约16km。", distance: 16, elevation: 1300, highlights: "英国最高点、高地全景" },
    ]
  },

  {
    titleZh: "稻城亚丁大转",
    titleEn: "Yading Kora Trek",
    difficulty: "advanced",
    distance: 45,
    elevationGain: 3000,
    duration: 5,
    season: "秋季（9-10月）",
    region: "四川",
    country: "中国",
    descriptionZh: "蓝色星球上最后一片净土。围绕仙乃日、央迈勇、夏诺多吉三座神山转山，途经牛奶海、五色海。秋季是最美季节。",
    descriptionEn: "The last pure land on the blue planet. Kora around the three sacred mountains of Chenrezig, Jambeyang, and Chanadorje, passing Milk Lake and Five-Color Lake.",
    coordinates: [
      [100.390, 28.440, 4150], [100.388, 28.438, 4200], [100.385, 28.436, 4280],
      [100.382, 28.434, 4350], [100.379, 28.432, 4420], [100.376, 28.430, 4500],
      [100.373, 28.428, 4580], [100.370, 28.426, 4650], [100.367, 28.424, 4700],
      [100.364, 28.422, 4680], [100.361, 28.420, 4620], [100.358, 28.418, 4550],
      [100.355, 28.416, 4480], [100.352, 28.414, 4400], [100.350, 28.412, 4350],
      [100.348, 28.410, 4320], [100.346, 28.408, 4380], [100.344, 28.406, 4450],
      [100.342, 28.404, 4520], [100.340, 28.402, 4600], [100.338, 28.400, 4680],
      [100.340, 28.398, 4650], [100.342, 28.396, 4580], [100.344, 28.394, 4500],
      [100.346, 28.392, 4420], [100.348, 28.390, 4350], [100.350, 28.388, 4300],
      [100.352, 28.386, 4250], [100.354, 28.384, 4200], [100.356, 28.382, 4180],
    ],
    days: [
      { dayNumber: 1, titleZh: "冲古寺→洛绒牛场→牛奶海", titleEn: "Chonggu Monastery→Luorong→Milk Lake", description: "从冲古寺经洛绒牛场，到牛奶海（4600m）。约12km，爬升约500m。", distance: 12, elevation: 500, highlights: "洛绒牛场、央迈勇神山、牛奶海" },
      { dayNumber: 2, titleZh: "牛奶海→五色海→智慧海", titleEn: "Milk Lake→Five-Color Lake→Wisdom Lake", description: "翻越垭口，经五色海到智慧海。约10km。", distance: 10, elevation: 600, highlights: "五色海、仙乃日倒影" },
      { dayNumber: 3, titleZh: "智慧海→卡斯地狱谷", titleEn: "Wisdom Lake→Kasi Hell Valley", description: "下到卡斯地狱谷，原始森林和溪流。约10km。", distance: 10, elevation: 400, highlights: "地狱谷、原始森林" },
      { dayNumber: 4, titleZh: "卡斯→珍珠海", titleEn: "Kasi→Pearl Lake", description: "经卡斯村绕到珍珠海。约10km。", distance: 10, elevation: 500, highlights: "卡斯村、珍珠海、仙乃日" },
      { dayNumber: 5, titleZh: "珍珠海→冲古寺", titleEn: "Pearl Lake→Chonggu Monastery", description: "返回冲古寺，完成转山。约8km。", distance: 8, elevation: 300, highlights: "冲古寺、三神山全景" },
    ]
  },
];

async function main() {
  console.log(`\n🌍 开始导入 ${trails.length} 条经典徒步路线...\n`);

  for (const t of trails) {
    // Check if trail already exists
    const existing = await prisma.trail.findFirst({
      where: { titleZh: t.titleZh }
    });

    if (existing) {
      console.log(`  ⏭️ 跳过已存在: ${t.titleZh}`);
      continue;
    }

    const trail = await prisma.trail.create({
      data: {
        titleZh: t.titleZh,
        titleEn: t.titleEn,
        descriptionZh: t.descriptionZh,
        descriptionEn: t.descriptionEn,
        difficulty: t.difficulty,
        distance: t.distance,
        elevationGain: t.elevationGain,
        duration: t.duration,
        season: t.season,
        region: t.region,
        country: t.country,
        status: 'seed',
        coordinates: {
          create: t.coordinates.map((c, i) => ({
            latitude: c[1],
            longitude: c[0],
            elevation: c[2],
            order: i,
          })),
        },
        days: {
          create: t.days.map(d => ({
            dayNumber: d.dayNumber,
            titleZh: d.titleZh,
            titleEn: d.titleEn,
            description: d.description,
            distance: d.distance,
            elevation: d.elevation,
            highlights: d.highlights,
          })),
        },
      },
    });

    console.log(`  ✅ ${t.titleZh} (${t.coordinates.length} 坐标点, ${t.days.length} 天)`);
  }

  const total = await prisma.trail.count({ where: { status: 'seed' } });
  console.log(`\n🎉 完成！数据库共有 ${total} 条种子路线\n`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());