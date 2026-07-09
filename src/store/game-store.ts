import { create } from "zustand";
import { blankCharacter, mockMessages, mockNotes, type CharacterSheet, type ChatMessage, type KeywordNote } from "@/lib/game-data";

export type ScreenName = "home" | "create" | "play" | "character";

interface GameState {
  // 導航
  currentScreen: ScreenName;
  setScreen: (s: ScreenName) => void;

  // 角色
  character: CharacterSheet;
  updateCharacter: (patch: Partial<CharacterSheet>) => void;

  // 對話
  messages: ChatMessage[];
  pushMessage: (m: ChatMessage) => void;
  clearMessages: () => void;

  // 筆記
  notes: KeywordNote[];
  openNoteId: string | null;
  setOpenNote: (id: string | null) => void;

  // 教學
  showTutorial: boolean;
  tutorialStep: number;
  setTutorialStep: (n: number) => void;
  closeTutorial: () => void;
  restartTutorial: () => void;

  // 設定面板
  showNotesPanel: boolean;
  setShowNotesPanel: (b: boolean) => void;
  showReviewPanel: boolean;
  setShowReviewPanel: (b: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentScreen: "home",
  setScreen: (s) => set({ currentScreen: s }),

  character: blankCharacter,
  updateCharacter: (patch) => set((st) => ({ character: { ...st.character, ...patch } })),

  messages: mockMessages,
  pushMessage: (m) => set((st) => ({ messages: [...st.messages, m] })),
  clearMessages: () => set({ messages: [] }),

  notes: mockNotes,
  openNoteId: null,
  setOpenNote: (id) => set({ openNoteId: id }),

  showTutorial: false,
  tutorialStep: 0,
  setTutorialStep: (n) => set({ tutorialStep: n }),
  closeTutorial: () => set({ showTutorial: false }),
  restartTutorial: () => set({ showTutorial: true, tutorialStep: 0 }),

  showNotesPanel: false,
  setShowNotesPanel: (b) => set({ showNotesPanel: b }),
  showReviewPanel: false,
  setShowReviewPanel: (b) => set({ showReviewPanel: b }),
}));
