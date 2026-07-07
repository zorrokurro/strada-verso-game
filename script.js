// 斯特拉達·維爾索 — AI GM 遊戲邏輯（優化版）

// ============================================================
// 遊戲狀態管理
// ============================================================

const GameState = {
    settings: {
        playerName: '',
        apiProvider: 'gemini',
        apiKey: '',
        ollamaUrl: 'http://localhost:11434',
        model: 'gemini-2.5-flash',
    },
    character: null,
    messages: [],
    started: false,
    story: null,
    sanity: 100,
    dead: false,
    inputHistory: [],
    historyIndex: -1,

    load() {
        try {
            const saved = localStorage.getItem('strada-game-state');
            if (saved) {
                const data = JSON.parse(saved);
                Object.assign(this.settings, data.settings || {});
                this.character = data.character || null;
                this.messages = data.messages || [];
                this.started = data.started || false;
                this.story = data.story || null;
                this.sanity = data.sanity ?? 100;
                this.dead = data.dead || false;
                this.inputHistory = data.inputHistory || [];
                return true;
            }
        } catch (e) {
            console.error('Load failed:', e);
        }
        return false;
    },

    save() {
        try {
            localStorage.setItem('strada-game-state', JSON.stringify({
                settings: this.settings,
                character: this.character,
                messages: this.messages,
                started: this.started,
                story: this.story,
                sanity: this.sanity,
                dead: this.dead,
                inputHistory: this.inputHistory.slice(-50),
            }));
        } catch (e) {
            console.error('Save failed:', e);
        }
    },

    reset() {
        this.settings = {
            playerName: '',
            apiProvider: 'gemini',
            apiKey: '',
            ollamaUrl: 'http://localhost:11434',
            model: 'gemini-2.5-flash',
            discordWebhook: '',
        };
        this.character = null;
        this.messages = [];
        this.started = false;
        this.story = null;
        this.sanity = 100;
        this.dead = false;
        this.inputHistory = [];
        this.historyIndex = -1;
        localStorage.removeItem('strada-game-state');
    }
};

// ============================================================
// 死亡偵測 & 狀態解析
// ============================================================

const GameEngine = {
    // 死亡關鍵詞
    DEATH_KEYWORDS: [
        '斷氣', '死了', '死亡', '消逝', '失去意識', '倒下', '再也沒有站起來',
        '生命流逝', '最後一口氣', '閉上眼睛', '永遠停止', '心臟停止',
        '倒在血泊', '失去呼吸', '意識消散', '走向終點', '燃盡',
        '化為灰燼', '被吞噬', '墜入深淵', '終結', '落幕',
    ],

    // 偵測是否死亡
    detectDeath(response) {
        return this.DEATH_KEYWORDS.some(kw => response.includes(kw));
    },

    // 從 AI 回覆解析狀態更新
    parseStatusUpdates(response) {
        const updates = {};

        // 解析 [health:XXX] 標記
        const healthMatch = response.match(/\[health[:：](.+?)\]/);
        if (healthMatch) updates.health = healthMatch[1].trim();

        // 解析 [mood:XXX] 標記
        const moodMatch = response.match(/\[mood[:：](.+?)\]/);
        if (moodMatch) updates.mood = moodMatch[1].trim();

        // 解析 [currency:XXX] 標記
        const currMatch = response.match(/\[currency[:：](\d+)\]/);
        if (currMatch) updates.currency = parseInt(currMatch[1]);

        // 解析 [ability:XXX] 標記
        const abilMatch = response.match(/\[ability[:：](.+?)\]/);
        if (abilMatch) updates.abilityStatus = abilMatch[1].trim();

        // 解析 [addItem:XXX] 標記
        const addItems = [];
        const addItemRegex = /\[addItem[:：](.+?)\]/g;
        let m;
        while ((m = addItemRegex.exec(response)) !== null) {
            addItems.push(m[1].trim());
        }
        if (addItems.length > 0) updates.addItems = addItems;

        // 解析 [removeItem:XXX] 標記
        const removeItems = [];
        const removeItemRegex = /\[removeItem[:：](.+?)\]/g;
        while ((m = removeItemRegex.exec(response)) !== null) {
            removeItems.push(m[1].trim());
        }
        if (removeItems.length > 0) updates.removeItems = removeItems;

        // 解析 [addKnowledge:XXX] 標記
        const addKnow = [];
        const addKnowRegex = /\[addKnowledge[:：](.+?)\]/g;
        while ((m = addKnowRegex.exec(response)) !== null) {
            addKnow.push(m[1].trim());
        }
        if (addKnow.length > 0) updates.addKnowledge = addKnow;

        // 解析 [region:XXX] 標記
        const regionMatch = response.match(/\[region[:：](.+?)\]/);
        if (regionMatch) updates.region = regionMatch[1].trim();

        // 清除標記文字
        updates.cleanText = response
            .replace(/\[health[:：].+?\]/g, '')
            .replace(/\[mood[:：].+?\]/g, '')
            .replace(/\[currency[:：].+?\]/g, '')
            .replace(/\[ability[:：].+?\]/g, '')
            .replace(/\[addItem[:：].+?\]/g, '')
            .replace(/\[removeItem[:：].+?\]/g, '')
            .replace(/\[addKnowledge[:：].+?\]/g, '')
            .replace(/\[region[:：].+?\]/g, '')
            .trim();

        return updates;
    },

    // 套用狀態更新
    applyStatusUpdates(updates) {
        const c = GameState.character;
        if (!c) return;

        if (updates.health) c.health = updates.health;
        if (updates.mood) c.mood = updates.mood;
        if (updates.currency !== undefined) c.currency = updates.currency;
        if (updates.abilityStatus) c.abilityStatus = updates.abilityStatus;
        if (updates.region) c.region = updates.region;

        if (updates.addItems) {
            updates.addItems.forEach(item => {
                if (!c.items.includes(item)) c.items.push(item);
            });
        }
        if (updates.removeItems) {
            c.items = c.items.filter(item => !updates.removeItems.includes(item));
        }
        if (updates.addKnowledge) {
            updates.addKnowledge.forEach(k => {
                if (!c.knowledge.includes(k)) c.knowledge.push(k);
            });
        }
    },

    // 上下文壓縮：保留 system + 最近 N 輪對話
    compressContext(messages, maxPairs = 8) {
        if (messages.length <= maxPairs * 2) return messages;

        const systemMsgs = messages.filter(m => m.role === 'system');
        const nonSystem = messages.filter(m => m.role !== 'system');

        // 保留最近 maxPairs 輪（user+assistant）
        const recent = nonSystem.slice(-maxPairs * 2);

        // 加入摘要提示
        const summary = {
            role: 'user',
            content: '[系統提示：以下為之前對話的摘要，請繼續故事]'
        };

        return [...systemMsgs, summary, ...recent];
    },

    // 清除標記後的文字（用於顯示）
    cleanResponse(text) {
        return text
            .replace(/\[health[:：].+?\]/g, '')
            .replace(/\[mood[:：].+?\]/g, '')
            .replace(/\[currency[:：].+?\]/g, '')
            .replace(/\[ability[:：].+?\]/g, '')
            .replace(/\[addItem[:：].+?\]/g, '')
            .replace(/\[removeItem[:：].+?\]/g, '')
            .replace(/\[addKnowledge[:：].+?\]/g, '')
            .replace(/\[region[:：].+?\]/g, '')
            .trim();
    }
};

