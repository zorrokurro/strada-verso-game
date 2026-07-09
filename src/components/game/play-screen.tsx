"use client";

import { useGameStore } from "@/store/game-store";
import { PixelButton, PixelDivider } from "./primitives";
import { GameChat, ActionInput } from "./chat";
import { CharacterSheetPanel } from "./character-sheet";
import { NotesPanel } from "./notes-panel";
import { TutorialOverlay } from "./tutorial-overlay";
import { cn } from "@/lib/utils";

export function PlayScreen() {
  const character = useGameStore((s) => s.character);
  const setScreen = useGameStore((s) => s.setScreen);
  const showNotesPanel = useGameStore((s) => s.showNotesPanel);
  const setShowNotesPanel = useGameStore((s) => s.setShowNotesPanel);
  const showReviewPanel = useGameStore((s) => s.showReviewPanel);
  const setShowReviewPanel = useGameStore((s) => s.setShowReviewPanel);
  const showTutorial = useGameStore((s) => s.showTutorial);
  const restartTutorial = useGameStore((s) => s.restartTutorial);
  const openNoteId = useGameStore((s) => s.openNoteId);

  return (
    <div className="h-screen w-screen overflow-hidden dark-bg flex flex-col">
      {/* 頂部狀態列 */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4 py-2"
        style={{
          background: "var(--ink)",
          borderBottom: "3px solid var(--gold)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setScreen("home")}
            className="font-pixel text-[8px] flex items-center gap-1"
            style={{ color: "var(--gold)" }}
          >
            ◂ STRADA·VERSO
          </button>
          {character.era && (
            <>
              <div className="w-px h-4" style={{ background: "var(--gold)", opacity: .4 }} />
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[7px]" style={{ color: "var(--p1)", opacity: .6 }}>
                  ERA
                </span>
                <span className="font-body-tc text-[12px]" style={{ color: "var(--p0)" }}>
                  {character.era}
                </span>
              </div>
            </>
          )}
          {character.region && (
            <>
              <div className="w-px h-4" style={{ background: "var(--gold)", opacity: .4 }} />
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[7px]" style={{ color: "var(--p1)", opacity: .6 }}>
                  LOCATION
                </span>
                <span className="font-body-tc text-[12px]" style={{ color: "var(--gold)" }}>
                  {character.region}
                </span>
              </div>
            </>
          )}
          {!character.era && character.name && (
            <>
              <div className="w-px h-4" style={{ background: "var(--gold)", opacity: .4 }} />
              <div className="flex items-center gap-2">
                <span className="font-body-tc text-[12px]" style={{ color: "var(--p0)" }}>
                  {character.name} — 等待 AI 生成角色...
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <TopButton onClick={() => setShowNotesPanel(!showNotesPanel)} active={showNotesPanel}>
            ◈ 筆記
          </TopButton>
          <TopButton onClick={() => setShowReviewPanel(!showReviewPanel)} active={showReviewPanel}>
            ↺ 回顧
          </TopButton>
          <TopButton onClick={restartTutorial}>
            ? 教學
          </TopButton>
          <TopButton onClick={() => setScreen("character")}>
            ▤ 角色
          </TopButton>
          <TopButton>
            ☰ 儲存
          </TopButton>
        </div>
      </header>

      {/* 主內容：左右分割 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左側 60%：對話區 */}
        <div
          className="flex-1 flex flex-col"
          style={{
            background: "rgba(20,9,0,.4)",
            borderRight: "3px solid var(--ink)",
          }}
        >
          {/* 對話歷史 */}
          <div className="flex-1 overflow-hidden">
            <GameChat />
          </div>
          {/* 行動輸入 */}
          <ActionInput />
        </div>

        {/* 右側 40%：角色卡面板 */}
        <div className="w-[40%] min-w-[320px] max-w-[440px] flex-shrink-0">
          <CharacterSheetPanel />
        </div>
      </div>

      {/* 筆記面板（slide-in 或詳情 modal） */}
      {(showNotesPanel || openNoteId) && <NotesPanel />}

      {/* 劇情回顧面板 */}
      {showReviewPanel && <ReviewPanel onClose={() => setShowReviewPanel(false)} />}

      {/* 教學 overlay */}
      {showTutorial && <TutorialOverlay />}

      {/* 角色變動提示（demo 用） */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        {/* 預留空間 */}
      </div>
    </div>
  );
}

function TopButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn("font-pixel text-[8px] px-2.5 py-1.5 transition-all")}
      style={{
        color: active ? "var(--ink)" : "var(--gold)",
        background: active ? "var(--gold)" : "transparent",
        border: "1px solid var(--gold)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
// 劇情回顧面板
// ─────────────────────────────────────────────
function ReviewPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ background: "rgba(8,4,10,.9)" }}>
      <div
        className="pixel-frame-dark parchment-bg-deep max-w-2xl w-full mx-6 max-h-[80vh] flex flex-col"
        style={{ boxShadow: "0 0 60px rgba(196,144,8,.3)" }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "2px solid var(--ink)" }}>
          <div>
            <div className="font-pixel text-[12px]" style={{ color: "var(--ink)" }}>
              ◆ STORY REVIEW
            </div>
            <div className="font-body-tc text-[11px] mt-1" style={{ color: "var(--walnut)", opacity: .7 }}>
              AI 自動整理的故事摘要
            </div>
          </div>
          <button
            onClick={onClose}
            className="font-pixel text-[10px] px-2 py-1"
            style={{ background: "var(--ink)", color: "var(--p0)", border: "1px solid var(--gold)" }}
          >
            ✕ 關閉
          </button>
        </div>

        <div className="flex-1 overflow-y-auto fancy-scroll px-6 py-4">
          <ChapterSummary
            chapter="序章"
            title="實驗室的回聲"
            summary="你被派去觀測實驗體21號——認知科學局最早的實驗對象。他坐在金屬椅上，半透明的身體在日光燈下幾乎看不見輪廓。你的觀測日誌已經寫了三頁。但今天不一樣——他開始對你說話。"
            highlights={["抵達觀測室", "認識實驗體21號", "聽見無聲的聲音"]}
            current
          />
        </div>
      </div>
    </div>
  );
}

function ChapterSummary({
  chapter,
  title,
  summary,
  highlights,
  current,
}: {
  chapter: string;
  title: string;
  summary: string;
  highlights: string[];
  current?: boolean;
}) {
  return (
    <div
      className="mb-4 p-4 relative"
      style={{
        background: "rgba(242,230,198,.5)",
        border: "2px solid var(--ink)",
        boxShadow: "3px 3px 0 rgba(20,9,0,.3)",
      }}
    >
      {current && (
        <div
          className="absolute -top-2 -right-2 px-2 py-0.5 flicker"
          style={{ background: "var(--blood)", border: "1px solid var(--gold)" }}
        >
          <span className="font-pixel text-[7px]" style={{ color: "var(--p0)" }}>NOW</span>
        </div>
      )}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-pixel text-[9px]" style={{ color: "var(--blood)" }}>
          {chapter}
        </span>
        <span className="font-body-tc text-[15px]" style={{ color: "var(--ink)", fontStyle: "italic" }}>
          {title}
        </span>
      </div>
      <p className="font-body-tc text-[13px] mb-3" style={{ color: "var(--walnut)", lineHeight: 1.7 }}>
        {summary}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {highlights.map((h) => (
          <span
            key={h}
            className="font-body-tc text-[11px] px-2 py-0.5"
            style={{ background: "rgba(196,144,8,.2)", border: "1px solid var(--gold)", color: "var(--blood)" }}
          >
            ◇ {h}
          </span>
        ))}
      </div>
    </div>
  );
}
