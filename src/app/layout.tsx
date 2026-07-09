import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P, VT323, IM_Fell_English, Pixelify_Sans, Noto_Serif_TC } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});

const vt323 = VT323({
  variable: "--font-vt323",
  weight: "400",
  subsets: ["latin"],
});

const imFell = IM_Fell_English({
  variable: "--font-im-fell",
  weight: "400",
  subsets: ["latin"],
});

const pixelify = Pixelify_Sans({
  variable: "--font-pixelify",
  weight: "400",
  subsets: ["latin"],
});

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "斯特拉達·維爾索 — AI 引導的 TRPG 冒險",
  description: "由 AI 擔任遊戲主持人的單人 D&D 風格文字冒險。擲骰、對話、敘事，全由 AI GM 即時引導。",
  keywords: ["TRPG", "D&D", "AI GM", "AI Dungeon Master", "文字冒險", "斯特拉達維爾索", "Strada Verso"],
  authors: [{ name: "Strada Verso" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} ${vt323.variable} ${imFell.variable} ${pixelify.variable} ${notoSerifTC.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
