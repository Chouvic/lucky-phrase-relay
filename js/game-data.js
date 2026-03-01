/* ═══════════════════════════════════════════════════════════
   GAME DATA – Tiles, Templates, and Avatars
   All static data previously on the server
   ═══════════════════════════════════════════════════════════ */

// ─── Tile Data ──────────────────────────────────────────────
const LUCKY_TILES = [
  // ── Adjective tiles ──
  { text: 'golden',  chinese: '金',   meaning: 'Golden',     luck: 2, rare: false, slot: 'adj' },
  { text: 'joyful',  chinese: '喜',   meaning: 'Joyful',     luck: 2, rare: false, slot: 'adj' },
  { text: 'bright',  chinese: '明',   meaning: 'Bright',     luck: 2, rare: false, slot: 'adj' },
  { text: 'grand',   chinese: '大',   meaning: 'Grand',      luck: 2, rare: false, slot: 'adj' },
  { text: 'bold',    chinese: '勇',   meaning: 'Bold',       luck: 2, rare: false, slot: 'adj' },
  { text: 'swift',   chinese: '迅',   meaning: 'Swift',      luck: 2, rare: false, slot: 'adj' },
  { text: 'lucky',   chinese: '吉',   meaning: 'Lucky',      luck: 3, rare: true,  slot: 'adj' },
  { text: 'radiant', chinese: '旺',   meaning: 'Radiant',    luck: 2, rare: false, slot: 'adj' },
  { text: 'rich',    chinese: '富',   meaning: 'Rich',       luck: 3, rare: true,  slot: 'adj' },
  { text: 'warm',    chinese: '暖',   meaning: 'Warm',       luck: 2, rare: false, slot: 'adj' },
  { text: 'noble',   chinese: '貴',   meaning: 'Noble',      luck: 3, rare: true,  slot: 'adj' },
  { text: 'fresh',   chinese: '新',   meaning: 'Fresh/New',  luck: 2, rare: false, slot: 'adj' },
  { text: 'sweet',   chinese: '甜',   meaning: 'Sweet',      luck: 2, rare: false, slot: 'adj' },
  { text: 'mighty',  chinese: '壯',   meaning: 'Mighty',     luck: 3, rare: true,  slot: 'adj' },

  // ── Noun / blessing tiles ──
  { text: 'fortune', chinese: '福',   meaning: 'Fortune',    luck: 3, rare: true,  slot: 'noun' },
  { text: 'spring',  chinese: '春',   meaning: 'Spring',     luck: 2, rare: false, slot: 'noun' },
  { text: 'wealth',  chinese: '財',   meaning: 'Wealth',     luck: 3, rare: true,  slot: 'noun' },
  { text: 'harmony', chinese: '和',   meaning: 'Harmony',    luck: 2, rare: false, slot: 'noun' },
  { text: 'health',  chinese: '康',   meaning: 'Health',     luck: 2, rare: false, slot: 'noun' },
  { text: 'success', chinese: '成',   meaning: 'Success',    luck: 2, rare: false, slot: 'noun' },
  { text: 'peace',   chinese: '安',   meaning: 'Peace',      luck: 2, rare: false, slot: 'noun' },
  { text: 'joy',     chinese: '樂',   meaning: 'Joy',        luck: 2, rare: false, slot: 'noun' },
  { text: 'love',    chinese: '愛',   meaning: 'Love',       luck: 2, rare: false, slot: 'noun' },
  { text: 'hope',    chinese: '望',   meaning: 'Hope',       luck: 2, rare: false, slot: 'noun' },
  { text: 'dreams',  chinese: '夢',   meaning: 'Dreams',     luck: 2, rare: false, slot: 'noun' },
  { text: 'growth',  chinese: '長',   meaning: 'Growth',     luck: 2, rare: false, slot: 'noun' },
  { text: 'unity',   chinese: '團',   meaning: 'Unity',      luck: 3, rare: true,  slot: 'noun' },
  { text: 'vigour',  chinese: '力',   meaning: 'Vigour',     luck: 2, rare: false, slot: 'noun' },
  { text: 'glory',   chinese: '榮',   meaning: 'Glory',      luck: 3, rare: true,  slot: 'noun' },
  { text: 'spirit',  chinese: '氣',   meaning: 'Spirit',     luck: 2, rare: false, slot: 'noun' },

  // ── Emoji accent tiles ──
  { text: '🐴',  chinese: '馬',   meaning: 'Horse',       luck: 4, rare: true,  slot: 'emoji' },
  { text: '🧧',  chinese: '紅包', meaning: 'Red Packet',  luck: 3, rare: true,  slot: 'emoji' },
  { text: '🏮',  chinese: '燈籠', meaning: 'Lantern',     luck: 2, rare: false, slot: 'emoji' },
  { text: '🎆',  chinese: '煙花', meaning: 'Fireworks',   luck: 2, rare: false, slot: 'emoji' },
  { text: '🎊',  chinese: '慶祝', meaning: 'Celebration', luck: 2, rare: false, slot: 'emoji' },
  { text: '💰',  chinese: '金幣', meaning: 'Gold',        luck: 3, rare: true,  slot: 'emoji' },
  { text: '🍊',  chinese: '橘子', meaning: 'Orange',      luck: 2, rare: false, slot: 'emoji' },
  { text: '🌸',  chinese: '花',   meaning: 'Blossom',     luck: 2, rare: false, slot: 'emoji' },
  { text: '✨',  chinese: '閃光', meaning: 'Sparkles',    luck: 2, rare: false, slot: 'emoji' },
  { text: '🏇',  chinese: '賽馬', meaning: 'Racing',      luck: 4, rare: true,  slot: 'emoji' },
  { text: '🥟',  chinese: '餃子', meaning: 'Dumpling',    luck: 2, rare: false, slot: 'emoji' },
  { text: '🐎',  chinese: '駿馬', meaning: 'Stallion',    luck: 4, rare: true,  slot: 'emoji' },
];

