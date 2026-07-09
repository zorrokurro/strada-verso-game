"use client";

import { useGameStore } from "@/store/game-store";
import { PixelDivider } from "./primitives";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, string> = {
  npc: "人物",
  location: "地點",
  item: "物品",
  faction: "勢力",
};

const typeColors: Record<string, string> = {
  npc: "var(--blood)",
  location: "var(--gold)",
  item: "#2a6bb8",
  faction: "var(--walnut)",
};

export function NotesPanel() {
  const notes = useGameStore((s) => s.notes);
  const openNoteId = useGameStore((s) => s.openNoteId);
  const setOpenNote = useGameStore((s) => s.setOpenNote);
  const setShowNotesPanel = useGameStore((s) => s.setShowNotesPanel);

  const openNote = notes.find((n) => n.id === openNoteId);

  if (openNote) {
    return (
      <div
        className="absolute inset-0 z-50 flex items-center justify-center scale-in"
        style={{ background: "rgba(8,4,10,.92)" }}
      >
        <div
          className="pixel-frame-dark parchment-bg-deep max-w-2xl w-full mx-6 max-h-[85vh] flex flex-col"
          style={{ boxShadow: "0 0 60px rgba(196,144,8,.4)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: "2px solid var(--ink)", background: "rgba(20,9,0,.85)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="font-pixel text-[7px] px-2 py-1"
                style={{
                  color: "var(--p0)",
                  background: typeColors[openNote.type],
                  border: "1px solid var(--gold)",
                }}
              >
                {typeIcons[openNote.type]}
              </span>
              <div>
                <div className="font-pixel text-[12px]" style={{ color: "var(--p0)" }}>
                  {openNote.title}
                </div>
                <div className="font-body-tc text-[10px] mt-0.5" style={{ color: "var(--p1)", opacity: .7 }}>
                  {openNote.firstSeen}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setOpenNote(null);
                if (!useGameStore.getState().showNotesPanel) {
                  setShowNotesPanel(false);
                }
              }}
              className="font-pixel text-[10px] px-2 py-1"
              style={{ background: "var(--ink)", color: "var(--p0)", border: "1px solid var(--gold)" }}
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto fancy-scroll px-6 py-5">
            <div className="text-eyebrow mb-2">SUMMARY · 摘要</div>
            <p className="font-body-tc text-[14px] mb-5" style={{ color: "var(--blood)", fontStyle: "italic", lineHeight: 1.7 }}>
              {openNote.summary}
            </p>

            <PixelDivider className="my-4" />

            <div className="text-eyebrow mb-2">DETAILS · 詳細資訊</div>
            <p className="font-body-tc text-[14px]" style={{ color: "var(--walnut)", lineHeight: 1.85 }}>
              {openNote.details}
            </p>

            <div className="mt-6 p-3" style={{ background: "rgba(112,14,14,.08)", border: "1px dashed var(--blood)" }}>
              <div className="font-pixel text-[7px] mb-1" style={{ color: "var(--blood)" }}>
                ▸ GM 提示
              </div>
              <div className="font-body-tc text-[12px]" style={{ color: "var(--walnut)", lineHeight: 1.6 }}>
                這個條目已加入你的筆記。在對話中提到相關事物時，AI GM 會自動參照此資訊。
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "2px solid var(--ink)" }}>
            <button
              onClick={() => setOpenNote(null)}
              className="pixel-btn pixel-btn-ghost text-[8px] py-2"
            >
              ◂ 返回筆記列表
            </button>
            <button
              onClick={() => {
                setOpenNote(null);
                setShowNotesPanel(false);
              }}
              className="pixel-btn text-[8px] py-2"
            >
              關閉筆記面板
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute top-0 right-0 bottom-0 z-40 scale-in"
      style={{
        width: "380px",
        background: "var(--ink)",
        borderLeft: "3px solid var(--gold)",
        boxShadow: "-8px 0 30px rgba(0,0,0,.5)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "2px solid var(--gold)" }}
      >
        <div>
          <div className="font-pixel text-[10px]" style={{ color: "var(--gold)" }}>
            ◈ CODEX · 筆記
          </div>
          <div className="font-body-tc text-[10px] mt-0.5" style={{ color: "var(--p1)", opacity: .7 }}>
            {notes.length} 個條目
          </div>
        </div>
        <button
          onClick={() => setShowNotesPanel(false)}
          className="font-pixel text-[10px] px-2 py-1"
          style={{ color: "var(--gold)", border: "1px solid var(--gold)" }}
        >
          ✕
        </button>
      </div>

      <div className="overflow-y-auto fancy-scroll-dark" style={{ height: "calc(100% - 60px)" }}>
        {notes.map((n) => (
          <button
            key={n.id}
            onClick={() => setOpenNote(n.id)}
            className="w-full text-left px-4 py-3 transition-all hover:translate-x-[-2px]"
            style={{
              borderBottom: "1px solid rgba(196,144,8,.2)",
              cursor: "pointer",
            }}
          >
            <div className="flex items-start gap-3">
              <span
                className="font-pixel text-[6px] px-1.5 py-0.5 flex-shrink-0 mt-0.5"
                style={{
                  color: "var(--p0)",
                  background: typeColors[n.type],
                  border: "1px solid var(--gold)",
                }}
              >
                {typeIcons[n.type]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-body-tc text-[13px] mb-0.5" style={{ color: "var(--p0)" }}>
                  {n.title}
                </div>
                <div
                  className="font-body-tc text-[11px] line-clamp-2"
                  style={{ color: "var(--p1)", opacity: .7, lineHeight: 1.5 }}
                >
                  {n.summary}
                </div>
                <div className="font-pixel text-[6px] mt-1" style={{ color: "var(--gold)", opacity: .5 }}>
                  {n.firstSeen}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
