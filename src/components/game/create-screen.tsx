"use client";

import { useState } from "react";
import { useGameStore } from "@/store/game-store";
import { PixelButton, PixelDivider, Eyebrow } from "./primitives";
import { cn } from "@/lib/utils";

const RACES = ["人類", "精靈", "半精靈", "矮人", "半身人", "龍裔", "提夫林", "半獸人"];
const CLASSES = ["戰士", "遊蕩者", "法師", "牧師", "遊俠", "聖武士", "吟遊詩人", "術士", "邪術師", "武僧", "野蠻人", "德魯伊"];
const BACKGROUNDS = ["罪犯", "學者", "士兵", "平民英雄", "貴族", "流浪者", "民間英雄", "侍僧", "詐欺師"];
const ALIGNMENTS = ["守序善良", "中立善良", "混亂善良", "守序中立", "絕對中立", "混亂中立", "守序邪惡", "中立邪惡", "混亂邪惡"];

const STEPS = ["身分", "出身", "屬性", "確認"] as const;

export function CreateScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const updateCharacter = useGameStore((s) => s.updateCharacter);
  const character = useGameStore((s) => s.character);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: character.name,
    race: character.race,
    class: character.class,
    background: character.background,
    alignment: character.alignment,
    age: character.age || 25,
    attributes: { ...character.attributes },
  });
  const [rolling, setRolling] = useState(false);

  const rollAttribute = (key: keyof typeof form.attributes) => {
    setRolling(true);
    setTimeout(() => {
      const rolls = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 6));
      const sum = rolls.sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0);
      setForm((f) => ({ ...f, attributes: { ...f.attributes, [key]: sum } }));
      setRolling(false);
    }, 400);
  };

  const rollAll = () => {
    setRolling(true);
    setTimeout(() => {
      const newAttrs = { ...form.attributes };
      (Object.keys(newAttrs) as Array<keyof typeof newAttrs>).forEach((k) => {
        const rolls = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 6));
        newAttrs[k] = rolls.sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a + b, 0);
      });
      setForm((f) => ({ ...f, attributes: newAttrs }));
      setRolling(false);
    }, 600);
  };

  const finish = () => {
    updateCharacter({
      name: form.name,
      race: form.race,
      class: form.class,
      background: form.background,
      alignment: form.alignment,
      age: form.age,
      attributes: form.attributes,
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
          ◆ 創建新角色
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
                {form.race} · {form.class}
              </div>
              <div className="font-body-tc text-[10px] mt-1" style={{ color: "var(--p1)", opacity: .7 }}>
                {form.background} · {form.alignment}
              </div>
              <div className="font-body-tc text-[10px] mt-2" style={{ color: "var(--p1)", opacity: .5 }}>
                {form.age} 歲
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1">
              {(Object.keys(form.attributes) as Array<keyof typeof form.attributes>).map((k) => (
                <div key={k} className="text-center p-1" style={{ background: "rgba(0,0,0,.3)" }}>
                  <div className="font-pixel text-[6px]" style={{ color: "var(--gold)" }}>
                    {k.toUpperCase()}
                  </div>
                  <div className="font-pixel-num text-[14px]" style={{ color: "var(--p0)" }}>
                    {form.attributes[k]}
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
              {step === 0 && "為你的角色取個名字。名字會影響 GM 稱呼你的方式。"}
              {step === 1 && "種族決定你的先天屬性與壽命；職業決定你的戰鬥風格與能力。"}
              {step === 2 && "4d6 取最高三個。你可以一次擲一個，或一次擲完六個。"}
              {step === 3 && "確認後即將進入第一章。GM 會根據你的角色背景生成開場。"}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto fancy-scroll-dark">
          <div className="max-w-2xl">
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
                <Eyebrow light className="mb-4">02 · ORIGIN · 出身</Eyebrow>

                <ChoiceGrid
                  label="種族 · RACE"
                  options={RACES}
                  value={form.race}
                  onChange={(v) => setForm({ ...form, race: v })}
                />
                <ChoiceGrid
                  label="職業 · CLASS"
                  options={CLASSES}
                  value={form.class}
                  onChange={(v) => setForm({ ...form, class: v })}
                />
                <ChoiceGrid
                  label="背景 · BACKGROUND"
                  options={BACKGROUNDS}
                  value={form.background}
                  onChange={(v) => setForm({ ...form, background: v })}
                />
                <ChoiceGrid
                  label="陣營 · ALIGNMENT"
                  options={ALIGNMENTS}
                  value={form.alignment}
                  onChange={(v) => setForm({ ...form, alignment: v })}
                />
              </div>
            )}

            {step === 2 && (
              <div className="fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <Eyebrow light>03 · ABILITY SCORES · 屬性擲骰</Eyebrow>
                  <PixelButton variant="gold" onClick={rollAll} disabled={rolling} className="text-[8px] px-3 py-1.5">
                    一次擲完六個 ▸
                  </PixelButton>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {(Object.keys(form.attributes) as Array<keyof typeof form.attributes>).map((k) => {
                    const labels: Record<string, { zh: string; abbr: string }> = {
                      str: { zh: "力量", abbr: "STR" },
                      dex: { zh: "敏捷", abbr: "DEX" },
                      con: { zh: "體質", abbr: "CON" },
                      int: { zh: "智力", abbr: "INT" },
                      wis: { zh: "睿智", abbr: "WIS" },
                      cha: { zh: "魅力", abbr: "CHA" },
                    };
                    const score = form.attributes[k];
                    const mod = Math.floor((score - 10) / 2);
                    const { zh, abbr } = labels[k];
                    return (
                      <button
                        key={k}
                        onClick={() => rollAttribute(k)}
                        disabled={rolling}
                        className="text-center p-4 transition-all hover:translate-y-[-2px]"
                        style={{
                          background: "rgba(20,9,0,.5)",
                          border: "2px solid var(--gold)",
                          boxShadow: "3px 3px 0 rgba(0,0,0,.5)",
                          cursor: rolling ? "wait" : "pointer",
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
                          style={{
                            color: rolling ? "var(--p2)" : "var(--p0)",
                            transition: "color .2s",
                          }}
                        >
                          {rolling ? "?" : score}
                        </div>
                        <div
                          className="inline-block font-pixel-num text-[12px] px-1.5"
                          style={{
                            color: "var(--p0)",
                            background: "var(--blood)",
                            border: "1px solid var(--gold)",
                          }}
                        >
                          {mod >= 0 ? "+" : ""}{mod}
                        </div>
                        <div className="font-pixel text-[6px] mt-2" style={{ color: "var(--gold)", opacity: .6 }}>
                          ▸ 點擊重擲
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  className="mt-4 p-3 text-center"
                  style={{ background: "rgba(196,144,8,.08)", border: "1px dashed var(--gold)" }}
                >
                  <span className="font-body-tc text-[12px]" style={{ color: "var(--p1)" }}>
                    規則：4d6 取最高三個之和（範圍 3-18）
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
                      {form.race} · {form.class} · Lv.1
                    </div>
                    <div className="font-body-tc text-[12px] mt-1" style={{ color: "var(--p1)", opacity: .7 }}>
                      {form.background} · {form.alignment} · {form.age}歲
                    </div>
                  </div>

                  <PixelDivider dark className="my-3" />

                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(form.attributes) as Array<keyof typeof form.attributes>).map((k) => {
                      const score = form.attributes[k];
                      const mod = Math.floor((score - 10) / 2);
                      return (
                        <div key={k} className="text-center p-2" style={{ background: "rgba(0,0,0,.3)" }}>
                          <div className="font-pixel text-[7px]" style={{ color: "var(--gold)" }}>
                            {k.toUpperCase()}
                          </div>
                          <div className="font-pixel-num text-[18px]" style={{ color: "var(--p0)" }}>
                            {score}
                          </div>
                          <div className="font-pixel text-[6px]" style={{ color: "var(--blood)" }}>
                            {mod >= 0 ? "+" : ""}{mod}
                          </div>
                        </div>
                      );
                    })}
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
                    確認後即將進入第一章「序章·抵達」。GM 將根據你的角色背景生成開場。
                    角色資訊後續可在角色檔案頁面查看。
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
