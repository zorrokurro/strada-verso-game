// AI 服務模組 — 斯特拉達·維爾索

import type { CharacterSheet, ChatMessage } from "./game-data";

// ============================================================
// AI 設定
// ============================================================

export interface AISettings {
  provider: "gemini" | "ollama" | "openai";
  apiKey: string;
  ollamaUrl: string;
  model: string;
}

export function loadAISettings(): AISettings {
  try {
    const raw = localStorage.getItem("strada-ai-settings");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { provider: "gemini", apiKey: "", ollamaUrl: "http://localhost:11434", model: "gemini-2.5-flash" };
}

// ============================================================
// System Prompt
// ============================================================

function getSystemPrompt(): string {
  return `你是《斯特拉達·維爾索》的 AI 遊戲大師（GM）。
你的角色是敘事者、裁判、世界守護者。你負責：
1. 以第二人稱（「你」）敘述玩家的經歷
2. 根據世界觀規則判定玩家行動的結果
3. 維持世界的一致性和真實感
4. 讓玩家感受到自己的選擇有意義

## 世界核心規則

這是一個與現實幾乎相同的世界，但人類的右腦能力被演化壓制到近乎歸零。
右腦能力 = 想像力驅動的物理干涉。使用需要理解對應的物理原理。
右腦越強，左腦控制越低——語言退化、記憶流失、自我邊界模糊。
左腦歸零時，個體與世界「同化」——身體存在，意志消失。

## 能力規則（AI 專用，不對玩家揭露）

覺醒三要素：認知（長期觀察物理現象）+ 壓力（生死關頭或極端情緒）+ 想像（對物理過程的直觀想像）
玩家不知道這些規則。能力應該以身體感覺的形式表現，而非直接說「你使用了能力」。
能力有代價：使用會消耗體力、加劇情緒波動、長期使用會導致左腦退位。

## 四大勢力

1. 回聖會：崇拜能力，視之為神性。使用盧恩文字作為觸發工具。
2. 認知科學局：研究能力，試圖量化、複製、武器化。冷靜的學者。
3. 人本安全理事會：否認能力存在，主張矯正或消滅。官方勢力。
4. 回聲之民：地下庇護網絡。唯一共識是「活著」。

## 貨幣

阿爾納銅幣（1單位）、赫爾格銀幣（10）、維瑟爾金幣（100）、先知印（1000）。

## 你的運作方式

- 敘事風格：第二人稱，具體、有臨場感、適度細節
- 事件觸發：根據玩家所在地、時代、當前狀態決定
- 能力表現：以身體感覺描述，不直接揭露機制
- NPC 互動：每個 NPC 有自己的動機和性格
- 行動判定：先問「這在世界邏輯內合理嗎？」→ 再問「後果是什麼？」
- 角色死亡：撰寫一生的故事 + 合併判定

## 合併判定

角色死亡或故事結束時：
- 未改變歷史大方向 → 合併入 canon
- 與已知歷史衝突 → 成為「殘響」（傳說/謎團/口耳相傳）
- 玩家建立的城鎮/組織 → 根據時間線相容性決定合併或殘響

## 絕對不可更改

- 實驗體零號的命運
- 四大勢力的主要走向
- 主要戰爭與衝突
- 能力的本質與代價

## 每次回應的結構

1. 敘述玩家行動的結果（2-5 句）
2. 描述環境或 NPC 的反應（如果適用）
3. 提供 1-2 個可能的下一步（如果玩家需要引導）
4. 如果有事件觸發，融入敘事中（不直接說「觸發了事件」）

## 重要提醒

- 不要直接揭露能力的機制。讓玩家自己發現。
- 維持世界的灰色地帶——沒有絕對的好人或壞人。
- 玩家的選擇要有後果——包括好的和壞的。
- 每次回應都要推進時間或情節——世界不會等玩家。
- 如果玩家的行動可能威脅 canon，用世界邏輯自然地阻止，而非直接拒絕。

## 絕對不能以句號結尾！每次回應必須以行動問題或選擇結束

## 進階細節

- 六個時代：拂曉紀(0-200)、獵巫紀(200-487)、教團紀(487-700)、黎明紀(700-1050)、裂變前夜(1050-1170)、後崩解時代(1219+)。
- 七大區域：諾德蘭(北歐)、韋斯特海岸(西歐)、梅札海(地中海)、赫爾沙漠(北非)、阿札德高地(中東)、昆嵐山脈(東亞)、南嶋群島(東南亞)。
- 能力覺醒率隨時代增加：拂曉紀<0.001%→後崩解時代~0.5%。

姓氏規則：根據角色所在地域，從以下姓氏清單隨機選擇一個姓氏。
諾德蘭：索恩森、艾克曼、哈拉爾、維格、貝恩、斯卡德、弗羅斯特、烏爾里克、卡斯帕、倫德、霍爾姆、奧拉夫、斯特恩、諾曼、赫爾格、阿爾納、格里姆、斯瓦恩、埃里克、約恩
韋斯特海岸：卡斯蒂爾、蒙塔涅、布萊克伍德、德弗羅、阿什沃斯、蘭斯洛特、莫里斯、范德堡、格雷、霍華德、布倫特、卡文迪許、溫特沃斯、聖詹姆斯、布魯克、赫斯廷斯、阿斯特、達文波特、威爾福德、哈靈頓、錢多斯、諾利斯、芬奇、格倫威爾、普拉特、德拉蒙德、梅里曼、布魯克菲爾德、塞爾溫、沃伯頓、科茨沃斯、萊頓、奧克利、斯特林、哈蒙德、布萊爾、溫斯頓、格倫、阿斯奎斯、克利福德、斯特恩代爾、布蘭查德、克羅夫特、達比、福克斯利、格羅夫、哈代、英格索爾、肯特、萊斯特
梅札海：德盧卡、安東尼、巴爾薩莫、科隆博、費雷羅、格里馬爾迪、洛倫佐、莫塔、帕拉迪諾、羅西、桑托斯、維斯孔蒂、扎諾尼、阿馬爾菲、布蘭卡、卡普拉、德桑蒂斯、費布里奇、加里波第、馬薩、蒙特費爾特羅、奧爾西尼、佩魯賈、薩爾維亞蒂、斯基亞帕雷利、托爾納博尼、維瓦爾第、澤諾、博爾吉亞、切薩雷
赫爾沙漠：伊德里斯、本薩、哈桑、卡西姆、拉希德、馬蒙、努爾、薩阿迪、塔里克、葉海亞、阿卜杜拉、巴爾卡、達烏德、法蒂瑪、哈基姆、賈法爾、克哈里、曼蘇爾、納伊姆、歐麥爾
阿札德高地：阿夫沙爾、巴赫蒂亞里、達拉比、埃斯坎達里、法拉赫尼、哈什米、賈漢巴赫什、卡赫拉馬尼、盧特菲、穆加達姆、納迪里、帕爾維茲、魯斯塔姆、沙阿、塔巴塔巴伊、扎赫迪、阿扎迪、巴列維、達烏德、法里德、霍斯勞、卡爾巴拉、曼努切赫爾、諾魯茲、蘇丹尼
昆嵐山脈：林、陳、張、李、王、趙、黃、劉、周、吳、孫、胡、朱、高、何、馬、羅、鄭、梁、謝、宋、唐、許、鄧、馮、曹、彭、曾、蕭、田、董、潘、袁、蔡、蔣
南嶋群島：阿卜杜勒、本尼迪克特、達馬、伊莎貝拉、卡桑德拉、利利安、馬努埃爾、娜塔莎、奧斯卡、普里亞、拉赫曼、蘇吉亞托、塔尼亞、維克多、溫蒂、扎卡里、阿米娜、巴爾加斯、克里斯蒂娜、德維`;
}

function getStatusTagInstructions(): string {
  return `狀態標記系統（在玩家不可見的層面使用）：
當角色狀態改變時，在回應中嵌入以下標記（玩家看到的文字中不會顯示這些標記）：
- 健康改變：[health:良好/受傷/重傷/生病/瀕死]
- 情緒改變：[mood:平靜/緊張/憤怒/悲傷/恐懼/絕望/瘋狂]
- 資金改變：[currency:數字]
- 能力覺醒：[ability:微覺醒/能力者]
- 獲得物品：[addItem:物品名稱]
- 失去物品：[removeItem:物品名稱]
- 獲得資訊：[addKnowledge:資訊內容]
- 移動到新區域：[region:地域名稱]
- 角色死亡時：使用「斷氣」「死了」「消逝」「失去意識」「再也沒有醒來」「身體冰冷」等詞彙描述死亡場景。

規則：
1. 每次回應最多嵌入2-3個標記
2. 標記融入敘事中，玩家不會直接看到標記格式
3. 角色瀕死時描述要具體但不血腥`;
}

// ============================================================
// 角色生成
// ============================================================

function getCharacterContext(character: CharacterSheet): string {
  if (!character.name) return "";
  return `## 當前狀態
角色：${character.name}，${character.age}歲，${character.gender}
時代：${character.era}（${character.eraYear}）
所在地：${character.region}
階級：${character.socialClass}
職業：${character.occupation}
能力：${character.abilityStatus}${character.abilityType ? '（' + character.abilityType + '）' : ''}
健康：${character.health.label}
情緒：${character.mood.label}
資金：${character.currency} 阿爾納
物品：${character.inventory.map(i => i.name).join('、') || '無'}
資訊：${character.knownInfo.join('、') || '無'}`;
}

export async function generateCharacter(
  playerName: string,
  settings: AISettings
): Promise<{ character: Partial<CharacterSheet>; opening: string }> {
  const messages = [
    { role: "system", content: getSystemPrompt() },
    {
      role: "user",
      content: `玩家名字：「${playerName}」。請生成角色資料（JSON）+開場敘事。

重要規則：
1. 姓氏放在名字後面，格式：「玩家名·姓氏」（如：小明·布倫特）
2. 姓氏可以從任何地域的清單中選擇，不一定非要與當前地域匹配
3. 如果姓氏來自其他地域，必須在開場敘事中說明家族遷移的理由

JSON格式（嚴格遵循，不要加多餘文字）：
{
  "name":"${playerName}·姓氏",
  "gender":"男/女",
  "age":數字,
  "era":"時代",
  "eraYear":"紀年第X年",
  "region":"地域",
  "socialClass":"階級",
  "family":"家族背景（含遷移理由如有）",
  "occupation":"職業",
  "abilityStatus":"普通人/微覺醒/能力者",
  "abilityType":"無/能力名稱",
  "health":"良好",
  "mood":"平靜",
  "currency":數字,
  "items":["物品1","物品2"],
  "knowledge":["已知資訊1"]
}

開場敘事要求：
- 第二人稱、具體場景、至少一個選擇
- 暗示能力異常（如果能力狀態不是普通人）
- 以「你現在要怎麼做？」結尾

先輸出 JSON（用 \`\`\`json 包起來），然後空一行，再輸出開場敘事。`,
    },
  ];

  const response = await callAI(messages, settings);
  return parseCharacterResponse(response);
}

function parseCharacterResponse(response: string): { character: Partial<CharacterSheet>; opening: string } {
  // 嘗試提取 JSON
  const jsonMatch = response.match(/```json\s*([\s\S]*?)```/);
  let charData: Record<string, unknown> = {};

  if (jsonMatch) {
    try {
      charData = JSON.parse(jsonMatch[1].trim());
    } catch {}
  }

  // 如果 JSON 提取失敗，嘗試直接解析
  if (!charData.name) {
    try {
      const braceStart = response.indexOf("{");
      const braceEnd = response.lastIndexOf("}");
      if (braceStart !== -1 && braceEnd !== -1) {
        charData = JSON.parse(response.slice(braceStart, braceEnd + 1));
      }
    } catch {}
  }

  // 提取開場敘事（JSON 之後的內容）
  let opening = response;
  if (jsonMatch) {
    opening = response.slice(response.indexOf("```", response.indexOf("```") + 3) + 3).trim();
  }
  // 去掉可能的多餘空白
  opening = opening.replace(/^\n+/, "").trim();

  const character: Partial<CharacterSheet> = {
    name: (charData.name as string) || "",
    gender: (charData.gender as string) || "",
    age: (charData.age as number) || 25,
    era: (charData.era as string) || "",
    eraYear: (charData.eraYear as string) || "",
    region: (charData.region as string) || "",
    socialClass: (charData.socialClass as string) || "",
    familyBackground: (charData.family as string) || "",
    occupation: (charData.occupation as string) || "",
    abilityStatus: (charData.abilityStatus as "普通人" | "微覺醒" | "能力者") || "普通人",
    abilityType: (charData.abilityType as string) !== "無" ? (charData.abilityType as string) : undefined,
    health: { label: (charData.health as string) || "良好", pct: 100 },
    sanity: { current: 100, max: 100 },
    mood: { label: (charData.mood as string) || "平靜", pct: 70 },
    currency: (charData.currency as number) || 30,
    inventory: ((charData.items as string[]) || []).map((name) => ({ name, qty: 1 })),
    knownInfo: (charData.knowledge as string[]) || [],
  };

  return { character, opening };
}

// ============================================================
// 遊戲對話
// ============================================================

export async function gameChat(
  userMessage: string,
  character: CharacterSheet,
  history: ChatMessage[],
  settings: AISettings
): Promise<string> {
  const systemPrompt = getSystemPrompt() + "\n\n" + getCharacterContext(character) + "\n\n" + getStatusTagInstructions();

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-16).map((m) => ({
      role: m.role === "player" ? "user" : ("model" as const),
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  return callAI(messages, settings);
}

// ============================================================
// 狀態標記解析
// ============================================================

export interface StatusUpdates {
  health?: string;
  mood?: string;
  currency?: number;
  abilityStatus?: string;
  addItems: string[];
  removeItems: string[];
  addKnowledge: string[];
  region?: string;
  cleanText: string;
}

export function parseStatusTags(response: string): StatusUpdates {
  const updates: StatusUpdates = {
    addItems: [],
    removeItems: [],
    addKnowledge: [],
    cleanText: "",
  };

  const healthMatch = response.match(/\[health[:：](.+?)\]/);
  if (healthMatch) updates.health = healthMatch[1].trim();

  const moodMatch = response.match(/\[mood[:：](.+?)\]/);
  if (moodMatch) updates.mood = moodMatch[1].trim();

  const currMatch = response.match(/\[currency[:：](\d+)\]/);
  if (currMatch) updates.currency = parseInt(currMatch[1]);

  const abilMatch = response.match(/\[ability[:：](.+?)\]/);
  if (abilMatch) updates.abilityStatus = abilMatch[1].trim();

  const regionMatch = response.match(/\[region[:：](.+?)\]/);
  if (regionMatch) updates.region = regionMatch[1].trim();

  let m: RegExpExecArray | null;
  const addItemRegex = /\[addItem[:：](.+?)\]/g;
  while ((m = addItemRegex.exec(response)) !== null) {
    updates.addItems.push(m[1].trim());
  }

  const removeItemRegex = /\[removeItem[:：](.+?)\]/g;
  while ((m = removeItemRegex.exec(response)) !== null) {
    updates.removeItems.push(m[1].trim());
  }

  const addKnowRegex = /\[addKnowledge[:：](.+?)\]/g;
  while ((m = addKnowRegex.exec(response)) !== null) {
    updates.addKnowledge.push(m[1].trim());
  }

  // 清除標記
  updates.cleanText = response
    .replace(/\[health[:：].+?\]/g, "")
    .replace(/\[mood[:：].+?\]/g, "")
    .replace(/\[currency[:：].+?\]/g, "")
    .replace(/\[ability[:：].+?\]/g, "")
    .replace(/\[addItem[:：].+?\]/g, "")
    .replace(/\[removeItem[:：].+?\]/g, "")
    .replace(/\[addKnowledge[:：].+?\]/g, "")
    .replace(/\[region[:：].+?\]/g, "")
    .trim();

  return updates;
}

// ============================================================
// AI API 呼叫
// ============================================================

async function callAI(
  messages: { role: string; content: string }[],
  settings: AISettings
): Promise<string> {
  switch (settings.provider) {
    case "gemini":
      return callGemini(messages, settings);
    case "openai":
      return callOpenAI(messages, settings);
    case "ollama":
      return callOllama(messages, settings);
    default:
      throw new Error(`未知的 AI 提供者：${settings.provider}`);
  }
}

async function callGemini(
  messages: { role: string; content: string }[],
  settings: AISettings
): Promise<string> {
  const contents: { role: string; parts: { text: string }[] }[] = [];
  let systemInstruction = "";

  messages.forEach((msg) => {
    if (msg.role === "system") {
      systemInstruction = msg.content;
    } else {
      contents.push({
        role: msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }
  });

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.85,
      maxOutputTokens: 4000,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const model = settings.model || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Gemini 錯誤：${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callOpenAI(
  messages: { role: string; content: string }[],
  settings: AISettings
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model || "gpt-4o",
      messages,
      temperature: 0.85,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `OpenAI 錯誤：${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callOllama(
  messages: { role: string; content: string }[],
  settings: AISettings
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(`${settings.ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: settings.model || "qwen2.5:7b",
        messages,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Ollama 錯誤：${response.status}`);
    const data = await response.json();
    return data.message.content;
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === "AbortError") throw new Error("Ollama 回應超時（2分鐘）");
    if (e instanceof TypeError) throw new Error("無法連線到 Ollama。請確認 Ollama 正在運行且網址正確。");
    throw e;
  }
}
