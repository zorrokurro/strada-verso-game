"use client";

import { useGameStore } from "@/store/game-store";
import { PixelButton, PixelDivider } from "./primitives";

export function CharacterScreen() {
  const character = useGameStore((s) => s.character);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="h-screen w-screen overflow-hidden dark-bg flex flex-col">
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 py-3"
        style={{ background: "var(--ink)", borderBottom: "3px solid var(--gold)" }}
      >
        <button onClick={() => setScreen("home")} className="font-pixel text-[8px] flex items-center gap-1" style={{ color: "var(--gold)" }}>
          ◂ STRADA·VERSO
        </button>
        <div className="font-pixel text-[10px]" style={{ color: "var(--gold)" }}>
          ◆ CHARACTER SHEET · 角色檔案
        </div>
        <PixelButton variant="ghost" onClick={() => setScreen("play")} className="text-[8px] py-2">
          ▸ 返回遊戲
        </PixelButton>
      </header>

      <div className="flex-1 overflow-y-auto fancy-scroll-dark px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="pixel-frame-dark parchment-bg-deep p-6 mb-6" style={{ boxShadow: "0 0 40px rgba(196,144,8,.2)" }}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 flex items-center justify-center" style={{ background: "var(--ink)", border: "3px solid var(--gold)", boxShadow: "4px 4px 0 rgba(0,0,0,.5)" }}>
                  <span className="font-pixel text-[36px]" style={{ color: "var(--gold)" }}>{character.name.charAt(0)}</span>
                </div>
                <div className="text-center mt-2">
                  <div className="font-pixel text-[7px]" style={{ color: "var(--blood)" }}>{character.abilityStatus}</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-eyebrow mb-1">CHARACTER · 角色</div>
                <h2 className="font-pixel mb-2" style={{ color: "var(--ink)", fontSize: "20px", letterSpacing: "2px" }}>{character.name}</h2>
                <p className="font-display italic text-[15px] mb-4" style={{ color: "var(--blood)" }}>{character.era} · {character.region}</p>
                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <InfoRow label="性別" value={character.gender} />
                  <InfoRow label="年齡" value={`${character.age} 歲`} />
                  <InfoRow label="時代" value={character.era} />
                  <InfoRow label="地域" value={character.region} />
                  <InfoRow label="社會階級" value={character.socialClass} />
                  <InfoRow label="職業" value={character.occupation} />
                  <InfoRow label="家族" value={character.familyBackground} />
                  <InfoRow label="能力" value={character.abilityStatus} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="LEFT BRAIN · 左腦" eyebrow="01">
              <div className="grid grid-cols-3 gap-3">
                {([["reason", "理性", "REASON"], ["memory", "記憶", "MEMORY"], ["language", "語言", "LANG"], ["logic", "邏輯", "LOGIC"], ["self", "自我", "SELF"]] as const).map(([key, zh, abbr]) => (
                  <div key={key} className="text-center p-3 parchment-bg" style={{ border: "2px solid var(--ink)", boxShadow: "3px 3px 0 rgba(20,9,0,.4)" }}>
                    <div className="text-stat-label">{abbr}</div>
                    <div className="font-pixel text-[9px] mt-0.5 mb-1" style={{ color: "var(--walnut)" }}>{zh}</div>
                    <div className="font-pixel-num text-[28px]" style={{ color: "var(--ink)" }}>{character.leftBrain[key]}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="RIGHT BRAIN · 右腦" eyebrow="02">
              <div className="grid grid-cols-3 gap-3">
                {([["perception", "感知", "PERC"], ["imagination", "想像", "IMAG"], ["intuition", "直覺", "INTU"], ["emotion", "情緒", "EMOT"], ["insight", "洞察", "INSI"]] as const).map(([key, zh, abbr]) => (
                  <div key={key} className="text-center p-3 parchment-bg" style={{ border: "2px solid var(--ink)", boxShadow: "3px 3px 0 rgba(20,9,0,.4)" }}>
                    <div className="text-stat-label">{abbr}</div>
                    <div className="font-pixel text-[9px] mt-0.5 mb-1" style={{ color: "var(--walnut)" }}>{zh}</div>
                    <div className="font-pixel-num text-[28px]" style={{ color: "var(--ink)" }}>{character.rightBrain[key]}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="STATUS · 狀態" eyebrow="03">
              <div className="space-y-4">
                <StatusBlock label="HEALTH · 健康" value={character.health.label} pct={character.health.pct} color="var(--blood)" />
                <StatusBlock label="SANITY · 理智" value={`${character.sanity.current} / ${character.sanity.max}`} pct={(character.sanity.current / character.sanity.max) * 100} color="#385880" />
                <StatusBlock label="MOOD · 情緒" value={character.mood.label} pct={character.mood.pct} color="#2a6bb8" />
                <div className="flex items-center justify-between">
                  <span className="text-stat-label">CURRENCY · 資金</span>
                  <span className="font-pixel-num text-[18px]" style={{ color: "var(--gold)" }}>{character.currency} <span className="text-[10px]">阿爾納</span></span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="INVENTORY · 物品" eyebrow="04">
              <div className="space-y-2">
                {character.inventory.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-2" style={{ background: "rgba(20,9,0,.06)", border: "1px solid rgba(20,9,0,.2)" }}>
                    <span className="font-pixel-num text-[14px] px-1.5 flex-shrink-0" style={{ color: "var(--p0)", background: "var(--walnut)" }}>×{item.qty}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-body-tc text-[13px]" style={{ color: "var(--ink)" }}>{item.name}</div>
                      {item.desc && <div className="font-body-tc text-[11px] mt-0.5" style={{ color: "var(--walnut)", opacity: .7, lineHeight: 1.5 }}>{item.desc}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="mt-6 flex justify-center">
            <PixelButton variant="ghost" onClick={() => setScreen("play")} className="px-6 py-3">▸ 返回遊戲</PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 p-2" style={{ background: "rgba(20,9,0,.06)" }}>
      <span className="font-pixel text-[7px]" style={{ color: "var(--walnut)", opacity: .7 }}>{label}</span>
      <span className="font-body-tc text-[12px]" style={{ color: "var(--ink)" }}>{value}</span>
    </div>
  );
}

function SectionCard({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="pixel-frame parchment-bg p-5" style={{ boxShadow: "5px 5px 0 rgba(20,9,0,.4)" }}>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-pixel text-[10px]" style={{ color: "var(--blood)" }}>{eyebrow}</span>
        <span className="text-eyebrow">{title}</span>
      </div>
      <PixelDivider className="mb-3" />
      {children}
    </div>
  );
}

function StatusBlock({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-stat-label">{label}</span>
        <span className="font-pixel text-[10px]" style={{ color }}>{value}</span>
      </div>
      <div className="stat-bar">
        <div className="stat-bar-fill" style={{ width: `${pct}%`, background: `repeating-linear-gradient(90deg, ${color} 0, ${color} 5px, ${color}aa 5px, ${color}aa 7px)` }} />
      </div>
    </div>
  );
}