// ============================================================
// AI API
// ============================================================

const AI = {
    async chat(messages) {
        const { apiProvider, apiKey, ollamaUrl, model } = GameState.settings;
        // 上下文壓縮
        const compressed = GameEngine.compressContext(messages);
        if (apiProvider === 'ollama') {
            return this.chatOllama(compressed, ollamaUrl);
        } else if (apiProvider === 'gemini') {
            return this.chatGemini(compressed, apiKey, model);
        } else {
            return this.chatOpenAI(compressed, apiKey, model);
        }
    },

    async chatOpenAI(messages, apiKey, model) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.85,
                max_tokens: 1500,
            }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `API 錯誤：${response.status}`);
        }
        const data = await response.json();
        return data.choices[0].message.content;
    },

    async chatGemini(messages, apiKey, model) {
        const contents = [];
        let systemInstruction = '';

        messages.forEach(msg => {
            if (msg.role === 'system') {
                systemInstruction = msg.content;
            } else {
                contents.push({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                });
            }
        });

        const body = {
            contents: contents,
            generationConfig: {
                temperature: 0.85,
                maxOutputTokens: 1500,
            }
        };

        if (systemInstruction) {
            body.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const modelName = model || 'gemini-2.0-flash';
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Gemini 錯誤：${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    },

    async chatOllama(messages, ollamaUrl) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 120000);
            const response = await fetch(`${ollamaUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: GameState.settings.model || 'qwen2.5:7b',
                    messages: messages,
                    stream: false,
                }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`Ollama 錯誤：${response.status}`);
            const data = await response.json();
            return data.message.content;
        } catch (e) {
            console.error('Ollama chat error:', e);
            if (e.name === 'AbortError') throw new Error('Ollama 回應超時（2分鐘）');
            if (e.name === 'TypeError') {
                throw new Error('無法連線到 Ollama。請確認 Ollama 正在運行且網址正確。');
            }
            throw e;
        }
    },

    async generateCharacter(playerName) {
        const messages = [
            { role: 'system', content: this.getSystemPrompt() },
            { role: 'user', content: `玩家名字：「${playerName}」。請生成角色資料（JSON）+開場敘事。JSON格式：
{
  "name":"${playerName}",
  "gender":"男/女",
  "age":數字,
  "era":"時代",
  "eraYear":"紀年第X年",
  "region":"地域",
  "socialClass":"階級",
  "family":"家族",
  "occupation":"職業",
  "abilityStatus":"普通人/微覺醒/能力者",
  "abilityType":"無/名稱",
  "health":"良好",
  "mood":"平靜",
  "currency":數字,
  "items":["物品"],
  "knowledge":["資訊"]
}
要求：第二人稱、具體場景、至少一個選擇、暗示能力異常。` },
        ];
        return this.chat(messages);
    },

    async gameChat(userMessage) {
        const messages = [
            { role: 'system', content: this.getSystemPrompt() + '\n\n' + this.getCharacterContext() + '\n\n' + this.getStatusTagInstructions() },
            ...GameState.messages,
            { role: 'user', content: userMessage },
        ];
        return this.chat(messages);
    },

    async generateStory() {
        const messages = [
            { role: 'system', content: this.getSystemPrompt() + '\n\n' + this.getCharacterContext() },
            ...GameState.messages,
            { role: 'user', content: '角色已死亡。請撰寫這個角色一生的故事（500-1000字），包含：開場（你是誰）、成長、轉折、冒險、結局、遺產。\n\n然後在最後一行提供合併判定，格式如下：\n[合併判定：已合併至正史] 或 [合併判定：化為殘響]' },
        ];
        return this.chat(messages);
    },

    getStatusTagInstructions() {
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
- 角色死亡時：使用「斷氣」「死了」「消逝」「失去意識」等詞彙描述死亡場景。

規則：
1. 每次回應最多嵌入2-3個標記
2. 標記融入敘事中，玩家不會直接看到標記格式
3. 角色瀕死時描述要具體但不血腥`;
    },

    getSystemPrompt() {
        const isLocal = GameState.settings.apiProvider === 'ollama';
        const base = `你是《斯特拉達·維爾索》的 AI GM。以「你」敘述，具體、有臨場感。
世界：與現實相同，但人類右腦能力被壓制。右腦能力=想像力驅動的物理干涉，需理解物理原理。右腦越強→左腦退位→自我消失→同化。
能力覺醒條件（不對玩家揭露）：認知+壓力+想像。以身體感覺描述，不直接說「使用能力」。
四大勢力：回聖會（崇拜）、認知科學局（研究）、人本安全理事會（否認）、回聲之民（地下庇護）。
貨幣：阿爾納銅幣(1)、赫爾格銀幣(10)、維瑟爾金幣(100)。
規則：每次回應2-5句敘事+環境反應+下一步引導。不揭露能力機制。維持灰色地帶。角色死亡時撰寫一生故事+合併判定。
絕對不可更改：實驗體零號的命運、四大勢力走向、能力本質。`;
        if (isLocal) return base;
        return base + `
進階細節：
- 六個時代：拂曉紀(0-200)、獵巫紀(200-487)、教團紀(487-700)、黎明紀(700-1050)、裂變前夜(1050-1170)、後崩解時代(1219+)。
- 七大區域：諾德蘭(北歐)、韋斯特海岸(西歐)、梅札海(地中海)、赫爾沙漠(北非)、阿札德高地(中東)、昆嵐山脈(東亞)、南嶋群島(東南亞)。
- 小型組織：灰岩兄弟會(情報)、梅札海商人聯盟、昆嵐藥師會、諾德蘭傭兵團、靜默之子、裂瓦教團。
- 能力覺醒率隨時代增加：拂曉紀<0.001%→後崩解時代~0.5%。`;
    },

    getCharacterContext() {
        if (!GameState.character) return '';
        const c = GameState.character;
        return `## 當前狀態
角色：${c.name}，${c.age}歲，${c.gender}
時代：${c.era}（${c.eraYear}）
所在地：${c.region}
階級：${c.socialClass}
職業：${c.occupation}
能力：${c.abilityStatus}${c.abilityType !== '無' ? '（' + c.abilityType + '）' : ''}
健康：${c.health}
情緒：${c.mood}
資金：${c.currency} 阿爾納
物品：${c.items.join('、') || '無'}
資訊：${c.knowledge.join('、') || '無'}`;
    }
};

