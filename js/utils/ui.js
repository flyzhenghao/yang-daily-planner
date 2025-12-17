(function(global) {
    'use strict';

            const getLocalDateStr = (date = new Date()) => {
                const d = new Date(date);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            };

            const calcDuration = (timeFrom, timeTo) => {
                if (!timeFrom || !timeTo) return 0;
                const [h1, m1] = timeFrom.split(":").map(Number);
                const [h2, m2] = timeTo.split(":").map(Number);
                let mins = h2 * 60 + m2 - (h1 * 60 + m1);
                if (mins < 0) mins += 24 * 60;
                return mins;
            };

            const timeStrToMins = (time) => {
                if (!time) return null;
                const [h, m] = time.split(":").map(Number);
                return h * 60 + m;
            };

            const addMinutesToTime = (time, minutes) => {
                if (!time && time !== "00:00") return "";
                const [h, m] = String(time || "")
                    .split(":")
                    .map(Number);
                if (Number.isNaN(h) || Number.isNaN(m)) return "";
                const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
                const hh = String(Math.floor(total / 60)).padStart(2, "0");
                const mm = String(total % 60).padStart(2, "0");
                return `${hh}:${mm}`;
            };

            const getEndDateForRange = (dateStr, timeFrom, timeTo) => {
                const base = new Date(
                    `${dateStr || getLocalDateStr()}T00:00:00`,
                );
                if (Number.isNaN(base.getTime())) return "";
                const fromMins = timeStrToMins(timeFrom);
                const toMins = timeStrToMins(timeTo);
                if (fromMins != null && toMins != null && toMins < fromMins) {
                    base.setDate(base.getDate() + 1);
                }
                return getLocalDateStr(base);
            };

            const getActivityStartDate = (activity) => {
                if (!activity?.date) return null;
                const time = activity.timeFrom || "00:00";
                const d = new Date(`${activity.date}T${time}:00`);
                if (Number.isNaN(d.getTime())) return null;
                return d;
            };

            const formatDuration = (mins) => {
                if (mins <= 0) return "-";
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                if (h > 0 && m > 0) return `${h}h ${m}m`;
                if (h > 0) return `${h}h`;
                return `${m}m`;
            };

            const formatDate = (date) =>
                new Date(date).toLocaleDateString("en-NZ", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            const generateId = () =>
                Date.now() + Math.random().toString(36).substr(2, 9);
            const getLS = (key, def) => {
                try {
                    const s = localStorage.getItem(key);
                    return s ? JSON.parse(s) : def;
                } catch {
                    return def;
                }
            };
            const setLS = (key, val) => {
                try {
                    localStorage.setItem(key, JSON.stringify(val));
                } catch (e) {
                    console.error(e);
                }
            };

            const normalizeGitHubToken = (raw) => {
                const trimmed = String(raw || "").trim();
                if (!trimmed) return "";
                try {
                    const parsed = JSON.parse(trimmed);
                    if (typeof parsed === "string") return parsed.trim();
                } catch {}
                return trimmed;
            };

            const getGitHubToken = () => {
                try {
                    return normalizeGitHubToken(
                        localStorage.getItem(GITHUB_TOKEN_KEY),
                    );
                } catch {
                    return "";
                }
            };

            const setGitHubToken = (token) => {
                try {
                    const trimmed = String(token || "").trim();
                    if (!trimmed) {
                        localStorage.removeItem(GITHUB_TOKEN_KEY);
                        return;
                    }
                    localStorage.setItem(GITHUB_TOKEN_KEY, trimmed);
                } catch (e) {
                    console.error(e);
                }
            };

            const clearGitHubToken = () => {
                try {
                    localStorage.removeItem(GITHUB_TOKEN_KEY);
                } catch {}
            };

            const OPTIMIZER_IGNORED_KEY = "yang_optimizer_ignored_issues";
            const OPTIMIZER_GAPS_ENABLED_KEY = "yang_optimizer_gaps_enabled";
            const OPTIMIZER_CATEGORY_ENABLED_KEY =
                "yang_optimizer_category_enabled";
            const OPTIMIZER_TIME_ENABLED_KEY = "yang_optimizer_time_enabled";
            const REMINDER_ENABLED_KEY = "yang_reminder_enabled";

            const minsToTimeStr = (mins) => {
                if (mins == null || Number.isNaN(mins)) return "";
                const m = ((Math.round(mins) % 1440) + 1440) % 1440;
                const h = Math.floor(m / 60);
                const mm = m % 60;
                return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
            };

            const isOtherCategoryName = (name) => {
                const raw = String(name || "").trim();
                if (!raw) return false;
                if (/other/i.test(raw)) return true;
                if (raw.includes("其他") || raw.includes("其它")) return true;
                return false;
            };

            const normalizeTextForMatch = (text) => {
                return String(text || "")
                    .trim()
                    .toLowerCase()
                    .replace(/[\u2014\u2013]/g, "-")
                    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();
            };

            const extractCategoryCandidate = (item) => {
                const raw = String(item || "").trim();
                if (!raw) return null;
                const firstPart = raw.split(/\s*[-–—:|>]+\s*/)[0]?.trim();
                if (!firstPart) return null;
                const cleaned = firstPart.replace(/\s+/g, " ").trim();
                if (cleaned.length < 2) return null;
                return cleaned.length > 28
                    ? cleaned.slice(0, 28).trim()
                    : cleaned;
            };

            const buildActivityHistoryIndex = (activities) => {
                const byItem = new Map();
                for (const a of activities || []) {
                    const itemKey = normalizeTextForMatch(a.item);
                    if (!itemKey) continue;
                    const entry = byItem.get(itemKey) || {
                        item: String(a.item || "").trim(),
                        total: 0,
                        categories: new Map(),
                    };
                    entry.total += 1;
                    const cat = String(a.category || "");
                    entry.categories.set(
                        cat,
                        (entry.categories.get(cat) || 0) + 1,
                    );
                    if (
                        a.item &&
                        String(a.item).trim().length >
                            String(entry.item || "").length
                    ) {
                        entry.item = String(a.item).trim();
                    }
                    byItem.set(itemKey, entry);
                }
                return { byItem };
            };

            const buildCategoryKeywordIndex = (categories) => {
                const keywordIndex = new Map();
                for (const c of categories || []) {
                    const name = String(c.name || "");
                    const lower = name.toLowerCase();

                    let keywords = [];
                    if (
                        lower === "study" ||
                        lower.includes("study") ||
                        name.includes("学习")
                    ) {
                        keywords = [
                            "study",
                            "homework",
                            "revision",
                            "revise",
                            "read",
                            "reading",
                            "school",
                            "class",
                            "lesson",
                            "tutor",
                            "tuition",
                            "exam",
                            "quiz",
                            "assignment",
                            "project",
                            "research",
                            "coding",
                            "code",
                            "program",
                            "leetcode",
                            "学习",
                            "作业",
                            "复习",
                            "阅读",
                            "上课",
                            "补习",
                            "考试",
                            "测验",
                            "项目",
                            "编程",
                        ];
                    } else if (
                        lower === "entertainment" ||
                        lower.includes("entertain") ||
                        name.includes("娱乐")
                    ) {
                        keywords = [
                            "game",
                            "gaming",
                            "youtube",
                            "video",
                            "tv",
                            "movie",
                            "netflix",
                            "tiktok",
                            "music",
                            "play",
                            "fun",
                            "动漫",
                            "游戏",
                            "视频",
                            "电视",
                            "电影",
                            "音乐",
                            "娱乐",
                        ];
                    } else if (
                        lower === "social" ||
                        lower.includes("social") ||
                        name.includes("社交") ||
                        name.includes("朋友")
                    ) {
                        keywords = [
                            "chat",
                            "call",
                            "meet",
                            "party",
                            "hangout",
                            "family",
                            "friend",
                            "friends",
                            "talk",
                            "social",
                            "dinner",
                            "聚会",
                            "聊天",
                            "通话",
                            "见面",
                            "朋友",
                            "家人",
                            "社交",
                        ];
                    } else if (
                        lower === "exercise" ||
                        lower.includes("exercise") ||
                        lower.includes("sport") ||
                        name.includes("运动") ||
                        name.includes("健身")
                    ) {
                        keywords = [
                            "gym",
                            "run",
                            "running",
                            "walk",
                            "walking",
                            "workout",
                            "exercise",
                            "sport",
                            "training",
                            "swim",
                            "swimming",
                            "basketball",
                            "football",
                            "soccer",
                            "tennis",
                            "yoga",
                            "跑步",
                            "散步",
                            "健身",
                            "运动",
                            "训练",
                            "游泳",
                            "篮球",
                            "足球",
                            "瑜伽",
                        ];
                    } else if (
                        lower === "sleep" ||
                        lower.includes("sleep") ||
                        name.includes("睡")
                    ) {
                        keywords = [
                            "sleep",
                            "nap",
                            "bed",
                            "rest",
                            "wake",
                            "wakeup",
                            "night",
                            "睡",
                            "睡觉",
                            "午睡",
                            "休息",
                            "起床",
                        ];
                    }

                    const nameNorm = normalizeTextForMatch(name);
                    if (nameNorm) {
                        keywords.push(...nameNorm.split(" ").filter(Boolean));
                    }

                    const deduped = [
                        ...new Set(
                            keywords
                                .map((k) => normalizeTextForMatch(k))
                                .filter((k) => k && k.length >= 2),
                        ),
                    ];
                    keywordIndex.set(name, deduped);
                }
                return keywordIndex;
            };

            const suggestCategoryBySemantic = (
                item,
                categories,
                keywordIndex,
            ) => {
                const itemNorm = normalizeTextForMatch(item);
                if (!itemNorm) return null;
                let best = null;
                for (const c of categories || []) {
                    const name = String(c.name || "");
                    if (isOtherCategoryName(name)) continue;
                    const keywords = keywordIndex.get(name) || [];
                    let score = 0;
                    const matched = [];
                    for (const kw of keywords) {
                        if (itemNorm.includes(kw)) {
                            score += kw.length >= 5 ? 2 : 1;
                            if (matched.length < 3) matched.push(kw);
                        }
                    }
                    if (!best || score > best.score) {
                        best = { category: name, score, matched };
                    }
                }
                if (!best || best.score < 2) return null;
                return best;
            };

            const suggestCategoryByHistory = (item, historyIndex) => {
                const key = normalizeTextForMatch(item);
                if (!key) return null;
                const entry = historyIndex?.byItem?.get(key);
                if (!entry) return null;
                const breakdown = [...entry.categories.entries()]
                    .filter(([name]) => name)
                    .sort((a, b) => b[1] - a[1]);
                if (breakdown.length === 0) return null;
                const [topCategory, topCount] = breakdown[0];
                const confidence = topCount / entry.total;
                return {
                    topCategory,
                    topCount,
                    confidence,
                    total: entry.total,
                    breakdown,
                };
            };

            const intervalOverlapMins = (startA, endA, startB, endB) => {
                return Math.max(
                    0,
                    Math.min(endA, endB) - Math.max(startA, startB),
                );
            };

            const suggestActivityByTimeWindow = (
                windowStartMins,
                windowEndMins,
                historyActivities,
            ) => {
                if (windowStartMins == null || windowEndMins == null)
                    return null;
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
                        entry.categories.set(
                            cat,
                            (entry.categories.get(cat) || 0) + 1,
                        );
                    if (
                        a.item &&
                        String(a.item).trim().length >
                            String(entry.item || "").length
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
                const topCategory = [
                    ...(best.categories || new Map()).entries(),
                ].sort((a, b) => b[1] - a[1])[0]?.[0];

                return {
                    item: best.item,
                    category: topCategory || "",
                    count: best.count,
                };
            };

            const analyzeActivitiesOptimizer = ({
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
                    (statuses || []).find((s) => /^finished$/i.test(s.name))
                        ?.name || statuses?.[0]?.name;

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
                        if (!scopeByItem.has(itemKey))
                            scopeByItem.set(itemKey, []);
                        scopeByItem.get(itemKey).push(a);
                    }

                    // Activity ↔ Category checks (history + semantic)
                    for (const [itemKey, group] of scopeByItem.entries()) {
                        const displayItem =
                            group.find((x) => x.item && x.item.trim())?.item ||
                            itemKey;

                        const scopeCategoryCounts = new Map();
                        for (const a of group) {
                            const cat = String(a.category || "");
                            scopeCategoryCounts.set(
                                cat,
                                (scopeCategoryCounts.get(cat) || 0) + 1,
                            );
                        }
                        const scopeBreakdown = [
                            ...scopeCategoryCounts.entries(),
                        ].sort((a, b) => b[1] - a[1]);
                        const scopeTopCategory = scopeBreakdown[0]?.[0] || "";

                        const historyRec = suggestCategoryByHistory(
                            displayItem,
                            historyIndex,
                        );
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
                            .filter(
                                (a) =>
                                    normalizeTextForMatch(a?.item) === itemKey,
                            )
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
                                              (a) =>
                                                  a.category !==
                                                  historyRec.topCategory,
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
                                              defaultCategory:
                                                  scopeTopCategory || "",
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
                                .filter(
                                    (a) =>
                                        a.category !== recommendation.category,
                                )
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
                            otherCategoryNames.has(
                                String(a.category || "").toLowerCase(),
                            ),
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
                        otherCategoryNames.has(
                            String(a.category || "").toLowerCase(),
                        ),
                    );
                    const scopeOtherByCandidate = new Map();
                    for (const a of scopeOther) {
                        const candidate = extractCategoryCandidate(a.item);
                        const key = normalizeTextForMatch(candidate);
                        if (!candidate || !key) continue;
                        const hist = candidateIndex.get(key);
                        if (!hist || hist.count < cfg.minOtherCandidateCount)
                            continue;
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
                                if (!bySlot.has(slotKey))
                                    bySlot.set(slotKey, []);
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
                                if (next.start < cur.end)
                                    overlaps.push({ cur, next });
                            }
                            if (overlaps.length > 0) {
                                overlaps
                                    .slice(0, 12)
                                    .forEach(({ cur, next }) => {
                                        const overlapStart = Math.max(
                                            cur.start,
                                            next.start,
                                        );
                                        const overlapEnd = Math.min(
                                            cur.end,
                                            next.end,
                                        );
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
                                const prevActs = (
                                    historyActivities || []
                                ).filter(
                                    (a) =>
                                        a.date === prevDate &&
                                        a.timeFrom &&
                                        a.timeTo,
                                );
                                for (const a of prevActs) {
                                    const startPrev = timeStrToMins(a.timeFrom);
                                    const endPrev = timeStrToMins(a.timeTo);
                                    if (startPrev == null || endPrev == null)
                                        continue;
                                    if (endPrev < startPrev && endPrev > 0) {
                                        coverageIntervals.push({
                                            start: 0,
                                            end: endPrev,
                                        });
                                    }
                                }
                            }

                            const merged = [];
                            for (const it of coverageIntervals) {
                                const start = Math.max(
                                    0,
                                    Math.min(it.start, 1440),
                                );
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
                                    gaps.push({
                                        start: cursor,
                                        end: block.start,
                                    });
                                }
                                cursor = Math.max(cursor, block.end);
                            }
                            if (cursor < 1440)
                                gaps.push({ start: cursor, end: 1440 });

                            const bigGaps = gaps
                                .map((g) => ({
                                    ...g,
                                    duration: g.end - g.start,
                                }))
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
                                            (k) =>
                                                k.start === g.start &&
                                                k.end === g.end,
                                        )
                                    ) {
                                        keep.push(g);
                                    }
                                }
                                keep.sort((a, b) => a.start - b.start);

                                for (const g of keep) {
                                    const from = minsToTimeStr(g.start);
                                    const to = minsToTimeStr(g.end);
                                    const suggestSleep =
                                        g.start >= 22 * 60 || g.end <= 7 * 60;
                                    const actions = [];

                                    const historySuggestion =
                                        suggestActivityByTimeWindow(
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
                                            (c) =>
                                                c.name === suggestedCategoryRaw,
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
                                                    ? {
                                                          status: finishedStatusName,
                                                      }
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
                    return String(a.meta || "").localeCompare(
                        String(b.meta || ""),
                    );
                });

                return { issues };
            };

            async function loadDataFromGitHub(forceRemote = false) {
                try {
                    const response = await fetch(`data.json?t=${Date.now()}`, {
                        cache: "no-cache",
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const remoteUpdated = data.lastUpdated
                            ? Date.parse(data.lastUpdated)
                            : 0;
                        const localUpdated = getLS("yang_last_updated", 0) || 0;

                        // If forceRemote is true, always use remote data
                        if (
                            !forceRemote &&
                            localUpdated &&
                            localUpdated > remoteUpdated
                        ) {
                            console.log(
                                "📱 Using local data (newer than remote)",
                            );
                            return {
                                activities: getLS("yang_activities", []),
                                categories: getLS(
                                    "yang_categories",
                                    defaultCategories,
                                ),
                                statuses: getLS(
                                    "yang_statuses",
                                    defaultStatuses,
                                ),
                            };
                        }

                        console.log("☁️ Using remote data from GitHub");
                        if (data.activities)
                            setLS("yang_activities", data.activities);
                        if (data.categories)
                            setLS("yang_categories", data.categories);
                        if (data.statuses)
                            setLS("yang_statuses", data.statuses);
                        setLS("yang_last_updated", remoteUpdated || Date.now());
                        return data;
                    }
                } catch (error) {
                    console.log("Using localStorage fallback");
                }
                return {
                    activities: getLS("yang_activities", []),
                    categories: getLS("yang_categories", defaultCategories),
                    statuses: getLS("yang_statuses", defaultStatuses),
                };
            }

            async function saveDataToGitHub(activities, categories, statuses) {
                const token = getGitHubToken();
                if (!token) {
                    console.warn("⚠️ GitHub token not configured");
                    return false;
                }
                try {
                    const dataObj = {
                        version: APP_VERSION,
                        lastUpdated: new Date().toISOString(),
                        activities,
                        categories,
                        statuses,
                    };
                    const content = JSON.stringify(dataObj, null, 2);
                    const encodedContent = btoa(
                        unescape(encodeURIComponent(content)),
                    );
                    const getResponse = await fetch(
                        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}&t=${Date.now()}`,
                        {
                            headers: {
                                Authorization: `token ${token}`,
                                Accept: "application/vnd.github.v3+json",
                            },
                            cache: "no-cache",
                        },
                    );
                    if (!getResponse.ok)
                        throw new Error(
                            `Failed to get file info: ${getResponse.status}`,
                        );
                    const fileData = await getResponse.json();
                    const updateResponse = await fetch(
                        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
                        {
                            method: "PUT",
                            headers: {
                                Authorization: `token ${token}`,
                                Accept: "application/vnd.github.v3+json",
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                message: `Update data - ${new Date().toISOString()}`,
                                content: encodedContent,
                                sha: fileData.sha,
                                branch: GITHUB_BRANCH,
                            }),
                        },
                    );
                    if (!updateResponse.ok) throw new Error("Failed to save");
                    console.log("✅ Successfully saved to GitHub");
                    return true;
                } catch (error) {
                    console.error("Error saving to GitHub:", error);
                    return false;
                }
            }

            function PieChart({ data, totalLabel, onHover, hoveredCategory }) {
                const total = data.reduce((s, i) => s + i.value, 0);
                if (total === 0)
                    return (
                        <div
                            className="empty-state"
                            style={{ padding: "40px 20px" }}
                        >
                            <div className="empty-icon">📊</div>
                            <p>No data</p>
                        </div>
                    );
                let parts = [],
                    angle = 0;
                data.forEach((i) => {
                    const a = (i.value / total) * 360;
                    parts.push(`${i.color} ${angle}deg ${angle + a}deg`);
                    angle += a;
                });
                return (
                    <div className="pie-chart-container">
                        <div
                            className="pie-chart"
                            style={{
                                background: `conic-gradient(${parts.join(", ")})`,
                            }}
                        >
                            <div className="pie-chart-inner">
                                <div className="pie-chart-total">
                                    {Math.round(total / 60)}h
                                </div>
                                <div className="pie-chart-label">
                                    {totalLabel || "Total"}
                                </div>
                            </div>
                        </div>
                        <div className="pie-legend">
                            {data.map((i, idx) => (
                                <div
                                    key={idx}
                                    className={`legend-item ${hoveredCategory === i.name ? "hovered" : ""}`}
                                    onMouseEnter={(e) => onHover(i.name, e)}
                                    onMouseLeave={() => onHover(null)}
                                >
                                    <div
                                        className="legend-color"
                                        style={{ background: i.color }}
                                    ></div>
                                    <span>
                                        {i.icon} {i.name}
                                    </span>
                                    <span className="legend-value">
                                        {Math.round(i.value)}m
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            function BarChart({ data }) {
                const max = Math.max(...data.map((d) => d.value), 1);
                if (data.length === 0)
                    return (
                        <div
                            className="empty-state"
                            style={{ padding: "40px 20px" }}
                        >
                            <div className="empty-icon">📊</div>
                            <p>No data</p>
                        </div>
                    );
                return (
                    <div className="bar-chart-container">
                        {data.map((i, idx) => (
                            <div key={idx} className="bar-chart-item">
                                <div className="bar-label">{i.name}</div>
                                <div className="bar-track">
                                    <div
                                        className="bar-fill"
                                        style={{
                                            width: `${Math.max((i.value / max) * 100, i.value > 0 ? 10 : 0)}%`,
                                            background: i.color,
                                        }}
                                    >
                                        {i.value > 0 && (
                                            <span className="bar-value">
                                                {i.value}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            function Tooltip({ activities, category, position }) {
                if (!activities || activities.length === 0) return null;

                const sortedActivities = [...activities].sort((a, b) => {
                    return (
                        calcDuration(b.timeFrom, b.timeTo) -
                        calcDuration(a.timeFrom, a.timeTo)
                    );
                });

                return (
                    <div
                        className="tooltip"
                        style={{
                            left: position.x,
                            top: position.y,
                        }}
                    >
                        <h4>{category}</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Duration</th>
                                    <th>Activity</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedActivities.map((a) => (
                                    <tr key={a.id}>
                                        <td>
                                            {formatDuration(
                                                calcDuration(
                                                    a.timeFrom,
                                                    a.timeTo,
                                                ),
                                            )}
                                        </td>
                                        <td>{a.item}</td>
                                        <td>{a.date}</td>
                                        <td>
                                            {a.timeFrom} - {a.timeTo}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            }

    global.getLocalDateStr = getLocalDateStr;
    global.calcDuration = calcDuration;
    global.timeStrToMins = timeStrToMins;
    global.addMinutesToTime = addMinutesToTime;
    global.getEndDateForRange = getEndDateForRange;
    global.getActivityStartDate = getActivityStartDate;
    global.formatDuration = formatDuration;
    global.formatDate = formatDate;
    global.generateId = generateId;
    global.getLS = getLS;
    global.setLS = setLS;
    global.normalizeGitHubToken = normalizeGitHubToken;
    global.getGitHubToken = getGitHubToken;
    global.setGitHubToken = setGitHubToken;
    global.clearGitHubToken = clearGitHubToken;
    global.minsToTimeStr = minsToTimeStr;
    global.isOtherCategoryName = isOtherCategoryName;
    global.normalizeTextForMatch = normalizeTextForMatch;
    global.extractCategoryCandidate = extractCategoryCandidate;
    global.loadDataFromGitHub = loadDataFromGitHub;
    global.saveDataToGitHub = saveDataToGitHub;

})(window);