// Taboo tiles – picking these reduces luck!
const TABOO_TILES = [
  // noun taboos
  { text: 'misfortune', chinese: '四',   meaning: 'Four (四 sounds like death)', luck: -3, rare: false, taboo: true, slot: 'noun', culturalNote: '"四" (sì) sounds like "死" (death) – a major taboo in Chinese culture!' },
  { text: 'loss',       chinese: '失',   meaning: 'Loss',          luck: -2, rare: false, taboo: true, slot: 'noun', culturalNote: 'Mentioning loss during New Year invites misfortune!' },
  { text: 'tears',      chinese: '哭',   meaning: 'Tears',         luck: -3, rare: false, taboo: true, slot: 'noun', culturalNote: 'Crying on New Year\'s Day will bring sorrow all year!' },
  { text: 'emptiness',  chinese: '空',   meaning: 'Emptiness',     luck: -2, rare: false, taboo: true, slot: 'noun', culturalNote: 'Emptiness symbolises poverty – keep your rice jars full!' },
  { text: 'debt',       chinese: '債',   meaning: 'Debt',          luck: -3, rare: false, taboo: true, slot: 'noun', culturalNote: 'All debts should be settled before New Year for a fresh start!' },
  { text: 'sorrow',     chinese: '黑',   meaning: 'Sorrow',        luck: -2, rare: false, taboo: true, slot: 'noun', culturalNote: 'Darkness is associated with mourning – wear red instead!' },
  { text: 'bad luck',   chinese: '倒霉', meaning: 'Bad Luck',      luck: -4, rare: false, taboo: true, slot: 'noun', culturalNote: 'The ultimate bad omen! Never say "unlucky" during festivities!' },
  { text: 'separation', chinese: '剪',   meaning: 'Separation',    luck: -2, rare: false, taboo: true, slot: 'noun', culturalNote: 'Using scissors on New Year "cuts" your fortune and relationships!' },
  // adj taboos
  { text: 'broken',     chinese: '碎',   meaning: 'Broken',        luck: -3, rare: false, taboo: true, slot: 'adj', culturalNote: 'Breaking things during New Year invites bad luck – handle with care!' },
  { text: 'bitter',     chinese: '苦',   meaning: 'Bitter',        luck: -2, rare: false, taboo: true, slot: 'adj', culturalNote: 'Bitter flavours symbolise hardship – eat sweet foods instead!' },
  { text: 'lonely',     chinese: '孤',   meaning: 'Lonely',        luck: -2, rare: false, taboo: true, slot: 'adj', culturalNote: 'Loneliness is avoided – New Year is about togetherness!' },
  { text: 'gloomy',     chinese: '暗',   meaning: 'Gloomy',        luck: -2, rare: false, taboo: true, slot: 'adj', culturalNote: 'Keep all the lights on during New Year to ward off darkness!' },
  // emoji taboos
  { text: '💀',        chinese: '骷髏', meaning: 'Skull',          luck: -3, rare: false, taboo: true, slot: 'emoji', culturalNote: 'Death imagery is strictly avoided during celebrations!' },
  { text: '🖤',        chinese: '黑心', meaning: 'Black Heart',    luck: -2, rare: false, taboo: true, slot: 'emoji', culturalNote: 'Black symbolises mourning – red is the colour of celebration!' },
  { text: '😭',        chinese: '大哭', meaning: 'Crying',         luck: -3, rare: false, taboo: true, slot: 'emoji', culturalNote: 'No crying during New Year – it brings sorrow for the whole year!' },
];

