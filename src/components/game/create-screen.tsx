"use client";

import { useState } from "react";
import { useGameStore } from "@/store/game-store";
import { PixelButton, PixelDivider, Eyebrow } from "./primitives";
import { cn } from "@/lib/utils";
import { ERAS, REGIONS, SOCIAL_CLASSES } from "@/lib/game-data";

const OCCUPATIONS: Record<string, string[]> = {
  "拂曉紀": ["農民", "漁夫", "鐵匠", "獵人", "薩滿"],
  "獵巫紀": ["農民", "鐵匠", "教士", "傭兵", "獵人"],
  "教團紀": ["回聖會成員", "商人", "工匠", "學者", "農民"],
  "黎明紀": ["學者", "商人", "工匠", "醫生", "學徒"],
  "裂變前夜": ["工人", "商人", "貴族", "軍人", "學者"],
  "後崩解時代": ["拾荒者", "轉生者", "節點成員", "商人", "學者"],
};

const FAMILIES = [
  "貴族世家",
  "商人家庭",
  "農民家庭",
  "教士家庭",
  "學者家庭",
  "工匠家庭",
  "遊民",
];

const STEPS = ["身分", "時代", "能力", "確認"] as const;

export function CreateScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const updateCharacter = useGameStore((s) => s.updateCharacter);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    gender: "隨機",
    age: 25,
    era: "裂變前夜" as string,
    region: "韋斯特海岸" as string,
    socialClass: "學者" as string,
    familyBackground: "學者家庭" as string,
    occupation: "學者" as string,
    abilityStatus: "普通人" as "普通人" | "微覺醒" | "能力者",
  });
  const [rolling, setRolling] = useState(false);

  const rollBrain = () => {
    setRolling(true);
    setTimeout(() => {
      setRolling(false);
    }, 600);
  };

  const finish = () => {
    const randomGender = form.gender === "隨機"
      ? (Math.random() > 0.5 ? "男" : "女")
      : form.gender;

    updateCharacter({
      name: form.name,
      gender: randomGender,
      age: form.age,
      era: form.era,
      eraYear: `${form.era === "拂曉紀" ? "AE 0-200" :
        form.era === "獵巫紀" ? "AE 200-487" :
        form.era === "教團紀" ? "AE 487-700" :
        form.era === "黎明紀" ? "AE 700-1050" :
        form.era === "裂變前夜" ? "AE 1050-1170" :
        "AE 1219+"}`,
      region: form.region,
      socialClass: form.socialClass,
      familyBackground: form.familyBackground,
      occupation: form.occupation,
      abilityStatus: form.abilityStatus,
    });
    setScreen("play");
  };

  const currentOccupations = OCCUPATIONS[form.era] || OCCUPATIONS["裂變前夜"];

  return (
    <div className="h-screen w-screen overflow-hidden dark-bg flex flex-col">
      {/* 頂部 */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
        <button
          onClick={() => setScreen("home")}
          className="font-pixel text-[8px] flex items-center gap-2"
          style={{ color: "var(--gold)" }}
        >
          ◂ 返回首頁
        </button>
        <div className="font-pixel text-[10px]" style={{ color: "var(--gold)" }}>
          ◆ 創建新角色
        </div>
        <div className="font-pixel text-[7px]" style={{ color: "var(--p1)", opacity: .6 }}>
          STEP {step + 1} / {STEPS.length}
        </div>
      </div>

      {/* 步驟進度條 */}
      <div className="px-6 py-2 flex-shrink-0">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  "flex-1 h-2 transition-all",
                  i < step && "bg-[var(--gold)]",
                  i === step && "bg-[var(--blood)]",
                  i > step && "bg-[rgba(196,144,8,.2)]"
                )}
                style={{
                  boxShadow: i === step ? "0 0 8px var(--blood)" : "none",
                }}
              />
              <span
                className="font-pixel text-[7px] px-1"
                style={{
                  color: i === step ? "var(--p0)" : i < step ? "var(--gold)" : "rgba(196,144,8,.4)",
                }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      <PixelDivider dark className="mx-6" />

      {/* 主內容區 */}
      <div className="flex-1 overflow-hidden flex">
        {/* 左側摘要 */}
        <div className="w-72 flex-shrink-0 p-6 overflow-y-auto fancy-scroll-dark">
          <Eyebrow light className="mb-3">CURRENT · 目前狀態</Eyebrow>
          <div className="pixel-frame-dark p-4">
            <div className="text-center">
              <div className="font-pixel text-[10px] mb-1" style={{ color: "var(--gold)" }}>
                {form.name || "未命名"}
              </div>
              <div className="font-body-tc text-[12px]" style={{ color: "var(--p0)" }}>
                {form.era} · {form.region}
              </div>
              <div className="font-body-tc text-[10px] mt-1" style={{ color: "var(--p1)", opacity: .7 }}>
                {form.socialClass} · {form.occupation}
              </div>
              <div className="font-body-tc text-[10px] mt-2" style={{ color: "var(--p1)", opacity: .5 }}>
                {form.age} 歲 · {form.gender === "隨機" ? "隨機" : form.gender}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3" style={{ background: "rgba(196,144,8,.08)", border: "1px dashed var(--gold)" }}>
            <div className="font-pixel text-[7px] mb-1" style={{ color: "var(--gold)" }}>
              ▸ 提示
            </div>
            <div className="font-body-tc text-[11px]" style={{ color: "var(--p1)", lineHeight: 1.6 }}>
              {step === 0 && "為你的角色取個名字。性別可選擇或讓 AI 隨機。"}
              {step === 1 && "時代決定科技水準與能力者處境。地域決定文化風格。"}
              {step === 2 && "多數人是普通人。如果你是能力者，AI 會在遊戲中引導你發現自己的能力。"}
              {step === 3 && "確認後 AI 將根據你的角色生成開場敘事。"}
            </div>
          </div>
        </div>

        {/* 右側表單 */}
        <div className="flex-1 p-6 overflow-y-auto fancy-scroll-dark">
          <div className="max-w-2xl">
            {/* STEP 0: 身分 */}
            {step === 0 && (
              <div className="fade-in-up">
                <Eyebrow light className="mb-4">01 · IDENTITY · 身分</Eyebrow>

                <div className="mb-5">
                  <label className="text-eyebrow-light block mb-2">角色名稱 · NAME</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="輸入你的角色名字"
                    className="w-full px-3 py-2.5 font-body-tc text-[15px]"
                    style={{
                      background: "rgba(242,230,198,.08)",
                      border: "2px solid var(--gold)",
                      color: "var(--p0)",
                      boxShadow: "inset 0 0 0 1px var(--ink)",
                    }}
                  />
                </div>

                <div className="mb-5">
                  <label className="text-eyebrow-light block mb-2">性別 · GENDER</label>
                  <ChoiceGrid
                    options={["隨機", "男", "女"]}
                    value={form.gender}
                    onChange={(v) => setForm({ ...form, gender: v })}
                    compact
                  />
                </div>

                <div className="mb-5">
                  <label className="text-eyebrow-light block mb-2">年齡 · AGE（15–45）</label>
                  <input
                    type="number"
                    min={15}
                    max={45}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: Math.max(15, Math.min(45, parseInt(e.target.value) || 15)) })}
                    className="w-32 px-3 py-2.5 font-pixel-num text-[18px]"
                    style={{
                      background: "rgba(242,230,198,.08)",
                      border: "2px solid var(--gold)",
                      color: "var(--p0)",
                    }}
                  />
                </div>
              </div>
            )}

            {/* STEP 1: 時代與地域 */}
            {step === 1 && (
              <div className="fade-in-up">
                <Eyebrow light className="mb-4">02 · ERA & REGION · 時代與地域</Eyebrow>

                <ChoiceGrid
                  label="時代 · ERA"
                  options={[...ERAS]}
                  value={form.era}
                  onChange={(v) => {
                    setForm({ ...form, era: v, occupation: OCCUPATIONS[v]?.[0] || "學者" });
                  }}
                />
                <ChoiceGrid
                  label="地域 · REGION"
                  options={[...REGIONS]}
                  value={form.region}
                  onChange={(v) => setForm({ ...form, region: v })}
                />
                <ChoiceGrid
                  label="社會階級 · CLASS"
                  options={[...SOCIAL_CLASSES]}
                  value={form.socialClass}
                  onChange={(v) => setForm({ ...form, socialClass: v })}
                />
                <ChoiceGrid
                  label="職業 · OCCUPATION"
                  options={currentOccupations}
                  value={form.occupation}
                  onChange={(v) => setForm({ ...form, occupation: v })}
                />
                <ChoiceGrid
                  label="家族背景 · FAMILY"
                  options={FAMILIES}
                  value={form.familyBackground}
                  onChange={(v) => setForm({ ...form, familyBackground: v })}
                />
              </div>
            )}

            {/* STEP 2: 能力狀態 */}
            {step === 2 && (
              <div className="fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <Eyebrow light>03 · ABILITY STATUS · 能力狀態</Eyebrow>
                  <PixelButton variant="gold" onClick={rollBrain} disabled={rolling} className="text-[8px] px-3 py-1.5">
                    重新生成 ▸
                  </PixelButton>
                </div>

                <div className="mb-5">
                  <label className="text-eyebrow-light block mb-2">能力覺醒 · AWAKENING</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["普通人", "微覺醒", "能力者"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setForm({ ...form, abilityStatus: status })}
                        className={cn(
                          "px-3 py-3 font-body-tc text-[13px] transition-all text-center",
                        )}
                        style={{
                          background: form.abilityStatus === status ? "var(--blood)" : "rgba(20,9,0,.4)",
                          color: form.abilityStatus === status ? "var(--p0)" : "var(--p1)",
                          border: "2px solid",
                          borderColor: form.abilityStatus === status ? "var(--gold)" : "rgba(196,144,8,.4)",
                          boxShadow: form.abilityStatus === status ? "2px 2px 0 var(--ink)" : "1px 1px 0 rgba(0,0,0,.3)",
                          cursor: "pointer",
                        }}
                      >
                        <div className="font-pixel text-[8px] mb-1">
                          {status === "普通人" && "COMMONER"}
                          {status === "微覺醒" && "MICRO-AWAKE"}
                          {status === "能力者" && "ABLED"}
                        </div>
                        <div>{status}</div>
                        <div className="font-body-tc text-[10px] mt-1 opacity-70">
                          {status === "普通人" && "沒有覺醒能力"}
                          {status === "微覺醒" && "偶發、不穩定"}
                          {status === "能力者" && "穩定、有意識使用"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className="p-3"
                  style={{ background: "rgba(196,144,8,.08)", border: "1px dashed var(--gold)" }}
                >
                  <div className="font-pixel text-[7px] mb-1" style={{ color: "var(--gold)" }}>
                    ▸ 關於能力
                  </div>
                  <div className="font-body-tc text-[11px]" style={{ color: "var(--p1)", lineHeight: 1.6 }}>
                    能力是想像力驅動的物理干涉。使用需要理解對應的物理原理，以情感為燃料。
                    多數人一輩子不會覺醒。如果你選擇「微覺醒」或「能力者」，
                    AI 會在遊戲中以身體感覺的形式引導你——而不是直接說「你使用了能力」。
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: 確認 */}
            {step === 3 && (
              <div className="fade-in-up">
                <Eyebrow light className="mb-4">04 · CONFIRMATION · 確認</Eyebrow>

                <div className="pixel-frame-dark p-6 mb-4">
                  <div className="text-center mb-4">
                    <div className="font-pixel text-[14px] mb-1" style={{ color: "var(--gold)" }}>
                      {form.name || "未命名"}
                    </div>
                    <div className="font-body-tc text-[14px]" style={{ color: "var(--p0)" }}>
                      {form.era} · {form.region}
                    </div>
                    <div className="font-body-tc text-[12px] mt-1" style={{ color: "var(--p1)", opacity: .7 }}>
                      {form.socialClass} · {form.occupation} · {form.familyBackground}
                    </div>
                    <div className="font-body-tc text-[12px] mt-1" style={{ color: "var(--p1)", opacity: .5 }}>
                      {form.age} 歲 · {form.gender === "隨機" ? "隨機" : form.gender} · {form.abilityStatus}
                    </div>
                  </div>
                </div>

                <div
                  className="p-3 mb-4"
                  style={{ background: "rgba(112,14,14,.15)", border: "1px dashed var(--blood)" }}
                >
                  <div className="font-pixel text-[7px] mb-1" style={{ color: "var(--blood)" }}>
                    ⚠ 注意
                  </div>
                  <div className="font-body-tc text-[12px]" style={{ color: "var(--p1)", lineHeight: 1.6 }}>
                    確認後 AI 將根據你的角色背景生成開場敘事。你只需輸入名字，
                    其他所有資訊都由 AI 根據世界觀隨機生成——你的時代、地域、開場處境、
                    以及一個「異常」事件，暗示能力或特殊情況。
                  </div>
                </div>

                <div className="flex gap-3">
                  <PixelButton variant="primary" onClick={finish} className="flex-1 py-3">
                    ▸ 開始冒險
                  </PixelButton>
                  <PixelButton variant="ghost" onClick={() => setStep(0)} className="px-4">
                    重新調整
                  </PixelButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部導航 */}
      <div className="flex-shrink-0 px-6 py-3 flex items-center justify-between" style={{ borderTop: "2px solid var(--gold)" }}>
        <PixelButton
          variant="ghost"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="text-[8px] py-2"
        >
          ◂ 上一步
        </PixelButton>
        {step < STEPS.length - 1 && (
          <PixelButton
            variant="primary"
            onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
            className="text-[8px] py-2"
          >
            下一步 ▸
          </PixelButton>
        )}
      </div>
    </div>
  );
}

function ChoiceGrid({
  label,
  options,
  value,
  onChange,
  compact,
}: {
  label?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="mb-5">
      {label && <label className="text-eyebrow-light block mb-2">{label}</label>}
      <div className={cn("grid gap-2", compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4")}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "px-3 py-2 font-body-tc text-[13px] transition-all",
              value === opt ? "translate-y-[-1px]" : "hover:translate-y-[-1px]"
            )}
            style={{
              background: value === opt ? "var(--blood)" : "rgba(20,9,0,.4)",
              color: value === opt ? "var(--p0)" : "var(--p1)",
              border: "2px solid",
              borderColor: value === opt ? "var(--gold)" : "rgba(196,144,8,.4)",
              boxShadow: value === opt ? "2px 2px 0 var(--ink)" : "1px 1px 0 rgba(0,0,0,.3)",
              cursor: "pointer",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
