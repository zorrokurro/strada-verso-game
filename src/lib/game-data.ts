export type KeywordType = "npc" | "location" | "item" | "faction";

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
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: string;
  age?: number;
  attributes: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  hp: { current: number; max: number };
  mp: { current: number; max: number };
  ac: number;
  initiative: number;
  speed: number;
  attackBonus: number;
  damage: string;
  xp: { current: number; next: number };
  gold: number;
  inventory: { name: string; qty: number; desc?: string }[];
}

export const mockCharacter: CharacterSheet = {
  name: "艾爾卓德·夜梟",
  race: "半精靈",
  class: "遊蕩者",
  level: 3,
  background: "罪犯",
  alignment: "混亂中立",
  age: 27,
  attributes: { str: 10, dex: 17, con: 14, int: 13, wis: 12, cha: 15 },
  hp: { current: 22, max: 28 },
  mp: { current: 8, max: 12 },
  ac: 15,
  initiative: 3,
  speed: 30,
  attackBonus: 5,
  damage: "1d6+3 穿刺",
  xp: { current: 950, next: 1800 },
  gold: 47,
  inventory: [
    { name: "匕首", qty: 2, desc: "鋒利的雙刃短刀" },
    { name: "皮甲", qty: 1, desc: "輕便但提供基本防護" },
    { name: "盜賊工具", qty: 1, desc: "開鎖、解除陷阱用" },
    { name: "治療藥水", qty: 3, desc: "恢復 2d4+2 HP" },
    { name: "繩索（50呎）", qty: 1 },
    { name: "火把", qty: 5 },
  ],
};

export const mockNotes: KeywordNote[] = [
  {
    id: "aldric",
    type: "npc",
    title: "艾爾德里克·灰斗篷",
    summary: "旅店老闆，前傭兵，似乎認識你的過去。",
    details: "禿頭、左眼有道長疤。經營「鏽蝕錨」旅店超過十五年。據說曾是「碎骨連」的副隊長，在一次任務中失去半個小隊後金盆洗手。對你的態度曖昧——既像在保護你，又像在監視你。",
    firstSeen: "第一章·抵達鏽蝕錨",
  },
  {
    id: "rusty-anchor",
    type: "location",
    title: "鏽蝕錨旅店",
    summary: "港口區最老的旅店，木造建築，常客多為水手與傭兵。",
    details: "位於斯特拉達·維爾索舊港區西側。一樓是酒館，二樓是六間客房，地下室據說通往某條被遺忘的渠道。爐火總是燒著，空氣中混著鹹味與烤洋蔥的氣味。",
    firstSeen: "第一章·抵達鏽蝕錨",
  },
  {
    id: "bone-legion",
    type: "faction",
    title: "碎骨連",
    summary: "活躍於南方邊境的傭兵團，以殘酷聞名。",
    details: "約 200 人的編制，旗幟是白骨交叉於黑底。近年傳聞與某個貴族家族暗通款曲，開始接一些見不得光的委託。艾爾德里克離開後，連隊由「鐵爪」加爾文接管。",
    firstSeen: "第一章·抵達鏽蝕錨",
  },
  {
    id: "owl-pendant",
    type: "item",
    title: "夜梟護身符",
    summary: "母親留下的銀製護身符，背面刻著不知名的符文。",
    details: "重量極輕，月圓之夜會微微發涼。你曾試過所有已知的解讀方法都失敗。直到昨夜，鏽蝕錨的盲眼琴師觸碰它時，低聲說：「這是通往『寂靜之廳』的鑰匙。」",
    firstSeen: "第二章·月光下的低語",
  },
  {
    id: "strada-verso",
    type: "location",
    title: "斯特拉達·維爾索",
    summary: "你所在的城市，港口商業重鎮，被稱為「通往西方的階梯」。",
    details: "建城三百年，由七大家族共治。城市分為舊港區、新市集、貴族丘、霧巷四個區域。近月來失蹤案件頻傳，官方諱莫如深。",
    firstSeen: "序章·抵達",
  },
];

export const mockMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "system",
    content: "第二章·月光下的低語",
    timestamp: "2026-03-15T20:00:00Z",
    sceneTitle: "第二章",
    isCheckpoint: true,
  },
  {
    id: "m2",
    role: "gm",
    content: "夜半時分，[[rusty-anchor|鏽蝕錨]]的酒館已經空了大半。你最後一杯麥酒還剩半杯，爐火劈啪作響。[[aldric|艾爾德里克]]用抹布擦著杯子，目光卻不時飄向你腰間的[[owl-pendant|夜梟護身符]]。他終於放下杯子，低聲開口：「孩子，[[strada-verso|這座城]]這幾天不太對勁。碼頭又少了三個人。」",
    timestamp: "2026-03-15T20:00:05Z",
  },
  {
    id: "m3",
    role: "player",
    content: "我抬頭看他，把護身符藏進衣領裡。「又是失蹤？官方怎麼說？」",
    timestamp: "2026-03-15T20:01:12Z",
  },
  {
    id: "m4",
    role: "gm",
    content: "他冷哼一聲。「官方？他們只會說那些人『乘船去了西方』。但碼頭簿子上沒有任何離港紀錄。」他靠近一些，聲音壓得更低：「我知道你不是普通的旅人。你身上那個護身符... 我曾在[[bone-legion|碎骨連]]的某個老傭兵身上見過同樣的花紋。」",
    timestamp: "2026-03-15T20:01:30Z",
  },
  {
    id: "m5",
    role: "system",
    content: "感知檢定（DC 12）：你擲出 d20+3 = 16 ✓ 成功",
    timestamp: "2026-03-15T20:01:35Z",
  },
  {
    id: "m6",
    role: "gm",
    content: "你注意到他說「碎骨連」三個字時，右手下意識摸向腰後——那裡通常藏著一把短劍。他並沒有威脅你的意思，更像是一種長年養成的警戒。你看得出來，他知情，但也在害怕。",
    timestamp: "2026-03-15T20:01:40Z",
  },
  {
    id: "m7",
    role: "player",
    content: "「你認識我母親。」我直視他的眼睛，不是問句。",
    timestamp: "2026-03-15T20:02:20Z",
  },
  {
    id: "m8",
    role: "gm",
    content: "酒館的鐘響了十二下。爐火突然矮了半吋，像有什麼東西吸走了一口氣。艾爾德里克臉色一變，從吧台下方抽出一把生鏽的鑰匙推向你。「樓上第三間房。有人在等你。她... 她說她叫『寂靜』。」",
    timestamp: "2026-03-15T20:02:35Z",
  },
];

export const attributeMod = (score: number): number => Math.floor((score - 10) / 2);

export const formatMod = (mod: number): string => (mod >= 0 ? `+${mod}` : `${mod}`);

export const attributeLabels: Record<keyof CharacterSheet["attributes"], { zh: string; abbr: string }> = {
  str: { zh: "力量", abbr: "STR" },
  dex: { zh: "敏捷", abbr: "DEX" },
  con: { zh: "體質", abbr: "CON" },
  int: { zh: "智力", abbr: "INT" },
  wis: { zh: "睿智", abbr: "WIS" },
  cha: { zh: "魅力", abbr: "CHA" },
};
