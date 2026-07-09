"use client";

import { useState } from "react";
import { useGameStore } from "@/store/game-store";
import { PixelButton, PixelDivider } from "./primitives";

export function CreateScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const updateCharacter = useGameStore((s) => s.updateCharacter);

  const [name, setName] = useState("");
  const [provider, setProvider] = useState<"gemini" | "ollama" | "openai">("gemini");
  const [apiKey, setApiKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [model, setModel] = useState("gemini-2.5-flash");

  const startGame = () => {
    if (!name.trim()) return;

    // 存 AI 設定到 localStorage
    localStorage.setItem("strada-ai-settings", JSON.stringify({
      provider,
      apiKey,
      ollamaUrl,
      model,
    }));

    // 設定名字，其他全部由 AI 隨機生成
    updateCharacter({
      name: name.trim(),
      gender: "",
      age: 0,
      era: "",
      eraYear: "",
      region: "",
      socialClass: "",
      familyBackground: "",
      occupation: "",
      abilityStatus: "普通人",
      abilityType: undefined,
      leftBrain: { reason: 0, memory: 0, language: 0, logic: 0, self: 0 },
      rightBrain: { perception: 0, imagination: 0, intuition: 0, emotion: 0, insight: 0 },
      health: { label: "", pct: 0 },
      sanity: { current: 0, max: 100 },
      mood: { label: "", pct: 0 },
      currency: 0,
      inventory: [],
      knownInfo: [],
    });
    setScreen("play");
  };

  const showOllama = provider === "ollama";
  const showKey = provider !== "ollama";

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
          ◆ 開始新遊戲
        </div>
        <div />
      </div>

      <PixelDivider dark className="mx-6" />

      {/* 中央內容 */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          {/* 說明 */}
          <div className="text-center mb-8">
            <div className="font-pixel text-[9px] mb-2" style={{ color: "var(--gold)", letterSpacing: "3px" }}>
              AI GAME MASTER
            </div>
            <div className="font-body-tc text-[14px]" style={{ color: "var(--p0)", lineHeight: 1.8 }}>
              只需輸入一個名字，AI 會根據世界觀隨機生成：<br />
              時代、地域、家族、性別、能力狀態，以及你的開場處境。
            </div>
          </div>

          {/* 名字輸入 */}
          <div className="mb-6">
            <label className="font-pixel text-[8px] block mb-2" style={{ color: "var(--gold)", letterSpacing: "2px" }}>
              YOUR NAME · 你的名字
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startGame()}
              placeholder="輸入名字，其他交給 AI"
              autoFocus
              className="w-full px-4 py-3 font-body-tc text-[16px]"
              style={{
                background: "rgba(242,230,198,.08)",
                border: "2px solid var(--gold)",
                color: "var(--p0)",
                boxShadow: "inset 0 0 0 1px var(--ink)",
                outline: "none",
              }}
            />
          </div>

          <PixelDivider dark className="mb-6" />

          {/* AI 設定 */}
          <div className="mb-6">
            <div className="font-pixel text-[8px] mb-3" style={{ color: "var(--gold)", letterSpacing: "2px" }}>
              AI MODEL · 模型選擇
            </div>

            {/* Provider 選擇 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {([
                ["gemini", "Google Gemini"],
                ["ollama", "Ollama（本地）"],
                ["openai", "OpenAI"],
              ] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setProvider(val)}
                  className="px-3 py-2 font-body-tc text-[12px] text-center transition-all"
                  style={{
                    background: provider === val ? "var(--blood)" : "rgba(20,9,0,.4)",
                    color: provider === val ? "var(--p0)" : "var(--p1)",
                    border: "2px solid",
                    borderColor: provider === val ? "var(--gold)" : "rgba(196,144,8,.4)",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Ollama URL */}
            {showOllama && (
              <div className="mb-3">
                <label className="font-pixel text-[7px] block mb-1" style={{ color: "var(--gold)" }}>
                  OLLAMA 位址
                </label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  className="w-full px-3 py-2 font-body-tc text-[13px]"
                  style={{
                    background: "rgba(242,230,198,.08)",
                    border: "1px solid var(--gold)",
                    color: "var(--p0)",
                  }}
                />
              </div>
            )}

            {/* API Key */}
            {showKey && (
              <div className="mb-3">
                <label className="font-pixel text-[7px] block mb-1" style={{ color: "var(--gold)" }}>
                  API KEY
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="貼上你的 API Key"
                  className="w-full px-3 py-2 font-body-tc text-[13px]"
                  style={{
                    background: "rgba(242,230,198,.08)",
                    border: "1px solid var(--gold)",
                    color: "var(--p0)",
                  }}
                />
                <div className="font-body-tc text-[10px] mt-1" style={{ color: "var(--p1)", opacity: .5 }}>
                  只存在瀏覽器中，不會外傳
                </div>
              </div>
            )}

            {/* Model 選擇 */}
            <div>
              <label className="font-pixel text-[7px] block mb-1" style={{ color: "var(--gold)" }}>
                MODEL
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 font-body-tc text-[13px]"
                style={{
                  background: "rgba(242,230,198,.08)",
                  border: "1px solid var(--gold)",
                  color: "var(--p0)",
                }}
              >
                {provider === "gemini" && (
                  <>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash（快速）</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash（推薦）</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro（最強）</option>
                  </>
                )}
                {provider === "ollama" && (
                  <>
                    <option value="llama3.1">Llama 3.1</option>
                    <option value="qwen2.5">Qwen 2.5</option>
                    <option value="mistral">Mistral</option>
                  </>
                )}
                {provider === "openai" && (
                  <>
                    <option value="gpt-4o-mini">GPT-4o Mini（快速）</option>
                    <option value="gpt-4o">GPT-4o（推薦）</option>
                    <option value="o1">o1（最強）</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 開始按鈕 */}
          <PixelButton
            variant="primary"
            onClick={startGame}
            disabled={!name.trim()}
            className="w-full py-3 text-[10px]"
            style={{ opacity: name.trim() ? 1 : .4 }}
          >
            ▸ 開始冒險
          </PixelButton>

          <div className="text-center mt-4 font-body-tc text-[11px]" style={{ color: "var(--p1)", opacity: .4 }}>
            AI 將在遊戲開始時生成你的完整角色
          </div>
        </div>
      </div>
    </div>
  );
}