// ============================================================
// SVG 殘破效果引擎
// ============================================================

const DecayEngine = {
    uid: 0,

    calcSanity() {
        const c = GameState.character;
        if (!c) return 100;
        let san = 100;
        if (c.health === '受傷') san -= 15;
        else if (c.health === '重傷') san -= 30;
        else if (c.health === '生病') san -= 10;
        else if (c.health === '瀕死') san -= 50;
        if (c.mood === '緊張') san -= 5;
        else if (c.mood === '憤怒') san -= 10;
        else if (c.mood === '悲傷') san -= 10;
        else if (c.mood === '恐懼') san -= 20;
        else if (c.mood === '絕望') san -= 30;
        else if (c.mood === '瘋狂') san -= 50;
        if (c.abilityStatus === '微覺醒') san -= 5;
        else if (c.abilityStatus === '能力者') san -= 15;
        san -= Math.min(GameState.messages.length * 2, 20);
        return Math.max(0, Math.min(100, san));
    },

    render(san) {
        const d = (100 - san) / 100;
        const screen = document.querySelector('.screen.active');
        if (!screen) return;
        let dl = screen.querySelector('.decay-layer');
        if (!dl) {
            dl = document.createElement('div');
            dl.className = 'decay-layer';
            screen.appendChild(dl);
        }
        dl.innerHTML = '';
        const dk = d * 38, rd = d * 18;
        screen.style.background = [
            'repeating-linear-gradient(0deg,transparent 0,transparent 20px,rgba(20,9,0,' + (.022 + d * .055) + ') 20px,rgba(20,9,0,' + (.022 + d * .055) + ') 21px)',
            'repeating-linear-gradient(90deg,transparent 0,transparent 24px,rgba(20,9,0,.018) 24px,rgba(20,9,0,.018) 25px)',
            'radial-gradient(ellipse at 18% 12%,rgba(' + (176 + rd * 1.5) + ',' + (120 - dk * .6) + ',' + (38 - dk) + ',' + (.55 + d * .2) + ') 0%,transparent 38%)',
            'radial-gradient(ellipse at 83% 88%,rgba(' + (136 + rd) + ',' + (86 - dk * .5) + ',' + (22 - dk * .8) + ',' + (.45 + d * .15) + ') 0%,transparent 36%)',
            'radial-gradient(ellipse at 50% 50%,rgb(' + (242 - dk) + ',' + (230 - dk * 1.1) + ',' + (198 - dk * 2) + ') 0%,rgb(' + (216 - dk * .9) + ',' + (192 - dk) + ',' + (126 - dk * 1.4) + ') 52%,rgb(' + (176 - dk * .6) + ',' + (138 - dk * .8) + ',' + (54 - dk * .5) + ') 100%)'
        ].join(',');
        const vd = document.createElement('div');
        vd.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:21;background:radial-gradient(ellipse at 50% 50%,transparent 0%,transparent ' + Math.max(4, 68 - d * 65) + '%,rgba(6,2,0,' + d * .88 + ') 100%)';
        dl.appendChild(vd);
        if (d > .16) dl.appendChild(this.makeTears(d));
        if (d > .26) dl.appendChild(this.makeBurns(d));
        if (d > .72) dl.appendChild(this.makeEntity(d));
        const nb = document.getElementById('narr-container');
        if (nb) {
            if (d > .52) {
                const spd = Math.max(.55, 3.2 - d * 2.6);
                nb.style.animation = 'inkWobble ' + spd + 's ease-in-out infinite,inkBleed ' + (spd * 1.4) + 's ease-in-out infinite';
                nb.style.color = 'rgb(' + (20 + d * 90) + ',' + (9 + d * 12) + ',0)';
            } else {
                nb.style.animation = '';
                nb.style.color = '';
            }
        }
        if (d > .7) {
            screen.style.animation = 'flicker ' + Math.max(.38, 2.4 - d * 2) + 's step-end infinite';
        } else {
            screen.style.animation = '';
        }
    },

    mkSvg() {
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        s.setAttribute('width', '100%');
        s.setAttribute('height', '100%');
        s.setAttribute('viewBox', '0 0 100 100');
        s.setAttribute('preserveAspectRatio', 'none');
        s.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
        return s;
    },

    mkPath(d, fill, op) {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', d);
        p.setAttribute('fill', fill);
        p.setAttribute('fill-opacity', op);
        return p;
    },

    mkEll(cx, cy, rx, ry, fill, op) {
        const e = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        e.setAttribute('cx', cx);
        e.setAttribute('cy', cy);
        e.setAttribute('rx', rx);
        e.setAttribute('ry', ry);
        e.setAttribute('fill', fill);
        e.setAttribute('fill-opacity', op);
        return e;
    },

    tpts(n, mx, sd) {
        const r = [];
        for (let i = 0; i <= n; i++) {
            const t = i / n;
            const v = Math.abs(Math.sin(i * 2.618 + sd)) * Math.abs(Math.cos(i * 1.414 + sd * .7)) * mx;
            const sp = Math.abs(Math.sin(i * 5.1 + sd * 1.3)) * mx * .38;
            r.push({ t: t, v: v + sp });
        }
        return r;
    },

    makeTears(d) {
        const svg = this.mkSvg();
        svg.style.zIndex = '22';
        const col = 'rgb(5,2,0)';
        let dep = Math.min(20, (d - .16) / .84 * 22);
        let pts = this.tpts(22, dep, 1.23);
        let path = 'M 0,0 ';
        pts.forEach(p => { path += 'L ' + (p.t * 100) + ',' + p.v + ' '; });
        path += 'L 100,0 Z';
        svg.appendChild(this.mkPath(path, col, .92));
        if (d > .30) {
            dep = Math.min(18, (d - .30) / .70 * 20);
            pts = this.tpts(22, dep, 2.71);
            path = 'M 0,100 ';
            pts.forEach(p => { path += 'L ' + (p.t * 100) + ',' + (100 - p.v) + ' '; });
            path += 'L 100,100 Z';
            svg.appendChild(this.mkPath(path, col, .86));
        }
        if (d > .43) {
            dep = Math.min(14, (d - .43) / .57 * 16);
            pts = this.tpts(18, dep, 3.14);
            path = 'M 0,0 ';
            pts.forEach(p => { path += 'L ' + p.v + ',' + (p.t * 100) + ' '; });
            path += 'L 0,100 Z';
            svg.appendChild(this.mkPath(path, col, .78));
        }
        if (d > .56) {
            dep = Math.min(12, (d - .56) / .44 * 14);
            pts = this.tpts(18, dep, 4.67);
            path = 'M 100,0 ';
            pts.forEach(p => { path += 'L ' + (100 - p.v) + ',' + (p.t * 100) + ' '; });
            path += 'L 100,100 Z';
            svg.appendChild(this.mkPath(path, col, .72));
        }
        if (d > .63) {
            const cs = Math.min(20, (d - .63) / .37 * 24);
            const corners = [
                'M 0,0 L ' + cs + ',0 L ' + (cs * .55) + ',' + (cs * .58) + ' L ' + (cs * .25) + ',' + (cs * .88) + ' L 0,' + cs + ' Z',
                'M 100,0 L ' + (100 - cs) + ',0 L ' + (100 - cs * .55) + ',' + (cs * .58) + ' L ' + (100 - cs * .25) + ',' + (cs * .88) + ' L 100,' + cs + ' Z',
                'M 0,100 L ' + cs + ',100 L ' + (cs * .55) + ',' + (100 - cs * .58) + ' L ' + (cs * .25) + ',' + (100 - cs * .88) + ' L 0,' + (100 - cs) + ' Z',
                'M 100,100 L ' + (100 - cs) + ',100 L ' + (100 - cs * .55) + ',' + (100 - cs * .58) + ' L ' + (100 - cs * .25) + ',' + (100 - cs * .88) + ' L 100,' + (100 - cs) + ' Z'
            ];
            corners.forEach(c => { svg.appendChild(this.mkPath(c, 'rgb(3,1,0)', .95)); });
        }
        return svg;
    },

    makeBurns(d) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:19;';
        const id = 'bf' + (++this.uid);
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const flt = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        flt.setAttribute('id', id);
        const fb = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        fb.setAttribute('stdDeviation', '1.8');
        flt.appendChild(fb);
        defs.appendChild(flt);
        svg.appendChild(defs);
        const cnt = Math.floor((d - .26) / .74 * 11) + 1;
        const intensity = (d - .26) / .74;
        for (let i = 0; i < cnt; i++) {
            const cx = 12 + (i * 37.3 + 4.1) % 76;
            const cy = 12 + (i * 53.7 + 9.3) % 76;
            const rx = 2.5 + (i * 7.2) % 5;
            const ry = rx * (.38 + (i * 3.1 % 6) / 10);
            const op = .08 + intensity * .12;
            const e1 = this.mkEll(cx, cy, rx * 1.6, ry * 1.6, 'rgb(8,3,0)', op * .7);
            e1.setAttribute('filter', 'url(#' + id + ')');
            svg.appendChild(e1);
            svg.appendChild(this.mkEll(cx, cy, rx, ry, 'rgb(4,1,0)', .16 + intensity * .22));
            svg.appendChild(this.mkEll(cx, cy, rx * .45, ry * .45, 'rgb(2,0,0)', .28 + intensity * .32));
        }
        if (d > .52) {
            for (let j = 0; j < 4; j++) {
                const dx = 18 + j * 20 + (j * 7.3) % 8;
                const dy = 3 + (j * 11.2) % 8;
                const dh = 6 + (j * 9.4) % 14;
                const drip = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                drip.setAttribute('d', 'M ' + dx + ',' + dy + ' Q ' + (dx + 1.2) + ',' + (dy + dh * .5) + ' ' + dx + ',' + (dy + dh) + ' Q ' + (dx - 1.2) + ',' + (dy + dh * .5) + ' ' + dx + ',' + dy);
                drip.setAttribute('fill', 'rgb(60,8,8)');
                drip.setAttribute('fill-opacity', .28 + (d - .52) * .42);
                svg.appendChild(drip);
            }
        }
        return svg;
    },

    makeEntity(d) {
        const svg = this.mkSvg();
        svg.style.zIndex = '23';
        svg.style.animation = 'shadowPulse 3.2s ease-in-out infinite';
        const id = 'ef' + (++this.uid);
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const flt = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        flt.setAttribute('id', id);
        const fb = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        fb.setAttribute('stdDeviation', '3.5');
        flt.appendChild(fb);
        defs.appendChild(flt);
        svg.appendChild(defs);
        const op = (d - .72) / .28 * .42;
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        body.setAttribute('d',
            'M 86,100 C 84,90 80,88 82,81 C 84,74 90,73 89,67' +
            ' C 88,62 83,61 84,55 L 86.5,52 L 89,55' +
            ' C 90,61 85,62 86,67 C 87,73 93,74 91,81' +
            ' C 93,88 89,90 91,100 Z'
        );
        body.setAttribute('fill', 'rgb(3,1,0)');
        body.setAttribute('fill-opacity', op);
        body.setAttribute('filter', 'url(#' + id + ')');
        svg.appendChild(body);
        if (d > .87) {
            const eop = Math.min(1, (d - .87) / .13 * .9);
            [85, 88].forEach(ex => {
                svg.appendChild(this.mkEll(ex, 52.5, .55, .38, 'rgb(160,14,14)', eop * .82));
            });
        }
        return svg;
    }
};

