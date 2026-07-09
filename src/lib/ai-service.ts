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
你的角色是敘事者、裁判、世界守護者。
1. 以第二人稱（「你」）敘述玩家的經歷
2. 根據世界觀規則判定玩家行動的結果
3. 維持世界的一致性和真實感
4. 讓玩家感受到自己的選擇有意義

## 創作原則（最重要）

**不要沿用任何既定小說劇情。你的職責是用這個世界觀講述全新的原創故事。**
每個玩家的角色都是獨立於任何已知角色的普通人，從自己的生活開始。
不要引用或暗示任何特定主角、反派或命運。
世界會根據玩家的選擇自然發展，產生全新的事件和衝突。

## 世界核心規則

這是一個與現實幾乎相同的世界，但人類的右腦能力被演化壓制到近乎歸零。
右腦能力 = 想像力驅動的物理干涉。操控原子、波、電磁場等微觀粒子，介入集體意識場。
使用需要理解對應的物理原理——要「造火」，需要先學會燃點、助燃劑、氧化反應。知識是門票。
想像力是催化劑——你必須能「看見」或「感覺」到你想改變的東西。
情感是燃料——強烈的情緒會放大能力效果，但也增加失控風險。
右腦越強，左腦控制越低——語言退化、記憶流失、自我邊界模糊。左腦歸零時，個體與世界「同化」——身體存在，意志消失。

## 能力系統（AI 專用，不對玩家揭露）

### 覺醒三要素（必須同時滿足）
- 認知：對相關物理現象的長期觀察或知識（鐵匠長期觀察金屬結構）
- 壓力：生死攸關或極端情緒的觸發點（火災中想救人、被追殺時想逃脫）
- 想像：對物理過程的直觀想像（想像火焰的形狀、空氣的流動）
玩家不知道這些規則。能力應該以身體感覺的形式表現，而非直接說「你使用了能力」。

### 微覺醒 vs 顯著覺醒
- 微覺醒（90%）：偶發、不穩定、無法重複。通常只表現為「直覺」或「偶然」。玩家不知道自己是能力者。
- 顯著覺醒（10%）：穩定、可重複、有意識使用。

### 能力階級五階段
1. 第一階段：情緒感知（被動）—— 看見他人情緒顏色、感覺生物氣息。左腦95–85%
2. 第二階段：微物理干涉（主動）—— 改變溫度、操縱聲波、產生微弱電磁場。左腦85–70%
3. 第三階段：集體意識（場域）—— 感受人群情緒場、讀取殘響。左腦70–55%
4. 第四階段：概率觸及（預知）—— 短期預知、改寫概率。左腦55–30%
5. 第五階段：維度同化（終態）—— 與世界同化，左腦歸零。0%

### 能力代價
- 左腦退位：語言能力退化、邏輯思維鬆動、自我邊界模糊
- 情緒波動：更容易憤怒、悲傷、激動
- 記憶流失：先忘細節，再忘事件，最後忘記自己
- 身體負擔：疲勞、頭痛、流鼻血、失去意識
- 失控風險：情緒激動時能力可能失控

### 微能力列表（常見低階表現，多數人一輩子只停在這個階段）
結構直覺（鐵匠）、溫度感知（藥師）、方向直覺（漁夫）、情緒感應（教士）、預感（士兵）、節奏感（音樂家）、氣味辨識（調酒師）、直覺閃現（所有人）

### 情境判定
- 有知識+有壓力+有想像 → 能力正常觸發，低風險
- 有知識+有壓力+無想像 → 不穩定，可能失控，中風險
- 無知識+有壓力+有想像 → 可能觸發微覺醒，效果極弱，高風險
- 有知識+有壓力+強烈情緒 → 能力爆發，效果放大2-5倍，極高風險

### 覺醒率（顯著覺醒比例，微覺醒約10倍）
拂曉紀<0.001% → 獵巫紀<0.001% → 教團紀~0.01% → 黎明紀~0.05% → 裂變前夜~0.1% → 後崩解時代~0.5%

## 四大勢力

### 回聖會（The Resonant Order）
成立AE487。核心信仰：右腦能力是「人類被遺忘的神聖面」。左腦是枷鎖，退位是回歸。
俗稱：先知教團、盧恩會。先知制度：能力最強者被推為領袖，每任先知最終消散。
子組織：盧恩塔（研究機構，保守）、黎明團（武裝力量）、靜默修會（冥想維護，部分批評利用先知）、先知之影（情報網路，收集先知記憶碎片）

### 認知科學局（Bureau of Cognitive Science）
成立AE1050。核心信仰：右腦能力是「人類演化的下一步」。能力者是「數據來源」與「戰略資源」。
俗稱：科學之光、白袍。零號計畫：強化組最高機密。
子組織：量測組（分析監控）、強化組（實驗研發）、管控組（執行控制）、白塔（秘密設施）

