"use client";

import { useGameStore } from "@/store/game-store";
import { PixelDivider } from "./primitives";
import { attributeMod, formatMod, attributeLabels, type CharacterSheet } from "@/lib/game-data";

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

      <div className="flex-1 overflow-y-auto fancy-scroll px-4 py-4">
        <div className="text-center mb-4">
          <div className="font-pixel text-[13px] mb-1" style={{ color: "var(--ink)", letterSpacing: "2px" }}>
            {character.name}
          </div>
          <div className="font-body-tc text-[12px]" style={{ color: "var(--blood)", fontStyle: "italic" }}>
            {character.race} · {character.class} · Lv.{character.level}
          </div>
          <div className="font-body-tc text-[10px] mt-1" style={{ color: "var(--walnut)", opacity: .7 }}>
            {character.background} · {character.alignment}
          </div>
        </div>

        <PixelDivider className="my-3" />

        <div className="space-y-3">
          <HPBar />
          <MPBar />
          <XPBar />
        </div>

        <PixelDivider className="my-4" />

        <div className="mb-2">
          <div className="text-eyebrow mb-2">ABILITY SCORES · 屬性</div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(character.attributes) as Array<keyof CharacterSheet["attributes"]>).map((k) => {
              const score = character.attributes[k];
              const mod = attributeMod(score);
              const { zh, abbr } = attributeLabels[k];
              return (
                <div key={k} className="stat-block group">
                  <div className="text-stat-label">{abbr}</div>
                  <div className="font-pixel text-[8px] mt-0.5 mb-1" style={{ color: "var(--walnut)" }}>
                    {zh}
                  </div>
                  <div className="relative">
                    <span className="text-stat-num" style={{ color: "var(--ink)" }}>{score}</span>
                    <span
                      className="absolute -top-1 -right-1 font-pixel-num text-[12px] px-1 leading-tight"
                      style={{
                        color: "var(--p0)",
                        background: "var(--blood)",
                        border: "1px solid var(--ink)",
                      }}
                    >
                      {formatMod(mod)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <PixelDivider className="my-4" />

        <div className="mb-2">
          <div className="text-eyebrow mb-2">COMBAT · 戰鬥</div>
          <div className="grid grid-cols-2 gap-2">
            <CombatCell label="AC" value={character.ac} desc="防禦等級" />
            <CombatCell label="先攻" value={`+${character.initiative}`} desc="INITIATIVE" />
            <CombatCell label="速度" value={`${character.speed}呎`} desc="SPEED" />
            <CombatCell label="攻擊" value={`+${character.attackBonus}`} desc="ATTACK" />
          </div>
          <div className="mt-2 p-2" style={{ background: "rgba(20,9,0,.1)", border: "1px dashed var(--ink)" }}>
            <div className="text-stat-label">傷害 / DAMAGE</div>
            <div className="font-pixel-num text-[16px] mt-0.5" style={{ color: "var(--blood)" }}>
              {character.damage}
            </div>
          </div>
        </div>

        <PixelDivider className="my-4" />

        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-eyebrow">INVENTORY · 物品</div>
            <span className="font-pixel-num text-[14px]" style={{ color: "var(--gold)" }}>
              {character.gold} <span className="text-[10px]">G</span>
            </span>
          </div>
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
      </div>
    </div>
  );
}

function HPBar() {
  const c = useGameStore((s) => s.character);
  const pct = (c.hp.current / c.hp.max) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-stat-label">HP · 生命</span>
        <span className="font-pixel-num text-[14px]" style={{ color: "var(--blood)" }}>
          {c.hp.current}<span style={{ opacity: .5, color: "var(--walnut)" }}> / {c.hp.max}</span>
        </span>
      </div>
      <div className="stat-bar">
        <div className="stat-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MPBar() {
  const c = useGameStore((s) => s.character);
  const pct = (c.mp.current / c.mp.max) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-stat-label">MP · 法力</span>
        <span className="font-pixel-num text-[14px]" style={{ color: "#2a6bb8" }}>
          {c.mp.current}<span style={{ opacity: .5, color: "var(--walnut)" }}> / {c.mp.max}</span>
        </span>
      </div>
      <div className="stat-bar">
        <div className="stat-bar-fill stat-bar-fill-mp" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function XPBar() {
  const c = useGameStore((s) => s.character);
  const pct = (c.xp.current / c.xp.next) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-stat-label">XP · 經驗</span>
        <span className="font-pixel-num text-[14px]" style={{ color: "var(--gold)" }}>
          {c.xp.current}<span style={{ opacity: .5, color: "var(--walnut)" }}> / {c.xp.next}</span>
        </span>
      </div>
      <div className="stat-bar">
        <div className="stat-bar-fill stat-bar-fill-xp" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CombatCell({ label, value, desc }: { label: string; value: string | number; desc: string }) {
  return (
    <div
      className="text-center py-2"
      style={{
        background: "rgba(20,9,0,.08)",
        border: "2px solid var(--ink)",
        boxShadow: "2px 2px 0 rgba(20,9,0,.3)",
      }}
    >
      <div className="text-stat-label">{desc}</div>
      <div className="font-pixel-num text-[20px] leading-none mt-1" style={{ color: "var(--ink)" }}>
        {value}
      </div>
      <div className="font-pixel text-[6px] mt-1" style={{ color: "var(--blood)" }}>
        {label}
      </div>
    </div>
  );
}