// ─── Greeting Templates ─────────────────────────────────────
const GREETING_TEMPLATES = [
  {
    starter: '{name} wishes you',
    pattern: [
      { slot: 'adj' }, { slot: 'noun' }, { connector: 'and' },
      { slot: 'adj' }, { slot: 'noun' }, { connector: 'and' },
      { slot: 'adj' }, { slot: 'noun' },
      { slot: 'emoji' }, { slot: 'emoji' },
    ],
    closer: 'in the Year of the Horse! 🐴',
  },
  {
    starter: '{name} hopes this Lunar New Year brings',
    pattern: [
      { slot: 'adj' }, { slot: 'noun' }, { connector: ',' },
      { slot: 'adj' }, { slot: 'noun' }, { connector: 'and' },
      { slot: 'adj' }, { slot: 'noun' },
      { slot: 'emoji' }, { slot: 'emoji' },
    ],
    closer: 'to you and yours! 🏮',
  },
  {
    starter: 'From {name} with love —',
    pattern: [
      { slot: 'adj' }, { slot: 'noun' }, { connector: ',' },
      { slot: 'adj' }, { slot: 'noun' }, { connector: 'and' },
      { slot: 'adj' }, { slot: 'noun' },
      { slot: 'emoji' }, { slot: 'emoji' },
    ],
    closer: 'this Year of the Horse! 🎆',
  },
  {
    starter: '{name} says: as the Horse gallops in, may you find',
    pattern: [
      { slot: 'adj' }, { slot: 'noun' }, { connector: ',' },
      { slot: 'adj' }, { slot: 'noun' }, { connector: 'and' },
      { slot: 'adj' }, { slot: 'noun' },
      { slot: 'emoji' }, { slot: 'emoji' },
    ],
    closer: 'all year long! 🏇',
  },
  {
    starter: '{name} from Glasgow wishes',
    pattern: [
      { slot: 'adj' }, { slot: 'noun' }, { connector: ',' },
      { slot: 'adj' }, { slot: 'noun' }, { connector: 'and' },
      { slot: 'adj' }, { slot: 'noun' },
      { slot: 'emoji' }, { slot: 'emoji' },
    ],
    closer: 'in 2026! 🧧',
  },
];

const AVATARS = ['🐴', '🏇', '🎠', '🐎', '🎑', '🏮', '🧧', '🎆', '🎊', '🎋', '🌸', '🍊', '💰', '🥟', '🎏', '🎐'];
