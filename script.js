// 斯特拉達·維爾索 — AI GM 遊戲邏輯（像素風格版）

// ============================================================
// 遊戲狀態管理
// ============================================================

const GameState = {
    settings: {
        playerName: '',
        apiProvider: 'ollama',
        apiKey: '',
        ollamaUrl: 'http://localhost:11434',
        model: 'qwen2.5:7b',
    },
    character: null,
    messages: [],
    started: false,
    story: null,
    sanity: 100, // 理智值 0-100

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
            }));
        } catch (e) {
            console.error('Save failed:', e);
        }
    },

    reset() {
        this.settings = {
            playerName: '',
            apiProvider: 'ollama',
            apiKey: '',
            ollamaUrl: 'http://localhost:11434',
            model: 'qwen2.5:7b',
        };
        this.character = null;
        this.messages = [];
        this.started = false;
        this.story = null;
        this.sanity = 100;
        localStorage.removeItem('strada-game-state');
    }
};

// ============================================================
// AI API
// ============================================================

const AI = {
    async chat(messages) {
        const { apiProvider, apiKey, ollamaUrl, model } = GameState.settings;
        if (apiProvider === 'ollama') {
            return this.chatOllama(messages, ollamaUrl);
        } else {
            return this.chatOpenAI(messages, apiKey, model);
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
            { role: 'system', content: this.getSystemPrompt() + '\n\n' + this.getCharacterContext() },
            ...GameState.messages,
            { role: 'user', content: userMessage },
        ];
        return this.chat(messages);
    },

    async generateStory() {
        const messages = [
            { role: 'system', content: this.getSystemPrompt() + '\n\n' + this.getCharacterContext() },
            ...GameState.messages,
            { role: 'user', content: '角色已死亡。撰寫一生故事（500-1000字）：開場、成長、轉折、冒險、結局、遺產。然後提供合併判定。' },
        ];
        return this.chat(messages);
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

    // 計算理智值（從角色狀態）
    calcSanity() {
        const c = GameState.character;
        if (!c) return 100;

        let san = 100;

        // 健康
        if (c.health === '受傷') san -= 15;
        else if (c.health === '重傷') san -= 30;
        else if (c.health === '生病') san -= 10;
        else if (c.health === '瀕死') san -= 50;

        // 情緒
        if (c.mood === '緊張') san -= 5;
        else if (c.mood === '憤怒') san -= 10;
        else if (c.mood === '悲傷') san -= 10;
        else if (c.mood === '恐懼') san -= 20;
        else if (c.mood === '絕望') san -= 30;
        else if (c.mood === '瘋狂') san -= 50;

        // 能力
        if (c.abilityStatus === '微覺醒') san -= 5;
        else if (c.abilityStatus === '能力者') san -= 15;

        // 對話次數
        san -= Math.min(GameState.messages.length * 2, 20);

        return Math.max(0, Math.min(100, san));
    },

    // 主渲染函數
    render(san) {
        const d = (100 - san) / 100; // decay ratio 0-1
        const screen = document.querySelector('.screen.active');
        if (!screen) return;

        let dl = screen.querySelector('.decay-layer');
        if (!dl) {
            dl = document.createElement('div');
            dl.className = 'decay-layer';
            screen.appendChild(dl);
        }
        dl.innerHTML = '';

        // Parchment darkening
        const dk = d * 38, rd = d * 18;
        screen.style.background = [
            'repeating-linear-gradient(0deg,transparent 0,transparent 20px,rgba(20,9,0,' + (.022 + d * .055) + ') 20px,rgba(20,9,0,' + (.022 + d * .055) + ') 21px)',
            'repeating-linear-gradient(90deg,transparent 0,transparent 24px,rgba(20,9,0,.018) 24px,rgba(20,9,0,.018) 25px)',
            'radial-gradient(ellipse at 18% 12%,rgba(' + (176 + rd * 1.5) + ',' + (120 - dk * .6) + ',' + (38 - dk) + ',' + (.55 + d * .2) + ') 0%,transparent 38%)',
            'radial-gradient(ellipse at 83% 88%,rgba(' + (136 + rd) + ',' + (86 - dk * .5) + ',' + (22 - dk * .8) + ',' + (.45 + d * .15) + ') 0%,transparent 36%)',
            'radial-gradient(ellipse at 50% 50%,rgb(' + (242 - dk) + ',' + (230 - dk * 1.1) + ',' + (198 - dk * 2) + ') 0%,rgb(' + (216 - dk * .9) + ',' + (192 - dk) + ',' + (126 - dk * 1.4) + ') 52%,rgb(' + (176 - dk * .6) + ',' + (138 - dk * .8) + ',' + (54 - dk * .5) + ') 100%)'
        ].join(',');

        // Vignette
        const vd = document.createElement('div');
        vd.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:21;background:radial-gradient(ellipse at 50% 50%,transparent 0%,transparent ' + Math.max(4, 68 - d * 65) + '%,rgba(6,2,0,' + d * .88 + ') 100%)';
        dl.appendChild(vd);

        // Tears
        if (d > .16) dl.appendChild(this.makeTears(d));

        // Burns
        if (d > .26) dl.appendChild(this.makeBurns(d));

        // Entity
        if (d > .72) dl.appendChild(this.makeEntity(d));

        // Text effects
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

        // Flicker
        if (d > .7) {
            screen.style.animation = 'flicker ' + Math.max(.38, 2.4 - d * 2) + 's step-end infinite';
        } else {
            screen.style.animation = '';
        }
    },

    // SVG helpers
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

    // Tear point generator
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

        // TOP
        let dep = Math.min(20, (d - .16) / .84 * 22);
        let pts = this.tpts(22, dep, 1.23);
        let path = 'M 0,0 ';
        pts.forEach(p => { path += 'L ' + (p.t * 100) + ',' + p.v + ' '; });
        path += 'L 100,0 Z';
        svg.appendChild(this.mkPath(path, col, .92));

        // BOTTOM
        if (d > .30) {
            dep = Math.min(18, (d - .30) / .70 * 20);
            pts = this.tpts(22, dep, 2.71);
            path = 'M 0,100 ';
            pts.forEach(p => { path += 'L ' + (p.t * 100) + ',' + (100 - p.v) + ' '; });
            path += 'L 100,100 Z';
            svg.appendChild(this.mkPath(path, col, .86));
        }

        // LEFT
        if (d > .43) {
            dep = Math.min(14, (d - .43) / .57 * 16);
            pts = this.tpts(18, dep, 3.14);
            path = 'M 0,0 ';
            pts.forEach(p => { path += 'L ' + p.v + ',' + (p.t * 100) + ' '; });
            path += 'L 0,100 Z';
            svg.appendChild(this.mkPath(path, col, .78));
        }

        // RIGHT
        if (d > .56) {
            dep = Math.min(12, (d - .56) / .44 * 14);
            pts = this.tpts(18, dep, 4.67);
            path = 'M 100,0 ';
            pts.forEach(p => { path += 'L ' + (100 - p.v) + ',' + (p.t * 100) + ' '; });
            path += 'L 100,100 Z';
            svg.appendChild(this.mkPath(path, col, .72));
        }

        // CORNERS
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

        // Blood drips at high decay
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

        // Body silhouette
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

        // Eyes at very low sanity
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
        // Provider 切換
        document.getElementById('inp-provider').addEventListener('change', async (e) => {
            const isOllama = e.target.value === 'ollama';
            document.getElementById('ollama-url-fld').style.display = isOllama ? 'block' : 'none';
            document.getElementById('openai-key-fld').style.display = isOllama ? 'none' : 'block';
            if (isOllama) {
                await this.updateOllamaModels();
            } else {
                this.updateOpenAIModels();
            }
        });

        // 開始遊戲
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());

        // 送出
        document.getElementById('btn-send').addEventListener('click', () => this.sendMessage());
        document.getElementById('user-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 側邊欄按鈕
        document.getElementById('btn-export').addEventListener('click', () => this.exportStory());
        document.getElementById('btn-newgame').addEventListener('click', () => this.newGame());
        document.getElementById('btn-settings').addEventListener('click', () => this.gotoSetup());

        // Modal
        document.getElementById('btn-close-modal').addEventListener('click', () => {
            document.getElementById('story-modal').classList.remove('active');
        });
        document.getElementById('btn-copy').addEventListener('click', () => this.copyStory());
        document.getElementById('btn-download').addEventListener('click', () => this.downloadStory());

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

    updateOpenAIModels() {
        const select = document.getElementById('inp-model');
        select.innerHTML = '';
        [
            { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
            { value: 'gpt-4o', label: 'GPT-4o' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        ].forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.value;
            opt.textContent = m.label;
            select.appendChild(opt);
        });
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

        if (provider === 'openai' && !apiKey) {
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

        GameState.settings = { playerName: name, apiProvider: provider, apiKey, ollamaUrl, model };

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

        try {
            const jsonMatch = response.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
                character = JSON.parse(jsonMatch[0]);
                const jsonEnd = response.indexOf(jsonMatch[0]) + jsonMatch[0].length;
                openingNarrative = response.substring(jsonEnd).trim();
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
        GameState.messages = [{ role: 'assistant', content: openingNarrative }];
        GameState.sanity = 100;
        GameState.save();

        this.gotoGame();
        this.updateCharacterPanel();
        this.updateSanityUI(100);
        DecayEngine.render(100);

        // 渲染開場
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

        // 健康條
        const hpMap = { '良好': 80, '受傷': 50, '重傷': 25, '生病': 60, '瀕死': 10 };
        document.getElementById('sb-health-bar').style.width = (hpMap[c.health] || 80) + '%';

        // 情緒條
        const emoMap = { '平靜': 70, '緊張': 50, '憤怒': 40, '悲傷': 45, '恐懼': 30, '絕望': 15, '瘋狂': 10 };
        document.getElementById('sb-emo-bar').style.width = (emoMap[c.mood] || 70) + '%';

        // 物品
        const itemsEl = document.getElementById('sb-items');
        itemsEl.innerHTML = '';
        c.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'ichip';
            div.textContent = item;
            itemsEl.appendChild(div);
        });

        // 資訊
        const knowEl = document.getElementById('sb-knowledge');
        knowEl.innerHTML = '';
        c.knowledge.forEach(k => {
            const div = document.createElement('div');
            div.className = 'ichip';
            div.textContent = k;
            knowEl.appendChild(div);
        });

        // Era badge
        document.getElementById('tb-era').textContent = c.era + ' · ' + c.region;
        document.getElementById('scene-tag').textContent = '─── ' + c.region + ' · ' + c.era + ' ───';
    },

    renderNarrative(text) {
        const container = document.getElementById('narr-container');
        container.innerHTML = '';

        // 解析選擇
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

        // 敘事
        const p = document.createElement('p');
        p.className = 'narr-body';
        p.textContent = narrative;
        container.appendChild(p);

        // 選擇
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

        // 滾動
        document.getElementById('narr-area').scrollTop = 999999;
    },

    async sendMessage() {
        const input = document.getElementById('user-input');
        const message = input.value.trim();
        if (!message) return;

        input.value = '';

        GameState.messages.push({ role: 'user', content: message });

        document.getElementById('btn-send').disabled = true;
        document.getElementById('user-input').disabled = true;

        // 顯示載入
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

            GameState.messages.push({ role: 'assistant', content: response });
            GameState.sanity = DecayEngine.calcSanity();
            GameState.save();

            this.updateSanityUI(GameState.sanity);
            DecayEngine.render(GameState.sanity);
            this.renderNarrative(response);

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
                this.renderNarrative(msg.content);
            }
        });
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

    newGame() {
        if (confirm('確定要開始新遊戲嗎？')) {
            GameState.reset();
            document.getElementById('game-screen').classList.remove('active');
            document.getElementById('setup-screen').classList.add('active');
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
