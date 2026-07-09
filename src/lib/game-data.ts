export type KeywordType = "person" | "location" | "organization" | "ability";

export interface KeywordNote {
  id: string;
  type: KeywordType;
  title: string;
  summary: string;
  details: string;
  firstSeen: string;
}

export type MessageRole = "narrator" | "player" | "system";

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
  codename: string;
  gender: string;
  age: number;
  organization: string;
  background: string;
  appearance: string;
  // 右腦能力
  brainStage: number;
  brainStages: {
    label: string;
    unlocked: boolean;
  }[];
  // 能力數值
  perception: number;
  control: number;
  stability: number;
  knowledge: number;
  awareness: number;
  willpower: number;
  // 生理狀態
  hp: { current: number; max: number };
  // 盧恩薄片
  runeFragment: boolean;
  // 物品
  inventory: { name: string; qty: number; desc?: string }[];
}

export const mockCharacter: CharacterSheet = {
  name: "實驗體21號",
  codename: "21-γ",
  gender: "模糊",
  age: 16,
  organization: "回聲之民",
  background: "零號計劃首個存活體，從有記憶以來就在認知科學局第十四區實驗室。6歲學會隱瞞能力。世界觀來自童話故事。",
  appearance: "黑髮黑瞳，皮膚蒼白，身高約170cm，體型清瘦。左手腕內側有實驗體編號燙印「21」。常穿著灰色連帽外套。",
  brainStage: 1,
  brainStages: [
    { label: "情緒顏色感知", unlocked: true },
    { label: "微物理干涉", unlocked: false },
    { label: "集體意識感知", unlocked: false },
    { label: "概率觸及", unlocked: false },
  ],
  perception: 8,
  control: 3,
  stability: 5,
  knowledge: 4,
  awareness: 7,
  willpower: 6,
  hp: { current: 100, max: 100 },
  runeFragment: true,
  inventory: [
    { name: "盧恩薄片", qty: 1, desc: "刻有奇異符號的金屬薄片，博士交給你的唯一物品" },
    { name: "灰色連帽外套", qty: 1, desc: "逃亡時撿來的，口袋裡永遠裹著盧恩薄片" },
    { name: "實驗體紀錄碎片", qty: 3, desc: "從實驗室帶出的文件殘頁" },
  ],
};

export const mockNotes: KeywordNote[] = [
  {
    id: "maria",
    type: "person",
    title: "瑪麗亞·維爾納博士",
    summary: "認知科學局強化組核心研究員，零號計劃主導者。你的創造者、救贖者、被迫合作者。",
    details: "約60歲，白髮盤起，深藍眼。常穿白大褂，袖口有燒傷疤痕。表層冷靜客觀，深層藏著被壓抑的愧疚與母性衝動。她叫你「孩子」，但在局方面前稱你「觀察對象」。Ch.01爆炸中偽造死亡，實則被軟禁繼續研究。",
    firstSeen: "實驗室",
  },
  {
    id: "cognitive-bureau",
    type: "organization",
    title: "認知科學局",
    summary: "試圖量化、複製、武器化右腦能力的政府機構。把你當作實驗成果而非人。",
    details: "原名「科學之光」。強化組負責能力者研究，清理組派出暗紅色者追蹤逃脫的實驗體。零號計劃真實目的：培育「不會同化的右腦全開體」作為戰略兵器。21號之前20個實驗體全數同化或處決。",
    firstSeen: "實驗室",
  },
  {
    id: "echo-people",
    type: "organization",
    title: "回聲之民",
    summary: "被三方勢力排斥的地下能力者網絡，以節點制運作。",
    details: "無統一領導，維護「轉生路線」，讓即將同化的能力者以轉生者身分繼續存在。山谷節點是重要據點。亮紅色男人、亮藍綠女孩、銀白色老人皆屬於此。",
    firstSeen: "第二幕·第一次接觸",
  },
  {
    id: "rune-tablet",
    type: "ability",
    title: "盧恩薄片",
    summary: "刻有盧恩文字的金屬薄片，能幫助穩定右腦操控狀態。",
    details: "不是魔法，是心理學與神經科學的交叉點。盧恩文字具有極強的「心理暗示激活效果」，能幫助右腦使用者進入操控狀態。博士在Ch.01塞入你手中的「刻有奇異符號的金屬薄片」。",
    firstSeen: "實驗室",
  },
  {
    id: "lin",
    type: "person",
    title: "林",
    summary: "書店店員，第一個不把你當實驗體的人。教會你「溫度」與「信任」。",
    details: "普通人，沒有右腦能力。與祖母同住。給予你第一個家的感覺。他的情緒顏色是暖橘色——善意、溫暖、無條件接納。在Ch.05被暗紅色者殺害。",
    firstSeen: "第二幕·第一次接觸",
  },
];

