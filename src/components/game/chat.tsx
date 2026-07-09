"use client";

import { Fragment, useState, useRef, useEffect } from "react";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/game-data";
import {
  loadAISettings,
  generateCharacter,
  gameChat,
  parseStatusTags,
  type StatusUpdates,
} from "@/lib/ai-service";

// ─────────────────────────────────────────────
// KeywordText：解析 [[id|label]] 標記為可點擊 chip
// ─────────────────────────────────────────────
function KeywordText({ text }: { text: string }) {
  const setOpenNote = useGameStore((s) => s.setOpenNote);

  const parts: { type: "text" | "kw"; id?: string; label?: string }[] = [];
  let lastIndex = 0;
  const regex = /\[\[([^|\]]+)\|([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", label: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "kw", id: match[1], label: match[2] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", label: text.slice(lastIndex) });
  }

  return (
    <>
      {parts.map((p, i) =>
        p.type === "text" ? (
          <Fragment key={i}>{p.label}</Fragment>
        ) : (
          <span
            key={i}
            className="keyword-chip"
            onClick={(e) => {
              e.stopPropagation();
              if (p.id) setOpenNote(p.id);
            }}
          >
            {p.label}
          </span>
        )
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// MessageBubble：單則訊息
// ─────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "system") {
    if (msg.isCheckpoint) {
      return (
        <div className="my-4 fade-in-up">
          <div className="scene-title-card">
            <div className="font-pixel text-[8px] tracking-[3px] mb-2" style={{ color: "var(--blood)" }}>
              CHECKPOINT
            </div>
            <div className="font-pixel text-[14px] tracking-[2px]" style={{ color: "var(--ink)" }}>
              {msg.content}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex justify-center my-2 fade-in-up">
        <div
          className="px-3 py-1.5 max-w-[80%] text-center"
          style={{
            background: "rgba(20,9,0,.85)",
            border: "2px solid var(--gold)",
            boxShadow: "2px 2px 0 rgba(0,0,0,.5)",
          }}
        >
          <span className="system-msg">{msg.content}</span>
        </div>
      </div>
    );
  }

  if (msg.role === "gm") {
    return (
      <div className="flex gap-3 my-3 fade-in-up">
        <div
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
          style={{
            background: "var(--ink)",
            border: "2px solid var(--gold)",
            boxShadow: "2px 2px 0 rgba(20,9,0,.4)",
          }}
        >
          <span className="font-pixel text-[10px]" style={{ color: "var(--gold)" }}>GM</span>
        </div>
        <div
          className="flex-1 px-4 py-3 parchment-bg-deep"
          style={{
            border: "2px solid var(--ink)",
            boxShadow: "3px 3px 0 rgba(20,9,0,.35)",
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-pixel text-[8px]" style={{ color: "var(--blood)" }}>◆ 敘事者</span>
            <span className="font-body-tc text-[10px]" style={{ color: "var(--walnut)", opacity: .5 }}>
              {new Date(msg.timestamp).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className="gm-narrative">
            <KeywordText text={msg.content} />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 my-3 flex-row-reverse fade-in-up">
      <div
        className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
        style={{
          background: "var(--blood)",
          border: "2px solid var(--gold)",
          boxShadow: "-2px 2px 0 rgba(20,9,0,.4)",
        }}
      >
        <span className="font-pixel text-[8px]" style={{ color: "var(--p0)" }}>YOU</span>
      </div>
      <div
        className="max-w-[80%] px-4 py-3"
        style={{
          background: "var(--walnut)",
          border: "2px solid var(--gold)",
          boxShadow: "-3px 3px 0 rgba(0,0,0,.5)",
        }}
      >
        <div className="flex items-center gap-2 mb-1.5 justify-end">
          <span className="font-body-tc text-[10px]" style={{ color: "var(--p0)", opacity: .5 }}>
            {new Date(msg.timestamp).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="font-pixel text-[8px]" style={{ color: "var(--gold)" }}>◇ 行動</span>
        </div>
        <p className="player-action text-right">{msg.content}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// GameChat：對話區
// ─────────────────────────────────────────────
export function GameChat() {
  const messages = useGameStore((s) => s.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="fancy-scroll h-full overflow-y-auto px-4 py-4">
      <div className="max-w-3xl mx-auto">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ActionInput：純文字行動輸入
// ─────────────────────────────────────────────
export function ActionInput() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const pushMessage = useGameStore((s) => s.pushMessage);
  const updateCharacter = useGameStore((s) => s.updateCharacter);
  const character = useGameStore((s) => s.character);
  const messages = useGameStore((s) => s.messages);
  const pendingGeneration = useGameStore((s) => s.pendingGeneration);
  const setPendingGeneration = useGameStore((s) => s.setPendingGeneration);

  const applyStatusUpdates = (updates: StatusUpdates) => {
    const patch: Record<string, unknown> = {};
    if (updates.health) patch.health = { label: updates.health, pct: updates.health === "良好" ? 100 : updates.health === "受傷" ? 60 : updates.health === "重傷" ? 30 : updates.health === "瀕死" ? 10 : 80 };
    if (updates.mood) patch.mood = { label: updates.mood, pct: updates.mood === "平靜" ? 70 : updates.mood === "緊張" ? 50 : updates.mood === "憤怒" ? 80 : updates.mood === "悲傷" ? 40 : updates.mood === "恐懼" ? 30 : 20 };
    if (updates.currency !== undefined) patch.currency = updates.currency;
    if (updates.abilityStatus) patch.abilityStatus = updates.abilityStatus;
    if (updates.region) patch.region = updates.region;
    if (updates.addItems.length > 0) {
      const newInv = [...character.inventory];
      updates.addItems.forEach((name) => {
        if (!newInv.find((i) => i.name === name)) newInv.push({ name, qty: 1 });
      });
      patch.inventory = newInv;
    }
    if (updates.removeItems.length > 0) {
      patch.inventory = character.inventory.filter((i) => !updates.removeItems.includes(i.name));
    }
    if (updates.addKnowledge.length > 0) {
      patch.knownInfo = [...character.knownInfo, ...updates.addKnowledge];
    }
    updateCharacter(patch);
  };

  const submit = async () => {
    const v = value.trim();
    if (!v || loading) return;

    setLoading(true);
    setValue("");

    // 判斷是否需要生成角色
  const needsGeneration = !character.era;

  // 自動生成：從建立角色畫面進來時，自動觸發 AI 生成
  useEffect(() => {
    if (pendingGeneration && character.name && needsGeneration && !loading) {
      setPendingGeneration(false);
      setLoading(true);

      pushMessage({
        id: `p-${Date.now()}`,
        role: "player",
        content: character.name,
        timestamp: new Date().toISOString(),
      });

      pushMessage({
        id: `sys-${Date.now()}`,
        role: "system",
        content: "AI 正在生成你的角色和世界...",
        timestamp: new Date().toISOString(),
      });

      (async () => {
        try {
          const settings = loadAISettings();
          const result = await generateCharacter(character.name, settings);
          updateCharacter(result.character);

          pushMessage({
            id: `sys-${Date.now() + 1}`,
            role: "system",
            content: `${result.character.era} · ${result.character.region}`,
            timestamp: new Date().toISOString(),
            sceneTitle: result.character.era || "序章",
            isCheckpoint: true,
          });

          pushMessage({
            id: `g-${Date.now() + 2}`,
            role: "gm",
            content: result.opening,
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          pushMessage({
            id: `g-${Date.now() + 3}`,
            role: "gm",
            content: `AI 連線失敗：${err instanceof Error ? err.message : "未知錯誤"}。請檢查 API 設定後重試。`,
            timestamp: new Date().toISOString(),
          });
        }
        setLoading(false);
      })();
    }
  }, [pendingGeneration, character.name, needsGeneration]);

    if (needsGeneration) {
      // 第一次：生成角色
      pushMessage({
        id: `p-${Date.now()}`,
        role: "player",
        content: v,
        timestamp: new Date().toISOString(),
      });

      pushMessage({
        id: `sys-${Date.now()}`,
        role: "system",
        content: "AI 正在生成你的角色和世界...",
        timestamp: new Date().toISOString(),
      });

      try {
        const settings = loadAISettings();
        const result = await generateCharacter(v, settings);

        // 更新角色
        updateCharacter(result.character);

        // 顯示開場
        pushMessage({
          id: `sys-${Date.now() + 1}`,
          role: "system",
          content: `${result.character.era} · ${result.character.region}`,
          timestamp: new Date().toISOString(),
          sceneTitle: result.character.era || "序章",
          isCheckpoint: true,
        });

        pushMessage({
          id: `g-${Date.now() + 2}`,
          role: "gm",
          content: result.opening,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        pushMessage({
          id: `g-${Date.now() + 3}`,
          role: "gm",
          content: `AI 連線失敗：${err instanceof Error ? err.message : "未知錯誤"}。請檢查 API 設定後重試。`,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // 正常遊戲對話
      pushMessage({
        id: `p-${Date.now()}`,
        role: "player",
        content: v,
        timestamp: new Date().toISOString(),
      });

      try {
        const settings = loadAISettings();
        const response = await gameChat(v, character, messages, settings);

        // 解析狀態標記
        const updates = parseStatusTags(response);
        applyStatusUpdates(updates);

        pushMessage({
          id: `g-${Date.now() + 1}`,
          role: "gm",
          content: updates.cleanText,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        pushMessage({
          id: `g-${Date.now() + 1}`,
          role: "gm",
          content: `AI 連線失敗：${err instanceof Error ? err.message : "未知錯誤"}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    setLoading(false);
  };

  const needsGeneration = !character.era;

  return (
    <div
      className="px-4 py-3"
      style={{
        background: "rgba(20,9,0,.92)",
        borderTop: "3px solid var(--ink)",
        boxShadow: "0 -3px 0 var(--gold)",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-pixel text-[7px]" style={{ color: "var(--gold)" }}>
            {needsGeneration ? "▸ 輸入你的名字" : "▸ 行動輸入"}
          </span>
          <span className="font-body-tc text-[10px]" style={{ color: "var(--p1)", opacity: .6 }}>
            {needsGeneration ? "AI 將根據名字生成你的角色" : "描述你想做的事，AI GM 會判定結果"}
          </span>
        </div>
        <div className="flex gap-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={needsGeneration ? "例：莉亞" : "例：我檢查實驗體的狀況..."}
            rows={2}
            disabled={loading}
            className={cn(
              "flex-1 px-3 py-2 resize-none fancy-scroll",
              "font-body-tc text-[14px]",
              "focus:outline-none"
            )}
            style={{
              background: "rgba(242,230,198,.08)",
              border: "2px solid var(--gold)",
              color: "var(--p0)",
              boxShadow: "inset 0 0 0 1px var(--ink)",
              opacity: loading ? 0.5 : 1,
            }}
          />
          <button
            onClick={submit}
            disabled={!value.trim() || loading}
            className="pixel-btn pixel-btn-primary self-stretch px-5"
            style={{ minHeight: "100%", opacity: loading || !value.trim() ? 0.5 : 1 }}
          >
            <span className="font-pixel text-[10px]">{loading ? "..." : "送出"}</span>
            <span className="font-body-tc text-[10px] opacity-70">↵</span>
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-body-tc text-[10px]" style={{ color: "var(--p1)", opacity: .5 }}>
            {loading ? "AI 正在回應..." : "Enter 送出 · Shift+Enter 換行"}
          </span>
          <span className="font-pixel text-[7px]" style={{ color: "var(--gold)", opacity: .6 }}>
            {value.length} 字
          </span>
        </div>
      </div>
    </div>
  );
}
