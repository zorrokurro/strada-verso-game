"use client";

import { useGameStore } from "@/store/game-store";
import { PixelButton, PixelDivider } from "./primitives";
import { attributeMod, formatMod, attributeLabels, type CharacterSheet } from "@/lib/game-data";

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
                  <span className="font-pixel text-[36px]" style={{ color: "var(--gold)" }}>
                    {character.name.charAt(0)}
                  </span>
                </div>
                <div className="text-center mt-2">
                  <div className="font-pixel text-[7px]" style={{ color: "var(--blood)" }}>
                    Lv. {character.level}
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="text-eyebrow mb-1">CHARACTER · 角色</div>
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
                  {character.race} · {character.class}
                </p>

                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <InfoRow label="背景" value={character.background} />
                  <InfoRow label="陣營" value={character.alignment} />
                  <InfoRow label="年齡" value={`${character.age} 歲`} />
                  <InfoRow label="等級" value={`Level ${character.level}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="ABILITY SCORES · 屬性" eyebrow="01">
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(character.attributes) as Array<keyof CharacterSheet["attributes"]>).map((k) => {
                  const score = character.attributes[k];
                  const mod = attributeMod(score);
                  const { zh, abbr } = attributeLabels[k];
                  return (
                    <div
                      key={k}
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
                      <div className="relative inline-block">
                        <span className="font-pixel-num text-[28px]" style={{ color: "var(--ink)" }}>
                          {score}
                        </span>
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
            </SectionCard>

            <SectionCard title="COMBAT · 戰鬥" eyebrow="02">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <BigStat label="AC" desc="防禦等級" value={character.ac} />
                <BigStat label="先攻" desc="INITIATIVE" value={`+${character.initiative}`} />
                <BigStat label="速度" desc="SPEED" value={`${character.speed}呎`} />
                <BigStat label="攻擊" desc="ATTACK" value={`+${character.attackBonus}`} />
              </div>
              <div
                className="p-3"
                style={{ background: "rgba(112,14,14,.1)", border: "1px dashed var(--blood)" }}
              >
                <div className="text-stat-label">傷害 · DAMAGE</div>
                <div className="font-pixel-num text-[20px] mt-1" style={{ color: "var(--blood)" }}>
                  {character.damage}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <BarBlock label="HP" sub="生命" current={character.hp.current} max={character.hp.max} variant="hp" />
                <BarBlock label="MP" sub="法力" current={character.mp.current} max={character.mp.max} variant="mp" />
              </div>
              <div className="mt-3">
                <BarBlock
                  label="XP"
                  sub={`經驗 · ${character.xp.current} / ${character.xp.next}`}
                  current={character.xp.current}
                  max={character.xp.next}
                  variant="xp"
                />
              </div>
            </SectionCard>

            <SectionCard title="INVENTORY · 物品" eyebrow="03">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body-tc text-[12px]" style={{ color: "var(--walnut)" }}>
                  共 {character.inventory.length} 種物品
                </span>
                <span
                  className="font-pixel-num text-[16px] px-2 py-1"
                  style={{
                    color: "var(--p0)",
                    background: "var(--ink)",
                    border: "1px solid var(--gold)",
                  }}
                >
                  {character.gold} G
                </span>
              </div>
              <PixelDivider className="mb-3" />
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
                        <div
                          className="font-body-tc text-[11px] mt-0.5"
                          style={{ color: "var(--walnut)", opacity: .7, lineHeight: 1.5 }}
                        >
                          {item.desc}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="BACKGROUND · 背景" eyebrow="04">
              <div className="space-y-3">
                <div>
                  <div className="text-eyebrow mb-1">出身 · ORIGIN</div>
                  <p className="font-body-tc text-[13px]" style={{ color: "var(--walnut)", lineHeight: 1.7 }}>
                    {character.background}出身的{character.race}{character.class}，
                    在{character.age}年的歲月裡見過許多事。你的母親留給你一枚
                    <span className="keyword-chip">夜梟護身符</span>，
                    從此成為你身上唯一的牽絆。
                  </p>
                </div>
                <PixelDivider />
                <div>
                  <div className="text-eyebrow mb-1">陣營 · ALIGNMENT</div>
                  <p className="font-body-tc text-[13px]" style={{ color: "var(--walnut)", lineHeight: 1.7 }}>
                    <span style={{ color: "var(--blood)" }}>{character.alignment}</span>。
                    你的選擇多半取決於當下利益與直覺，不特別遵守或反抗規則。
                    這座城裡，這樣的人活得最久——也死得最快。
                  </p>
                </div>
                <PixelDivider />
                <div>
                  <div className="text-eyebrow mb-1">目前任務 · CURRENT QUEST</div>
                  <p className="font-body-tc text-[13px]" style={{ color: "var(--walnut)", lineHeight: 1.7 }}>
                    第二章·月光下的低語——鏽蝕錨旅店老闆艾爾德里克透露，
                    樓上第三間房有人在等你，她自稱「寂靜」。
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="mt-6 flex justify-center">
            <PixelButton variant="ghost" onClick={() => setScreen("play")} className="px-6 py-3">
              ▸ 返回遊戲
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

function BigStat({ label, desc, value }: { label: string; desc: string; value: string | number }) {
  return (
    <div
      className="text-center py-3"
      style={{
        background: "rgba(20,9,0,.1)",
        border: "2px solid var(--ink)",
        boxShadow: "2px 2px 0 rgba(20,9,0,.3)",
      }}
    >
      <div className="text-stat-label">{desc}</div>
      <div className="font-pixel-num text-[24px] leading-none mt-1" style={{ color: "var(--ink)" }}>
        {value}
      </div>
      <div className="font-pixel text-[7px] mt-1" style={{ color: "var(--blood)" }}>
        {label}
      </div>
    </div>
  );
}

function BarBlock({
  label,
  sub,
  current,
  max,
  variant,
}: {
  label: string;
  sub: string;
  current: number;
  max: number;
  variant: "hp" | "mp" | "xp";
}) {
  const pct = (current / max) * 100;
  const fillClass = {
    hp: "stat-bar-fill",
    mp: "stat-bar-fill stat-bar-fill-mp",
    xp: "stat-bar-fill stat-bar-fill-xp",
  }[variant];
  const color = { hp: "var(--blood)", mp: "#2a6bb8", xp: "var(--gold)" }[variant];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-stat-label">{label} · {sub}</span>
        <span className="font-pixel-num text-[14px]" style={{ color }}>
          {current}<span style={{ opacity: .5, color: "var(--walnut)" }}> / {max}</span>
        </span>
      </div>
      <div className="stat-bar">
        <div className={fillClass} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