export const mockMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "system",
    content: "第二幕 · 第一次接觸人類",
    timestamp: "2026-03-15T20:00:00Z",
    sceneTitle: "第二幕",
    isCheckpoint: true,
  },
  {
    id: "m2",
    role: "narrator",
    content: "雨停了。你站在街角的阴影裡，帽簷壓得很低。這是你逃出實驗室後的第三天。胃裡空空的，左手腕的燙印还在隱隱作痛。路過的人身上都帶著顏色——你已經學會不去看。但有個人不一樣。[[lin|書店]]的門打開時，裡面走出來的老人身上帶著[[maria|暖橘色]]。你已經很久沒見過這種顏色了。",
    timestamp: "2026-03-15T20:00:05Z",
  },
  {
    id: "m3",
    role: "player",
    content: "我猶豫了一下，還是走向書店。門上掛著「營業中」的木牌。",
    timestamp: "2026-03-15T20:01:12Z",
  },
  {
    id: "m4",
    role: "narrator",
 content: "推開門，風鈴響了。一個年輕男人從書架後面抬起頭。他身上的顏色是安靜的藍綠色——[[lin|林]]。他看了你一眼，沒有露出大多數人會有的那種表情。不是恐懼，不是厭惡。只是平靜地說：「歡迎。想找什麼書？」",
    timestamp: "2026-03-15T20:01:30Z",
  },
  {
    id: "m5",
    role: "system",
    content: "情緒感知（被動）：林 — 藍綠色（安靜、安全、理性守護）",
    timestamp: "2026-03-15T20:01:35Z",
  },
  {
    id: "m6",
    role: "narrator",
    content: "你不知道該怎麼回答。在實驗室裡，沒有人問過你「想要什麼」。你習慣了被觀察、被記錄、被分析。但眼前這個人只是等著，不急。他的藍綠色很穩定，沒有裂縫，沒有暗紅。你第一次覺得，也許可以試著開口。",
    timestamp: "2026-03-15T20:01:40Z",
  },
  {
    id: "m7",
    role: "player",
    content: "「……有沒有那種，小孩會喜歡的故事書？」",
    timestamp: "2026-03-15T20:02:20Z",
  },
  {
    id: "m8",
    role: "narrator",
    content: "他笑了。藍綠色微微發亮。「有啊。」他從架上抽出一本舊舊的童話集，封面上畫著一棵大樹。「這本不錯。很多人小時候都看過。」你接過來，指尖觸到書頁的瞬間，[[rune-tablet|盧恩薄片]]在口袋裡微微發燙。你不知道為什麼。但你決定留下來。",
    timestamp: "2026-03-15T20:02:35Z",
  },
];

export const brainStageLabels = [
  { zh: "情緒顏色感知", abbr: "EP", desc: "被動感知他人情緒狀態為顏色" },
  { zh: "微物理干涉", abbr: "PC", desc: "需要學習對應物理知識才能使用" },
  { zh: "集體意識感知", abbr: "CA", desc: "感受到人群的情緒場" },
  { zh: "概率觸及", abbr: "PR", desc: "接近預知，但伴隨自我瓦解" },
];

export const statLabels: Record<string, { zh: string; abbr: string }> = {
  perception: { zh: "感知", abbr: "EP" },
  control: { zh: "控制", abbr: "CT" },
  stability: { zh: "穩定", abbr: "ST" },
  knowledge: { zh: "知識", abbr: "KN" },
  awareness: { zh: "覺察", abbr: "AW" },
  willpower: { zh: "意志", abbr: "WP" },
};
