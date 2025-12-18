// ============================================================================
// analyzer.js
// Main optimizer analysis engine
// ============================================================================

import {
    buildActivityHistoryIndex,
    buildCategoryKeywordIndex,
    suggestCategoryBySemantic,
    suggestCategoryByHistory,
} from "./categoryMatcher.js";
import { suggestActivityByTimeWindow } from "./timeSuggester.js";
import {
    normalizeTextForMatch,
    isOtherCategoryName,
    extractCategoryCandidate,
} from "../utils/formatUtils.js";
import { timeStrToMins, minsToTimeStr, getLocalDateStr } from "../utils/dateUtils.js";

/**
 * Analyze activities and generate optimization suggestions
 * @param {Object} params - Analysis parameters
 * @param {Array} params.scopeActivities - Activities in current scope
 * @param {Array} params.historyActivities - Historical activities
 * @param {Array} params.categories - Available categories
 * @param {Array} params.statuses - Available statuses
 * @param {Object} params.options - Configuration options
 * @returns {Object} Analysis results with issues array
 */
export const analyzeActivitiesOptimizer = ({
    scopeActivities,
    historyActivities,
    categories,
    statuses,
    options = {},
}) => {
    const cfg = {
        gapMinMins: 30,
        maxGapsPerDay: 5,
        enableCategory: true,
        enableTime: true,
        enableGaps: true,
        historyConfidence: 0.6,
        minOtherCandidateCount: 3,
        ...options,
    };

    const issues = [];
    const categoryNamesLower = new Set(
        (categories || [])
            .map((c) => normalizeTextForMatch(c.name))
            .filter(Boolean),
    );
    const otherCategoryNames = new Set(
        (categories || [])
            .map((c) => c.name)
            .filter(isOtherCategoryName)
            .map((n) => String(n).toLowerCase()),
    );

    const finishedStatusName =
        (statuses || []).find((s) => /^finished$/i.test(s.name))?.name ||
        statuses?.[0]?.name;

    const sleepCategoryName =
        (categories || []).find(
            (c) =>
                /^sleep$/i.test(String(c.name || "")) ||
                String(c.name || "").includes("睡"),
        )?.name || null;

    const historyIndex = cfg.enableCategory
        ? buildActivityHistoryIndex(historyActivities)
        : null;
    const keywordIndex = cfg.enableCategory
        ? buildCategoryKeywordIndex(categories)
        : null;

    if (cfg.enableCategory) {
        // Group scope activities by normalized item
        const scopeByItem = new Map();
        for (const a of scopeActivities || []) {
            const itemKey = normalizeTextForMatch(a.item);
            if (!itemKey) continue;
            if (!scopeByItem.has(itemKey)) scopeByItem.set(itemKey, []);
            scopeByItem.get(itemKey).push(a);
        }

        // Activity ↔ Category checks (history + semantic)
        for (const [itemKey, group] of scopeByItem.entries()) {
            const displayItem =
                group.find((x) => x.item && x.item.trim())?.item || itemKey;

            const scopeCategoryCounts = new Map();
            for (const a of group) {
                const cat = String(a.category || "");
                scopeCategoryCounts.set(
                    cat,
                    (scopeCategoryCounts.get(cat) || 0) + 1,
                );
            }
            const scopeBreakdown = [...scopeCategoryCounts.entries()].sort(
                (a, b) => b[1] - a[1],
            );
            const scopeTopCategory = scopeBreakdown[0]?.[0] || "";

            const historyRec = suggestCategoryByHistory(displayItem, historyIndex);
            const semanticRec = suggestCategoryBySemantic(
                displayItem,
                categories,
                keywordIndex,
            );

            const recommendation =
                historyRec &&
                historyRec.topCategory &&
                historyRec.confidence >= cfg.historyConfidence
                    ? {
                          category: historyRec.topCategory,
                          source: "history",
                          confidence: historyRec.confidence,
                      }
                    : semanticRec &&
                        semanticRec.category &&
                        semanticRec.score >= 3
                      ? {
                            category: semanticRec.category,
                            source: "semantic",
                            matched: semanticRec.matched,
                        }
                      : null;

            const relatedIdsAll = (historyActivities || [])
                .filter((a) => normalizeTextForMatch(a?.item) === itemKey)
                .map((a) => a.id)
                .filter(Boolean);

            if (historyRec && historyRec.breakdown.length > 1) {
                const breakdownText = historyRec.breakdown
                    .slice(0, 4)
                    .map(([cat, count]) => `${cat} ${count}`)
                    .join(", ");

                const idsToFix =
                    historyRec.topCategory &&
                    historyRec.confidence >= cfg.historyConfidence
                        ? group
                              .filter(
                                  (a) => a.category !== historyRec.topCategory,
                              )
                              .map((a) => a.id)
                              .filter(Boolean)
                        : [];

                const actions = [
                    ...(idsToFix.length > 0
                        ? [
                              {
                                  kind: "applyCategory",
                                  label: `Apply "${historyRec.topCategory}" to ${idsToFix.length} activities`,
                                  category: historyRec.topCategory,
                                  ids: idsToFix,
                              },
                          ]
                        : []),
                    ...(relatedIdsAll.length > 0
                        ? [
                              {
                                  kind: "bulkEdit",
                                  label: `Manual edit ${relatedIdsAll.length} related activities`,
                                  ids: relatedIdsAll,
                                  title: `Manual edit related: "${displayItem}"`,
                                  defaultCategory:
                                      historyRec.topCategory ||
                                      scopeTopCategory ||
                                      "",
                              },
                          ]
                        : []),
                ];

                issues.push({
                    id: `hist-${itemKey}`,
                    kind: "category",
                    severity: idsToFix.length > 0 ? "warn" : "info",
                    title: `Category consistency: "${displayItem}"`,
                    meta: `History: ${breakdownText}`,
                    details:
                        idsToFix.length > 0
                            ? `Recommend "${historyRec.topCategory}" (${Math.round(historyRec.confidence * 100)}% in history).`
                            : "This activity has been logged under multiple categories in the past.",
                    actions,
                });
            } else if (scopeBreakdown.length > 1) {
                const actions =
                    relatedIdsAll.length > 0
                        ? [
                              {
                                  kind: "bulkEdit",
                                  label: `Manual edit ${relatedIdsAll.length} related activities`,
                                  ids: relatedIdsAll,
                                  title: `Manual edit related: "${displayItem}"`,
                                  defaultCategory: scopeTopCategory || "",
                              },
                          ]
                        : [];

                issues.push({
                    id: `scope-${itemKey}`,
                    kind: "category",
                    severity: "warn",
                    title: `Category inconsistent in current view: "${displayItem}"`,
                    meta: `Current view: ${scopeBreakdown
                        .slice(0, 4)
                        .map(([cat, count]) => `${cat} ${count}`)
                        .join(", ")}`,
                    details:
                        "Consider standardizing this activity to a single category.",
                    actions,
                });
            }

            const skipRec =
                recommendation &&
                recommendation.source === "history" &&
                historyRec &&
                historyRec.breakdown.length > 1;
            if (
                !skipRec &&
                recommendation &&
                recommendation.category &&
                scopeTopCategory &&
                scopeTopCategory !== recommendation.category
            ) {
                const idsToFix = group
                    .filter((a) => a.category !== recommendation.category)
                    .map((a) => a.id)
                    .filter(Boolean);
                if (idsToFix.length > 0) {
                    const detail =
                        recommendation.source === "history"
                            ? `History suggests "${recommendation.category}" (${Math.round((recommendation.confidence || 0) * 100)}% in history).`
                            : `Semantic match suggests "${recommendation.category}"${
                                  recommendation.matched?.length
                                      ? ` (matched: ${recommendation.matched.join(", ")})`
                                      : ""
                              }.`;
                    issues.push({
                        id: `rec-${itemKey}`,
                        kind: "category",
                        severity: "info",
                        title: `Category suggestion: "${displayItem}"`,
                        meta: `Current: ${scopeTopCategory}`,
                        details: detail,
                        actions: [
                            {
                                kind: "applyCategory",
                                label: `Apply "${recommendation.category}" to ${idsToFix.length} activities`,
                                category: recommendation.category,
                                ids: idsToFix,
                            },
                        ],
                    });
                }
            }

            const groupHasOther = group.some((a) =>
                otherCategoryNames.has(String(a.category || "").toLowerCase()),
            );
            if (
                groupHasOther &&
                recommendation &&
                recommendation.category &&
                !isOtherCategoryName(recommendation.category)
            ) {
                const idsToFix = group
                    .filter((a) =>
                        otherCategoryNames.has(
                            String(a.category || "").toLowerCase(),
                        ),
                    )
                    .map((a) => a.id)
                    .filter(Boolean);
                if (idsToFix.length > 0) {
                    issues.push({
                        id: `other-existing-${itemKey}`,
                        kind: "other",
                        severity: "warn",
                        title: `Other looks specific: "${displayItem}"`,
                        meta: `Suggest: ${recommendation.category}`,
                        details:
                            "This activity is tagged as Other but appears to fit an existing category.",
                        actions: [
                            {
                                kind: "applyCategory",
                                label: `Move ${idsToFix.length} to "${recommendation.category}"`,
                                category: recommendation.category,
                                ids: idsToFix,
                            },
                        ],
                    });
                }
            }
        }

        // Suggest new categories for "Other"
        const candidateIndex = new Map();
        for (const a of historyActivities || []) {
            const catLower = String(a.category || "").toLowerCase();
            if (!otherCategoryNames.has(catLower)) continue;
            const candidate = extractCategoryCandidate(a.item);
            const candidateKey = normalizeTextForMatch(candidate);
            if (!candidate || !candidateKey) continue;
            if (isOtherCategoryName(candidate)) continue;
            if (categoryNamesLower.has(candidateKey)) continue;

            const entry = candidateIndex.get(candidateKey) || {
                label: candidate,
                count: 0,
                examples: [],
            };
            entry.count += 1;
            if (entry.examples.length < 3 && a.item) {
                entry.examples.push(a.item);
            }
            candidateIndex.set(candidateKey, entry);
        }

        const scopeOther = (scopeActivities || []).filter((a) =>
            otherCategoryNames.has(String(a.category || "").toLowerCase()),
        );
        const scopeOtherByCandidate = new Map();
        for (const a of scopeOther) {
            const candidate = extractCategoryCandidate(a.item);
            const key = normalizeTextForMatch(candidate);
            if (!candidate || !key) continue;
            const hist = candidateIndex.get(key);
            if (!hist || hist.count < cfg.minOtherCandidateCount) continue;
            if (!scopeOtherByCandidate.has(key))
                scopeOtherByCandidate.set(key, []);
            scopeOtherByCandidate.get(key).push(a);
        }

        for (const [key, acts] of scopeOtherByCandidate.entries()) {
            const info = candidateIndex.get(key);
            const ids = acts.map((a) => a.id).filter(Boolean);
            issues.push({
                id: `other-newcat-${key}`,
                kind: "other",
                severity: "info",
                title: `New category candidate`,
                meta: `Seen ${info.count}× under Other (history)`,
                suggestedName: info.label,
                details: info.examples.length
                    ? `Examples: ${info.examples.join(" · ")}`
                    : "Frequently logged under Other.",
                actions: [
                    {
                        kind: "createCategory",
                        label: "Create category",
                        defaultName: info.label,
                    },
                    ...(ids.length > 0
                        ? [
                              {
                                  kind: "applyCategory",
                                  label: `Apply to ${ids.length} activities in view`,
                                  ids,
                                  alsoCreate: true,
                                  defaultName: info.label,
                              },
                          ]
                        : []),
                ],
            });
        }
    }

    // Time checks per day
    if (cfg.enableTime || cfg.enableGaps) {
        const scopeByDate = new Map();
        for (const a of scopeActivities || []) {
            const date = String(a.date || "");
            if (!date) continue;
            if (!scopeByDate.has(date)) scopeByDate.set(date, []);
            scopeByDate.get(date).push(a);
        }

        for (const [date, dayActsRaw] of scopeByDate.entries()) {
            const missingTimeActs = (dayActsRaw || []).filter(
                (a) => !a.timeFrom || !a.timeTo,
            );
            if (cfg.enableTime && missingTimeActs.length > 0) {
                issues.push({
                    id: `missing-time-${date}`,
                    kind: "time",
                    severity: "info",
                    title: `Missing time fields (${missingTimeActs.length})`,
                    meta: date,
                    details:
                        "Some activities are missing start/end time, so overlap and gap checks may be incomplete.",
                    actions: [],
                });
            }

            const dayActs = (dayActsRaw || []).filter(
                (a) => a.timeFrom && a.timeTo,
            );
            if (dayActs.length === 0) continue;

            if (cfg.enableTime) {
                // Duplicate time slots
                const bySlot = new Map();
                for (const a of dayActs) {
                    const slotKey = `${a.timeFrom || ""}|${a.timeTo || ""}`;
                    if (!bySlot.has(slotKey)) bySlot.set(slotKey, []);
                    bySlot.get(slotKey).push(a);
                }
                const duplicateSlots = [...bySlot.entries()].filter(
                    ([, list]) => list.length > 1,
                );
                if (duplicateSlots.length > 0) {
                    issues.push({
                        id: `duplicate-slot-${date}`,
                        kind: "time",
                        severity: "warn",
                        title: `Duplicate time slots (${duplicateSlots.length})`,
                        meta: date,
                        details: duplicateSlots
                            .slice(0, 8)
                            .map(([slot, list]) => {
                                const [from, to] = slot.split("|");
                                const names = list
                                    .map((x) => x.item)
                                    .filter(Boolean)
                                    .slice(0, 4)
                                    .join(" · ");
                                return `${from}–${to}: ${names}${list.length > 4 ? ` (+${list.length - 4} more)` : ""}`;
                            }),
                        actions: [],
                    });
                }
            }

            const intervals = [];
            for (const a of dayActs) {
                const start = timeStrToMins(a.timeFrom);
                const endRaw = timeStrToMins(a.timeTo);
                if (start == null || endRaw == null) continue;
                let end = endRaw;
                if (end < start) end += 1440;
                intervals.push({ a, start, end });

                if (cfg.enableTime && end === start) {
                    issues.push({
                        id: `zero-duration-${a.id}`,
                        kind: "time",
                        severity: "warn",
                        title: "Zero duration activity",
                        meta: `${date} ${a.timeFrom}–${a.timeTo}`,
                        details: `"${a.item}" has the same start and end time.`,
                        actions: [],
                    });
                } else if (cfg.enableTime && end - start < 5) {
                    issues.push({
                        id: `tiny-duration-${a.id}`,
                        kind: "time",
                        severity: "info",
                        title: `Very short activity (${end - start}m)`,
                        meta: `${date} ${a.timeFrom}–${a.timeTo}`,
                        details: `"${a.item}" might be better merged into a larger block.`,
                        actions: [],
                    });
                }
            }

            intervals.sort((x, y) => x.start - y.start);

            if (cfg.enableTime) {
                // Overlaps
                const overlaps = [];
                for (let i = 0; i < intervals.length - 1; i++) {
                    const cur = intervals[i];
                    const next = intervals[i + 1];
                    if (next.start < cur.end) overlaps.push({ cur, next });
                }
                if (overlaps.length > 0) {
                    overlaps.slice(0, 12).forEach(({ cur, next }) => {
                        const overlapStart = Math.max(cur.start, next.start);
                        const overlapEnd = Math.min(cur.end, next.end);
                        const overlapMins = Math.max(
                            0,
                            overlapEnd - overlapStart,
                        );
                        const aId = cur.a?.id;
                        const bId = next.a?.id;
                        issues.push({
                            id: `overlap-${date}-${aId || "a"}-${bId || "b"}`,
                            kind: "time",
                            severity: "error",
                            title: `Time overlap (${overlapMins}m)`,
                            meta: `${date} · ${cur.a.timeFrom}–${cur.a.timeTo} vs ${next.a.timeFrom}–${next.a.timeTo}`,
                            details: `"${cur.a.item}" overlaps "${next.a.item}".`,
                            actions: [
                                ...(aId
                                    ? [
                                          {
                                              kind: "editActivity",
                                              label: `Edit "${cur.a.item}"`,
                                              activityId: aId,
                                          },
                                      ]
                                    : []),
                                ...(bId
                                    ? [
                                          {
                                              kind: "editActivity",
                                              label: `Edit "${next.a.item}"`,
                                              activityId: bId,
                                          },
                                      ]
                                    : []),
                            ],
                        });
                    });
                    if (overlaps.length > 12) {
                        issues.push({
                            id: `overlap-more-${date}`,
                            kind: "time",
                            severity: "info",
                            title: "More overlaps not shown",
                            meta: date,
                            details: `${overlaps.length - 12} more overlaps exist. Fix some overlaps and re-run.`,
                            actions: [],
                        });
                    }
                }
            }

            if (cfg.enableGaps) {
                // Gaps (00:00–24:00), including carry-over from previous day
                const coverageIntervals = intervals.map((it) => ({
                    start: it.start,
                    end: it.end,
                }));

                const prevDateObj = new Date(date + "T00:00:00");
                if (!Number.isNaN(prevDateObj.getTime())) {
                    prevDateObj.setDate(prevDateObj.getDate() - 1);
                    const prevDate = getLocalDateStr(prevDateObj);
                    const prevActs = (historyActivities || []).filter(
                        (a) => a.date === prevDate && a.timeFrom && a.timeTo,
                    );
                    for (const a of prevActs) {
                        const startPrev = timeStrToMins(a.timeFrom);
                        const endPrev = timeStrToMins(a.timeTo);
                        if (startPrev == null || endPrev == null) continue;
                        if (endPrev < startPrev && endPrev > 0) {
                            coverageIntervals.push({ start: 0, end: endPrev });
                        }
                    }
                }

                const merged = [];
                for (const it of coverageIntervals) {
                    const start = Math.max(0, Math.min(it.start, 1440));
                    const end = Math.max(0, Math.min(it.end, 1440));
                    if (end <= start) continue;
                    const last = merged[merged.length - 1];
                    if (!last || start > last.end) {
                        merged.push({ start, end });
                    } else {
                        last.end = Math.max(last.end, end);
                    }
                }

                const gaps = [];
                let cursor = 0;
                for (const block of merged) {
                    if (block.start > cursor) {
                        gaps.push({ start: cursor, end: block.start });
                    }
                    cursor = Math.max(cursor, block.end);
                }
                if (cursor < 1440) gaps.push({ start: cursor, end: 1440 });

                const bigGaps = gaps
                    .map((g) => ({ ...g, duration: g.end - g.start }))
                    .filter((g) => g.duration >= cfg.gapMinMins);

                if (bigGaps.length > 0) {
                    const keep = [];
                    for (const g of bigGaps) {
                        if (g.start >= 22 * 60 || g.end <= 7 * 60) {
                            keep.push(g);
                        }
                    }
                    const ranked = [...bigGaps].sort(
                        (a, b) => b.duration - a.duration,
                    );
                    for (const g of ranked) {
                        if (keep.length >= cfg.maxGapsPerDay) break;
                        if (
                            !keep.some(
                                (k) => k.start === g.start && k.end === g.end,
                            )
                        ) {
                            keep.push(g);
                        }
                    }
                    keep.sort((a, b) => a.start - b.start);

                    for (const g of keep) {
                        const from = minsToTimeStr(g.start);
                        const to = minsToTimeStr(g.end);
                        const suggestSleep = g.start >= 22 * 60 || g.end <= 7 * 60;
                        const actions = [];

                        const historySuggestion = suggestActivityByTimeWindow(
                            g.start,
                            g.end,
                            historyActivities,
                        );
                        const suggestedItem =
                            historySuggestion?.item ||
                            (suggestSleep ? "Sleep" : "");
                        const suggestedCategoryRaw =
                            historySuggestion?.category || "";
                        const suggestedCategory =
                            suggestedCategoryRaw &&
                            (categories || []).some(
                                (c) => c.name === suggestedCategoryRaw,
                            )
                                ? suggestedCategoryRaw
                                : suggestSleep && sleepCategoryName
                                  ? sleepCategoryName
                                  : categories?.[0]?.name || "";

                        actions.push({
                            kind: "addActivity",
                            label: suggestedItem
                                ? `New "${suggestedItem}" ${from}–${to}`
                                : `New activity ${from}–${to}`,
                            prefill: {
                                date,
                                timeFrom: from,
                                timeTo: to,
                                item: suggestedItem,
                                category: suggestedCategory,
                                ...(finishedStatusName
                                    ? { status: finishedStatusName }
                                    : {}),
                            },
                        });
                        if (suggestSleep && sleepCategoryName) {
                            actions.push({
                                kind: "addActivity",
                                label: `Add "Sleep" ${from}–${to}`,
                                prefill: {
                                    date,
                                    timeFrom: from,
                                    timeTo: to,
                                    item: "Sleep",
                                    category: sleepCategoryName,
                                    ...(finishedStatusName
                                        ? { status: finishedStatusName }
                                        : {}),
                                },
                            });
                        }
                        issues.push({
                            id: `gap-${date}-${g.start}-${g.end}`,
                            kind: "gap",
                            severity: "info",
                            title: `Gap ${from}–${to} (${Math.round(g.duration)}m)`,
                            meta: date,
                            details: suggestSleep
                                ? `Likely Sleep time. Consider adding Sleep for ${from}–${to}.`
                                : `Unlogged time. Consider adding an activity for ${from}–${to}.`,
                            actions,
                        });
                    }
                }
            }
        }
    }

    const severityOrder = { error: 0, warn: 1, info: 2 };
    issues.sort((a, b) => {
        const sa = severityOrder[a.severity] ?? 9;
        const sb = severityOrder[b.severity] ?? 9;
        if (sa !== sb) return sa - sb;
        return String(a.meta || "").localeCompare(String(b.meta || ""));
    });

    return { issues };
};
