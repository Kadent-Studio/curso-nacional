"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const expired = diff <= 0;

  return (
    <div className="flex items-baseline gap-2">
      {expired ? (
        <span className="font-display text-2xl italic text-oxblood">Tiempo cumplido</span>
      ) : (
        <span className="font-display text-3xl text-ink">
          {hours > 0 && <>{pad(hours)}<span className="mx-1 text-mute">:</span></>}
          {pad(minutes)}<span className="mx-1 text-mute">:</span>{pad(seconds)}
        </span>
      )}
      {!expired && <span className="text-xs uppercase tracking-[0.2em] text-mute">restantes</span>}
    </div>
  );
}
