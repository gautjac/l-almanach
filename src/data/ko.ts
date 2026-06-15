// The 72 kō (七十二候) — the Japanese micro-seasons. The solar year is divided
// into 24 sekki (節気), each split into three kō of roughly five days. Each kō is
// a tiny observation of the turning year ("the worms surface", "the peach blooms").
//
// This is the FULL, real 72-kō dataset, with a faithful French rendering of each
// kō name, its parent sekki, and the calendar window it occupies. Dates follow the
// widely-used modern (1685 Shibukawa Shunkai) reckoning; the windows are stable
// to within a day from year to year, which is plenty for a poetic almanac.
//
// We determine today's kō LOCALLY from (month, day) — no network. See koForDate().

export type SeasonKey = "printemps" | "ete" | "automne" | "hiver";
export type Lang = "fr" | "en";

export interface Sekki {
  /** romaji name, e.g. "risshun" */
  id: string;
  /** kanji */
  kanji: string;
  /** French name of the solar term */
  fr: string;
  /** literal gloss of the term (French) */
  glossFr: string;
  /** English name of the solar term (romaji is identical; we keep a parallel field for clarity) */
  en: string;
  /** literal gloss of the term (English) */
  glossEn: string;
  season: SeasonKey;
}

export interface Ko {
  /** stable index 1..72 across the year, starting at risshun */
  index: number;
  kanji: string;
  /** faithful French rendering of the kō */
  fr: string;
  /** faithful English rendering of the kō */
  en: string;
  /** romaji of the kō */
  romaji: string;
  /** parent sekki id */
  sekkiId: string;
  /** inclusive start month/day */
  startMonth: number;
  startDay: number;
  /** inclusive end month/day */
  endMonth: number;
  endDay: number;
}

export const SEKKI: Sekki[] = [
  { id: "risshun", kanji: "立春", fr: "Risshun", glossFr: "début du printemps", en: "Risshun", glossEn: "beginning of spring", season: "printemps" },
  { id: "usui", kanji: "雨水", fr: "Usui", glossFr: "eau de pluie", en: "Usui", glossEn: "rain water", season: "printemps" },
  { id: "keichitsu", kanji: "啓蟄", fr: "Keichitsu", glossFr: "réveil des insectes", en: "Keichitsu", glossEn: "awakening of insects", season: "printemps" },
  { id: "shunbun", kanji: "春分", fr: "Shunbun", glossFr: "équinoxe de printemps", en: "Shunbun", glossEn: "spring equinox", season: "printemps" },
  { id: "seimei", kanji: "清明", fr: "Seimei", glossFr: "pur et clair", en: "Seimei", glossEn: "pure and clear", season: "printemps" },
  { id: "koku", kanji: "穀雨", fr: "Kokuu", glossFr: "pluie des grains", en: "Kokuu", glossEn: "grain rains", season: "printemps" },
  { id: "rikka", kanji: "立夏", fr: "Rikka", glossFr: "début de l'été", en: "Rikka", glossEn: "beginning of summer", season: "ete" },
  { id: "shoman", kanji: "小満", fr: "Shōman", glossFr: "petite plénitude", en: "Shōman", glossEn: "lesser fullness", season: "ete" },
  { id: "boshu", kanji: "芒種", fr: "Bōshu", glossFr: "grains barbus", en: "Bōshu", glossEn: "grain in ear", season: "ete" },
  { id: "geshi", kanji: "夏至", fr: "Geshi", glossFr: "solstice d'été", en: "Geshi", glossEn: "summer solstice", season: "ete" },
  { id: "shosho", kanji: "小暑", fr: "Shōsho", glossFr: "petite chaleur", en: "Shōsho", glossEn: "lesser heat", season: "ete" },
  { id: "taisho", kanji: "大暑", fr: "Taisho", glossFr: "grande chaleur", en: "Taisho", glossEn: "greater heat", season: "ete" },
  { id: "risshu", kanji: "立秋", fr: "Risshū", glossFr: "début de l'automne", en: "Risshū", glossEn: "beginning of autumn", season: "automne" },
  { id: "shosho2", kanji: "処暑", fr: "Shosho", glossFr: "fin de la chaleur", en: "Shosho", glossEn: "manageable heat", season: "automne" },
  { id: "hakuro", kanji: "白露", fr: "Hakuro", glossFr: "rosée blanche", en: "Hakuro", glossEn: "white dew", season: "automne" },
  { id: "shubun", kanji: "秋分", fr: "Shūbun", glossFr: "équinoxe d'automne", en: "Shūbun", glossEn: "autumn equinox", season: "automne" },
  { id: "kanro", kanji: "寒露", fr: "Kanro", glossFr: "rosée froide", en: "Kanro", glossEn: "cold dew", season: "automne" },
  { id: "soko", kanji: "霜降", fr: "Sōkō", glossFr: "descente du givre", en: "Sōkō", glossEn: "frost falls", season: "automne" },
  { id: "ritto", kanji: "立冬", fr: "Rittō", glossFr: "début de l'hiver", en: "Rittō", glossEn: "beginning of winter", season: "hiver" },
  { id: "shosetsu", kanji: "小雪", fr: "Shōsetsu", glossFr: "petite neige", en: "Shōsetsu", glossEn: "lesser snow", season: "hiver" },
  { id: "taisetsu", kanji: "大雪", fr: "Taisetsu", glossFr: "grande neige", en: "Taisetsu", glossEn: "greater snow", season: "hiver" },
  { id: "toji", kanji: "冬至", fr: "Tōji", glossFr: "solstice d'hiver", en: "Tōji", glossEn: "winter solstice", season: "hiver" },
  { id: "shokan", kanji: "小寒", fr: "Shōkan", glossFr: "petit froid", en: "Shōkan", glossEn: "lesser cold", season: "hiver" },
  { id: "daikan", kanji: "大寒", fr: "Daikan", glossFr: "grand froid", en: "Daikan", glossEn: "greater cold", season: "hiver" },
];

