"use client";

import { useGameStore } from "@/store/game-store";
import { PixelButton, PixelDivider, Eyebrow } from "./primitives";

export function HomeScreen() {
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="h-screen w-screen overflow-hidden dark-bg flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[10px]" style={{ color: "var(--gold)" }}>
            ◆ 實驗體21號
          </span>
          <span className="font-body-tc text-[11px]" style={{ color: "var(--p1)", opacity: .6 }}>
            零號計劃
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="font-pixel text-[8px] px-2 py-1"
            style={{ color: "var(--p1)", border: "1px solid var(--gold)" }}
            onClick={() => setScreen("character")}
          >
            角色檔案
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-2xl scale-in">
          <div className="flex items-center justify-center gap-3 mb-4 opacity-70">
            <div className="h-px w-16" style={{ background: "var(--gold)" }} />
            <span className="font-pixel text-[8px]" style={{ color: "var(--gold)", letterSpacing: "4px" }}>
              右腦能力 · 文字冒險
            </span>
            <div className="h-px w-16" style={{ background: "var(--gold)" }} />
          </div>

          <h1
            className="font-pixel mb-3 flicker"
            style={{
              fontSize: "36px",
              letterSpacing: "4px",
              color: "var(--p0)",
              textShadow: "4px 4px 0 var(--blood), 8px 8px 0 rgba(112,14,14,.4)",
              lineHeight: 1.3,
            }}
          >
            實驗體
            <br />
            21號
          </h1>

          <div className="font-body-tc text-[18px] mb-2" style={{ color: "var(--gold)", letterSpacing: "4px" }}>
            零 號 計 劃 · 首 個 存 活 體
          </div>

          <p
            className="font-display italic text-[16px] mt-4 mb-8 max-w-md mx-auto"
            style={{ color: "var(--p1)", opacity: .9, lineHeight: 1.7 }}
          >
            從有記憶以來就在實驗室裡。你的右腦是武器，你的左腦是牢籠。
            每一次使用能力，都是在向「與世界同化」邁進一步。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <PixelButton variant="primary" onClick={() => setScreen("create")} className="px-6 py-3 pulse-gold">
              <span>▸ 建立檔案</span>
            </PixelButton>
            <PixelButton variant="gold" onClick={() => setScreen("play")} className="px-6 py-3">
              <span>繼續旅程</span>
            </PixelButton>
            <PixelButton variant="ghost" onClick={() => setScreen("character")} className="px-6 py-3">
              <span>角色檔案</span>
            </PixelButton>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="font-pixel text-[7px] mb-1" style={{ color: "var(--gold)" }}>
                右腦能力
              </div>
              <div className="font-body-tc text-[10px]" style={{ color: "var(--p1)", opacity: .6 }}>
                右腦開發
              </div>
            </div>
            <div className="w-px h-8" style={{ background: "var(--gold)", opacity: .4 }} />
            <div className="text-center">
              <div className="font-pixel text-[7px] mb-1" style={{ color: "var(--gold)" }}>
                色彩感知
              </div>
              <div className="font-body-tc text-[10px]" style={{ color: "var(--p1)", opacity: .6 }}>
                情緒顏色
              </div>
            </div>
            <div className="w-px h-8" style={{ background: "var(--gold)", opacity: .4 }} />
            <div className="text-center">
              <div className="font-pixel text-[7px] mb-1" style={{ color: "var(--gold)" }}>
                互動敘事
              </div>
              <div className="font-body-tc text-[10px]" style={{ color: "var(--p1)", opacity: .6 }}>
                AI 引導
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 py-3">
        <PixelDivider dark className="mb-3" />
        <div className="flex items-center justify-between">
          <span className="font-body-tc text-[10px]" style={{ color: "var(--p1)", opacity: .5 }}>
            第一次玩？進入旅程後會有引導教學
          </span>
          <span className="font-pixel text-[7px]" style={{ color: "var(--gold)", opacity: .6 }}>
            v 0.2 · SUBJECT 21
          </span>
        </div>
      </div>
    </div>
  );
}
