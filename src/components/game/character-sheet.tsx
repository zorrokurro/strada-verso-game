"use client";

import { useGameStore } from "@/store/game-store";
import { PixelDivider } from "./primitives";
import { brainStageLabels, statLabels, type CharacterSheet } from "@/lib/game-data";

export function CharacterSheetPanel({ compact = false }: { compact?: boolean }) {
  const character = useGameStore((s) => s.character);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="h-full flex flex-col parchment-bg">
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: "var(--ink)",
          borderBottom: "3px solid var(--gold)",
        }}
      >
        <div>
          <div className="font-pixel text-[8px]" style={{ color: "var(--gold)", letterSpacing: "2px" }}>
            ◆ SUBJECT FILE
          </div>
          <div className="font-body-tc text-[10px] mt-0.5" style={{ color: "var(--p1)", opacity: .7 }}>
            角色檔案
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

      <div className="flex-1 overflow-y-auto fancy-scroll px-4 py-4">
        <div className="text-center mb-4">
          <div className="font-pixel text-[13px] mb-1" style={{ color: "var(--ink)", letterSpacing: "2px" }}>
            {character.codename}
          </div>
          <div className="font-body-tc text-[12px]" style={{ color: "var(--blood)", fontStyle: "italic" }}>
            {character.gender} · {character.age}歲
          </div>
          <div className="font-body-tc text-[10px] mt-1" style={{ color: "var(--walnut)", opacity: .7 }}>
            {character.organization}
          </div>
        </div>

        <PixelDivider className="my-3" />

        {/* HP 條 */}
        <div className="space-y-3">
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-stat-label">HP · 生命</span>
              <span className="font-pixel-num text-[14px]" style={{ color: "var(--blood)" }}>
                {character.hp.current}<span style={{ opacity: .5, color: "var(--walnut)" }}> / {character.hp.max}</span>
              </span>
            </div>
            <div className="stat-bar">
              <div className="stat-bar-fill" style={{ width: `${(character.hp.current / character.hp.max) * 100}%` }} />
            </div>
          </div>
        </div>

        <PixelDivider className="my-4" />

        {/* 右腦階段 */}
        <div className="mb-2">
          <div className="text-eyebrow mb-2">BRAIN STAGE · 右腦階段</div>
          <div className="space-y-1.5">
            {character.brainStages.map((stage, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5" style={{ background: stage.unlocked ? "rgba(196,144,8,.1)" : "transparent" }}>
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0" style={{ background: stage.unlocked ? "var(--gold)" : "rgba(20,9,0,.2)", border: "1px solid var(--ink)" }}>
                  <span className="font-pixel text-[7px]" style={{ color: stage.unlocked ? "var(--ink)" : "var(--walnut)" }}>{i + 1}</span>
                </div>
                <span className="font-body-tc text-[11px] flex-1" style={{ color: stage.unlocked ? "var(--ink)" : "var(--walnut)" }}>{stage.label}</span>
                {i === character.brainStage - 1 && (
                  <span className="font-pixel text-[6px] px-1" style={{ color: "var(--p0)", background: "var(--blood)" }}>NOW</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <PixelDivider className="my-4" />

        {/* 能力數值 */}
        <div className="mb-2">
          <div className="text-eyebrow mb-2">ABILITIES · 能力</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(statLabels).map(([key, { zh, abbr }]) => {
              const value = (character as any)[key] as number;
              return (
                <div key={key} className="stat-block">
                  <div className="text-stat-label">{abbr}</div>
                  <div className="font-pixel text-[8px] mt-0.5 mb-1" style={{ color: "var(--walnut)" }}>{zh}</div>
                  <div className="relative">
                    <span className="text-stat-num" style={{ color: "var(--ink)" }}>{value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <PixelDivider className="my-4" />

        {/* 物品 */}
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
                  <span className="font-pixel text-[8px]" style={{ color: "var(--gold)" }}>◇</span>
                  <span className="font-body-tc text-[12px] truncate" style={{ color: "var(--ink)" }}>{item.name}</span>
                </div>
                <span className="font-pixel-num text-[12px] px-1.5" style={{ color: "var(--p0)", background: "var(--walnut)" }}>×{item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