export const SEKKI_BY_ID: Record<string, Sekki> = Object.fromEntries(
  SEKKI.map((s) => [s.id, s]),
);

// The 72 kō in calendar order from risshun (~Feb 4). Each entry: kanji, French
// rendering, romaji, parent sekki, and its window.
export const KO: Ko[] = [
  // ── 立春 Risshun ──
  { index: 1, kanji: "東風解凍", fr: "Le vent d'est fait fondre la glace", en: "East wind melts the ice", romaji: "harukaze kōri o toku", sekkiId: "risshun", startMonth: 2, startDay: 4, endMonth: 2, endDay: 8 },
  { index: 2, kanji: "黄鶯睍睆", fr: "Le rossignol des buissons commence à chanter", en: "Bush warblers start singing", romaji: "kōō kenkan su", sekkiId: "risshun", startMonth: 2, startDay: 9, endMonth: 2, endDay: 13 },
  { index: 3, kanji: "魚上氷", fr: "Les poissons percent la glace", en: "Fish emerge from the ice", romaji: "uo kōri o izuru", sekkiId: "risshun", startMonth: 2, startDay: 14, endMonth: 2, endDay: 18 },
  // ── 雨水 Usui ──
  { index: 4, kanji: "土脉潤起", fr: "La pluie humecte la terre", en: "Rain moistens the soil", romaji: "tsuchi no shō uruoi okoru", sekkiId: "usui", startMonth: 2, startDay: 19, endMonth: 2, endDay: 23 },
  { index: 5, kanji: "霞始靆", fr: "La brume commence à s'étendre", en: "Mist starts to linger", romaji: "kasumi hajimete tanabiku", sekkiId: "usui", startMonth: 2, startDay: 24, endMonth: 2, endDay: 28 },
  { index: 6, kanji: "草木萌動", fr: "Herbes et arbres bourgeonnent", en: "Grass and trees sprout", romaji: "sōmoku mebae izuru", sekkiId: "usui", startMonth: 3, startDay: 1, endMonth: 3, endDay: 5 },
  // ── 啓蟄 Keichitsu ──
  { index: 7, kanji: "蟄虫啓戸", fr: "Les insectes terrés ouvrent leur porte", en: "Hibernating insects open their doors", romaji: "sugomori mushito o hiraku", sekkiId: "keichitsu", startMonth: 3, startDay: 6, endMonth: 3, endDay: 10 },
  { index: 8, kanji: "桃始笑", fr: "Le pêcher commence à rire", en: "First peach blossoms", romaji: "momo hajimete saku", sekkiId: "keichitsu", startMonth: 3, startDay: 11, endMonth: 3, endDay: 15 },
  { index: 9, kanji: "菜虫化蝶", fr: "Les chenilles deviennent papillons", en: "Caterpillars become butterflies", romaji: "namushi chō to naru", sekkiId: "keichitsu", startMonth: 3, startDay: 16, endMonth: 3, endDay: 20 },
  // ── 春分 Shunbun ──
  { index: 10, kanji: "雀始巣", fr: "Les moineaux commencent à nicher", en: "Sparrows start to nest", romaji: "suzume hajimete sukū", sekkiId: "shunbun", startMonth: 3, startDay: 21, endMonth: 3, endDay: 25 },
  { index: 11, kanji: "桜始開", fr: "Les premières fleurs de cerisier s'ouvrent", en: "First cherry blossoms open", romaji: "sakura hajimete saku", sekkiId: "shunbun", startMonth: 3, startDay: 26, endMonth: 3, endDay: 30 },
  { index: 12, kanji: "雷乃発声", fr: "Le tonnerre élève sa voix au loin", en: "Distant thunder first sounds", romaji: "kaminari sunawachi koe o hassu", sekkiId: "shunbun", startMonth: 3, startDay: 31, endMonth: 4, endDay: 4 },
  // ── 清明 Seimei ──
  { index: 13, kanji: "玄鳥至", fr: "Les hirondelles reviennent", en: "Swallows return", romaji: "tsubame kitaru", sekkiId: "seimei", startMonth: 4, startDay: 5, endMonth: 4, endDay: 9 },
  { index: 14, kanji: "鴻雁北", fr: "Les oies sauvages s'en vont vers le nord", en: "Wild geese fly north", romaji: "kōgan kaeru", sekkiId: "seimei", startMonth: 4, startDay: 10, endMonth: 4, endDay: 14 },
  { index: 15, kanji: "虹始見", fr: "Les premiers arcs-en-ciel paraissent", en: "First rainbows appear", romaji: "niji hajimete arawaru", sekkiId: "seimei", startMonth: 4, startDay: 15, endMonth: 4, endDay: 19 },
  // ── 穀雨 Kokuu ──
  { index: 16, kanji: "葭始生", fr: "Les premiers roseaux germent", en: "First reeds sprout", romaji: "ashi hajimete shōzu", sekkiId: "koku", startMonth: 4, startDay: 20, endMonth: 4, endDay: 24 },
  { index: 17, kanji: "霜止出苗", fr: "Le gel cesse, les jeunes pousses montent", en: "Last frost, rice seedlings grow", romaji: "shimo yamite nae izuru", sekkiId: "koku", startMonth: 4, startDay: 25, endMonth: 4, endDay: 29 },
  { index: 18, kanji: "牡丹華", fr: "Les pivoines s'épanouissent", en: "Peonies bloom", romaji: "botan hana saku", sekkiId: "koku", startMonth: 4, startDay: 30, endMonth: 5, endDay: 4 },
  // ── 立夏 Rikka ──
  { index: 19, kanji: "蛙始鳴", fr: "Les grenouilles se mettent à chanter", en: "Frogs start singing", romaji: "kawazu hajimete naku", sekkiId: "rikka", startMonth: 5, startDay: 5, endMonth: 5, endDay: 9 },
  { index: 20, kanji: "蚯蚓出", fr: "Les vers de terre émergent", en: "Earthworms surface", romaji: "mimizu izuru", sekkiId: "rikka", startMonth: 5, startDay: 10, endMonth: 5, endDay: 14 },
  { index: 21, kanji: "竹笋生", fr: "Les pousses de bambou percent le sol", en: "Bamboo shoots sprout", romaji: "takenoko shōzu", sekkiId: "rikka", startMonth: 5, startDay: 15, endMonth: 5, endDay: 20 },
  // ── 小満 Shōman ──
  { index: 22, kanji: "蚕起食桑", fr: "Les vers à soie s'éveillent et mangent le mûrier", en: "Silkworms wake and feed on mulberry", romaji: "kaiko okite kuwa o hamu", sekkiId: "shoman", startMonth: 5, startDay: 21, endMonth: 5, endDay: 25 },
  { index: 23, kanji: "紅花栄", fr: "Le carthame fleurit en abondance", en: "Safflowers bloom in abundance", romaji: "benibana sakau", sekkiId: "shoman", startMonth: 5, startDay: 26, endMonth: 5, endDay: 30 },
  { index: 24, kanji: "麦秋至", fr: "Le temps de la moisson du blé arrive", en: "Wheat ripens and is harvested", romaji: "mugi no toki itaru", sekkiId: "shoman", startMonth: 5, startDay: 31, endMonth: 6, endDay: 5 },
  // ── 芒種 Bōshu ──
  { index: 25, kanji: "螳螂生", fr: "Les mantes religieuses éclosent", en: "Praying mantises hatch", romaji: "kamakiri shōzu", sekkiId: "boshu", startMonth: 6, startDay: 6, endMonth: 6, endDay: 10 },
  { index: 26, kanji: "腐草為螢", fr: "Les herbes mortes deviennent lucioles", en: "Rotten grass becomes fireflies", romaji: "kusari taru kusa hotaru to naru", sekkiId: "boshu", startMonth: 6, startDay: 11, endMonth: 6, endDay: 15 },
  { index: 27, kanji: "梅子黄", fr: "Les prunes jaunissent", en: "Plums turn yellow", romaji: "ume no mi kibamu", sekkiId: "boshu", startMonth: 6, startDay: 16, endMonth: 6, endDay: 20 },
  // ── 夏至 Geshi ──
  { index: 28, kanji: "乃東枯", fr: "La brunelle se fane", en: "Self-heal withers", romaji: "natsukarekusa karuru", sekkiId: "geshi", startMonth: 6, startDay: 21, endMonth: 6, endDay: 26 },
  { index: 29, kanji: "菖蒲華", fr: "Les iris s'épanouissent", en: "Irises bloom", romaji: "ayame hana saku", sekkiId: "geshi", startMonth: 6, startDay: 27, endMonth: 7, endDay: 1 },
  { index: 30, kanji: "半夏生", fr: "L'aron mi-été pousse", en: "Crow-dipper sprouts", romaji: "hange shōzu", sekkiId: "geshi", startMonth: 7, startDay: 2, endMonth: 7, endDay: 6 },
  // ── 小暑 Shōsho ──
  { index: 31, kanji: "温風至", fr: "Le vent tiède arrive", en: "Warm winds arrive", romaji: "atsukaze itaru", sekkiId: "shosho", startMonth: 7, startDay: 7, endMonth: 7, endDay: 11 },
  { index: 32, kanji: "蓮始開", fr: "Les premiers lotus s'ouvrent", en: "First lotus blossoms open", romaji: "hasu hajimete hiraku", sekkiId: "shosho", startMonth: 7, startDay: 12, endMonth: 7, endDay: 16 },
  { index: 33, kanji: "鷹乃学習", fr: "Les jeunes faucons apprennent à voler", en: "Young hawks learn to fly", romaji: "taka sunawachi waza o narau", sekkiId: "shosho", startMonth: 7, startDay: 17, endMonth: 7, endDay: 22 },
  // ── 大暑 Taisho ──
  { index: 34, kanji: "桐始結花", fr: "Le paulownia commence à porter ses graines", en: "Paulownia trees produce seeds", romaji: "kiri hajimete hana o musubu", sekkiId: "taisho", startMonth: 7, startDay: 23, endMonth: 7, endDay: 28 },
  { index: 35, kanji: "土潤溽暑", fr: "La terre est humide, l'air est lourd de chaleur", en: "Earth is damp, air is humid and hot", romaji: "tsuchi uruōte mushi atsushi", sekkiId: "taisho", startMonth: 7, startDay: 29, endMonth: 8, endDay: 2 },
  { index: 36, kanji: "大雨時行", fr: "De grandes pluies tombent parfois", en: "Great rains sometimes fall", romaji: "taiu tokidoki furu", sekkiId: "taisho", startMonth: 8, startDay: 3, endMonth: 8, endDay: 7 },
  // ── 立秋 Risshū ──
  { index: 37, kanji: "涼風至", fr: "Le vent frais arrive", en: "Cool winds arrive", romaji: "suzukaze itaru", sekkiId: "risshu", startMonth: 8, startDay: 8, endMonth: 8, endDay: 12 },
  { index: 38, kanji: "寒蝉鳴", fr: "Les cigales du soir chantent", en: "Evening cicadas sing", romaji: "higurashi naku", sekkiId: "risshu", startMonth: 8, startDay: 13, endMonth: 8, endDay: 17 },
  { index: 39, kanji: "蒙霧升降", fr: "Les brumes épaisses se lèvent et descendent", en: "Thick fog descends", romaji: "fukaki kiri matō", sekkiId: "risshu", startMonth: 8, startDay: 18, endMonth: 8, endDay: 22 },
  // ── 処暑 Shosho ──
  { index: 40, kanji: "綿柎開", fr: "Les capsules de coton s'ouvrent", en: "Cotton bolls open", romaji: "wata no hana shibe hiraku", sekkiId: "shosho2", startMonth: 8, startDay: 23, endMonth: 8, endDay: 27 },
  { index: 41, kanji: "天地始粛", fr: "La chaleur commence enfin à s'apaiser", en: "Heat starts to die down", romaji: "tenchi hajimete samushi", sekkiId: "shosho2", startMonth: 8, startDay: 28, endMonth: 9, endDay: 1 },
  { index: 42, kanji: "禾乃登", fr: "Le riz mûrit dans les champs", en: "Rice ripens in the fields", romaji: "kokumono sunawachi minoru", sekkiId: "shosho2", startMonth: 9, startDay: 2, endMonth: 9, endDay: 7 },
  // ── 白露 Hakuro ──
  { index: 43, kanji: "草露白", fr: "La rosée blanchit sur l'herbe", en: "Dew glistens white on grass", romaji: "kusa no tsuyu shiroshi", sekkiId: "hakuro", startMonth: 9, startDay: 8, endMonth: 9, endDay: 12 },
  { index: 44, kanji: "鶺鴒鳴", fr: "Les bergeronnettes chantent", en: "Wagtails sing", romaji: "sekirei naku", sekkiId: "hakuro", startMonth: 9, startDay: 13, endMonth: 9, endDay: 17 },
  { index: 45, kanji: "玄鳥去", fr: "Les hirondelles s'en vont", en: "Swallows leave", romaji: "tsubame saru", sekkiId: "hakuro", startMonth: 9, startDay: 18, endMonth: 9, endDay: 22 },
  // ── 秋分 Shūbun ──
  { index: 46, kanji: "雷乃収声", fr: "Le tonnerre range sa voix", en: "Thunder ceases", romaji: "kaminari sunawachi koe o osamu", sekkiId: "shubun", startMonth: 9, startDay: 23, endMonth: 9, endDay: 27 },
  { index: 47, kanji: "蟄虫坏戸", fr: "Les insectes referment leur porte", en: "Insects shut their burrows", romaji: "mushi kakurete to o fusagu", sekkiId: "shubun", startMonth: 9, startDay: 28, endMonth: 10, endDay: 2 },
  { index: 48, kanji: "水始涸", fr: "Les eaux des champs commencent à se retirer", en: "Farmland waters start to dry", romaji: "mizu hajimete karuru", sekkiId: "shubun", startMonth: 10, startDay: 3, endMonth: 10, endDay: 7 },
  // ── 寒露 Kanro ──
  { index: 49, kanji: "鴻雁来", fr: "Les oies sauvages reviennent", en: "Wild geese return", romaji: "kōgan kitaru", sekkiId: "kanro", startMonth: 10, startDay: 8, endMonth: 10, endDay: 12 },
  { index: 50, kanji: "菊花開", fr: "Les chrysanthèmes s'épanouissent", en: "Chrysanthemums bloom", romaji: "kiku no hana hiraku", sekkiId: "kanro", startMonth: 10, startDay: 13, endMonth: 10, endDay: 17 },
  { index: 51, kanji: "蟋蟀在戸", fr: "Les grillons chantent près de la porte", en: "Crickets chirp by the door", romaji: "kirigirisu to ni ari", sekkiId: "kanro", startMonth: 10, startDay: 18, endMonth: 10, endDay: 22 },
  // ── 霜降 Sōkō ──
  { index: 52, kanji: "霜始降", fr: "Le premier givre se dépose", en: "First frost falls", romaji: "shimo hajimete furu", sekkiId: "soko", startMonth: 10, startDay: 23, endMonth: 10, endDay: 27 },
  { index: 53, kanji: "霎時施", fr: "De brèves averses passent par moments", en: "Light rains fall now and then", romaji: "kosame tokidoki furu", sekkiId: "soko", startMonth: 10, startDay: 28, endMonth: 11, endDay: 1 },
  { index: 54, kanji: "楓蔦黄", fr: "Érables et lierres se dorent", en: "Maples and ivy turn yellow", romaji: "momiji tsuta kibamu", sekkiId: "soko", startMonth: 11, startDay: 2, endMonth: 11, endDay: 6 },
  // ── 立冬 Rittō ──
  { index: 55, kanji: "山茶始開", fr: "Les premiers camélias d'hiver s'ouvrent", en: "First camellias bloom", romaji: "tsubaki hajimete hiraku", sekkiId: "ritto", startMonth: 11, startDay: 7, endMonth: 11, endDay: 11 },
  { index: 56, kanji: "地始凍", fr: "La terre commence à geler", en: "Land starts to freeze", romaji: "chi hajimete kōru", sekkiId: "ritto", startMonth: 11, startDay: 12, endMonth: 11, endDay: 16 },
  { index: 57, kanji: "金盞香", fr: "Les narcisses embaument", en: "Daffodils bloom and scent the air", romaji: "kinsenka saku", sekkiId: "ritto", startMonth: 11, startDay: 17, endMonth: 11, endDay: 21 },
  // ── 小雪 Shōsetsu ──
  { index: 58, kanji: "虹蔵不見", fr: "Les arcs-en-ciel se cachent", en: "Rainbows hide", romaji: "niji kakurete miezu", sekkiId: "shosetsu", startMonth: 11, startDay: 22, endMonth: 11, endDay: 26 },
  { index: 59, kanji: "朔風払葉", fr: "Le vent du nord balaie les feuilles", en: "North wind sweeps the leaves", romaji: "kitakaze konoha o harau", sekkiId: "shosetsu", startMonth: 11, startDay: 27, endMonth: 12, endDay: 1 },
  { index: 60, kanji: "橘始黄", fr: "Les mandariniers commencent à jaunir", en: "Mandarin trees begin to yellow", romaji: "tachibana hajimete kibamu", sekkiId: "shosetsu", startMonth: 12, startDay: 2, endMonth: 12, endDay: 6 },
  // ── 大雪 Taisetsu ──
  { index: 61, kanji: "閉塞成冬", fr: "Le ciel se ferme, l'hiver s'installe", en: "Cold sets in, winter begins", romaji: "sora samuku fuyu to naru", sekkiId: "taisetsu", startMonth: 12, startDay: 7, endMonth: 12, endDay: 11 },
  { index: 62, kanji: "熊蟄穴", fr: "Les ours se retirent dans leur tanière", en: "Bears retreat to their dens", romaji: "kuma ana ni komoru", sekkiId: "taisetsu", startMonth: 12, startDay: 12, endMonth: 12, endDay: 16 },
  { index: 63, kanji: "鱖魚群", fr: "Les saumons remontent en bancs", en: "Salmon gather and swim upstream", romaji: "sake no uo muragaru", sekkiId: "taisetsu", startMonth: 12, startDay: 17, endMonth: 12, endDay: 21 },
  // ── 冬至 Tōji ──
  { index: 64, kanji: "乃東生", fr: "La brunelle reverdit", en: "Self-heal sprouts", romaji: "natsukarekusa shōzu", sekkiId: "toji", startMonth: 12, startDay: 22, endMonth: 12, endDay: 26 },
  { index: 65, kanji: "麋角解", fr: "Les cerfs perdent leurs bois", en: "Deer shed their antlers", romaji: "sawashika no tsuno otsuru", sekkiId: "toji", startMonth: 12, startDay: 27, endMonth: 12, endDay: 31 },
  { index: 66, kanji: "雪下出麦", fr: "Sous la neige, le blé pousse", en: "Wheat sprouts under the snow", romaji: "yuki watarite mugi nobiru", sekkiId: "toji", startMonth: 1, startDay: 1, endMonth: 1, endDay: 4 },
  // ── 小寒 Shōkan ──
  { index: 67, kanji: "芹乃栄", fr: "Le persil d'eau prospère", en: "Parsley flourishes", romaji: "seri sunawachi sakau", sekkiId: "shokan", startMonth: 1, startDay: 5, endMonth: 1, endDay: 9 },
  { index: 68, kanji: "水泉動", fr: "Les sources se remettent à couler", en: "Springs thaw and flow", romaji: "shimizu atataka o fukumu", sekkiId: "shokan", startMonth: 1, startDay: 10, endMonth: 1, endDay: 14 },
  { index: 69, kanji: "雉始雊", fr: "Les faisans commencent à crier", en: "Pheasants start to call", romaji: "kiji hajimete naku", sekkiId: "shokan", startMonth: 1, startDay: 15, endMonth: 1, endDay: 19 },
  // ── 大寒 Daikan ──
  { index: 70, kanji: "款冬華", fr: "Le pas-d'âne fleurit sous la neige", en: "Butterburs bud under the snow", romaji: "fuki no hana saku", sekkiId: "daikan", startMonth: 1, startDay: 20, endMonth: 1, endDay: 24 },
  { index: 71, kanji: "水沢腹堅", fr: "La glace des ruisseaux gagne en épaisseur", en: "Ice thickens on streams", romaji: "sawamizu kōri tsumeru", sekkiId: "daikan", startMonth: 1, startDay: 25, endMonth: 1, endDay: 29 },
  { index: 72, kanji: "鶏始乳", fr: "Les poules recommencent à pondre", en: "Hens start laying again", romaji: "niwatori hajimete toya ni tsuku", sekkiId: "daikan", startMonth: 1, startDay: 30, endMonth: 2, endDay: 3 },
];