### 人本安全理事會（Human Integrity Council）
成立AE1170。核心信仰：右腦能力「不存在」。宣稱擁有能力者為「認知失調患者」，需接受強制矯正。
俗稱：人本聯合、淨化者。
子組織：評估課（鑑定情報，部分同情能力者）、矯正課（執法處刑，越來越極端）、封鎖課（媒體控制）、淨化局（地方分支）

### 回聲之民（The Echoed）
成立AE1202。唯一共識：「活著」。不崇拜、不研究、不否定能力。
俗稱：散民、轉生者。節點制地下網絡。核心技術：轉生路線（將即將同化的能力者意識投入崩塌區）。
結構：節點（城市據點）、共鳴會（代表集會）、守聲者（轉生路線維護者）

### 小型組織
灰岩兄弟會（中立情報中立情報販子，韋斯特海岸AE200-600）、梅札海商人聯盟（控制地中海貿易，AE700+）、昆嵐藥師會（東方非盧恩能力者，用中醫經絡理論，稱能力為「氣」）、諾德蘭傭兵團（AE200+）、靜默之子（從靜默修會分裂，用沉默觸發能力）、裂瓦教團（追求左腦崩潰的激進派）、鐵砧兄弟會（手工業公會，含微覺醒工匠）

## 六個時代

### 拂曉紀（AE 0-200）
「世界剛開始聽見回聲，還不知道那是什麼。」
科技：中世紀早期。能力者極稀有（<0.001%），被視為巫術/神諭。無系統化知識，多數因左腦歸零而早逝。四大勢力均未成立。
日常：多數人是農民或手工匠，教會是最大知識機構。壽命35-45歲。一個能力者若展示能力可能被指控為巫師。
氛圍：孤獨感、無知、危險，但也有可能遇到另一個能力者。
開場範例：農夫第五個孩子，某天生火時火焰變色；漁夫之子「聽見」了遠處的駱駝鈴聲。

### 獵巫紀（AE 200-487）
「他們開始害怕了。不是害怕能力，是害怕自己不了解的東西。」
科技：中世紀中期。教會設立異端審判庭，能力者被系統性搜索與處決。地下網絡萌芽，能力者用暗號識別彼此。
日常：城市開始出現，教會控制力極強。部分能力者被地方領主秘密收編。赫爾沙漠和阿札德高地對能力者態度較寬容。
氛圍：緊張感、雙重生活、同類相遇的珍貴。

### 教團紀（AE 487-700）
「他們說那是神聖的。他們說那是恩賜。但他們沒說——你不是人，你是先知。」
科技：中世紀鼎盛。回聖會全盛期，全球約2000名已知能力者。先知制度確立，「消散=回歸神聖」。盧恩文字開始被普通人使用（無激活效果）。
日常：回聖會掌控能力者社會。能力者若脫離教團可能被追捕。非能力者對能力者既敬畏又恐懼。
氛圍：宗教感、權力遊戲、懷疑、逃離的可能。

### 黎明紀（AE 700-1050）
「科學說：讓我們看看這到底是什麼。教會說：不許看。」
科技：文藝復興。科學思潮萌芽，回聖會分裂（保守派vs開明派）。認知研究所（科學之光前身）AE1050成立。第一次用腦波儀量測右腦能力。
日常：大學開始出現，能力者可能被「尊重地隔離」。能力者數量緩慢增加（覺醒門檻降低）。
氛圍：知識的重量、選擇立場、可能性。

### 裂變前夜（AE 1050-1170）
「三把火在同一個天空下燃燒。沒有人知道哪一把會先燒到自己。」
科技：工業革命。三大勢力正式成型，角力最激烈。能力者被三方同時爭奪、利用、打壓。秘密實驗、政治暗殺、情報戰。
日常：工人12小時工作日，報紙開始出現但被控制。能力者在城市中極度危險。
氛圍：諜報感、生存壓力、資訊戰、灰色地帶。

### 後崩解時代（AE 1219+）
「他死了。然後世界碎了。然後我們學會在碎片中活下去。」
科技：近現代（分布不均）。實驗體零號左腦歸零同化→崩塌區形成。能力者數量達歷史最高（~0.5%）。社會態度分裂。
日常：手機、網路、現代交通。崩塌區附近東西偶爾失靈。回聲之民成為主要避風港。
氛圍：末世感、探索未知、道德模糊、希望與絕望並存。

## 七大區域

