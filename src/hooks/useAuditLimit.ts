import { useState, useCallback } from "react";

const DAILY_LIMIT = 2;
const STORAGE_PREFIX = "fixux_audit_";

interface AuditUsage {
  date: string;
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getStorageKey(userId: string | null): string {
  return `${STORAGE_PREFIX}${userId || "anon"}`;
}

function getUsage(userId: string | null): AuditUsage {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as AuditUsage;
      if (parsed.date === getTodayKey()) return parsed;
    }
  } catch {}
  return { date: getTodayKey(), count: 0 };
}

function setUsage(userId: string | null, usage: AuditUsage) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(usage));
}

export function useAuditLimit(userId: string | null) {
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  const checkAndIncrement = useCallback((): boolean => {
    if (!userId) return true; // no limit for non-logged-in
    const usage = getUsage(userId);
    if (usage.count >= DAILY_LIMIT) {
      setShowLimitPopup(true);
      return false;
    }
    setUsage(userId, { date: getTodayKey(), count: usage.count + 1 });
    return true;
  }, [userId]);

  const dismissPopup = useCallback(() => {
    setShowLimitPopup(false);
  }, []);

  const remainingToday = (() => {
    const usage = getUsage(userId);
    return Math.max(0, DAILY_LIMIT - usage.count);
  })();

  return { showLimitPopup, checkAndIncrement, dismissPopup, remainingToday };
}
