import { useState, useCallback } from "react";

const DAILY_LIMIT = 2;
const STORAGE_PREFIX = "fixux_audit_";

type FeatureKey = "audit" | "transcript";

interface AuditUsage {
  date: string;
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getStorageKey(userId: string | null, feature: FeatureKey): string {
  return `${STORAGE_PREFIX}${feature}_${userId || "anon"}`;
}

function getUsage(userId: string | null, feature: FeatureKey): AuditUsage {
  try {
    const raw = localStorage.getItem(getStorageKey(userId, feature));
    if (raw) {
      const parsed = JSON.parse(raw) as AuditUsage;
      if (parsed.date === getTodayKey()) return parsed;
    }
  } catch {}
  return { date: getTodayKey(), count: 0 };
}

function setUsage(userId: string | null, feature: FeatureKey, usage: AuditUsage) {
  localStorage.setItem(getStorageKey(userId, feature), JSON.stringify(usage));
}

export function useAuditLimit(userId: string | null, feature: FeatureKey = "audit") {
  const [showLimitPopup, setShowLimitPopup] = useState(false);

  const checkAndIncrement = useCallback((): boolean => {
    if (!userId) return true;
    const usage = getUsage(userId, feature);
    if (usage.count >= DAILY_LIMIT) {
      setShowLimitPopup(true);
      return false;
    }
    setUsage(userId, feature, { date: getTodayKey(), count: usage.count + 1 });
    return true;
  }, [userId, feature]);

  const dismissPopup = useCallback(() => {
    setShowLimitPopup(false);
  }, []);

  const remainingToday = (() => {
    const usage = getUsage(userId, feature);
    return Math.max(0, DAILY_LIMIT - usage.count);
  })();

  return { showLimitPopup, checkAndIncrement, dismissPopup, remainingToday };
}
