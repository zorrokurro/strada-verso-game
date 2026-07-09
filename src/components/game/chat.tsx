"use client";

import { Fragment, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/game-data";

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
          <span className="font-pixel text-[10px]" style={{ color: "var(--gold)" }}>
            GM
          </span>
        </div>
        <div
          className="flex-1 px-4 py-3 parchment-bg-deep"
          style={{
            border: "2px solid var(--ink)",
            boxShadow: "3px 3px 0 rgba(20,9,0,.35)",
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-pixel text-[8px]" style={{ color: "var(--blood)" }}>
              ◆ 敘事者
            </span>
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
        <span className="font-pixel text-[8px]" style={{ color: "var(--p0)" }}>
          YOU
        </span>
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
          <span className="font-pixel text-[8px]" style={{ color: "var(--gold)" }}>
            ◇ 行動
          </span>
        </div>
        <p className="player-action text-right">{msg.content}</p>
      </div>
    </div>
  );
}

export function GameChat() {
  const messages = useGameStore((s) => s.messages);

  return (
    <div className="fancy-scroll h-full overflow-y-auto px-4 py-4">
      <div className="max-w-3xl mx-auto">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
        <div className="flex items-center gap-2 mt-2 opacity-60">
          <div
            className="w-2 h-4"
            style={{ background: "var(--gold)", animation: "blink 1s steps(1) infinite" }}
          />
          <span className="font-pixel text-[7px]" style={{ color: "var(--walnut)" }}>
            GM 正在構思下一步...
          </span>
        </div>
      </div>
    </div>
  );
}

export function ActionInput() {
  const [value, setValue] = useState("");
  const pushMessage = useGameStore((s) => s.pushMessage);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    pushMessage({
      id: `p-${Date.now()}`,
      role: "player",
      content: v,
      timestamp: new Date().toISOString(),
    });
    setValue("");
    setTimeout(() => {
      pushMessage({
        id: `g-${Date.now()}`,
        role: "gm",
        content: "（GM 沉吟片刻，繼續推進故事...）你話語剛落，整個空氣似乎都凝滯了。爐火跳了一下，影子在牆上拉長。你的下一步選擇，將決定接下來的方向。",
        timestamp: new Date().toISOString(),
      });
    }, 1200);
  };

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
            ▸ 行動輸入
          </span>
          <span className="font-body-tc text-[10px]" style={{ color: "var(--p1)", opacity: .6 }}>
            描述你想做的事，AI GM 會判定結果
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
            placeholder="例：我悄悄走向樓上第三間房，手按著匕首..."
            rows={2}
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
            }}
          />
          <button
            onClick={submit}
            disabled={!value.trim()}
            className="pixel-btn pixel-btn-primary self-stretch px-5"
            style={{ minHeight: "100%" }}
          >
            <span className="font-pixel text-[10px]">送出</span>
            <span className="font-body-tc text-[10px] opacity-70">↵</span>
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-body-tc text-[10px]" style={{ color: "var(--p1)", opacity: .5 }}>
            Enter 送出 · Shift+Enter 換行
          </span>
          <span className="font-pixel text-[7px]" style={{ color: "var(--gold)", opacity: .6 }}>
            {value.length} 字
          </span>
        </div>
      </div>
    </div>
  );
}
