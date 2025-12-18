// ============================================================================
// timeSuggester.js
// Time-based activity suggestion engine
// ============================================================================

import { timeStrToMins } from "../utils/dateUtils.js";
import { normalizeTextForMatch } from "../utils/formatUtils.js";

/**
 * Calculate overlap in minutes between two time intervals
 * @param {number} startA - Start time in minutes
 * @param {number} endA - End time in minutes
 * @param {number} startB - Start time in minutes
 * @param {number} endB - End time in minutes
 * @returns {number} Overlap in minutes
 */
export const intervalOverlapMins = (startA, endA, startB, endB) => {
    return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB));
};

/**
 * Suggest activity based on time window historical patterns
 * @param {number} windowStartMins - Window start time in minutes
 * @param {number} windowEndMins - Window end time in minutes
 * @param {Array} historyActivities - Array of historical activities
 * @returns {Object|null} Suggested activity with item, category, and count
 */
export const suggestActivityByTimeWindow = (
    windowStartMins,
    windowEndMins,
    historyActivities,
) => {
    if (windowStartMins == null || windowEndMins == null) return null;
    if (windowEndMins <= windowStartMins) return null;
    const scores = new Map();

    for (const a of historyActivities || []) {
        if (!a?.timeFrom || !a?.timeTo || !a?.item) continue;
        const start = timeStrToMins(a.timeFrom);
        const endRaw = timeStrToMins(a.timeTo);
        if (start == null || endRaw == null) continue;

        let end = endRaw;
        if (end < start) end += 1440;

        const itemKey = normalizeTextForMatch(a.item);
        if (!itemKey) continue;

        let overlap = 0;
        overlap += intervalOverlapMins(
            windowStartMins,
            windowEndMins,
            start,
            Math.min(end, 1440),
        );
        if (end > 1440) {
            overlap += intervalOverlapMins(
                windowStartMins,
                windowEndMins,
                0,
                end - 1440,
            );
        }
        if (overlap <= 0) continue;

        const entry = scores.get(itemKey) || {
            item: String(a.item || "").trim(),
            count: 0,
            minutes: 0,
            categories: new Map(),
        };
        entry.count += 1;
        entry.minutes += overlap;
        const cat = String(a.category || "");
        if (cat)
            entry.categories.set(cat, (entry.categories.get(cat) || 0) + 1);
        if (
            a.item &&
            String(a.item).trim().length > String(entry.item || "").length
        ) {
            entry.item = String(a.item).trim();
        }
        scores.set(itemKey, entry);
    }

    if (scores.size === 0) return null;
    const best = [...scores.values()].sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        if (b.minutes !== a.minutes) return b.minutes - a.minutes;
        return String(a.item).localeCompare(String(b.item));
    })[0];
    const topCategory = [...(best.categories || new Map()).entries()].sort(
        (a, b) => b[1] - a[1],
    )[0]?.[0];

    return {
        item: best.item,
        category: topCategory || "",
        count: best.count,
    };
};
