"use client";

import { useGameStore } from "@/store/game-store";

const STEPS = [
  {
    title: "歡迎來到斯特拉達·維爾索",
    body: "這是一個由 AI 擔任遊戲主持人（GM）的單人文字冒險。你只需輸入一個名字，AI 會根據世界觀隨機生成你的角色——時代、地域、家族、能力狀態。然後用文字描述你想做的事，AI 會判定結果並推進故事。",
    icon: "◆",
  },
  {
    title: "左側是 GM 對話區",
    body: "GM 的敘事用羊皮紙框呈現，你的行動用深色框呈現。系統訊息（章節切換等）會以小卡片顯示。可點擊的關鍵字會以金色底線高亮——點下去可查看筆記詳情。",
    icon: "◈",
  },
  {
    title: "右側是你的角色卡",
    body: "隨時顯示健康、理智、情緒狀態，以及左腦（理性面）和右腦（直覺面）屬性。能力狀態從普通人到能力者不等。角色死亡時，AI 會為你撰寫一生的故事。",
    icon: "▤",
  },
  {
    title: "下方輸入你的行動",
    body: "用自然語言描述你想做的事，例如「我感覺空氣中的溫度變化」或「我檢查房間裡的線索」。Enter 送出，Shift+Enter 換行。",
    icon: "▸",
  },
  {
    title: "頂部功能列",
    body: "「筆記」查看已收集的資訊，「教學」可隨時重看，「角色」查看完整角色卡。能力的覺醒是漸進的——你不會直接看到「使用了能力」，而是透過身體感覺來感知。",
    icon: "★",
  },
];

export function TutorialOverlay() {
  const step = useGameStore((s) => s.tutorialStep);
  const setStep = useGameStore((s) => s.setTutorialStep);
  const closeTutorial = useGameStore((s) => s.closeTutorial);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(8,4,10,.88)" }}
    >
      <div
        className="w-full max-w-md mx-4 fade-in-up"
        style={{
          background: "var(--ink)",
          border: "3px solid var(--gold)",
          boxShadow: "6px 6px 0 rgba(0,0,0,.6), 0 0 40px rgba(196,144,8,.25)",
        }}
      >
        {/* 標題列 */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "2px solid var(--gold)" }}
        >
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[16px]" style={{ color: "var(--gold)" }}>
              {current.icon}
            </span>
            <span className="font-pixel text-[10px]" style={{ color: "var(--gold)", letterSpacing: "2px" }}>
              教學 · TUTORIAL
            </span>
          </div>
          <span className="font-pixel text-[9px]" style={{ color: "var(--p1)" }}>
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* 進度條 */}
        <div className="flex gap-1.5 px-5 py-3" style={{ background: "rgba(196,144,8,.06)" }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1.5"
              style={{
                background: i <= step ? "var(--gold)" : "rgba(196,144,8,.15)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* 內容 */}
        <div className="px-6 py-6">
          <div
            className="font-pixel text-[15px] mb-4"
            style={{ color: "var(--p0)", letterSpacing: "1.5px" }}
          >
            {current.title}
          </div>
          <p
            className="font-body-tc text-[14px]"
            style={{ color: "var(--p1)", lineHeight: 1.8 }}
          >
            {current.body}
          </p>
        </div>

        {/* 按鈕列 */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderTop: "2px solid var(--gold)", background: "rgba(196,144,8,.04)" }}
        >
          <button
            onClick={closeTutorial}
            className="font-pixel text-[9px] px-4 py-2 hover:opacity-100 transition-opacity"
            style={{ color: "var(--p1)", opacity: 0.7 }}
          >
            略過
          </button>
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="font-pixel text-[9px] px-4 py-2"
                style={{
                  color: "var(--gold)",
                  border: "2px solid var(--gold)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                ◂ 上一步
              </button>
            )}
            <button
              onClick={isLast ? closeTutorial : () => setStep(step + 1)}
              className="font-pixel text-[9px] px-5 py-2"
              style={{
                color: "var(--ink)",
                background: "var(--gold)",
                border: "2px solid var(--gold)",
                cursor: "pointer",
                letterSpacing: "1px",
              }}
            >
              {isLast ? "開始冒險 ★" : "下一步 ▸"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
