"use client";
import React from "react";
import { GoTrophy } from "react-icons/go";
import { PiStarLight } from "react-icons/pi";
import { IoRocketOutline } from "react-icons/io5";
import { IoIosGitNetwork } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";

const ICON_MAP: Record<string, React.ReactNode> = {
  trophy: <GoTrophy className="w-6 h-6 text-white" aria-hidden />,
  network: <IoIosGitNetwork className="w-6 h-6 text-white" aria-hidden />,
  chart: <IoRocketOutline className="w-6 h-6 text-white" aria-hidden />,
  learn: <PiStarLight className="w-6 h-6 text-white" aria-hidden />,
};

const Card: React.FC<{
  title: string;
  subtitle: string;
  bullets: string[];
  iconBg: string;
  iconKey?: string;
}> = ({ title, subtitle, bullets, iconBg, iconKey }) => {
  return (
    <div className="bg-[#2a3441] p-6 rounded-lg">
      <div className="flex flex-col items-start gap-4">
        {/* Icon placeholder - replace with your icon library component */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${iconBg}`}
        >
          {iconKey ? (
            (ICON_MAP[iconKey] ?? <span className="w-6 h-6" />)
          ) : (
            <span className="w-6 h-6" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <p className="text-slate-300 mt-1 text-sm max-w-md">{subtitle}</p>
        </div>
      </div>

      <ul className="mt-4 grid gap-3">
        {bullets.map((b) => (
          <li
            key={b}
            className="flex items-center gap-3 text-slate-200 text-sm"
          >
            {/* Bullet placeholder - replace with icon from your library */}
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#4FD1C5] shrink-0"
              aria-hidden
            >
              <FaCheck className="w-3 h-3 text-[#2a3441]" aria-hidden />
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Data-driven card definitions
const CARDS: Array<{
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
  // CSS gradient class to apply to the circular icon background
  iconBg: string;
  // optional key to identify which icon to render (for your icon library)
  iconKey?: string;
}> = [
  {
    id: "win-rewards",
    title: "Win Rewards",
    subtitle: "Compete in live prediction pools and out-smart the market.",
    bullets: [
      "Over $100k daily pools",
      "Exclusive NFT badges",
      "Weekly top rewards",
    ],
    iconBg: "bg-linear-to-tr from-yellow-400 via-orange-400 to-rose-400",
    iconKey: "trophy",
  },
  {
    id: "learn-experts",
    title: "Learn from Experts",
    subtitle: "Access elite tiers of top-performing traders and analysts.",
    bullets: [
      "Live strategy sessions",
      "Expert Q&A events",
      "Premium leaderboard access",
    ],
    iconBg: "bg-linear-to-tr from-sky-500 via-blue-500 to-indigo-600",
    iconKey: "learn",
  },
  {
    id: "build-reputation",
    title: "Build Reputation",
    subtitle: "Upgrade your credibility and climb the leaderboards.",
    bullets: [
      "Verified track record",
      "Public performance stats",
      "Unlockable badges",
    ],
    iconBg: "bg-linear-to-tr from-emerald-400 via-green-400 to-teal-500",
    iconKey: "chart",
  },
  {
    id: "network-grow",
    title: "Network & Grow",
    subtitle: "Connect with a community of serious traders and investors.",
    bullets: [
      "Private community access",
      "Collaborative opportunities",
      "Mentorship programs",
    ],
    iconBg: "bg-linear-to-tr from-purple-500 via-fuchsia-500 to-pink-500",
    iconKey: "network",
  },
];

export default function WhyJoinValueGrid() {
  return (
    <section className="w-full py-12 sm:py-18 md:py-24">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-8 sm:mb-12">
          Why Join InsightArena?
        </h2>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          aria-label="Why Join InsightArena value grid"
        >
          {CARDS.map((c) => (
            <Card
              key={c.id}
              title={c.title}
              subtitle={c.subtitle}
              bullets={c.bullets}
              iconBg={c.iconBg}
              iconKey={c.iconKey}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
