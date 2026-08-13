import React, { useState, useEffect } from "react";

const HEART_D =
  "M16,28.2 C16,28.2 3,20.2 3,11.5 C3,6.5 7,3.5 11,3.5 C14,3.5 16,6 16,6 C16,6 18,3.5 21,3.5 C25,3.5 29,6.5 29,11.5 C29,20.2 16,28.2 16,28.2 Z";

export const HeartLoader = ({ progress, size = 120 }: { progress: number; size?: number }) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  const strokeDashOffset = 100 - clampedProgress;

  return (
    <div className="flex flex-col items-center justify-center bg-stone-50 p-6 rounded-2xl">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 32 32" className="w-full h-full">
          {/* Background: gray outline */}
          <path
            className="text-stone-200"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            d={HEART_D}
          />
          {/* Foreground: animating red progress outline.
              pathLength="100" normalizes the path so the dash math is exact. */}
          <path
            className="text-red-500 transition-all duration-300 ease-out"
            stroke="currentColor"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={strokeDashOffset}
            d={HEART_D}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-sm font-semibold text-stone-700">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      </div>

      <span className="mt-4 font-serif text-xs tracking-widest text-stone-400 uppercase">
        Loading Details
      </span>
    </div>
  );
};

export default function Demo() {
  const [progress, setProgress] = useState(38);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : Math.min(100, p + 2)));
    }, 60);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col items-center gap-8">
      <HeartLoader progress={progress} />

      <div className="w-full max-w-md flex flex-col gap-4">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => {
            setPlaying(false);
            setProgress(Number(e.target.value));
          }}
          className="w-full accent-red-500"
          aria-label="Progress"
        />
        <button
          onClick={() => setPlaying((v) => !v)}
          className="self-center px-4 py-2 rounded-full border border-stone-300 text-stone-700 font-serif text-xs tracking-widest uppercase hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          {playing ? "Pause" : "Play"}
        </button>
      </div>
    </div>
  );
}