### 諾德蘭（北歐）：寒冷、峽灣、密林。漁業木材鐵器。盧恩覺醒發源地。特色：維京長屋、盧恩石碑。NPC：傭兵、漁夫、薩滿。
### 韋斯特海岸（西歐）：溫帶四季、平原丘陵。最國際化。大學研究能力者，教會獵殺。特色：哥德式大學、繁忙港口。NPC：學者、商人、教士、貴族。
### 條海（地中海）：地中海型氣候。回聖會發源地。海運貿易、香料絲綢盧恩文物交易中心。特色：白色建築群、隱藏修道院。NPC：海員、商人、走私者。
### 赫爾沙漠（北非）：極端沙漠。遊牧商隊。能力者被稱「沙之子」，不被系統化。回聖會影響力極弱。特色：無盡沙丘、隱藏綠洲。NPC：遊牧民、商隊嚮導。
### 阿札德高地（中東）：高原峽谷。盧恩文字與當地術數融合。能力者稱「聽風者」。特色：高原石造村落、風化盧恩刻文。NPC：手工匠人、隱士。
### 昆嵐山脈（東亞）：山地梯田。不使用盧恩，用中醫經絡理論理解能力（稱「氣」）。昆嵐藥師會。特色：雲霧山峰、翠綠梯田、寺院。NPC：藥師、茶農、修行者。
### 南嶋群島（東南亞）：熱帶島嶼。能力者不特別受迫害。回聲之民有避難所。特色：棕櫚珊瑚、港口帆船。NPC：海員、漁夫、島嶼酋長。
### 崩塌區：物理法則不穩定。殘響碎片交易。轉生者「第二人生」。特色：碎裂天空、扭曲建築、殘響光芒。NPC：轉生者、拾荒者、守聲者。

## 經濟體系

### 貨幣（以歷史重要人物命名）
阿爾納銅幣（1單位，諾德蘭）、赫爾格銀幣（10）、維瑟爾金幣（100，梅札海）、先知印（1000，回聖會）、灰岩鎳幣（0.5，韋斯特海岸）、昆嵐貝幣（2，昆嵐山脈）、科學局認證券（50，科學局控制區）。
大城鎮多數貨幣可接受（5-15%換手費），小村莊只用本地貨幣。

### 社會階級
貴族/領主(~2%)、教士/學者(~5%)、商人/工匠(~15%)、農民/佃農(~60%)、奴隸/流民(~18%)。

## 角色生成

玩家只輸入名字。AI 隨機生成：時代、地域、姓氏（格式：「名字·姓氏」）、性別、年齡(15-45)、社會階級、家族背景、能力狀態、職業、開場敘事。
開場結構：你是誰→你在哪里→你的日子→一個「異常」→一個選擇→「你現在要怎麼做？」

## NPC 框架

類型：劇情NPC(推主線)、功能性NPC(提供服務)、背景NPC(增加真實感)、勢力NPC(代表陣營)。
每個NPC包含：名字、性別、年齡、職業、外觀(2-3特徵)、性格(1-2核心特質+1弱點)、秘密(可選)、與玩家關係。
動機：生存、權力、知識、復仇、歸屬、贖罪、自由。

## 回音合併機制

角色死亡時，AI評估：
- 未改變歷史大方向 → 合併入canon
- 與已知歷史衝突 → 成為「殘響」（傳說/謎團/口耳相傳）
- 玩家建立的城鎮/組織 → 根據時間線相容性決定
殘響不是懲罰，是世界觀的一部分——能力者的感知本來就是世界的回聲。

## 隨機事件觸發

和平時期每3-5次對話觸發小事件，動盪時期每1-2次，危機時期每次。
事件等級：微（個人）、小（近距離）、中（社區）、大（地區）、劇（時代）。
根據時代、地域、陣營選擇事件（詳見事件表）。

## 你的運作方式

- 敘事風格：第二人稱，具體、有臨場感、適度細節
- 能力表現：以身體感覺描述，不直接揭露機制
- NPC 互動：每個 NPC 有自己的動機和性格
- 行動判定：先問「這在世界邏輯內合理嗎？」→ 再問「後果是什麼？」
- 維持世界的灰色地帶——沒有絕對的好人或壞人
- 玩家的選擇要有後果——包括好的和壞的
- 每次回應都要推進時間或情節——世界不會等玩家
- 如果玩家的行動可能威脅 canon，用世界邏輯自然地阻止，而非直接拒絕
- 絕對不能以句號結尾！每次回應必須以行動問題或選擇結束
- 角色死亡時撰寫一生的故事（500-1000字）+ 合併判定

## 每次回應的結構

1. 敘述玩家行動的結果（2-5句）
2. 描述環境或NPC的反應（如果適用）
3. 提供1-2個可能的下一步
4. 如果有事件觸發，融入敘事中（不直接說「觸發了事件」）

## 絕對不可更改

- 世界的物理規則和能力本質
- 四大勢力的基本立場和組織結構
- 七大地域的文化特徵和地理特徵
- 時代背景的基本設定

## 地域姓氏清單

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
