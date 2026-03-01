/* ═══════════════════════════════════════════════════════════
   春聯 CHŪNLIÁN DATA – Traditional Spring Couplet Phrases
   Year of the Horse 2026 | JPMC Glasgow
   ───────────────────────────────────────────────────────────
   Structure of a Chūnlián (Spring Couplet):
     橫批 héngpī  — Horizontal header scroll (4 characters)
     右聯 yòulián — Right-side vertical scroll (上聯 first line)
     左聯 zuǒlián — Left-side vertical scroll  (下聯 second line)
   
   The right line (上聯) is read first; the left line (下聯) second.
   Both vertical lines must have the SAME number of characters.
   When hung on a door: right scroll on the right, left on left,
   horizontal header across the top of the door frame.
   ═══════════════════════════════════════════════════════════ */

// ─── Horizontal Headers 橫批 héngpī (4 characters) ──────────
const CHUNLIAN_HEADERS = [
  {
    id: 'h1',
    chinese: '萬事如意',
    pinyin: 'Wàn shì rú yì',
    english: 'May all go as you wish',
  },
  {
    id: 'h2',
    chinese: '吉祥如意',
    pinyin: 'Jí xiáng rú yì',
    english: 'Auspicious and as you wish',
  },
  {
    id: 'h3',
    chinese: '五福臨門',
    pinyin: 'Wǔ fú lín mén',
    english: 'Five blessings arrive at the door',
  },
  {
    id: 'h4',
    chinese: '迎春接福',
    pinyin: 'Yíng chūn jiē fú',
    english: 'Welcome spring, receive blessings',
  },
  {
    id: 'h5',
    chinese: '春回大地',
    pinyin: 'Chūn huí dà dì',
    english: 'Spring returns to the earth',
  },
  {
    id: 'h6',
    chinese: '福壽雙全',
    pinyin: 'Fú shòu shuāng quán',
    english: 'Both fortune and longevity',
  },
  {
    id: 'h7',
    chinese: '馬到成功',
    pinyin: 'Mǎ dào chéng gōng',
    english: 'Success upon the horse\'s arrival',
  },
  {
    id: 'h8',
    chinese: '龍馬精神',
    pinyin: 'Lóng mǎ jīng shén',
    english: 'Spirit of the dragon-horse',
  },
  {
    id: 'h9',
    chinese: '闔家歡樂',
    pinyin: 'Hé jiā huān lè',
    english: 'Joy for the whole family',
  },
  {
    id: 'h10',
    chinese: '紫氣東來',
    pinyin: 'Zǐ qì dōng lái',
    english: 'Purple aura arrives from the east',
  },
  {
    id: 'h11',
    chinese: '財源廣進',
    pinyin: 'Cái yuán guǎng jìn',
    english: 'Wealth flows in from all directions',
  },
  {
    id: 'h12',
    chinese: '國泰民安',
    pinyin: 'Guó tài mín ān',
    english: 'Nation prospers, people at peace',
  },
];

// ─── Right-side Lines 右聯 / 上聯 (grouped by length) ───────
// The right scroll is read FIRST and traditionally ends with an oblique tone
// User picks one; this determines the character length for the left line

