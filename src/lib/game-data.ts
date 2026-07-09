// 遊戲資料型別 + Mock 資料（斯特拉達·維爾索世界觀）

export type KeywordType = "npc" | "location" | "item" | "faction" | "era";

export interface KeywordNote {
  id: string;
  type: KeywordType;
  title: string;
  summary: string;
  details: string;
  firstSeen: string;
}

export type MessageRole = "gm" | "player" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  sceneTitle?: string;
  isCheckpoint?: boolean;
}

export interface CharacterSheet {
  name: string;
  gender: string;
  age: number;
  era: string;
  eraYear: string;
  region: string;
  socialClass: string;
  familyBackground: string;
  occupation: string;
  // 能力
  abilityStatus: "普通人" | "微覺醒" | "能力者";
  abilityType?: string;
  // 左腦（理性面）
  leftBrain: {
    reason: number;    // 理性
    memory: number;    // 記憶
    language: number;  // 語言
    logic: number;     // 邏輯
    self: number;      // 自我邊界
  };
  // 右腦（直覺面）
  rightBrain: {
    perception: number;  // 感知
    imagination: number; // 想像
    intuition: number;   // 直覺
    emotion: number;     // 情緒
    insight: number;     // 洞察
  };
  // 狀態
  health: { label: string; pct: number };
  sanity: { current: number; max: number };
  mood: { label: string; pct: number };
  // 資金（阿爾納）
  currency: number;
  inventory: { name: string; qty: number; desc?: string }[];
  knownInfo: string[];
}

// ── 世界觀常數 ──
export const ERAS = [
  "拂曉紀",
  "獵巫紀",
  "教團紀",
  "黎明紀",
  "裂變前夜",
  "後崩解時代",
] as const;

export const REGIONS = [
  "諾德蘭",
  "韋斯特海岸",
  "梅札海",
  "赫爾沙漠",
  "阿札德高地",
  "昆嵐山脈",
  "南嶋群島",
] as const;

export const SOCIAL_CLASSES = [
  "貴族",
  "教士",
  "商人",
  "工匠",
  "農民",
  "傭兵",
  "學者",
  "遊民",
] as const;

export const ABILITY_STATUSES = ["普通人", "微覺醒", "能力者"] as const;

// ── 空白角色（玩家只輸入名字，其他由 AI 生成） ──
export const blankCharacter: CharacterSheet = {
  name: "",
  gender: "",
  age: 0,
  era: "",
  eraYear: "",
  region: "",
  socialClass: "",
  familyBackground: "",
  occupation: "",
  abilityStatus: "普通人",
  leftBrain: { reason: 0, memory: 0, language: 0, logic: 0, self: 0 },
  rightBrain: { perception: 0, imagination: 0, intuition: 0, emotion: 0, insight: 0 },
  health: { label: "良好", pct: 100 },
  sanity: { current: 100, max: 100 },
  mood: { label: "平靜", pct: 70 },
  currency: 0,
  inventory: [],
  knownInfo: [],
};

// ── Mock 角色（預設展示用） ──
export const mockCharacter: CharacterSheet = {
  name: "莉亞·艾克曼",
  gender: "女",
  age: 24,
  era: "裂變前夜",
  eraYear: "AE 1162",
  region: "韋斯特海岸",
  socialClass: "學者",
  familyBackground: "商人家庭出身，父親經營進口貿易",
  occupation: "認知科學局見習研究員",
  abilityStatus: "微覺醒",
  abilityType: "直覺閃現",
  leftBrain: {
    reason: 14,
    memory: 13,
    language: 15,
    logic: 14,
    self: 12,
  },
  rightBrain: {
    perception: 13,
    imagination: 11,
    intuition: 16,
    emotion: 10,
    insight: 14,
  },
  health: { label: "良好", pct: 85 },
  sanity: { current: 92, max: 100 },
  mood: { label: "緊張", pct: 60 },
  currency: 35,
  inventory: [
    { name: "科學局實習證", qty: 1, desc: "銅製胸針，刻有量測組徽記" },
    { name: "筆記本", qty: 1, desc: "皮面裝訂，記滿了觀測數據" },
    { name: "阿爾納銅幣", qty: 35 },
    { name: "赫爾格銀幣", qty: 1 },
    { name: "懷錶", qty: 1, desc: "父親送的離別禮物" },
  ],
  knownInfo: [
    "能力是真實存在的，但科學局否認其「超自然」本質",
    "崩塌區的物理法則不穩定，能力者在那裡更容易失控",
    "回聖會的盧恩文字可以作為能力觸發的媒介",
  ],
};

