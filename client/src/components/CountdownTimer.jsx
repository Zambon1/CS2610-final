import { useEffect, useState } from "react";

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(safeSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function CountdownTimer({ targetTimestamp, label = "Timer", compact = false }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!targetTimestamp) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [targetTimestamp]);

  if (!targetTimestamp) {
    return (
      <div className={compact ? "countdown compact" : "countdown"}>
        <span className="countdown-label">{label}</span>
        <strong className="countdown-value">--:--:--</strong>
      </div>
    );
  }

  const remainingSeconds = Math.max(0, Math.floor((new Date(targetTimestamp).getTime() - now) / 1000));

  return (
    <div className={compact ? "countdown compact" : "countdown"}>
      <span className="countdown-label">{label}</span>
      <strong className="countdown-value">{formatTime(remainingSeconds)}</strong>
    </div>
  );
}

export default CountdownTimer;