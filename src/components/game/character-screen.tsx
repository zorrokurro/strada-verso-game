"use client";

import { useGameStore } from "@/store/game-store";
import { PixelButton, PixelDivider } from "./primitives";
import { brainStageLabels, statLabels, type CharacterSheet } from "@/lib/game-data";

export function CharacterScreen() {
  const character = useGameStore((s) => s.character);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="h-screen w-screen overflow-hidden dark-bg flex flex-col">
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 py-3"
        style={{
          background: "var(--ink)",
          borderBottom: "3px solid var(--gold)",
        }}
      >
        <button
          onClick={() => setScreen("home")}
          className="font-pixel text-[8px] flex items-center gap-1"
          style={{ color: "var(--gold)" }}
        >
          ◂ 回到首頁
        </button>
        <div className="font-pixel text-[10px]" style={{ color: "var(--gold)" }}>
          ◆ 角色檔案 · SUBJECT FILE
        </div>
        <PixelButton variant="ghost" onClick={() => setScreen("play")} className="text-[8px] py-2">
          ▸ 返回旅程
        </PixelButton>
      </header>

      <div className="flex-1 overflow-y-auto fancy-scroll-dark px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {/* 角色卡頂部 */}
          <div
            className="pixel-frame-dark parchment-bg-deep p-6 mb-6"
            style={{ boxShadow: "0 0 40px rgba(196,144,8,.2)" }}
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div
                  className="w-32 h-32 flex items-center justify-center"
                  style={{
                    background: "var(--ink)",
                    border: "3px solid var(--gold)",
                    boxShadow: "4px 4px 0 rgba(0,0,0,.5)",
                  }}
                >
                  <span className="font-pixel text-[24px]" style={{ color: "var(--gold)" }}>
                    {character.codename}
                  </span>
                </div>
                <div className="text-center mt-2">
                  <div className="font-pixel text-[7px]" style={{ color: "var(--blood)" }}>
                    STAGE {character.brainStage}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="text-eyebrow mb-1">SUBJECT · 實驗體</div>
                <h2
                  className="font-pixel mb-2"
                  style={{ color: "var(--ink)", fontSize: "20px", letterSpacing: "2px" }}
                >
                  {character.name}
                </h2>
                <p
                  className="font-display italic text-[15px] mb-4"
                  style={{ color: "var(--blood)" }}
                >
                  {character.codename} · {character.gender} · {character.age}歲
                </p>

                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <InfoRow label="所屬" value={character.organization} />
                  <InfoRow label="出身" value={character.background} />
                  <InfoRow label="右腦階段" value={`Stage ${character.brainStage} · ${brainStageLabels[character.brainStage - 1]?.label || "—"}`} />
                  <InfoRow label="盧恩薄片" value={character.runeFragment ? "持有" : "無"} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 右腦階段 */}
            <SectionCard title="BRAIN STAGES · 右腦階段" eyebrow="01">
              <div className="space-y-3">
                {character.brainStages.map((stage, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                      style={{
                        background: stage.unlocked ? "var(--gold)" : "rgba(20,9,0,.3)",
                        border: "2px solid var(--ink)",
                      }}
                    >
                      <span className="font-pixel text-[10px]" style={{ color: stage.unlocked ? "var(--ink)" : "var(--walnut)" }}>
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-body-tc text-[13px]" style={{ color: stage.unlocked ? "var(--ink)" : "var(--walnut)" }}>
                        {stage.label}
                      </div>
                      <div className="font-body-tc text-[10px]" style={{ color: "var(--walnut)", opacity: .6 }}>
                        {brainStageLabels[i]?.desc}
                      </div>
                    </div>
                    {stage.unlocked && (
                      <span className="font-pixel text-[7px] px-2 py-0.5" style={{ color: "var(--p0)", background: "var(--gold)" }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* 能力數值 */}
            <SectionCard title="ABILITIES · 能力" eyebrow="02">
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(statLabels).map(([key, { zh, abbr }]) => {
                  const value = (character as any)[key] as number;
                  return (
                    <div
                      key={key}
                      className="text-center p-3 parchment-bg"
                      style={{
                        border: "2px solid var(--ink)",
                        boxShadow: "3px 3px 0 rgba(20,9,0,.4)",
                      }}
                    >
                      <div className="text-stat-label">{abbr}</div>
                      <div className="font-pixel text-[9px] mt-0.5 mb-1" style={{ color: "var(--walnut)" }}>
                        {zh}
                      </div>
                      <span className="font-pixel-num text-[28px]" style={{ color: "var(--ink)" }}>
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            {/* 外觀 */}
            <SectionCard title="APPEARANCE · 外觀" eyebrow="03">
              <p className="font-body-tc text-[13px]" style={{ color: "var(--walnut)", lineHeight: 1.7 }}>
                {character.appearance}
              </p>
            </SectionCard>

            {/* 物品 */}
            <SectionCard title="INVENTORY · 物品" eyebrow="04">
              <div className="space-y-2">
                {character.inventory.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2"
                    style={{
                      background: "rgba(20,9,0,.06)",
                      border: "1px solid rgba(20,9,0,.2)",
                    }}
                  >
                    <span
                      className="font-pixel-num text-[14px] px-1.5 flex-shrink-0"
                      style={{ color: "var(--p0)", background: "var(--walnut)" }}
                    >
                      ×{item.qty}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-body-tc text-[13px]" style={{ color: "var(--ink)" }}>
                        {item.name}
                      </div>
                      {item.desc && (
                        <div className="font-body-tc text-[11px] mt-0.5" style={{ color: "var(--walnut)", opacity: .7, lineHeight: 1.5 }}>
                          {item.desc}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="mt-6 flex justify-center">
            <PixelButton variant="ghost" onClick={() => setScreen("play")} className="px-6 py-3">
              ▸ 返回旅程
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2 p-2" style={{ background: "rgba(20,9,0,.06)" }}>
      <span className="font-pixel text-[7px]" style={{ color: "var(--walnut)", opacity: .7 }}>
        {label}
      </span>
      <span className="font-body-tc text-[12px]" style={{ color: "var(--ink)" }}>
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="pixel-frame parchment-bg p-5"
      style={{ boxShadow: "5px 5px 0 rgba(20,9,0,.4)" }}
    >
      <div className="flex items-baseline gap-2 mb-3">
        <span className="font-pixel text-[10px]" style={{ color: "var(--blood)" }}>
          {eyebrow}
        </span>
        <span className="text-eyebrow">{title}</span>
      </div>
      <PixelDivider className="mb-3" />
      {children}
    </div>
  );
}