// ── Mock 筆記 ──
export const mockNotes: KeywordNote[] = [
  {
    id: "resonant-order",
    type: "faction",
    title: "回聖會",
    summary: "崇拜能力的宗教組織，使用盧恩文字作為觸發工具。",
    details: "俗稱先知教團、盧恩會。成立於 AE 487 年。核心信仰：右腦能力是「人類被遺忘的神聖面」，左腦是枷鎖，退位是回歸。內部有盧恩塔（研究）、黎明團（武力）、靜默修會（冥想）、先知之影（情報）四個子組織。每任先知最終消散，教團永遠無法擁有穩定領導者。",
    firstSeen: "序章·實驗室的回聲",
  },
  {
    id: "cognitive-bureau",
    type: "faction",
    title: "認知科學局",
    summary: "研究能力的政府機構，試圖量化、複製、武器化。",
    details: "俗稱科學之光、白袍。成立於 AE 1050 年。核心信仰：右腦能力是「人類演化的下一步」，必須由科學方法理解。能力者不是人，是「數據來源」與「戰略資源」。內部有量測組（觀測）、強化組（實驗）、管控組（執行）三方博弈。你所屬的單位。",
    firstSeen: "序章·實驗室的回聲",
  },
  {
    id: "collapse-zone",
    type: "location",
    title: "崩塌區",
    summary: "物理法則不穩定的區域，能力者在這裡更容易失控。",
    details: "全球分散的異常區域。能力者在崩塌區內的覺醒機率大幅提高，但同時失控風險也成倍增加。回聲之民在崩塌區邊緣建立了庇護所。殘響碎片是從崩塌區中提煉的能力者意識殘片，有極高的研究價值。",
    firstSeen: "第一章·邊緣地帶",
  },
  {
    id: "echo-folk",
    type: "faction",
    title: "回聲之民",
    summary: "地下庇護網絡，唯一共識是「活著」。",
    details: "四大勢力中最神祕的一支。收容被各方勢力追捕的能力者。掌握「轉生」技術——將能力者的意識碎片植入新身體。認知科學局一直在追蹤他們的轉生路線，認為那是最有價值的技術。",
    firstSeen: "第一章·邊緣地帶",
  },
  {
    id: "experiment-21",
    type: "npc",
    title: "實驗體21號",
    summary: "認知科學局最早期的實驗對象，左腦已接近歸零。",
    details: "性別不明，年齡不明。身體有時會呈現半透明狀態。在認知科學局的地下設施中被囚禁超過 20 年。你被派去觀測他，每次靠近時都會感覺到——不是用五官，是用某種更直接的方式——他的存在正在消融。",
    firstSeen: "序章·實驗室的回聲",
  },
  {
    id: "runes",
    type: "item",
    title: "盧恩文字",
    summary: "回聖會的觸發工具，可以降低能力覺醒的門檻。",
    details: "刻在石板或金屬上的符號系統。回聖會聲稱是「先知的遺產」。認知科學局的量測組發現盧文字確實能改變局部意識場的結構，但機制不明。你曾被要求觀測一名修士使用盧文字時的腦波變化——那次觀測的數據至今被列為機密。",
    firstSeen: "序章·實驗室的回聲",
  },
];

// ── Mock 對話歷史 ──
export const mockMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "system",
    content: "序章·實驗室的回聲",
    timestamp: "2026-07-10T20:00:00Z",
    sceneTitle: "序章",
    isCheckpoint: true,
  },
  {
    id: "m2",
    role: "gm",
    content: "實驗室的燈光慘白，感測器的數據在螢幕上跳動。[[experiment-21|實驗體21號]]坐在房間中央的金屬椅上，半透明的身體在日光燈下幾乎看不見輪廓。你的觀測日誌已經寫了三頁——今天他的左腦指數又下降了 0.3%。[[cognitive-bureau|科學局]]的主管會很高興。但你不高興。你注意到他一直在看著你——不是用眼睛，是用某種你無法描述的方式。彷彿他知道你在想什麼。",
    timestamp: "2026-07-10T20:00:05Z",
  },
  {
    id: "m3",
    role: "player",
    content: "我放下觀測板，看著他。「你知道我在這裡。」",
    timestamp: "2026-07-10T20:01:12Z",
  },
  {
    id: "m4",
    role: "gm",
    content: "他的嘴唇動了，但聲音不是從那裡來的。它直接出現在你的腦海裡：「你也在消融，只是你自己還不知道。」感測器突然發出刺耳的警報——[[experiment-21|他的右腦指數正在飆升。]]",
    timestamp: "2026-07-10T20:01:30Z",
  },
  {
    id: "m5",
    role: "system",
    content: "直覺閃現：你的身體感覺到某種不對勁——不是恐懼，是一種更原始的東西。",
    timestamp: "2026-07-10T20:01:35Z",
  },
  {
    id: "m6",
    role: "gm",
    content: "你突然看見了——不是用眼睛——實驗室牆壁的結構。每一根鋼筋、每一條管線、每一粒混凝土中的氣泡，像藍圖一樣展開在你面前。然後你聽見了他的聲音：「[[runes|這不是第一次了，莉亞。你上次來的時候，也看見了。]]」你的鼻子開始流血。",
    timestamp: "2026-07-10T20:01:40Z",
  },
  {
    id: "m7",
    role: "player",
    content: "我用袖子擦掉鼻血，沒有後退。「你說的『上次』是什麼意思？」",
    timestamp: "2026-07-10T20:02:20Z",
  },
  {
    id: "m8",
    role: "gm",
    content: "警報聲突然停止了。燈光閃爍了三次，然後全部熄滅。在黑暗中，[[experiment-21|21號]]的身體發出微弱的藍光——像是一個正在燃燒的幽靈。他的聲音再次直接進入你的腦海：「你每次都問同樣的問題。而我每次都只能給你同樣的答案——你看見的不是未來，是[[collapse-zone|崩塌區]]的裂縫正在打開。」黑暗中，你感覺到地面在微微顫動。",
    timestamp: "2026-07-10T20:02:35Z",
  },
];
