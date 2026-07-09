"use client";

import { useGameStore } from "@/store/game-store";
import { PixelDivider } from "./primitives";
import type { CharacterSheet } from "@/lib/game-data";

export function CharacterSheetPanel({ compact = false }: { compact?: boolean }) {
  const character = useGameStore((s) => s.character);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="h-full flex flex-col parchment-bg">
      {/* 標題列 */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: "var(--ink)",
          borderBottom: "3px solid var(--gold)",
        }}
      >
        <div>
          <div className="font-pixel text-[8px]" style={{ color: "var(--gold)", letterSpacing: "2px" }}>
            ◆ CHARACTER
          </div>
          <div className="font-body-tc text-[10px] mt-0.5" style={{ color: "var(--p1)", opacity: .7 }}>
            角色面板
          </div>
        </div>
        {!compact && (
          <button
            onClick={() => setScreen("character")}
            className="font-pixel text-[7px] px-2 py-1"
            style={{
              color: "var(--p0)",
              border: "1px solid var(--gold)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            展開 ↗
          </button>
        )}
      </div>

      {/* 內容（可捲動） */}
      <div className="flex-1 overflow-y-auto fancy-scroll px-4 py-4">
        {/* 角色名 + 基本資訊 */}
        <div className="text-center mb-4">
          <div className="font-pixel text-[13px] mb-1" style={{ color: "var(--ink)", letterSpacing: "2px" }}>
            {character.name}
          </div>
          <div className="font-body-tc text-[12px]" style={{ color: "var(--blood)", fontStyle: "italic" }}>
            {character.era} · {character.region}
          </div>
          <div className="font-body-tc text-[10px] mt-1" style={{ color: "var(--walnut)", opacity: .7 }}>
            {character.socialClass} · {character.occupation}
          </div>
          <div className="font-body-tc text-[10px] mt-1" style={{ color: "var(--walnut)", opacity: .5 }}>
            {character.gender} · {character.age} 歲 · {character.familyBackground}
          </div>
        </div>

        <PixelDivider className="my-3" />

        {/* 健康 / 理智 / 情緒 */}
        <div className="space-y-3">
          <StatusRow label="HEALTH · 健康" value={character.health.label} pct={character.health.pct} color="var(--blood)" />
          <SanityBar current={character.sanity.current} max={character.sanity.max} />
          <StatusRow label="MOOD · 情緒" value={character.mood.label} pct={character.mood.pct} color="#2a6bb8" />
        </div>

        <PixelDivider className="my-4" />

        {/* 左腦屬性 */}
        <div className="mb-2">
          <div className="text-eyebrow mb-2">LEFT BRAIN · 左腦</div>
          <div className="grid grid-cols-3 gap-2">
            {([
              ["reason", "理性", "REASON"],
              ["memory", "記憶", "MEMORY"],
              ["language", "語言", "LANG"],
              ["logic", "邏輯", "LOGIC"],
              ["self", "自我", "SELF"],
            ] as const).map(([key, zh, abbr]) => {
              const score = character.leftBrain[key];
              return (
                <BrainCell key={key} abbr={abbr} zh={zh} score={score} />
              );
            })}
          </div>
        </div>

        <PixelDivider className="my-4" />

        {/* 右腦屬性 */}
        <div className="mb-2">
          <div className="text-eyebrow mb-2">RIGHT BRAIN · 右腦</div>
          <div className="grid grid-cols-3 gap-2">
            {([
              ["perception", "感知", "PERC"],
              ["imagination", "想像", "IMAG"],
              ["intuition", "直覺", "INTU"],
              ["emotion", "情緒", "EMOT"],
              ["insight", "洞察", "INSI"],
            ] as const).map(([key, zh, abbr]) => {
              const score = character.rightBrain[key];
              return (
                <BrainCell key={key} abbr={abbr} zh={zh} score={score} />
              );
            })}
          </div>
        </div>

        <PixelDivider className="my-4" />

        {/* 能力狀態 */}
        <div className="mb-2">
          <div className="text-eyebrow mb-2">ABILITY · 能力</div>
          <div
            className="p-3 text-center"
            style={{
              background: character.abilityStatus === "能力者"
                ? "rgba(112,14,14,.15)"
                : character.abilityStatus === "微覺醒"
                ? "rgba(196,144,8,.1)"
                : "rgba(20,9,0,.08)",
              border: `2px solid ${character.abilityStatus === "能力者" ? "var(--blood)" : character.abilityStatus === "微覺醒" ? "var(--gold)" : "var(--ink)"}`,
              boxShadow: "2px 2px 0 rgba(20,9,0,.3)",
            }}
          >
            <div className="font-pixel text-[8px] mb-1" style={{ color: "var(--gold)" }}>
              {character.abilityStatus === "普通人" && "COMMONER"}
              {character.abilityStatus === "微覺醒" && "MICRO-AWAKE"}
              {character.abilityStatus === "能力者" && "ABLED"}
            </div>
            <div className="font-pixel text-[14px]" style={{ color: "var(--ink)" }}>
              {character.abilityStatus}
            </div>
            {character.abilityType && (
              <div className="font-body-tc text-[11px] mt-1" style={{ color: "var(--walnut)" }}>
                {character.abilityType}
              </div>
            )}
          </div>
        </div>

        <PixelDivider className="my-4" />

        {/* 資金 */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-eyebrow">CURRENCY · 貨幣</div>
            <span className="font-pixel-num text-[14px]" style={{ color: "var(--gold)" }}>
              {character.currency} <span className="text-[10px]">阿爾納</span>
            </span>
          </div>
        </div>

        <PixelDivider className="my-4" />

        {/* 物品欄 */}
        <div className="mb-2">
          <div className="text-eyebrow mb-2">INVENTORY · 物品</div>
          <div className="space-y-1">
            {character.inventory.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-2 py-1.5"
                style={{
                  background: "rgba(20,9,0,.06)",
                  border: "1px solid rgba(20,9,0,.2)",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-pixel text-[8px]" style={{ color: "var(--gold)" }}>
                    ◇
                  </span>
                  <span className="font-body-tc text-[12px] truncate" style={{ color: "var(--ink)" }}>
                    {item.name}
                  </span>
                </div>
                <span
                  className="font-pixel-num text-[12px] px-1.5"
                  style={{ color: "var(--p0)", background: "var(--walnut)" }}
                >
                  ×{item.qty}
                </span>
              </div>
            ))}
          </div>
        </div>

        <PixelDivider className="my-4" />

        {/* 已知資訊 */}
        <div className="mb-2">
          <div className="text-eyebrow mb-2">KNOWN INFO · 已知</div>
          <div className="space-y-1">
            {character.knownInfo.map((info, i) => (
              <div
                key={i}
                className="px-2 py-1.5 font-body-tc text-[11px]"
                style={{
                  color: "var(--walnut)",
                  background: "rgba(20,9,0,.04)",
                  borderLeft: "2px solid var(--gold)",
                  lineHeight: 1.5,
                }}
              >
                {info}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-stat-label">{label}</span>
        <span className="font-pixel text-[10px]" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="stat-bar">
        <div
          className="stat-bar-fill"
          style={{
            width: `${pct}%`,
            background: `repeating-linear-gradient(90deg, ${color} 0, ${color} 5px, ${color}aa 5px, ${color}aa 7px)`,
          }}
        />
      </div>
    </div>
  );
}

function SanityBar({ current, max }: { current: number; max: number }) {
  const pct = (current / max) * 100;
  const color = pct > 60 ? "#385880" : pct > 30 ? "var(--gold)" : "var(--blood)";
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-stat-label">SANITY · 理智</span>
        <span className="font-pixel-num text-[14px]" style={{ color }}>
          {current}<span style={{ opacity: .5, color: "var(--walnut)" }}> / {max}</span>
        </span>
      </div>
      <div className="stat-bar">
        <div className="stat-bar-fill" style={{ width: `${pct}%`, background: `repeating-linear-gradient(90deg, ${color} 0, ${color} 5px, ${color}dd 5px, ${color}dd 7px)` }} />
      </div>
    </div>
  );
}

function BrainCell({ abbr, zh, score }: { abbr: string; zh: string; score: number }) {
  return (
    <div
      className="text-center py-2"
      style={{
        background: "rgba(20,9,0,.08)",
        border: "2px solid var(--ink)",
        boxShadow: "2px 2px 0 rgba(20,9,0,.3)",
      }}
    >
      <div className="text-stat-label">{abbr}</div>
      <div className="font-pixel text-[8px] mt-0.5 mb-1" style={{ color: "var(--walnut)" }}>
        {zh}
      </div>
      <div className="font-pixel-num text-[20px] leading-none" style={{ color: "var(--ink)" }}>
        {score}
      </div>
    </div>
  );
}
