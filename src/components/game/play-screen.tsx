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
          <div className="w-px h-4" style={{ background: "var(--gold)", opacity: .4 }} />
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[7px]" style={{ color: "var(--p1)", opacity: .6 }}>
              CHAPTER
            </span>
            <span className="font-body-tc text-[12px]" style={{ color: "var(--p0)" }}>
              第二章 · 月光下的低語
            </span>
          </div>
          <div className="w-px h-4" style={{ background: "var(--gold)", opacity: .4 }} />
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[7px]" style={{ color: "var(--p1)", opacity: .6 }}>
              LOCATION
            </span>
            <span className="font-body-tc text-[12px]" style={{ color: "var(--gold)" }}>
              鏽蝕錨旅店 · 一樓大廳
            </span>
          </div>
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

      <div className="flex-1 flex overflow-hidden">
        <div
          className="flex-1 flex flex-col"
          style={{
            background: "rgba(20,9,0,.4)",
            borderRight: "3px solid var(--ink)",
          }}
        >
          <div className="flex-1 overflow-hidden">
            <GameChat />
          </div>
          <ActionInput />
        </div>

        <div className="w-[40%] min-w-[320px] max-w-[440px] flex-shrink-0">
          <CharacterSheetPanel />
        </div>
      </div>

      {(showNotesPanel || openNoteId) && <NotesPanel />}

      {showReviewPanel && <ReviewPanel onClose={() => setShowReviewPanel(false)} />}

      {showTutorial && <TutorialOverlay />}
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
              AI 自動整理的章節摘要
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
            title="抵達"
            summary="你搭乘商船「灰鳥號」抵達斯特拉達·維爾索。船長警告你這座城近期不太平。下船後，你直奔熟悉的鏽蝕錨旅店，老闆艾爾德里克似乎認出了你。"
            highlights={["抵達港口", "認識艾爾德里克", "聽聞失蹤傳聞"]}
          />
          <ChapterSummary
            chapter="第一章"
            title="鏽蝕錨的夜"
            summary="艾爾德里克透露近期多人失蹤，並提到碎骨連的舊識曾見過你母親的護身符。你決定留下調查。夜裡，你聽到地下室傳來腳步聲。"
            highlights={["碎骨連線索", "護身符之謎", "地下室的腳步聲"]}
          />
          <ChapterSummary
            chapter="第二章"
            title="月光下的低語"
            summary="艾爾德里克給了你一把生鏽的鑰匙，說樓上有人在等你。她自稱「寂靜」。你必須決定是否上樓。"
            highlights={["神秘訪客", "寂靜之名", "抉擇時刻"]}
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