const CHUNLIAN_RIGHT_LINES = [
  // ── 5-character lines (五言) ──
  { id: 'r5a', length: 5, chinese: '春風送暖意', pinyin: 'Chūn fēng sòng nuǎn yì', english: 'Spring breeze brings warm affection' },
  { id: 'r5b', length: 5, chinese: '花開富貴來', pinyin: 'Huā kāi fù guì lái',    english: 'Blossoming flowers bring wealth' },
  { id: 'r5c', length: 5, chinese: '迎春納百福', pinyin: 'Yíng chūn nà bǎi fú',   english: 'Welcome spring, embrace a hundred blessings' },
  { id: 'r5d', length: 5, chinese: '紫氣東方來', pinyin: 'Zǐ qì dōng fāng lái',   english: 'Purple aura comes from the east' },
  { id: 'r5e', length: 5, chinese: '瑞雪兆豐年', pinyin: 'Ruì xuě zhào fēng nián', english: 'Auspicious snow heralds a bountiful year' },
  { id: 'r5f', length: 5, chinese: '梅開五福到', pinyin: 'Méi kāi wǔ fú dào',     english: 'Plum blossoms open, five blessings arrive' },

  // ── 7-character lines (七言) ──
  { id: 'r7a', length: 7, chinese: '天增歲月人增壽', pinyin: 'Tiān zēng suì yuè rén zēng shòu', english: 'Heaven adds years, people gain longevity' },
  { id: 'r7b', length: 7, chinese: '一年四季春常在', pinyin: 'Yī nián sì jì chūn cháng zài',    english: 'Spring endures through all four seasons' },
  { id: 'r7c', length: 7, chinese: '爆竹聲中一歲除', pinyin: 'Bào zhú shēng zhōng yī suì chú',  english: 'Amid firecrackers, the old year departs' },
  { id: 'r7d', length: 7, chinese: '喜居寶地千年旺', pinyin: 'Xǐ jū bǎo dì qiān nián wàng',    english: 'Dwelling on blessed land, prosperous a thousand years' },
  { id: 'r7e', length: 7, chinese: '綠竹別其三分景', pinyin: 'Lǜ zhú bié qí sān fēn jǐng',      english: 'Green bamboo creates its own distinct scenery' },
  { id: 'r7f', length: 7, chinese: '春雨絲絲潤萬物', pinyin: 'Chūn yǔ sī sī rùn wàn wù',        english: 'Spring rain gently nourishes all things' },
  { id: 'r7g', length: 7, chinese: '駿馬奔騰迎新歲', pinyin: 'Jùn mǎ bēn téng yíng xīn suì',    english: 'Fine horses gallop to greet the new year' },
  { id: 'r7h', length: 7, chinese: '馬踏祥雲迎瑞氣', pinyin: 'Mǎ tà xiáng yún yíng ruì qì',     english: 'Horses tread auspicious clouds, welcoming fortune' },
  { id: 'r7i', length: 7, chinese: '日出江花紅勝火', pinyin: 'Rì chū jiāng huā hóng shèng huǒ',  english: 'At sunrise, river flowers glow redder than fire' },
  { id: 'r7j', length: 7, chinese: '千門萬戶曈曈日', pinyin: 'Qiān mén wàn hù tóng tóng rì',     english: 'A thousand doors, ten thousand homes, bright morning sun' },

  // ── 9-character lines (九言) ──
  { id: 'r9a', length: 9, chinese: '大地回春千山秀麗好', pinyin: 'Dà dì huí chūn qiān shān xiù lì hǎo', english: 'Earth returns to spring, a thousand mountains in splendour' },
  { id: 'r9b', length: 9, chinese: '喜氣洋洋開門迎福來', pinyin: 'Xǐ qì yáng yáng kāi mén yíng fú lái', english: 'Joyous energy fills the air, open the door to welcome fortune' },
  { id: 'r9c', length: 9, chinese: '駿馬奔騰迎來好春色', pinyin: 'Jùn mǎ bēn téng yíng lái hǎo chūn sè', english: 'Galloping horses welcome the beautiful colours of spring' },
  { id: 'r9d', length: 9, chinese: '萬象更新春回大地暖', pinyin: 'Wàn xiàng gēng xīn chūn huí dà dì nuǎn', english: 'All things renew as warm spring returns to the earth' },

  // ── 11-character lines (十一言) ──
  { id: 'r11a', length: 11, chinese: '又是一年春風得意馬蹄疾', pinyin: 'Yòu shì yī nián chūn fēng dé yì mǎ tí jí',   english: 'Another year of proud spring breezes and swift horse hooves' },
  { id: 'r11b', length: 11, chinese: '瑞雪紛飛迎新歲駿馬奔騰', pinyin: 'Ruì xuě fēn fēi yíng xīn suì jùn mǎ bēn téng', english: 'Auspicious snow flies to greet the new year, fine horses gallop' },
];

// ─── Left-side Lines 左聯 / 下聯 (grouped by length) ────────
// The left scroll is read SECOND and traditionally ends with a level tone
// Must match the same character-length as the chosen right line

