"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PixelFrame({
  children,
  className,
  variant = "light",
}: {
  children: ReactNode;
  className?: string;
  variant?: "light" | "dark";
}) {
  return (
    <div className={cn(variant === "dark" ? "pixel-frame-dark" : "pixel-frame", className)}>
      {children}
    </div>
  );
}

export function ParchmentPanel({
  children,
  className,
  deep = false,
}: {
  children: ReactNode;
  className?: string;
  deep?: boolean;
}) {
  return (
    <div className={cn(deep ? "parchment-bg-deep" : "parchment-bg", "relative", className)}>
      {children}
    </div>
  );
}

export function PixelButton({
  children,
  onClick,
  variant = "default",
  className,
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "gold" | "ghost";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const variantClass = {
    default: "pixel-btn",
    primary: "pixel-btn pixel-btn-primary",
    gold: "pixel-btn pixel-btn-gold",
    ghost: "pixel-btn pixel-btn-ghost",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(variantClass, className)}
    >
      {children}
    </button>
  );
}

export function StatBlock({
  label,
  abbr,
  score,
  modifier,
}: {
  label: string;
  abbr: string;
  score: number;
  modifier: number;
}) {
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  return (
    <div className="stat-block group">
      <div className="text-stat-label mb-1">{abbr}</div>
      <div className="font-pixel text-[10px] text-ink mb-1" style={{ color: "var(--walnut)" }}>
        {label}
      </div>
      <div className="relative">
        <div className="text-stat-num" style={{ color: "var(--ink)" }}>
          {score}
        </div>
        <div
          className="absolute -top-1 -right-1 font-pixel-num text-[14px] px-1"
          style={{
            color: "var(--p0)",
            background: "var(--blood)",
            border: "1px solid var(--ink)",
            lineHeight: 1,
          }}
        >
          {modStr}
        </div>
      </div>
    </div>
  );
}

export function StatBar({
  label,
  current,
  max,
  variant = "hp",
}: {
  label: string;
  current: number;
  max: number;
  variant?: "hp" | "mp" | "xp";
}) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const fillClass = {
    hp: "stat-bar-fill",
    mp: "stat-bar-fill stat-bar-fill-mp",
    xp: "stat-bar-fill stat-bar-fill-xp",
  }[variant];

  const colorHex = { hp: "var(--blood)", mp: "#2a6bb8", xp: "var(--gold)" }[variant];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-stat-label">{label}</span>
        <span className="font-pixel-num text-[14px]" style={{ color: "var(--walnut)" }}>
          {current}<span style={{ opacity: .5 }}> / {max}</span>
        </span>
      </div>
      <div className="stat-bar">
        <div className={fillClass} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="font-pixel text-[6px]" style={{ color: "var(--walnut)", opacity: .6 }}>
          {label === "HP" ? "生命" : label === "MP" ? "法力" : "經驗"}
        </span>
        <span className="font-pixel text-[6px]" style={{ color: colorHex, opacity: .8 }}>
          {pct.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

export function CombatStat({
  label,
  value,
  desc,
}: {
  label: string;
  value: string | number;
  desc?: string;
}) {
  return (
    <div
      className="text-center py-2"
      style={{
        background: "rgba(20,9,0,.08)",
        border: "2px solid var(--ink)",
        boxShadow: "2px 2px 0 rgba(20,9,0,.3)",
      }}
    >
      <div className="text-stat-label">{label}</div>
      <div className="font-pixel-num text-[20px] leading-none mt-1" style={{ color: "var(--ink)" }}>
        {value}
      </div>
      {desc && (
        <div className="font-body-tc text-[10px] mt-1" style={{ color: "var(--walnut)", opacity: .7 }}>
          {desc}
        </div>
      )}
    </div>
  );
}

export function Eyebrow({
  children,
  light = false,
  className,
}: {
  children: ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(light ? "text-eyebrow-light" : "text-eyebrow", className)}>
      {children}
    </div>
  );
}

export function PixelDivider({ dark = false, className }: { dark?: boolean; className?: string }) {
  return <div className={cn(dark ? "pixel-divider-dark" : "pixel-divider", className)} />;
}
