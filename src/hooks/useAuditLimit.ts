import { useState, useCallback } from "react";

const DAILY_LIMIT = 2;
const STORAGE_KEY = "fixux_audit_usage";

interface AuditUsage {
  date: string;
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getUsage(): AuditUsage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuditUsage;
      if (parsed.date === getTodayKey()) return parsed;
    }
  } catch {}
  return { date: getTodayKey(), count: 0 };
}

function setUsage(usage: AuditUsage) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

export function useAuditLimit() {
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  const checkAndIncrement = useCallback((): boolean => {
    const usage = getUsage();
    if (usage.count >= DAILY_LIMIT) {
      setShowLimitPopup(true);
      return false; // blocked
    }
    setUsage({ date: getTodayKey(), count: usage.count + 1 });
    return true; // allowed
  }, []);

  const dismissPopup = useCallback(() => {
    setShowLimitPopup(false);
  }, []);

  const remainingToday = (() => {
    const usage = getUsage();
    return Math.max(0, DAILY_LIMIT - usage.count);
  })();

  return { showLimitPopup, checkAndIncrement, dismissPopup, remainingToday };
}
