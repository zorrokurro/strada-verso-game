"use client";

import { useState } from "react";
import { useGameStore } from "@/store/game-store";
import { PixelButton, PixelDivider, Eyebrow } from "./primitives";
import { cn } from "@/lib/utils";

const ORGANIZATIONS = ["回聲之民", "認知科學局", "人本安全理事會", "回聖會", "無所屬"];
const BACKGROUNDS = ["實驗體逃脫者", "能力者後代", "普通人覺醒", "組織叛逃者", "街頭孤兒"];

const STEPS = ["身分", "背景", "能力", "確認"] as const;

export function CreateScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const updateCharacter = useGameStore((s) => s.updateCharacter);
  const character = useGameStore((s) => s.character);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: character.name,
    codename: character.codename,
    gender: character.gender,
    age: character.age,
    organization: character.organization,
    background: character.background,
    brainStage: character.brainStage,
    perception: character.perception,
    control: character.control,
    stability: character.stability,
    knowledge: character.knowledge,
    awareness: character.awareness,
    willpower: character.willpower,
  });

  const finish = () => {
    updateCharacter({
      name: form.name,
      codename: form.codename,
      gender: form.gender,
      age: form.age,
      organization: form.organization,
      background: form.background,
      brainStage: form.brainStage,
      perception: form.perception,
      control: form.control,
      stability: form.stability,
      knowledge: form.knowledge,
      awareness: form.awareness,
      willpower: form.willpower,
    });
    setScreen("play");
  };

  return (
    <div className="h-screen w-screen overflow-hidden dark-bg flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
        <button
          onClick={() => setScreen("home")}
          className="font-pixel text-[8px] flex items-center gap-2"
          style={{ color: "var(--gold)" }}
        >
          ◂ 返回首頁
        </button>
        <div className="font-pixel text-[10px]" style={{ color: "var(--gold)" }}>
          ◆ 建立檔案
        </div>
        <div className="font-pixel text-[7px]" style={{ color: "var(--p1)", opacity: .6 }}>
          STEP {step + 1} / {STEPS.length}
        </div>
      </div>

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

      <div className="flex-1 overflow-hidden flex">
        <div className="w-72 flex-shrink-0 p-6 overflow-y-auto fancy-scroll-dark">
          <Eyebrow light className="mb-3">CURRENT · 目前狀態</Eyebrow>
          <div className="pixel-frame-dark p-4">
            <div className="text-center">
              <div className="font-pixel text-[10px] mb-1" style={{ color: "var(--gold)" }}>
                {form.name || "未命名"}
              </div>
              <div className="font-body-tc text-[12px]" style={{ color: "var(--p0)" }}>
                {form.codename} · {form.gender}
              </div>
              <div className="font-body-tc text-[10px] mt-1" style={{ color: "var(--p1)", opacity: .7 }}>
                {form.organization} · {form.age}歲
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1">
              {[
                { key: "perception", label: "感知" },
                { key: "control", label: "控制" },
                { key: "stability", label: "穩定" },
                { key: "knowledge", label: "知識" },
                { key: "awareness", label: "覺察" },
                { key: "willpower", label: "意志" },
              ].map(({ key, label }) => (
                <div key={key} className="text-center p-1" style={{ background: "rgba(0,0,0,.3)" }}>
                  <div className="font-pixel text-[6px]" style={{ color: "var(--gold)" }}>
                    {label}
                  </div>
                  <div className="font-pixel-num text-[14px]" style={{ color: "var(--p0)" }}>
                    {(form as any)[key]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3" style={{ background: "rgba(196,144,8,.08)", border: "1px dashed var(--gold)" }}>
            <div className="font-pixel text-[7px] mb-1" style={{ color: "var(--gold)" }}>
              ▸ 提示
            </div>
            <div className="font-body-tc text-[11px]" style={{ color: "var(--p1)", lineHeight: 1.6 }}>
              {step === 0 && "為你的角色取個代號。代號會影響敘事者稱呼你的方式。"}
              {step === 1 && "出身決定你的起點視角與初始資源。"}
              {step === 2 && "分配能力點數。感知越高，能看見的顏色越多；控制越高，干涉能力越強。"}
              {step === 3 && "確認後即將進入序章。敘事者會根據你的背景生成開場。"}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto fancy-scroll-dark">
          <div className="max-w-2xl">
            {step === 0 && (
              <div className="fade-in-up">
                <Eyebrow light className="mb-4">01 · IDENTITY · 身分</Eyebrow>

                <div className="mb-5">
                  <label className="text-eyebrow-light block mb-2">代號 · CODENAME</label>
                  <input
                    type="text"
                    value={form.codename}
                    onChange={(e) => setForm({ ...form, codename: e.target.value })}
                    placeholder="例：21-γ"
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
                  <input
                    type="text"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    placeholder="例：模糊"
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
                  <label className="text-eyebrow-light block mb-2">年齡 · AGE</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
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

            {step === 1 && (
              <div className="fade-in-up">
                <Eyebrow light className="mb-4">02 · BACKGROUND · 背景</Eyebrow>

                <ChoiceGrid
                  label="所屬 · ORGANIZATION"
                  options={ORGANIZATIONS}
                  value={form.organization}
                  onChange={(v) => setForm({ ...form, organization: v })}
                />
                <ChoiceGrid
                  label="出身 · ORIGIN"
                  options={BACKGROUNDS}
                  value={form.background}
                  onChange={(v) => setForm({ ...form, background: v })}
                />
              </div>
            )}

            {step === 2 && (
              <div className="fade-in-up">
                <Eyebrow light className="mb-4">03 · ABILITIES · 能力分配</Eyebrow>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: "perception", zh: "感知", abbr: "EP", desc: "看見情緒顏色的能力" },
                    { key: "control", zh: "控制", abbr: "CT", desc: "精確干涉微觀粒子" },
                    { key: "stability", zh: "穩定", abbr: "ST", desc: "抵抗左腦退位的速度" },
                    { key: "knowledge", zh: "知識", abbr: "KN", desc: "物理原理的理解深度" },
                    { key: "awareness", zh: "覺察", abbr: "AW", desc: "對周遭環境的敏銳度" },
                    { key: "willpower", zh: "意志", abbr: "WP", desc: "維持自我認知的力量" },
                  ].map(({ key, zh, abbr, desc }) => {
                    const value = (form as any)[key];
                    const mod = Math.floor((value - 10) / 2);
                    return (
                      <div
                        key={key}
                        className="text-center p-4"
                        style={{
                          background: "rgba(20,9,0,.5)",
                          border: "2px solid var(--gold)",
                          boxShadow: "3px 3px 0 rgba(0,0,0,.5)",
                        }}
                      >
                        <div className="font-pixel text-[8px] mb-1" style={{ color: "var(--gold)" }}>
                          {abbr}
                        </div>
                        <div className="font-body-tc text-[11px] mb-2" style={{ color: "var(--p1)" }}>
                          {zh}
                        </div>
                        <div
                          className="font-pixel-num text-[36px] leading-none mb-1"
                          style={{ color: "var(--p0)" }}
                        >
                          {value}
                        </div>
                        <div className="font-body-tc text-[10px] mb-2" style={{ color: "var(--p1)", opacity: .6 }}>
                          {desc}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setForm((f) => ({ ...f, [key]: Math.max(1, (f as any)[key] - 1) }))}
                            className="font-pixel text-[12px] w-6 h-6 flex items-center justify-center"
                            style={{ color: "var(--gold)", border: "1px solid var(--gold)" }}
                          >
                            -
                          </button>
                          <button
                            onClick={() => setForm((f) => ({ ...f, [key]: Math.min(20, (f as any)[key] + 1) }))}
                            className="font-pixel text-[12px] w-6 h-6 flex items-center justify-center"
                            style={{ color: "var(--gold)", border: "1px solid var(--gold)" }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="mt-4 p-3 text-center"
                  style={{ background: "rgba(196,144,8,.08)", border: "1px dashed var(--gold)" }}
                >
                  <span className="font-body-tc text-[12px]" style={{ color: "var(--p1)" }}>
                    點擊 + / - 調整各項能力數值
                  </span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="fade-in-up">
                <Eyebrow light className="mb-4">04 · CONFIRMATION · 確認</Eyebrow>

                <div className="pixel-frame-dark p-6 mb-4">
                  <div className="text-center mb-4">
                    <div className="font-pixel text-[14px] mb-1" style={{ color: "var(--gold)" }}>
                      {form.name || "未命名"}
                    </div>
                    <div className="font-body-tc text-[14px]" style={{ color: "var(--p0)" }}>
                      {form.codename} · {form.gender} · {form.age}歲
                    </div>
                    <div className="font-body-tc text-[12px] mt-1" style={{ color: "var(--p1)", opacity: .7 }}>
                      {form.organization} · {form.background}
                    </div>
                  </div>

                  <PixelDivider dark className="my-3" />

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "perception", label: "感知" },
                      { key: "control", label: "控制" },
                      { key: "stability", label: "穩定" },
                      { key: "knowledge", label: "知識" },
                      { key: "awareness", label: "覺察" },
                      { key: "willpower", label: "意志" },
                    ].map(({ key, label }) => (
                      <div key={key} className="text-center p-2" style={{ background: "rgba(0,0,0,.3)" }}>
                        <div className="font-pixel text-[7px]" style={{ color: "var(--gold)" }}>
                          {label}
                        </div>
                        <div className="font-pixel-num text-[18px]" style={{ color: "var(--p0)" }}>
                          {(form as any)[key]}
                        </div>
                      </div>
                    ))}
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
                    確認後即將進入序章。敘事者將根據你的背景生成開場。
                    檔案資訊後續可在角色檔案頁面查看。
                  </div>
                </div>

                <div className="flex gap-3">
                  <PixelButton variant="primary" onClick={finish} className="flex-1 py-3">
                    ▸ 開始旅程
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
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-5">
      <label className="text-eyebrow-light block mb-2">{label}</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
