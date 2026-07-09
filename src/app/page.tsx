'use client';

import { useEffect } from "react";
import { useGameStore } from "@/store/game-store";
import { HomeScreen } from "@/components/game/home-screen";
import { CreateScreen } from "@/components/game/create-screen";
import { PlayScreen } from "@/components/game/play-screen";
import { CharacterScreen } from "@/components/game/character-screen";

export default function Home() {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const showTutorial = useGameStore((s) => s.showTutorial);

  useEffect(() => {
    if (currentScreen === "play" && !localStorage.getItem("sv_tutorial_done")) {
      useGameStore.getState().restartTutorial();
    }
  }, [currentScreen]);

  useEffect(() => {
    if (!showTutorial && currentScreen === "play") {
      localStorage.setItem("sv_tutorial_done", "1");
    }
  }, [showTutorial, currentScreen]);

  return (
    <main className="w-screen h-screen overflow-hidden">
      {currentScreen === "home" && <HomeScreen />}
      {currentScreen === "create" && <CreateScreen />}
      {currentScreen === "play" && <PlayScreen />}
      {currentScreen === "character" && <CharacterScreen />}
    </main>
  );
}