const CHUNLIAN_LEFT_LINES = [
  // ── 5-character lines (五言) ──
  { id: 'l5a', length: 5, chinese: '福氣進家門', pinyin: 'Fú qì jìn jiā mén',     english: 'Fortune and blessings enter the home' },
  { id: 'l5b', length: 5, chinese: '竹報一家安', pinyin: 'Zhú bào yī jiā ān',      english: 'Bamboo heralds peace for the whole family' },
  { id: 'l5c', length: 5, chinese: '開門見喜來', pinyin: 'Kāi mén jiàn xǐ lái',    english: 'Open the door to greet arriving joy' },
  { id: 'l5d', length: 5, chinese: '紅運照九州', pinyin: 'Hóng yùn zhào jiǔ zhōu', english: 'Good fortune shines over all the land' },
  { id: 'l5e', length: 5, chinese: '春風入萬家', pinyin: 'Chūn fēng rù wàn jiā',   english: 'Spring breeze enters ten thousand homes' },
  { id: 'l5f', length: 5, chinese: '竹報三春暖', pinyin: 'Zhú bào sān chūn nuǎn',  english: 'Bamboo announces the warmth of three springs' },

  // ── 7-character lines (七言) ──
  { id: 'l7a', length: 7, chinese: '春滿乾坤福滿門', pinyin: 'Chūn mǎn qián kūn fú mǎn mén',    english: 'Spring fills the cosmos, fortune fills the door' },
  { id: 'l7b', length: 7, chinese: '萬紫千紅永開花', pinyin: 'Wàn zǐ qiān hóng yǒng kāi huā',    english: 'Myriad colours bloom forever' },
  { id: 'l7c', length: 7, chinese: '春風送暖入屠蘇', pinyin: 'Chūn fēng sòng nuǎn rù tú sū',     english: 'Spring breeze brings warmth with Tu Su wine' },
  { id: 'l7d', length: 7, chinese: '福照家門萬事興', pinyin: 'Fú zhào jiā mén wàn shì xīng',      english: 'Fortune shines on the door, all matters thrive' },
  { id: 'l7e', length: 7, chinese: '紅梅正報萬家春', pinyin: 'Hóng méi zhèng bào wàn jiā chūn',   english: 'Red plum blossoms herald spring for all homes' },
  { id: 'l7f', length: 7, chinese: '紅梅點點繡千山', pinyin: 'Hóng méi diǎn diǎn xiù qiān shān', english: 'Red plum blossoms adorn a thousand mountains' },
  { id: 'l7g', length: 7, chinese: '春風浩蕩展宏圖', pinyin: 'Chūn fēng hào dàng zhǎn hóng tú',  english: 'Mighty spring winds unfurl grand ambitions' },
  { id: 'l7h', length: 7, chinese: '春歸大地綻新花', pinyin: 'Chūn guī dà dì zhàn xīn huā',      english: 'Spring returns to earth, new flowers bloom' },
  { id: 'l7i', length: 7, chinese: '春來江水綠如藍', pinyin: 'Chūn lái jiāng shuǐ lǜ rú lán',    english: 'In spring, river waters turn green as jade' },
  { id: 'l7j', length: 7, chinese: '總把新桃換舊符', pinyin: 'Zǒng bǎ xīn táo huàn jiù fú',      english: 'Always replace old peach charms with new ones' },

  // ── 9-character lines (九言) ──
  { id: 'l9a', length: 9, chinese: '長空萬里百花齊放春', pinyin: 'Cháng kōng wàn lǐ bǎi huā qí fàng chūn', english: 'Across the vast sky, a hundred flowers bloom in spring' },
  { id: 'l9b', length: 9, chinese: '春風陣陣佳節臨門時', pinyin: 'Chūn fēng zhèn zhèn jiā jié lín mén shí', english: 'Spring breezes arrive as the festival comes to our door' },
  { id: 'l9c', length: 9, chinese: '祥雲繚繞帶來好福氣', pinyin: 'Xiáng yún liáo rào dài lái hǎo fú qì',   english: 'Auspicious clouds swirl, bringing good fortune' },
  { id: 'l9d', length: 9, chinese: '一元復始百業興旺長', pinyin: 'Yī yuán fù shǐ bǎi yè xīng wàng cháng', english: 'A new cycle begins, all enterprises flourish and endure' },

  // ── 11-character lines (十一言) ──
  { id: 'l11a', length: 11, chinese: '再盼來歲繁花似錦鵬程遠', pinyin: 'Zài pàn lái suì fán huā sì jǐn péng chéng yuǎn',  english: 'Looking forward to next year\'s brocade of flowers and boundless journey' },
  { id: 'l11b', length: 11, chinese: '春風浩蕩展宏圖金龍獻瑞', pinyin: 'Chūn fēng hào dàng zhǎn hóng tú jīn lóng xiàn ruì', english: 'Spring winds unfurl grand plans, golden dragon presents fortune' },
];

// ─── Classic Matched Pairs (for "recommended" pairings) ─────
// These are traditionally matched; shown as suggestions
const CHUNLIAN_CLASSIC_MATCHES = {
  'r7a': 'l7a',  // 天增歲月 ↔ 春滿乾坤
  'r7b': 'l7b',  // 一年四季 ↔ 萬紫千紅
  'r7c': 'l7c',  // 爆竹聲中 ↔ 春風送暖
  'r7d': 'l7d',  // 喜居寶地 ↔ 福照家門
  'r7e': 'l7e',  // 綠竹別其 ↔ 紅梅正報
  'r7f': 'l7f',  // 春雨絲絲 ↔ 紅梅點點
  'r7g': 'l7g',  // 駿馬奔騰 ↔ 春風浩蕩
  'r7h': 'l7h',  // 馬踏祥雲 ↔ 春歸大地
  'r7i': 'l7i',  // 日出江花 ↔ 春來江水
  'r7j': 'l7j',  // 千門萬戶 ↔ 總把新桃
  'r5a': 'l5a',  // 春風送暖 ↔ 福氣進家
  'r5b': 'l5b',  // 花開富貴 ↔ 竹報一家
  'r5c': 'l5c',  // 迎春納百 ↔ 開門見喜
  'r5d': 'l5d',  // 紫氣東方 ↔ 紅運照九
  'r5e': 'l5e',  // 瑞雪兆豐 ↔ 春風入萬
  'r5f': 'l5f',  // 梅開五福 ↔ 竹報三春
  'r9a': 'l9a',
  'r9b': 'l9b',
  'r9c': 'l9c',
  'r9d': 'l9d',
  'r11a': 'l11a',
  'r11b': 'l11b',
};