/** day-of-year ordinal (1..366) for a month/day, ignoring leap nuance (Feb=29). */
function ordinal(month: number, day: number): number {
  const cum = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
  return cum[month - 1] + day;
}

/**
 * Find today's kō from a Date, entirely locally. Windows can wrap the new year
 * (kō 66 starts Jan 1; kō 72 ends Feb 3). We compare on day-of-year ordinals and
 * handle the single wrapping window explicitly.
 */
export function koForDate(date: Date): Ko {
  const m = date.getMonth() + 1;
  // Feb 29 has no kō window of its own; fold the leap day into Feb 28 so the
  // last day of the 雨水 / 霞始靆 kō simply lasts one more day in leap years.
  const d = m === 2 && date.getDate() === 29 ? 28 : date.getDate();
  const o = ordinal(m, d);
  for (const ko of KO) {
    const s = ordinal(ko.startMonth, ko.startDay);
    const e = ordinal(ko.endMonth, ko.endDay);
    if (s <= e) {
      if (o >= s && o <= e) return ko;
    } else {
      // window wraps year-end (e.g. starts in Dec, ends in Jan)
      if (o >= s || o <= e) return ko;
    }
  }
  // Fallback: the Jan 1–3 sliver belongs to kō 72→? — but ordinals cover it.
  // Should never reach here; return the first kō defensively.
  return KO[0];
}

