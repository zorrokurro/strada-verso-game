"use client";

import { useGameStore } from "@/store/game-store";
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
          <TopButton onClick={restartTutorial}>
            ? 教學
          </TopButton>
          <TopButton onClick={() => setScreen("character")}>
            ▤ 角色
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