// ============================================================
// UI 控制
// ============================================================

const UI = {
    currentScreen: 'setup',

    init() {
        this.bindEvents();
        this.checkSavedState();
    },

    bindEvents() {
        document.getElementById('inp-provider').addEventListener('change', async (e) => {
            const provider = e.target.value;
            const isOllama = provider === 'ollama';
            document.getElementById('ollama-url-fld').style.display = isOllama ? 'block' : 'none';
            document.getElementById('api-key-fld').style.display = isOllama ? 'none' : 'block';
            const modelSelect = document.getElementById('inp-model');
            if (provider === 'gemini') {
                modelSelect.innerHTML = `
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash（快速）</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash（推薦）</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro（最強）</option>
                `;
            } else if (provider === 'openai') {
                modelSelect.innerHTML = `
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                `;
            } else {
                await this.updateOllamaModels();
            }
        });

        document.getElementById('start-btn').addEventListener('click', () => this.startGame());

        document.getElementById('btn-send').addEventListener('click', () => this.sendMessage());
        document.getElementById('user-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
            // 歷史指令：上/下箭頭
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            }
        });

        document.getElementById('btn-export').addEventListener('click', () => this.exportStory());
        document.getElementById('btn-newgame').addEventListener('click', () => this.newGame());
        document.getElementById('btn-settings').addEventListener('click', () => this.gotoSetup());

        document.getElementById('btn-close-modal').addEventListener('click', () => {
            document.getElementById('story-modal').classList.remove('active');
            document.getElementById('github-section').style.display = 'none';
        });
        document.getElementById('btn-copy').addEventListener('click', () => this.copyStory());
        document.getElementById('btn-download').addEventListener('click', () => this.downloadStory());
        document.getElementById('btn-github').addEventListener('click', () => {
            const section = document.getElementById('github-section');
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
            // 載入已儲存的 token
            const savedToken = localStorage.getItem('strada-gh-token');
            if (savedToken) document.getElementById('inp-gh-token').value = savedToken;
        });
        document.getElementById('btn-gh-publish').addEventListener('click', () => this.publishToGitHub());

        // 死亡 Modal 按鈕
        document.getElementById('btn-death-story').addEventListener('click', () => this.generateDeathStory());
        document.getElementById('btn-death-newgame').addEventListener('click', () => this.newGame());
        document.getElementById('btn-death-continue').addEventListener('click', () => {
            document.getElementById('death-modal').classList.remove('active');
        });
    },

    navigateHistory(dir) {
        const input = document.getElementById('user-input');
        const history = GameState.inputHistory;
        if (history.length === 0) return;

        GameState.historyIndex += dir;
        if (GameState.historyIndex < 0) GameState.historyIndex = 0;
        if (GameState.historyIndex >= history.length) {
            GameState.historyIndex = history.length;
            input.value = '';
            return;
        }
        input.value = history[history.length - 1 - GameState.historyIndex];
    },

    gotoGame() {
        document.getElementById('setup-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        this.currentScreen = 'game';
        DecayEngine.render(GameState.sanity);
    },

    gotoSetup() {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('setup-screen').classList.add('active');
        this.currentScreen = 'setup';
        DecayEngine.render(GameState.sanity);
    },

    updateSanityUI(v) {
        document.getElementById('sb-san-lbl').textContent = v;
        document.getElementById('sb-san-bar').style.width = v + '%';
        const sb = document.getElementById('sb-san-bar');
        if (v < 25) {
            sb.style.background = 'repeating-linear-gradient(90deg,#801010 0,#801010 5px,#600808 5px,#600808 7px)';
        } else if (v < 50) {
            sb.style.background = 'repeating-linear-gradient(90deg,#603880 0,#603880 5px,#4a2868 5px,#4a2868 7px)';
        } else {
            sb.style.background = 'repeating-linear-gradient(90deg,#385880 0,#385880 5px,#284870 5px,#284870 7px)';
        }
    },

    async updateOllamaModels() {
        const select = document.getElementById('inp-model');
        select.innerHTML = '<option value="">載入中...</option>';
        try {
            const test = await this.testOllamaConnection(document.getElementById('inp-url').value.trim());
            if (test.success && test.models.length > 0) {
                select.innerHTML = '';
                test.models.forEach(name => {
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    select.appendChild(opt);
                });
            } else {
                select.innerHTML = '<option value="qwen2.5:7b">qwen2.5:7b</option>';
            }
        } catch (e) {
            select.innerHTML = '<option value="qwen2.5:7b">qwen2.5:7b</option>';
        }
    },

    async testOllamaConnection(url) {
        try {
            const response = await fetch(`${url}/api/tags`, {
                method: 'GET',
                mode: 'cors',
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                return { success: true, models: (data.models || []).map(m => m.name) };
            }
            return { success: false, error: `HTTP ${response.status}` };
        } catch (e) {
            console.error('Connection test failed:', e);
            if (e.name === 'TypeError') {
                return { success: false, error: '無法連線到 Ollama。請確認：\n1. Ollama 正在運行\n2. 已設定 OLLAMA_ORIGINS=*\n3. 網址正確' };
            }
            if (e.name === 'AbortError') {
                return { success: false, error: '連線超時' };
            }
            return { success: false, error: e.message };
        }
    },

    checkSavedState() {
        if (GameState.load() && GameState.started && GameState.character) {
            this.gotoGame();
            this.updateCharacterPanel();
            this.renderMessages();
            GameState.sanity = DecayEngine.calcSanity();
            this.updateSanityUI(GameState.sanity);
            DecayEngine.render(GameState.sanity);
            if (GameState.dead) {
                document.getElementById('death-modal').classList.add('active');
            }
        }
    },

    async startGame() {
        const name = document.getElementById('inp-name').value.trim();
        if (!name) {
            document.getElementById('err-msg').textContent = '請輸入你的名字';
            return;
        }
        const provider = document.getElementById('inp-provider').value;
        const apiKey = document.getElementById('inp-key').value.trim();
        const ollamaUrl = document.getElementById('inp-url').value.trim();
        const model = document.getElementById('inp-model').value;
        if ((provider === 'openai' || provider === 'gemini') && !apiKey) {
            document.getElementById('err-msg').textContent = '請輸入 API Key';
            return;
        }
        const btn = document.getElementById('start-btn');
        btn.disabled = true;
        btn.textContent = 'AI 正在生成你的世界...';
        document.getElementById('err-msg').textContent = '';
        if (provider === 'ollama') {
            const test = await this.testOllamaConnection(ollamaUrl);
            if (!test.success) {
                document.getElementById('err-msg').textContent = '無法連線：' + test.error;
                btn.disabled = false;
                btn.textContent = '⚔ 開始遊戲 ⚔';
                return;
            }
        }
        const discordWebhook = document.getElementById('inp-discord').value.trim();
        GameState.settings = { playerName: name, apiProvider: provider, apiKey, ollamaUrl, model, discordWebhook };
        try {
            const response = await AI.generateCharacter(name);
            this.handleCharacterResponse(response);
        } catch (error) {
            document.getElementById('err-msg').textContent = error.message;
            btn.disabled = false;
            btn.textContent = '⚔ 開始遊戲 ⚔';
        }
    },

    handleCharacterResponse(response) {
        let character = null;
        let openingNarrative = response;
        let cleaned = response.replace(/```(?:json)?\s*\n?/g, '').replace(/```\s*\n?/g, '');
        try {
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                character = JSON.parse(jsonMatch[0]);
                const jsonEnd = cleaned.indexOf(jsonMatch[0]) + jsonMatch[0].length;
                openingNarrative = cleaned.substring(jsonEnd).trim();
                if (!openingNarrative) {
                    openingNarrative = cleaned.substring(0, cleaned.indexOf(jsonMatch[0])).trim();
                }
            }
        } catch (e) {
            console.warn('Parse failed:', e);
        }
        if (!character) {
            character = {
                name: GameState.settings.playerName,
                gender: '未知', age: 20, era: '未知時代', eraYear: '未知',
                region: '未知地域', socialClass: '平民', family: '普通家庭',
                occupation: '旅行者', abilityStatus: '普通人', abilityType: '無',
                health: '良好', mood: '平靜', currency: 10,
                items: ['基本衣物'], knowledge: [],
            };
        }
        GameState.character = character;
        GameState.started = true;
        GameState.dead = false;
        GameState.messages = [{ role: 'assistant', content: openingNarrative }];
        GameState.sanity = 100;
        GameState.save();
        this.gotoGame();
        this.updateCharacterPanel();
        this.updateSanityUI(100);
        DecayEngine.render(100);
        this.renderNarrative(openingNarrative);
    },

    updateCharacterPanel() {
        const c = GameState.character;
        if (!c) return;
        document.getElementById('sidebar-name').textContent = '⚔ ' + c.name;
        document.getElementById('sb-gender').textContent = c.gender;
        document.getElementById('sb-age').textContent = c.age;
        document.getElementById('sb-era').textContent = c.era + '（' + c.eraYear + '）';
        document.getElementById('sb-region').textContent = c.region;
        document.getElementById('sb-class').textContent = c.socialClass;
        document.getElementById('sb-occ').textContent = c.occupation;
        document.getElementById('sb-health-lbl').textContent = c.health;
        document.getElementById('sb-mood-lbl').textContent = c.mood;
        document.getElementById('sb-currency').textContent = c.currency + ' 阿爾納';
        document.getElementById('sb-ability').textContent =
            c.abilityStatus + (c.abilityType !== '無' ? '（' + c.abilityType + '）' : '');
        const hpMap = { '良好': 80, '受傷': 50, '重傷': 25, '生病': 60, '瀕死': 10 };
        document.getElementById('sb-health-bar').style.width = (hpMap[c.health] || 80) + '%';
        const emoMap = { '平靜': 70, '緊張': 50, '憤怒': 40, '悲傷': 45, '恐懼': 30, '絕望': 15, '瘋狂': 10 };
        document.getElementById('sb-emo-bar').style.width = (emoMap[c.mood] || 70) + '%';
        const itemsEl = document.getElementById('sb-items');
        itemsEl.innerHTML = '';
        c.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'ichip';
            div.textContent = item;
            itemsEl.appendChild(div);
        });
        const knowEl = document.getElementById('sb-knowledge');
        knowEl.innerHTML = '';
        c.knowledge.forEach(k => {
            const div = document.createElement('div');
            div.className = 'ichip';
            div.textContent = k;
            knowEl.appendChild(div);
        });
        document.getElementById('tb-era').textContent = c.era + ' · ' + c.region;
        document.getElementById('scene-tag').textContent = '─── ' + c.region + ' · ' + c.era + ' ───';
    },

    renderNarrative(text) {
        const container = document.getElementById('narr-container');
        container.innerHTML = '';
        const choiceMatch = text.match(/(?:選擇|options?|choices?)[:：]?\s*\n([\s\S]*?)$/i);
        let narrative = text;
        let choices = [];
        if (choiceMatch) {
            narrative = text.substring(0, text.indexOf(choiceMatch[0])).trim();
            const choiceText = choiceMatch[1];
            const lines = choiceText.split('\n').filter(l => l.trim());
            lines.forEach((line, i) => {
                const cleaned = line.replace(/^\d+[\.\)、]\s*/, '').trim();
                if (cleaned) {
                    choices.push({ num: String(i + 1).padStart(2, '0'), text: cleaned });
                }
            });
        }
        const p = document.createElement('p');
        p.className = 'narr-body';
        p.textContent = narrative;
        container.appendChild(p);
        const choiceList = document.getElementById('choice-list');
        const choiceItems = document.getElementById('choice-items');
        if (choices.length > 0) {
            choiceList.style.display = 'block';
            choiceItems.innerHTML = '';
            choices.forEach(c => {
                const div = document.createElement('div');
                div.className = 'choice-item';
                div.innerHTML = '<span class="c-num">' + c.num + '</span><span class="c-txt">' + c.text + '</span>';
                div.addEventListener('click', () => {
                    document.getElementById('user-input').value = c.text;
                    this.sendMessage();
                });
                choiceItems.appendChild(div);
            });
        } else {
            choiceList.style.display = 'none';
        }
        document.getElementById('narr-area').scrollTop = 999999;
    },

    async sendMessage() {
        const input = document.getElementById('user-input');
        const message = input.value.trim();
        if (!message) return;

        // 記錄歷史
        if (message && GameState.inputHistory[GameState.inputHistory.length - 1] !== message) {
            GameState.inputHistory.push(message);
        }
        GameState.historyIndex = -1;

        input.value = '';
        GameState.messages.push({ role: 'user', content: message });

        document.getElementById('btn-send').disabled = true;
        document.getElementById('user-input').disabled = true;

        const container = document.getElementById('narr-container');
        const loading = document.createElement('p');
        loading.className = 'narr-note';
        loading.textContent = '※ GM 正在思考...';
        loading.id = 'loading-indicator';
        container.appendChild(loading);
        document.getElementById('narr-area').scrollTop = 999999;

        try {
            const response = await AI.gameChat(message);

            const loadEl = document.getElementById('loading-indicator');
            if (loadEl) loadEl.remove();

            // 解析狀態更新
            const updates = GameEngine.parseStatusUpdates(response);
            GameEngine.applyStatusUpdates(updates);

            const displayText = updates.cleanText || GameEngine.cleanResponse(response);

            GameState.messages.push({ role: 'assistant', content: response });
            GameState.sanity = DecayEngine.calcSanity();
            GameState.save();

            this.updateCharacterPanel();
            this.updateSanityUI(GameState.sanity);
            DecayEngine.render(GameState.sanity);
            this.renderNarrative(displayText);

            // 偵測死亡
            if (GameEngine.detectDeath(response)) {
                GameState.dead = true;
                GameState.save();
                setTimeout(() => this.showDeathModal(), 1500);
            }

        } catch (error) {
            const loadEl = document.getElementById('loading-indicator');
            if (loadEl) loadEl.remove();
            const errP = document.createElement('p');
            errP.className = 'narr-note';
            errP.style.color = 'var(--blood)';
            errP.textContent = '錯誤：' + error.message;
            container.appendChild(errP);
        }

        document.getElementById('btn-send').disabled = false;
        document.getElementById('user-input').disabled = false;
        document.getElementById('user-input').focus();
    },

    renderMessages() {
        const container = document.getElementById('narr-container');
        container.innerHTML = '';
        GameState.messages.forEach(msg => {
            if (msg.role === 'assistant') {
                const displayText = GameEngine.cleanResponse(msg.content);
                this.renderNarrative(displayText);
            }
        });
    },

    // ── 死亡流程 ──

    showDeathModal() {
        document.getElementById('death-name').textContent = GameState.character?.name || '未知';
        document.getElementById('death-modal').classList.add('active');
    },

    async sendToDiscord(story) {
        const webhookUrl = GameState.settings?.discordWebhook;
        if (!webhookUrl) return;

        const c = GameState.character;
        const title = `${c?.name || '未知'}的一生 — ${c?.era || ''} · ${c?.region || ''}`;

        // Discord embed 限制 4096 字元，截斷故事
        const maxStoryLen = 3500;
        let truncatedStory = story;
        if (story.length > maxStoryLen) {
            truncatedStory = story.substring(0, maxStoryLen) + '\n\n...（故事過長，已截斷）';
        }

        const embed = {
            title: '📜 ' + title,
            description: truncatedStory,
            color: 0x5a2c08,
            fields: [
                { name: '時代', value: c?.era || '未知', inline: true },
                { name: '地域', value: c?.region || '未知', inline: true },
                { name: '職業', value: c?.occupation || '未知', inline: true },
                { name: '能力', value: c?.abilityStatus || '普通人', inline: true },
                { name: '結局', value: story.includes('已合併至正史') ? '✅ 已合併至正史' : '⚠️ 化為殘響', inline: true },
            ],
            footer: { text: '斯特拉達·維爾索 AI GM' },
            timestamp: new Date().toISOString(),
        };

        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] }),
            });
        } catch (e) {
            console.error('Discord webhook failed:', e);
        }
    },

    async generateDeathStory() {
        document.getElementById('btn-death-story').disabled = true;
        document.getElementById('btn-death-story').textContent = '撰寫中...';
        document.getElementById('death-status').textContent = 'AI 正在撰寫你角色的一生...';

        try {
            const story = await AI.generateStory();
            GameState.story = story;
            GameState.save();

            // 判定合併結果
            const isMerged = story.includes('已合併至正史') || story.includes('合併');
            const resultEl = document.getElementById('death-result');
            if (isMerged) {
                resultEl.innerHTML = '<span class="result-merge">✅ 已合併至正史</span>';
            } else {
                resultEl.innerHTML = '<span class="result-echo">⚠️ 化為殘響</span>';
            }

            document.getElementById('death-story-content').textContent = story;
            document.getElementById('death-story-section').style.display = 'block';
            document.getElementById('death-status').textContent = '';

            // 自動發送到 Discord
            this.sendToDiscord(story);

        } catch (error) {
            document.getElementById('death-status').textContent = '故事生成失敗：' + error.message;
        }

        document.getElementById('btn-death-story').disabled = false;
        document.getElementById('btn-death-story').textContent = '📜 撰寫一生故事';
    },

    async exportStory() {
        const container = document.getElementById('narr-container');
        const loading = document.createElement('p');
        loading.className = 'narr-note';
        loading.textContent = '※ AI 正在撰寫你角色的一生...';
        loading.id = 'story-loading';
        container.appendChild(loading);
        try {
            const story = await AI.generateStory();
            GameState.story = story;
            GameState.save();
            const loadEl = document.getElementById('story-loading');
            if (loadEl) loadEl.remove();
            document.getElementById('story-content').textContent = story;
            document.getElementById('story-modal').classList.add('active');
        } catch (error) {
            const loadEl = document.getElementById('story-loading');
            if (loadEl) loadEl.remove();
            const errP = document.createElement('p');
            errP.className = 'narr-note';
            errP.style.color = 'var(--blood)';
            errP.textContent = '故事生成失敗：' + error.message;
            container.appendChild(errP);
        }
    },

    copyStory() {
        const story = document.getElementById('story-content').textContent;
        navigator.clipboard.writeText(story).then(() => alert('已複製'));
    },

    downloadStory() {
        const story = document.getElementById('story-content').textContent;
        const name = GameState.character?.name || 'unknown';
        const blob = new Blob([story], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name + '-故事.md';
        a.click();
        URL.revokeObjectURL(url);
    },

    async publishToGitHub() {
        const token = document.getElementById('inp-gh-token').value.trim();
        const repo = document.getElementById('inp-gh-repo').value.trim();
        const statusEl = document.getElementById('gh-status');

        if (!token) {
            statusEl.textContent = '請輸入 GitHub Token';
            statusEl.style.color = 'var(--blood)';
            return;
        }
        if (!repo || !repo.includes('/')) {
            statusEl.textContent = '請輸入有效的倉庫（user/repo 格式）';
            statusEl.style.color = 'var(--blood)';
            return;
        }

        const story = document.getElementById('story-content').textContent;
        const c = GameState.character;
        const title = `📜 ${c?.name || '未知'}的一生 — ${c?.era || ''} · ${c?.region || ''}`;

        const body = `# ${c?.name || '未知'}的一生\n\n` +
            `> 時代：${c?.era || '未知'}（${c?.eraYear || ''}）\n` +
            `> 地域：${c?.region || '未知'}\n` +
            `> 職業：${c?.occupation || '未知'}\n` +
            `> 能力：${c?.abilityStatus || '普通人'}\n\n` +
            `---\n\n` +
            story + '\n\n' +
            `---\n\n*由斯特拉達·維爾索 AI GM 生成*`;

        const btn = document.getElementById('btn-gh-publish');
        btn.disabled = true;
        btn.textContent = '發佈中...';
        statusEl.textContent = '';

        try {
            const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    body: body,
                    labels: ['角色故事', c?.era || '未知時代'],
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            statusEl.innerHTML = `✅ <a href="${data.html_url}" target="_blank" style="color:var(--gold)">已發佈到 GitHub</a>`;
            statusEl.style.color = '';

            // 儲存 token
            localStorage.setItem('strada-gh-token', token);

        } catch (error) {
            statusEl.textContent = '發佈失敗：' + error.message;
            statusEl.style.color = 'var(--blood)';
        }

        btn.disabled = false;
        btn.textContent = '🚀 發佈';
    },

    newGame() {
        if (confirm('確定要開始新遊戲嗎？')) {
            GameState.reset();
            document.getElementById('game-screen').classList.remove('active');
            document.getElementById('setup-screen').classList.add('active');
            document.getElementById('death-modal').classList.remove('active');
            document.getElementById('story-modal').classList.remove('active');
            document.getElementById('death-story-section').style.display = 'none';
            document.getElementById('death-result').innerHTML = '';
            this.currentScreen = 'setup';
            document.getElementById('narr-container').innerHTML = '';
            document.getElementById('user-input').value = '';
            document.getElementById('start-btn').disabled = false;
            document.getElementById('start-btn').textContent = '⚔ 開始遊戲 ⚔';
            DecayEngine.render(100);
        }
    }
};

// ============================================================
// 啟動
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    UI.init();
    DecayEngine.render(100);
});