export function sekkiForKo(ko: Ko): Sekki {
  return SEKKI_BY_ID[ko.sekkiId];
}

/** human FR date-range label, e.g. "10–14 mai". */
const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function koDateRangeFr(ko: Ko): string {
  if (ko.startMonth === ko.endMonth) {
    return `${ko.startDay}–${ko.endDay} ${MONTHS_FR[ko.startMonth - 1]}`;
  }
  return `${ko.startDay} ${MONTHS_FR[ko.startMonth - 1]} – ${ko.endDay} ${MONTHS_FR[ko.endMonth - 1]}`;
}

/** human EN date-range label, e.g. "May 10–14" or "Dec 17 – Dec 21". */
export function koDateRangeEn(ko: Ko): string {
  if (ko.startMonth === ko.endMonth) {
    return `${MONTHS_EN[ko.startMonth - 1]} ${ko.startDay}–${ko.endDay}`;
  }
  return `${MONTHS_EN[ko.startMonth - 1]} ${ko.startDay} – ${MONTHS_EN[ko.endMonth - 1]} ${ko.endDay}`;
}

/** lang-aware date-range label. */
export function koDateRange(ko: Ko, lang: Lang): string {
  return lang === "en" ? koDateRangeEn(ko) : koDateRangeFr(ko);
}

/** lang-aware kō name. */
export function koName(ko: Ko, lang: Lang): string {
  return lang === "en" ? ko.en : ko.fr;
}

/** lang-aware sekki name + gloss. */
export function sekkiName(sekki: Sekki, lang: Lang): string {
  return lang === "en" ? sekki.en : sekki.fr;
}
export function sekkiGloss(sekki: Sekki, lang: Lang): string {
  return lang === "en" ? sekki.glossEn : sekki.glossFr;
}

export const SEASON_FR: Record<SeasonKey, string> = {
  printemps: "printemps",
  ete: "été",
  automne: "automne",
  hiver: "hiver",
};

export const SEASON_EN: Record<SeasonKey, string> = {
  printemps: "spring",
  ete: "summer",
  automne: "autumn",
  hiver: "winter",
};

export function seasonLabel(season: SeasonKey, lang: Lang): string {
  return lang === "en" ? SEASON_EN[season] : SEASON_FR[season];
}
