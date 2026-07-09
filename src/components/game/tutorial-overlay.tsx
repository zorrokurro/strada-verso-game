"use client";

import { useGameStore } from "@/store/game-store";
import { PixelButton } from "./primitives";

const STEPS = [
  {
    title: "歡迎，實驗體21號",
    body: "這是一個由 AI 擔任敘事者的互動文字冒險。你用文字描述你想做的事，敘事者會判定結果並推進故事。",
    highlight: null as string | null,
    icon: "◆",
  },
  {
    title: "左側是敘事區",
    body: "敘事者的描述用羊皮紙框呈現，你的行動用深色框呈現。系統訊息會以小卡片顯示。可點擊的關鍵字會以金色底線高亮——點下去可查看筆記詳情。",
    highlight: "chat",
    icon: "◈",
  },
  {
    title: "右側是你的角色檔案",
    body: "隨時顯示你的右腦階段、能力數值與物品。使用能力會加速左腦退位——這是代價。",
    highlight: "sheet",
    icon: "▤",
  },
  {
    title: "下方輸入你的行動",
    body: "用自然語言描述你想做的事，例如「我走進書店」或「我嘗試感知他的情緒顏色」。Enter 送出，Shift+Enter 換行。",
    highlight: "input",
    icon: "▸",
  },
  {
    title: "準備好了嗎？",
    body: "頂部的「筆記 / 回顧 / 引導 / 檔案」可隨時叫出。你的選擇會被記住——你的能力成長，也是你的瓦解。",
    highlight: null,
    icon: "★",
  },
];

export function TutorialOverlay() {
  const step = useGameStore((s) => s.tutorialStep);
  const setStep = useGameStore((s) => s.setTutorialStep);
  const closeTutorial = useGameStore((s) => s.closeTutorial);
  const current = STEPS[step];

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else closeTutorial();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center pb-8 px-4 pointer-events-none">
      {current.highlight && (
        <div
          className="absolute pointer-events-none"
          style={{
            background: "rgba(8,4,10,.85)",
            boxShadow: "0 0 0 9999px rgba(8,4,10,.85)",
          }}
        />
      )}

      <div
        className="pointer-events-auto scale-in"
        style={{
          background: "var(--ink)",
          border: "3px solid var(--gold)",
          boxShadow: "6px 6px 0 rgba(0,0,0,.6), 0 0 30px rgba(196,144,8,.3)",
          maxWidth: "480px",
          width: "100%",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ borderBottom: "2px solid var(--gold)" }}
        >
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[14px]" style={{ color: "var(--gold)" }}>
              {current.icon}
            </span>
            <span className="font-pixel text-[9px]" style={{ color: "var(--gold)" }}>
              引導 · TUTORIAL
            </span>
          </div>
          <span className="font-pixel text-[8px]" style={{ color: "var(--p1)" }}>
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <div className="flex gap-1 px-4 py-2" style={{ background: "rgba(196,144,8,.08)" }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1"
              style={{
                background: i <= step ? "var(--gold)" : "rgba(196,144,8,.2)",
              }}
            />
          ))}
        </div>

        <div className="px-5 py-5">
          <div className="font-pixel text-[14px] mb-3" style={{ color: "var(--p0)", letterSpacing: "1.5px" }}>
            {current.title}
          </div>
          <p
            className="font-body-tc text-[14px]"
            style={{ color: "var(--p1)", lineHeight: 1.75 }}
          >
            {current.body}
          </p>
        </div>

        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: "2px solid var(--gold)", background: "rgba(196,144,8,.05)" }}
        >
          <button
            onClick={closeTutorial}
            className="font-pixel text-[8px] px-3 py-1.5"
            style={{ color: "var(--p1)", opacity: .6 }}
          >
            略過引導
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <PixelButton variant="ghost" onClick={() => setStep(step - 1)} className="text-[8px] py-2">
                ◂ 上一步
              </PixelButton>
            )}
            <PixelButton variant="primary" onClick={next} className="text-[8px] py-2">
              {step < STEPS.length - 1 ? "下一步 ▸" : "開始旅程 ★"}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}
