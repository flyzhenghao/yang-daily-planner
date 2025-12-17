(function (global) {
  "use strict";

  global.APP_VERSION = "v2.0.0";
  global.GITHUB_OWNER = "flyzhenghao";
  global.GITHUB_REPO = "yang-daily-planner";
  global.GITHUB_FILE_PATH = "data.json";
  global.GITHUB_BRANCH = "main";
  global.GITHUB_TOKEN_KEY = "yang_github_token";

  global.defaultCategories = [
    { id: 1, name: "Study", color: "#6C5CE7", icon: "📚" },
    { id: 2, name: "Entertainment", color: "#FD79A8", icon: "🎮" },
    { id: 3, name: "Social", color: "#FDCB6E", icon: "👥" },
    { id: 4, name: "Exercise", color: "#00B894", icon: "🏃" },
    { id: 5, name: "Sleep", color: "#74B9FF", icon: "😴" },
    { id: 6, name: "Other", color: "#636E72", icon: "📌" },
  ];
  global.defaultStatuses = [
    { id: 1, name: "Planning", color: "#74B9FF" },
    { id: 2, name: "Processing", color: "#FDCB6E" },
    { id: 3, name: "Finished", color: "#00B894" },
    { id: 4, name: "Partial Finished", color: "#6C5CE7" },
    { id: 5, name: "Abandoned", color: "#B2BEC3" },
  ];
  global.PROFILE_KEY = "yang_profile";
  global.defaultProfile = {
    name: "Yang",
    school: "",
    grade: "Year 9",
    email: "",
    avatarDataUrl: "",
  };

  global.OPTIMIZER_IGNORED_KEY = "yang_optimizer_ignored_issues";
  global.OPTIMIZER_GAPS_ENABLED_KEY = "yang_optimizer_gaps_enabled";
  global.OPTIMIZER_CATEGORY_ENABLED_KEY = "yang_optimizer_category_enabled";
  global.OPTIMIZER_TIME_ENABLED_KEY = "yang_optimizer_time_enabled";
  global.REMINDER_ENABLED_KEY = "yang_reminder_enabled";
})(window);
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
(function (global) {
  "use strict";

  const { useState, useMemo } = React;

  function PieChart({ data, totalLabel, onHover, hoveredCategory }) {
    const total = data.reduce((s, i) => s + i.value, 0);
    if (total === 0)
      return (
        <div className="empty-state" style={{ padding: "40px 20px" }}>
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
            <div className="pie-chart-total">{Math.round(total / 60)}h</div>
            <div className="pie-chart-label">{totalLabel || "Total"}</div>
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
              <span className="legend-value">{Math.round(i.value)}m</span>
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
        <div className="empty-state" style={{ padding: "40px 20px" }}>
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
                {i.value > 0 && <span className="bar-value">{i.value}</span>}
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
        global.calcDuration(b.timeFrom, b.timeTo) -
        global.calcDuration(a.timeFrom, a.timeTo)
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
                  {global.formatDuration(
                    global.calcDuration(a.timeFrom, a.timeTo),
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

  global.PieChart = PieChart;
  global.BarChart = BarChart;
  global.Tooltip = Tooltip;
})(window);
(function (global) {
  "use strict";

  const { useState } = React;

  function ReminderPopup({ activity, onConfirm, onDismiss }) {
    if (!activity) return null;
    return (
      <div className="modal-overlay">
        <div className="modal" style={{ maxWidth: "420px" }}>
          <h2 className="modal-title">⏰ Activity Reminder</h2>
          <p style={{ marginBottom: "8px" }}>
            Planning item <b>{activity.item}</b> is scheduled to start now.
          </p>
          <div
            style={{
              color: "var(--text-secondary)",
              marginBottom: "10px",
            }}
          >
            {global.formatDate(activity.date)} · {activity.timeFrom} -{" "}
            {activity.timeTo}
          </div>
          <p
            style={{
              marginTop: 0,
              color: "var(--text-muted)",
              fontSize: "13px",
            }}
          >
            Confirm to close this reminder. The previous activity will be marked{" "}
            <b>Finished</b> by default.
          </p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onDismiss}>
              Later
            </button>
            <button className="btn btn-primary" onClick={onConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  function ConfirmModal({ title, message, onConfirm, onCancel }) {
    return (
      <div className="modal-overlay">
        <div className="modal" style={{ maxWidth: "400px" }}>
          <h2 className="modal-title">{title}</h2>
          <p>{message}</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  function ReportModal({ onConfirm, onCancel }) {
    const [date, setDate] = useState(global.getLocalDateStr());

    const handleConfirm = () => {
      onConfirm(date);
    };

    return (
      <div className="modal-overlay">
        <div className="modal" style={{ maxWidth: "400px" }}>
          <h2 className="modal-title">Select Report Date</h2>
          <div className="form-group">
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  global.ReminderPopup = ReminderPopup;
  global.ConfirmModal = ConfirmModal;
  global.ReportModal = ReportModal;
})(window);
(function(global) {
    'use strict';

    const { useState, useMemo, useEffect } = React;

            function Modal({
                activity,
                prefill,
                activities,
                categories,
                statuses,
                onSave,
                onClose,
            }) {
                const defaultForm = {
                    date: getLocalDateStr(),
                    timeFrom: "",
                    timeTo: "",
                    item: "",
                    category: categories[0]?.name || "",
                    status: statuses[0]?.name || "",
                    notes: "",
                };
                const [form, setForm] = useState(
                    activity || { ...defaultForm, ...(prefill || {}) },
                );
                const [suggestions, setSuggestions] = useState([]);
                const [keepOpen, setKeepOpen] = useState(false);
                const endsNextDay = useMemo(() => {
                    const from = timeStrToMins(form.timeFrom);
                    const to = timeStrToMins(form.timeTo);
                    if (from == null || to == null) return false;
                    return to < from;
                }, [form.timeFrom, form.timeTo]);
                const inferredEndDate = useMemo(
                    () =>
                        getEndDateForRange(
                            form.date,
                            form.timeFrom,
                            form.timeTo,
                        ),
                    [form.date, form.timeFrom, form.timeTo],
                );

                const handleChange = (field, value) => {
                    setForm((prev) => {
                        const next = { ...prev, [field]: value };
                        if (field === "timeFrom" && value && !prev.timeTo) {
                            next.timeTo = addMinutesToTime(value, 60);
                        }
                        return next;
                    });
                    if (field === "item" && value.length > 2) {
                        const uniqueItems = [
                            ...new Set(
                                activities.map((a) => a.item.toLowerCase()),
                            ),
                        ];
                        setSuggestions(
                            uniqueItems.filter((i) =>
                                i.includes(value.toLowerCase()),
                            ),
                        );
                    } else {
                        setSuggestions([]);
                    }
                };

                const handleSuggestionClick = (suggestion) => {
                    const existing = activities.find(
                        (a) => a.item.toLowerCase() === suggestion,
                    );
                    setForm({
                        ...form,
                        item: existing.item,
                        category: existing.category,
                    });
                    setSuggestions([]);
                };

                const handleSave = () => {
                    if (form.item.trim()) {
                        onSave(form, keepOpen);
                        if (keepOpen) {
                            const newTime = form.timeTo;
                            setForm({
                                date: form.date,
                                timeFrom: newTime,
                                timeTo: "",
                                item: "",
                                category: form.category,
                                status: form.status,
                                notes: "",
                            });
                        }
                    }
                };

                return (
                    <div className="modal-overlay" onClick={onClose}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="modal-title">
                                {activity ? "Edit" : "Add"} Activity
                            </h2>
                            <div className="form-group">
                                <label className="form-label">Activity</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.item}
                                    onChange={(e) =>
                                        handleChange("item", e.target.value)
                                    }
                                    placeholder="What did you do?"
                                    autoFocus
                                />
                                {suggestions.length > 0 && (
                                    <ul className="suggestions-list">
                                        {suggestions.map((s) => (
                                            <li
                                                key={s}
                                                onClick={() =>
                                                    handleSuggestionClick(s)
                                                }
                                            >
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={form.date}
                                        onChange={(e) =>
                                            handleChange("date", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Category
                                    </label>
                                    <select
                                        className="form-select"
                                        value={form.category}
                                        onChange={(e) =>
                                            handleChange(
                                                "category",
                                                e.target.value,
                                            )
                                        }
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.name}>
                                                {c.icon} {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">From</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={form.timeFrom}
                                        onChange={(e) =>
                                            handleChange(
                                                "timeFrom",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">To</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={form.timeTo}
                                        onChange={(e) =>
                                            handleChange(
                                                "timeTo",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    marginTop: "-6px",
                                    marginBottom: "12px",
                                    color: endsNextDay
                                        ? "var(--accent-red)"
                                        : "var(--text-muted)",
                                    fontSize: "12px",
                                }}
                            >
                                {form.timeFrom && form.timeTo ? (
                                    endsNextDay ? (
                                        <>
                                            To time is treated as{" "}
                                            <b>next day</b> ({inferredEndDate}).
                                            This helps overnight activities like
                                            Sleep.
                                        </>
                                    ) : (
                                        <>End date: {inferredEndDate}</>
                                    )
                                ) : (
                                    <>
                                        Tip: after setting From, To auto-fills
                                        +1 hour and supports overnight spans.
                                    </>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={form.status}
                                    onChange={(e) =>
                                        handleChange("status", e.target.value)
                                    }
                                >
                                    {statuses.map((s) => (
                                        <option key={s.id} value={s.name}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="form-textarea"
                                    value={form.notes}
                                    onChange={(e) =>
                                        handleChange("notes", e.target.value)
                                    }
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <label style={{ marginRight: "auto" }}>
                                    <input
                                        type="checkbox"
                                        checked={keepOpen}
                                        onChange={(e) =>
                                            setKeepOpen(e.target.checked)
                                        }
                                    />
                                    Continue adding
                                </label>
                                <button
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            function BulkEditModal({
                title,
                activityIds,
                activities,
                categories,
                statuses,
                defaultCategory = "",
                defaultStatus = "",
                onEditActivity,
                onApply,
                onClose,
            }) {
                const idSet = useMemo(
                    () => new Set(activityIds || []),
                    [activityIds],
                );
                const related = useMemo(() => {
                    return (activities || []).filter((a) => idSet.has(a.id));
                }, [activities, idSet]);

                const sortedRelated = useMemo(() => {
                    const list = [...(related || [])];
                    list.sort((a, b) => {
                        const dc = String(b.date || "").localeCompare(
                            String(a.date || ""),
                        );
                        if (dc !== 0) return dc;
                        return String(b.timeFrom || "").localeCompare(
                            String(a.timeFrom || ""),
                        );
                    });
                    return list;
                }, [related]);

                const commonCategory = useMemo(() => {
                    const counts = new Map();
                    for (const a of related) {
                        const val = String(a?.category || "");
                        if (!val) continue;
                        counts.set(val, (counts.get(val) || 0) + 1);
                    }
                    return (
                        [...counts.entries()].sort(
                            (a, b) => b[1] - a[1],
                        )[0]?.[0] || ""
                    );
                }, [related]);
                const commonStatus = useMemo(() => {
                    const counts = new Map();
                    for (const a of related) {
                        const val = String(a?.status || "");
                        if (!val) continue;
                        counts.set(val, (counts.get(val) || 0) + 1);
                    }
                    return (
                        [...counts.entries()].sort(
                            (a, b) => b[1] - a[1],
                        )[0]?.[0] || ""
                    );
                }, [related]);

                const [category, setCategory] = useState(
                    defaultCategory || commonCategory || "",
                );
                const [status, setStatus] = useState(
                    defaultStatus || commonStatus || "",
                );

                useEffect(() => {
                    setCategory(defaultCategory || commonCategory || "");
                }, [defaultCategory, commonCategory]);
                useEffect(() => {
                    setStatus(defaultStatus || commonStatus || "");
                }, [defaultStatus, commonStatus]);

                const [query, setQuery] = useState("");
                const visibleRelated = useMemo(() => {
                    const q = normalizeTextForMatch(query);
                    if (!q) return sortedRelated;
                    return (sortedRelated || []).filter((a) => {
                        const hay = normalizeTextForMatch(
                            `${a.item || ""} ${a.category || ""} ${a.status || ""} ${a.notes || ""} ${a.date || ""} ${a.timeFrom || ""} ${a.timeTo || ""}`,
                        );
                        return hay.includes(q);
                    });
                }, [sortedRelated, query]);

                const apply = () => {
                    const updates = {};
                    if (category) updates.category = category;
                    if (status) updates.status = status;
                    if (Object.keys(updates).length === 0) {
                        onClose && onClose();
                        return;
                    }
                    onApply && onApply(activityIds || [], updates);
                    onClose && onClose();
                };

                return (
                    <div
                        className="modal-overlay"
                        style={{ zIndex: 990 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose && onClose();
                        }}
                    >
                        <div
                            className="modal"
                            style={{ maxWidth: "720px" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="modal-title">
                                {title || "Bulk Edit Activities"}
                            </h2>
                            <div style={{ color: "var(--text-secondary)" }}>
                                Editing <b>{related.length}</b> activities.
                            </div>

                            <div
                                className="form-row"
                                style={{ marginTop: "16px" }}
                            >
                                <div
                                    className="form-group"
                                    style={{ marginBottom: 0 }}
                                >
                                    <label className="form-label">
                                        Category
                                    </label>
                                    <select
                                        className="form-select"
                                        value={category}
                                        onChange={(e) =>
                                            setCategory(e.target.value)
                                        }
                                    >
                                        <option value="">(No change)</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.name}>
                                                {c.icon} {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div
                                    className="form-group"
                                    style={{ marginBottom: 0 }}
                                >
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                    >
                                        <option value="">(No change)</option>
                                        {statuses.map((s) => (
                                            <option key={s.id} value={s.name}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="optimizer-section">
                                <div className="optimizer-section-title">
                                    Related activities
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        alignItems: "center",
                                        margin: "10px 0 12px",
                                    }}
                                >
                                    <input
                                        className="form-input"
                                        placeholder="Filter related..."
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                    />
                                    {query && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setQuery("")}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div
                                    style={{
                                        maxHeight: "220px",
                                        overflow: "auto",
                                        background: "#fafbff",
                                        border: "1px solid #eef0ff",
                                        borderRadius: "12px",
                                        padding: "10px 12px",
                                    }}
                                >
                                    {visibleRelated.length === 0 && (
                                        <div
                                            style={{
                                                color: "var(--text-muted)",
                                                padding: "6px 0",
                                            }}
                                        >
                                            No matching activities.
                                        </div>
                                    )}
                                    {(visibleRelated || []).map((a) => (
                                        <div
                                            key={a.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: "12px",
                                                padding: "6px 0",
                                                borderBottom:
                                                    "1px solid rgba(0,0,0,0.04)",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <b>{a.item}</b>{" "}
                                                <span
                                                    style={{
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    ({a.date} {a.timeFrom}–
                                                    {a.timeTo})
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "10px",
                                                    alignItems: "center",
                                                    whiteSpace: "nowrap",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        color: "var(--text-secondary)",
                                                    }}
                                                >
                                                    {a.category} · {a.status}
                                                </div>
                                                {onEditActivity && (
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() =>
                                                            onEditActivity(a)
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {query &&
                                        visibleRelated.length !==
                                            related.length && (
                                            <div
                                                style={{
                                                    paddingTop: "8px",
                                                    color: "var(--text-muted)",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                Showing {visibleRelated.length}{" "}
                                                of {related.length}.
                                            </div>
                                        )}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={apply}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            function OptimizerModal({
                scopeActivities,
                historyActivities,
                categories,
                statuses,
                onBulkUpdate,
                onAdd,
                onEdit,
                onCreateCategory,
                onClose,
            }) {
                const readCheckEnabled = (key) => {
                    const raw = getLS(key, true);
                    if (raw === false || raw === 0) return false;
                    const s = String(raw || "")
                        .trim()
                        .toLowerCase();
                    if (s === "false" || s === "0" || s === "off" || s === "no")
                        return false;
                    return true;
                };

                const [categoryEnabled, setCategoryEnabled] = useState(() =>
                    readCheckEnabled(OPTIMIZER_CATEGORY_ENABLED_KEY),
                );
                const [timeEnabled, setTimeEnabled] = useState(() =>
                    readCheckEnabled(OPTIMIZER_TIME_ENABLED_KEY),
                );
                const [gapsEnabled, setGapsEnabled] = useState(() =>
                    readCheckEnabled(OPTIMIZER_GAPS_ENABLED_KEY),
                );

                const computeIssues = (overrideOptions = {}) => {
                    const res = analyzeActivitiesOptimizer({
                        scopeActivities,
                        historyActivities,
                        categories,
                        statuses,
                        options: {
                            enableCategory: categoryEnabled,
                            enableTime: timeEnabled,
                            enableGaps: gapsEnabled,
                            ...overrideOptions,
                        },
                    });
                    return res.issues || [];
                };

                const [ignoredIssueIds, setIgnoredIssueIds] = useState(() =>
                    (getLS(OPTIMIZER_IGNORED_KEY, []) || []).filter(Boolean),
                );
                const ignoredSet = useMemo(
                    () => new Set(ignoredIssueIds || []),
                    [ignoredIssueIds],
                );
                const ignoreIssue = (id) => {
                    if (!id) return;
                    setIgnoredIssueIds((prev) => {
                        const list = Array.isArray(prev) ? prev : [];
                        if (list.includes(id)) return list;
                        const next = [...list, id];
                        setLS(OPTIMIZER_IGNORED_KEY, next);
                        return next;
                    });
                };
                const resetIgnores = () => {
                    setIgnoredIssueIds([]);
                    setLS(OPTIMIZER_IGNORED_KEY, []);
                };

                const [issuesSnapshot, setIssuesSnapshot] = useState(() =>
                    computeIssues(),
                );

                const issues = useMemo(
                    () =>
                        (issuesSnapshot || []).filter(
                            (i) => i && i.id && !ignoredSet.has(i.id),
                        ),
                    [issuesSnapshot, ignoredSet],
                );

                const [bulkEditConfig, setBulkEditConfig] = useState(null);
                const [categoryEdits, setCategoryEdits] = useState({});
                const getEditedCategoryName = (issue, fallback) => {
                    const raw =
                        categoryEdits[issue.id] ??
                        issue.suggestedName ??
                        fallback ??
                        "";
                    return String(raw || "").trim();
                };

                const rerun = () => {
                    setIssuesSnapshot(computeIssues());
                };
                const toggleCategoryEnabled = (enabled) => {
                    const next = Boolean(enabled);
                    setCategoryEnabled(next);
                    setLS(OPTIMIZER_CATEGORY_ENABLED_KEY, next);
                    setIssuesSnapshot(
                        computeIssues({
                            enableCategory: next,
                        }),
                    );
                };
                const toggleTimeEnabled = (enabled) => {
                    const next = Boolean(enabled);
                    setTimeEnabled(next);
                    setLS(OPTIMIZER_TIME_ENABLED_KEY, next);
                    setIssuesSnapshot(
                        computeIssues({
                            enableTime: next,
                        }),
                    );
                };
                const toggleGapsEnabled = (enabled) => {
                    const next = Boolean(enabled);
                    setGapsEnabled(next);
                    setLS(OPTIMIZER_GAPS_ENABLED_KEY, next);
                    setIssuesSnapshot(computeIssues({ enableGaps: next }));
                };
                const counts = useMemo(() => {
                    const out = { error: 0, warn: 0, info: 0 };
                    for (const i of issues) {
                        out[i.severity] = (out[i.severity] || 0) + 1;
                    }
                    return out;
                }, [issues]);

                const dayCount = useMemo(() => {
                    const s = new Set(
                        (scopeActivities || [])
                            .map((a) => a.date)
                            .filter(Boolean),
                    );
                    return s.size;
                }, [scopeActivities]);

                const sections = useMemo(() => {
                    const byKind = {
                        category: [],
                        other: [],
                        time: [],
                        gap: [],
                    };
                    for (const i of issues) {
                        if (byKind[i.kind]) byKind[i.kind].push(i);
                    }
                    return [
                        {
                            key: "category",
                            title: "Category & Tagging",
                            items: [...byKind.category, ...byKind.other],
                        },
                        {
                            key: "time",
                            title: "Time Conflicts",
                            items: byKind.time,
                        },
                        { key: "gap", title: "Gaps", items: byKind.gap },
                    ];
                }, [issues]);

                const severityIcon = (sev) => {
                    if (sev === "error") return "×";
                    if (sev === "warn") return "!";
                    return "i";
                };

                const handleAction = (issue, action) => {
                    if (!action) return;
                    if (action.kind === "createCategory") {
                        const name = getEditedCategoryName(
                            issue,
                            action.name || action.defaultName,
                        );
                        if (!name) return;
                        onCreateCategory && onCreateCategory(name);
                        return;
                    }
                    if (action.kind === "bulkEdit") {
                        setBulkEditConfig({
                            title:
                                action.title ||
                                `Manual edit related activities`,
                            ids: action.ids || [],
                            defaultCategory: action.defaultCategory || "",
                            defaultStatus: action.defaultStatus || "",
                        });
                        return;
                    }
                    if (action.kind === "applyCategory") {
                        const categoryName = getEditedCategoryName(
                            issue,
                            action.category || action.defaultName,
                        );
                        if (!categoryName) return;
                        if (action.alsoCreate && onCreateCategory) {
                            onCreateCategory(categoryName);
                        }
                        onBulkUpdate &&
                            onBulkUpdate(action.ids || [], {
                                category: categoryName,
                            });
                        return;
                    }
                    if (action.kind === "addActivity") {
                        onAdd && onAdd(action.prefill || null);
                        return;
                    }
                    if (action.kind === "editActivity") {
                        const target = (historyActivities || []).find(
                            (a) => a.id === action.activityId,
                        );
                        if (target && onEdit) onEdit(target);
                    }
                };

                return (
                    <div
                        className="modal-overlay"
                        style={{ zIndex: 980 }}
                        onClick={onClose}
                    >
                        <div
                            className="modal optimizer-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="modal-title">
                                Activities Optimizer
                            </h2>
                            <div style={{ color: "var(--text-secondary)" }}>
                                Runs checks on your current Activities filters
                                using your full history for smarter suggestions.
                            </div>
                            <div className="optimizer-summary">
                                <div className="optimizer-chip">
                                    Scope: <b>{scopeActivities?.length || 0}</b>{" "}
                                    activities
                                </div>
                                <div className="optimizer-chip">
                                    Days: <b>{dayCount}</b>
                                </div>
                                <div className="optimizer-chip">
                                    Issues: <b>{issues.length}</b> ({" "}
                                    {counts.error} errors, {counts.warn} warns,{" "}
                                    {counts.info} info )
                                </div>
                                <div className="optimizer-chip">
                                    Ignored: <b>{ignoredIssueIds.length}</b>
                                </div>
                            </div>

                            {issues.length === 0 && (
                                <div
                                    className="empty-state"
                                    style={{ margin: 0 }}
                                >
                                    <div className="empty-icon">✅</div>
                                    <h3 className="empty-title">All good!</h3>
                                    <p>No issues found in current scope.</p>
                                </div>
                            )}

                            {sections.map((section) => {
                                const enabled =
                                    section.key === "category"
                                        ? categoryEnabled
                                        : section.key === "time"
                                          ? timeEnabled
                                          : section.key === "gap"
                                            ? gapsEnabled
                                            : true;
                                const onToggle =
                                    section.key === "category"
                                        ? toggleCategoryEnabled
                                        : section.key === "time"
                                          ? toggleTimeEnabled
                                          : section.key === "gap"
                                            ? toggleGapsEnabled
                                            : null;
                                return (
                                    <div
                                        key={section.key}
                                        className="optimizer-section"
                                    >
                                        <div
                                            className="optimizer-section-title"
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: "12px",
                                            }}
                                        >
                                            <span>{section.title}</span>
                                            {onToggle && (
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        fontSize: "12px",
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    Check:
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(
                                                            enabled,
                                                        )}
                                                        onChange={(e) =>
                                                            onToggle(
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        style={{
                                                            width: "16px",
                                                            height: "16px",
                                                            accentColor:
                                                                "var(--primary)",
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            fontWeight: 700,
                                                            color: enabled
                                                                ? "var(--accent-green)"
                                                                : "var(--text-muted)",
                                                        }}
                                                    >
                                                        {enabled ? "On" : "Off"}
                                                    </span>
                                                </span>
                                            )}
                                        </div>

                                        {section.items.length > 0 && (
                                            <div className="issue-list">
                                                {section.items.map((issue) => (
                                                    <div
                                                        key={issue.id}
                                                        className="issue-card"
                                                    >
                                                        <div
                                                            className={`issue-badge ${issue.severity}`}
                                                        >
                                                            {severityIcon(
                                                                issue.severity,
                                                            )}
                                                        </div>
                                                        <div className="issue-content">
                                                            <div className="issue-title">
                                                                {issue.suggestedName
                                                                    ? `New category candidate: "${getEditedCategoryName(issue, issue.suggestedName) || issue.suggestedName}"`
                                                                    : issue.title}
                                                            </div>
                                                            {issue.meta && (
                                                                <div className="issue-meta">
                                                                    {issue.meta}
                                                                </div>
                                                            )}
                                                            <div className="issue-details">
                                                                {Array.isArray(
                                                                    issue.details,
                                                                ) ? (
                                                                    <ul
                                                                        style={{
                                                                            marginLeft:
                                                                                "18px",
                                                                        }}
                                                                    >
                                                                        {issue.details.map(
                                                                            (
                                                                                line,
                                                                                idx,
                                                                            ) => (
                                                                                <li
                                                                                    key={`${issue.id}-${idx}`}
                                                                                >
                                                                                    {
                                                                                        line
                                                                                    }
                                                                                </li>
                                                                            ),
                                                                        )}
                                                                    </ul>
                                                                ) : (
                                                                    issue.details
                                                                )}
                                                            </div>
                                                            {issue.suggestedName && (
                                                                <div
                                                                    style={{
                                                                        marginTop:
                                                                            "10px",
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            fontSize:
                                                                                "11px",
                                                                            fontWeight: 700,
                                                                            color: "var(--text-muted)",
                                                                            textTransform:
                                                                                "uppercase",
                                                                            letterSpacing:
                                                                                "0.5px",
                                                                            marginBottom:
                                                                                "6px",
                                                                        }}
                                                                    >
                                                                        Category
                                                                        name
                                                                    </div>
                                                                    <input
                                                                        className="form-input"
                                                                        style={{
                                                                            padding:
                                                                                "10px 12px",
                                                                        }}
                                                                        value={
                                                                            categoryEdits[
                                                                                issue
                                                                                    .id
                                                                            ] ??
                                                                            issue.suggestedName
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setCategoryEdits(
                                                                                (
                                                                                    prev,
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    [issue.id]:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }),
                                                                            )
                                                                        }
                                                                        placeholder="New category name"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="issue-actions">
                                                                {(
                                                                    issue.actions ||
                                                                    []
                                                                ).map(
                                                                    (
                                                                        a,
                                                                        idx,
                                                                    ) => (
                                                                        <button
                                                                            key={`${issue.id}-a-${idx}`}
                                                                            className="btn btn-sm btn-secondary"
                                                                            onClick={() =>
                                                                                handleAction(
                                                                                    issue,
                                                                                    a,
                                                                                )
                                                                            }
                                                                        >
                                                                            {
                                                                                a.label
                                                                            }
                                                                        </button>
                                                                    ),
                                                                )}
                                                                <button
                                                                    className="btn btn-sm btn-secondary"
                                                                    onClick={() =>
                                                                        ignoreIssue(
                                                                            issue.id,
                                                                        )
                                                                    }
                                                                >
                                                                    Ignore
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={rerun}
                                >
                                    Re-run
                                </button>
                                {ignoredIssueIds.length > 0 && (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={resetIgnores}
                                    >
                                        Reset ignores
                                    </button>
                                )}
                                <button
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        {bulkEditConfig && (
                            <BulkEditModal
                                title={bulkEditConfig.title}
                                activityIds={bulkEditConfig.ids}
                                activities={historyActivities}
                                categories={categories}
                                statuses={statuses}
                                defaultCategory={bulkEditConfig.defaultCategory}
                                defaultStatus={bulkEditConfig.defaultStatus}
                                onEditActivity={onEdit}
                                onApply={(ids, updates) =>
                                    onBulkUpdate && onBulkUpdate(ids, updates)
                                }
                                onClose={() => setBulkEditConfig(null)}
                            />
                        )}
                    </div>
                );
            }

    global.Modal = Modal;
    global.BulkEditModal = BulkEditModal;
    global.OptimizerModal = OptimizerModal;

})(window);
(function (global) {
  "use strict";

  const { useState, useMemo } = React;

  function Activities({
    activities,
    categories,
    statuses,
    onAdd,
    onEdit,
    onDelete,
    onBulkDelete,
    onBulkUpdate,
    onCreateCategory,
    condensed,
  }) {
    const [filter, setFilter] = useState({
      text: "",
      category: "all",
      status: "all",
      startDate: "",
      endDate: "",
    });
    const [sort, setSort] = useState({
      by: "date",
      asc: false,
    });
    const [selectedIds, setSelectedIds] = useState([]);
    const [showOptimizer, setShowOptimizer] = useState(false);

    const handleFilterChange = (field, value) => {
      setFilter({ ...filter, [field]: value });
    };

    const compareByDateTime = (a, b) => {
      const dc = String(a.date || "").localeCompare(String(b.date || ""));
      if (dc !== 0) return dc;
      return String(a.timeFrom || "").localeCompare(String(b.timeFrom || ""));
    };

    const filteredActivities = useMemo(() => {
      return [...activities]
        .filter((a) => {
          const txt = filter.text.toLowerCase();
          const matchesText =
            !txt ||
            a.item.toLowerCase().includes(txt) ||
            (a.notes && a.notes.toLowerCase().includes(txt));
          const matchesCategory =
            filter.category === "all" || a.category === filter.category;
          const matchesStatus =
            filter.status === "all" || a.status === filter.status;
          const matchesStartDate =
            !filter.startDate || a.date >= filter.startDate;
          const matchesEndDate = !filter.endDate || a.date <= filter.endDate;
          return (
            matchesText &&
            matchesCategory &&
            matchesStatus &&
            matchesStartDate &&
            matchesEndDate
          );
        })
        .sort((a, b) => {
          const direction = sort.asc ? 1 : -1;
          let res;
          if (sort.by === "date") {
            res = compareByDateTime(a, b);
          } else {
            res = String(a[sort.by] || "").localeCompare(
              String(b[sort.by] || ""),
            );
          }
          return res * direction;
        });
    }, [activities, filter, sort]);

    const handleSelect = (id) => {
      if (Array.isArray(id)) {
        setSelectedIds(id);
      } else {
        setSelectedIds((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
      }
    };

    if (condensed) {
      return (
        <ActivityList
          activities={activities}
          categories={categories}
          statuses={statuses}
          onEdit={onEdit}
          condensed
        />
      );
    }

    return (
      <div className="animate-fade-in">
        {!condensed && (
          <div className="page-header">
            <div>
              <h1 className="page-title">Activities</h1>
              <p className="page-subtitle">
                You have {activities.length} logged activities in total.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowOptimizer(true)}
              >
                🧠 Optimize
              </button>
              <button
                className="btn btn-primary"
                onClick={() => onAdd && onAdd()}
              >
                ✨ Add Activity
              </button>
            </div>
          </div>
        )}
        <div className="card">
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search..."
              value={filter.text}
              onChange={(e) => handleFilterChange("text", e.target.value)}
            />
            <select
              value={filter.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            <select
              value={filter.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="bulk-actions">
              <span>
                <b>{selectedIds.length}</b> selected
              </span>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  onBulkDelete(selectedIds, () => setSelectedIds([]));
                }}
              >
                Delete
              </button>
              <select
                className="form-select"
                style={{ width: "auto" }}
                onChange={(e) => {
                  if (e.target.value) {
                    onBulkUpdate(selectedIds, {
                      status: e.target.value,
                    });
                    setSelectedIds([]);
                  }
                }}
              >
                <option value="">Update Status</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <ActivityList
            activities={filteredActivities}
            onEdit={onEdit}
            onDelete={onDelete}
            categories={categories}
            statuses={statuses}
            onSelect={handleSelect}
            selectedIds={selectedIds}
          />
        </div>
        {showOptimizer && (
          <global.OptimizerModal
            scopeActivities={filteredActivities}
            historyActivities={activities}
            categories={categories}
            statuses={statuses}
            onBulkUpdate={onBulkUpdate}
            onAdd={onAdd}
            onEdit={onEdit}
            onCreateCategory={onCreateCategory}
            onClose={() => setShowOptimizer(false)}
          />
        )}
      </div>
    );
  }

  function ActivityList({
    activities,
    onEdit,
    onDelete,
    categories,
    statuses,
    condensed = false,
    onSelect,
    selectedIds = [],
  }) {
    const allSelected =
      !condensed &&
      selectedIds.length === activities.length &&
      activities.length > 0;

    const handleSelectAll = (e) => {
      if (e.target.checked) {
        onSelect(activities.map((a) => a.id));
      } else {
        onSelect([]);
      }
    };

    if (activities.length === 0 && !condensed) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🤷</div>
          <h3 className="empty-title">No activities found.</h3>
          <p>Try adjusting your filters.</p>
        </div>
      );
    }

    return (
      <table className="activity-table">
        {!condensed && (
          <thead>
            <tr>
              <th style={{ width: "40px" }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Date</th>
              <th>Time</th>
              <th>Activity</th>
              <th>Category</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
        )}
        <tbody>
          {activities.map((a) => (
            <ActivityRow
              key={a.id}
              activity={a}
              onEdit={onEdit}
              onDelete={onDelete}
              categories={categories}
              statuses={statuses}
              condensed={condensed}
              onSelect={onSelect}
              isSelected={!condensed && selectedIds.includes(a.id)}
            />
          ))}
        </tbody>
      </table>
    );
  }

  function ActivityRow({
    activity: a,
    onEdit,
    onDelete,
    categories,
    statuses,
    condensed,
    onSelect,
    isSelected,
  }) {
    const category = categories.find((c) => c.name === a.category);
    const status = statuses.find((s) => s.name === a.status);
    return (
      <tr onClick={() => onEdit && onEdit(a)}>
        {!condensed && (
          <td data-label="Select" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect && onSelect(a.id)}
            />
          </td>
        )}
        {!condensed && <td data-label="Date">{global.formatDate(a.date)}</td>}
        <td data-label="Time">
          {a.timeFrom} - {a.timeTo}
        </td>
        <td data-label="Activity">{a.item}</td>
        <td data-label="Category">
          <span
            className={`category-badge category-${a.category?.toLowerCase()}`}
          >
            {category?.icon} {a.category}
          </span>
        </td>
        {!condensed && (
          <td data-label="Status">
            <span
              className={`status-badge status-${a.status?.replace(/ /g, "").toLowerCase()}`}
            >
              {a.status}
            </span>
          </td>
        )}
        <td data-label="Duration">
          <span className="duration-badge">
            {global.formatDuration(global.calcDuration(a.timeFrom, a.timeTo))}
          </span>
        </td>
        {!condensed && (
          <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
            <div className="action-btns">
              <button className="action-btn edit" onClick={() => onEdit(a)}>
                ✏️
              </button>
              <button
                className="action-btn delete"
                onClick={() => onDelete(a.id)}
              >
                🗑️
              </button>
            </div>
          </td>
        )}
      </tr>
    );
  }

  global.Activities = Activities;
  global.ActivityList = ActivityList;
  global.ActivityRow = ActivityRow;
})(window);
(function (global) {
  "use strict";

  const { useState, useMemo } = React;

  function Calendar({
    activities,
    categories,
    statuses,
    selectedDate,
    setSelectedDate,
    view,
    setView,
    onAdd,
    onEdit,
    onDelete,
  }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">Calendar</h1>
          </div>
        </div>
        <div className="calendar-page-grid">
          <div className="calendar-container">
            <CalendarHeader
              date={currentDate}
              setDate={setCurrentDate}
              view={view}
              setView={setView}
            />
            {view === "month" ? (
              <CalendarMonthView
                date={currentDate}
                activities={activities}
                onDayClick={setCurrentDate}
              />
            ) : (
              <CalendarYearView
                date={currentDate}
                activities={activities}
                onMonthClick={(month) => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(month);
                  setCurrentDate(newDate);
                  setView("month");
                }}
              />
            )}
          </div>
          <global.ActivityDetailPanel
            date={currentDate}
            activities={activities}
            categories={categories}
            onEdit={onEdit}
          />
        </div>
      </div>
    );
  }

  function CalendarHeader({ date, setDate, view, setView }) {
    const changeMonth = (offset) => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() + offset);
      setDate(newDate);
    };

    const changeYear = (offset) => {
      const newDate = new Date(date);
      newDate.setFullYear(newDate.getFullYear() + offset);
      setDate(newDate);
    };

    const title =
      view === "month"
        ? date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          })
        : date.getFullYear();

    return (
      <div className="calendar-header">
        <div className="calendar-nav">
          <button
            className="calendar-nav-btn"
            onClick={() =>
              view === "month" ? changeMonth(-1) : changeYear(-1)
            }
          >
            &lt;
          </button>
          <h2 className="calendar-title">{title}</h2>
          <button
            className="calendar-nav-btn"
            onClick={() => (view === "month" ? changeMonth(1) : changeYear(1))}
          >
            &gt;
          </button>
        </div>
        <div className="calendar-view-toggle">
          <button
            className={`view-toggle-btn ${view === "month" ? "active" : ""}`}
            onClick={() => setView("month")}
          >
            Month
          </button>
          <button
            className={`view-toggle-btn ${view === "year" ? "active" : ""}`}
            onClick={() => setView("year")}
          >
            Year
          </button>
        </div>
      </div>
    );
  }

  function CalendarMonthView({ date, activities, onDayClick }) {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

    const days = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }

    return (
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dayStr = global.getLocalDateStr(day);
          const isToday = global.getLocalDateStr(new Date()) === dayStr;
          const isSelected = global.getLocalDateStr(date) === dayStr;
          const isCurrentMonth = day.getMonth() === date.getMonth();

          const dayActs = activities.filter((a) => a.date === dayStr);

          let health = "none";
          if (dayActs.length > 0) {
            const sleep = dayActs
              .filter((a) => a.category === "Sleep")
              .reduce(
                (s, a) => s + global.calcDuration(a.timeFrom, a.timeTo),
                0,
              );
            if (sleep >= 420) health = "good";
            else health = "poor";
          }

          return (
            <div
              key={dayStr}
              className={`calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${!isCurrentMonth ? "other-month" : ""}`}
              onClick={() => onDayClick(day)}
            >
              <span className="day-number">{day.getDate()}</span>
              <div className={`health-indicator health-${health}`}></div>
            </div>
          );
        })}
      </div>
    );
  }

  function CalendarYearView({ date, activities, onMonthClick }) {
    return (
      <div className="year-grid">
        {Array.from({ length: 12 }).map((_, i) => {
          const monthDate = new Date(date.getFullYear(), i, 1);
          const monthActivities = activities.filter((a) =>
            a.date.startsWith(
              `${date.getFullYear()}-${String(i + 1).padStart(2, "0")}`,
            ),
          );

          return (
            <div key={i} className="month-card" onClick={() => onMonthClick(i)}>
              <h4 className="month-name">
                {monthDate.toLocaleDateString("en-US", {
                  month: "long",
                })}
              </h4>
              <MiniCalendar
                year={date.getFullYear()}
                month={i}
                activities={monthActivities}
              />
            </div>
          );
        })}
      </div>
    );
  }

  function MiniCalendar({ year, month, activities }) {
    const monthStart = new Date(year, month, 1);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    return (
      <div className="mini-calendar">
        {days.map((d, i) => {
          const dayStr = global.getLocalDateStr(d);
          const hasActivity = activities.some((a) => a.date === dayStr);
          let color = "transparent";
          if (d.getMonth() === month) {
            color = "#f0f0f0";
            if (hasActivity) color = "var(--primary-light)";
          }
          return (
            <div
              key={i}
              className="mini-day"
              style={{ backgroundColor: color }}
            />
          );
        })}
      </div>
    );
  }

  global.Calendar = Calendar;
  global.CalendarHeader = CalendarHeader;
  global.CalendarMonthView = CalendarMonthView;
  global.CalendarYearView = CalendarYearView;
  global.MiniCalendar = MiniCalendar;
})(window);
(function(global) {
    'use strict';

    const { useState, useMemo, useEffect } = React;

            function Settings({
                categories,
                setCategories,
                activities,
                setActivities,
                statuses,
                setStatuses,
                onForceSync,
                isSyncing,
                reportPhoneNumber,
                setReportPhoneNumber,
                reminderEnabled,
                setReminderEnabled,
            }) {
                const [savedGitHubToken, setSavedGitHubToken] =
                    useState(getGitHubToken());
                const [githubToken, setGithubToken] =
                    useState(savedGitHubToken);
                const [githubTokenVisible, setGithubTokenVisible] =
                    useState(false);
                const [newCat, setNewCat] = useState({ name: "", icon: "🏷️" });
                const [editingCategory, setEditingCategory] = useState(null);
                const [editDraft, setEditDraft] = useState({
                    name: "",
                    icon: "🏷️",
                    color: "#6c5ce7",
                });
                const [deletingCategory, setDeletingCategory] = useState(null);
                const [deleteMoveTo, setDeleteMoveTo] = useState("");

                const tokenConfigured = Boolean(savedGitHubToken);
                const tokenDirty = githubToken !== savedGitHubToken;

                const handleSaveGitHubToken = () => {
                    setGitHubToken(githubToken);
                    const next = getGitHubToken();
                    setSavedGitHubToken(next);
                    setGithubToken(next);
                    alert(
                        next
                            ? "✅ GitHub token saved."
                            : "✅ GitHub token cleared.",
                    );
                };

                const handleClearGitHubToken = () => {
                    clearGitHubToken();
                    setSavedGitHubToken("");
                    setGithubToken("");
                };

                const makeRandomColor = () =>
                    `#${Math.floor(Math.random() * 16777215)
                        .toString(16)
                        .padStart(6, "0")}`;

                const handleAddCategory = () => {
                    const name = String(newCat.name || "").trim();
                    const icon = String(newCat.icon || "").trim() || "🏷️";
                    if (
                        name &&
                        !categories.some(
                            (c) =>
                                String(c.name || "").toLowerCase() ===
                                name.toLowerCase(),
                        )
                    ) {
                        setCategories([
                            ...categories,
                            {
                                name,
                                icon,
                                id: generateId(),
                                color: makeRandomColor(),
                            },
                        ]);
                        setNewCat({ name: "", icon: "🏷️" });
                    }
                };

                const startEditCategory = (cat) => {
                    if (!cat) return;
                    setEditDraft({
                        name: String(cat.name || "").trim(),
                        icon: String(cat.icon || "").trim() || "🏷️",
                        color: String(cat.color || "").trim() || "#6c5ce7",
                    });
                    setEditingCategory(cat);
                };

                const saveCategoryEdit = () => {
                    if (!editingCategory) return;
                    const nextName = String(editDraft.name || "").trim();
                    const nextIcon =
                        String(editDraft.icon || "").trim() || "🏷️";
                    const nextColor = String(editDraft.color || "").trim();

                    if (!nextName) {
                        alert("Category name cannot be empty.");
                        return;
                    }
                    if (
                        categories.some(
                            (c) =>
                                c.id !== editingCategory.id &&
                                String(c.name || "").toLowerCase() ===
                                    nextName.toLowerCase(),
                        )
                    ) {
                        alert("Category name already exists.");
                        return;
                    }

                    const oldName = editingCategory.name;
                    setCategories((prev) =>
                        prev.map((c) =>
                            c.id === editingCategory.id
                                ? {
                                      ...c,
                                      name: nextName,
                                      icon: nextIcon,
                                      color: nextColor || c.color,
                                  }
                                : c,
                        ),
                    );
                    if (oldName !== nextName && setActivities) {
                        setActivities((prev) =>
                            prev.map((a) =>
                                a.category === oldName
                                    ? { ...a, category: nextName }
                                    : a,
                            ),
                        );
                    }
                    setEditingCategory(null);
                };

                const startDeleteCategory = (cat) => {
                    if (!cat) return;
                    if ((categories || []).length <= 1) {
                        alert("At least one category is required.");
                        return;
                    }

                    const usedCount = (activities || []).filter(
                        (a) => a.category === cat.name,
                    ).length;

                    const fallback =
                        categories.find(
                            (c) =>
                                c.id !== cat.id && isOtherCategoryName(c.name),
                        )?.name ||
                        categories.find((c) => c.id !== cat.id)?.name ||
                        "";

                    setDeletingCategory({ ...cat, usedCount });
                    setDeleteMoveTo(fallback);
                };

                const confirmDeleteCategory = () => {
                    if (!deletingCategory) return;
                    if ((categories || []).length <= 1) {
                        alert("At least one category is required.");
                        return;
                    }

                    const oldName = deletingCategory.name;
                    const usedCount = (activities || []).filter(
                        (a) => a.category === oldName,
                    ).length;
                    const replacement = String(deleteMoveTo || "").trim();

                    if (usedCount > 0 && !replacement) {
                        alert(
                            "Please choose a category to move activities to.",
                        );
                        return;
                    }

                    if (usedCount > 0 && setActivities) {
                        setActivities((prev) =>
                            prev.map((a) =>
                                a.category === oldName
                                    ? { ...a, category: replacement }
                                    : a,
                            ),
                        );
                    }
                    setCategories((prev) =>
                        prev.filter((c) => c.id !== deletingCategory.id),
                    );
                    setDeletingCategory(null);
                    setDeleteMoveTo("");
                };

                return (
                    <div className="animate-fade-in">
                        <div className="page-header">
                            <h1 className="page-title">Settings</h1>
                        </div>
                        <div className="settings-section">
                            <h2 className="settings-title">System</h2>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "12px",
                                    marginBottom: "6px",
                                }}
                            >
                                <h3
                                    className="settings-subtitle"
                                    style={{ margin: 0 }}
                                >
                                    GitHub Token
                                </h3>
                                <div
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        color: tokenConfigured
                                            ? "var(--accent-green)"
                                            : "var(--accent-red)",
                                    }}
                                >
                                    {tokenConfigured ? "Configured" : "Not set"}
                                    {tokenDirty ? " • Unsaved" : ""}
                                </div>
                            </div>
                            <p
                                style={{
                                    color: "var(--text-secondary)",
                                    marginBottom: "12px",
                                }}
                            >
                                A GitHub personal access token with{" "}
                                <code>repo</code> scope is required for cloud
                                sync.{" "}
                                <a
                                    href="https://github.com/settings/tokens/new"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Create one here
                                </a>
                                .
                            </p>
                            <div className="form-group">
                                <label className="form-label">
                                    Personal Access Token
                                </label>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        alignItems: "center",
                                    }}
                                >
                                    <input
                                        className="form-input"
                                        type={
                                            githubTokenVisible
                                                ? "text"
                                                : "password"
                                        }
                                        value={githubToken}
                                        onChange={(e) =>
                                            setGithubToken(e.target.value)
                                        }
                                        placeholder="ghp_..."
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            setGithubTokenVisible((v) => !v)
                                        }
                                        style={{
                                            padding: "10px 12px",
                                            minWidth: "76px",
                                        }}
                                    >
                                        {githubTokenVisible ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClearGitHubToken}
                                    disabled={!tokenConfigured && !githubToken}
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSaveGitHubToken}
                                    disabled={!tokenDirty}
                                >
                                    Save
                                </button>
                            </div>

                            <div className="settings-divider" />

                            <h3 className="settings-subtitle">
                                WhatsApp Reporting
                            </h3>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label">
                                    Phone Number
                                </label>
                                <input
                                    className="form-input"
                                    type="tel"
                                    value={reportPhoneNumber}
                                    onChange={(e) =>
                                        setReportPhoneNumber(e.target.value)
                                    }
                                    placeholder="+1234567890"
                                />
                            </div>

                            <div className="settings-divider" />

                            <h3 className="settings-subtitle">
                                Activity Reminders
                            </h3>
                            <p
                                style={{
                                    color: "var(--text-secondary)",
                                    marginBottom: "12px",
                                }}
                            >
                                Show an in-app popup when a <b>Planning</b>{" "}
                                activity starts (today).
                            </p>
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    fontSize: "14px",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={Boolean(reminderEnabled)}
                                    onChange={(e) =>
                                        setReminderEnabled &&
                                        setReminderEnabled(e.target.checked)
                                    }
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        accentColor: "var(--primary)",
                                    }}
                                />
                                Enable planning reminders
                            </label>
                        </div>

                        <div className="settings-section">
                            <h2 className="settings-title">Data</h2>
                            <h3 className="settings-subtitle">
                                Data Management
                            </h3>
                            <p
                                style={{
                                    color: "var(--text-secondary)",
                                    marginBottom: "12px",
                                }}
                            >
                                Manually trigger data sync. Use with caution.
                            </p>
                            <button
                                className="btn btn-secondary"
                                onClick={onForceSync}
                                disabled={isSyncing}
                            >
                                {isSyncing ? "⏳ Syncing..." : "🔄 Force Sync"}
                            </button>

                            <div className="settings-divider" />

                            <h3 className="settings-subtitle">Categories</h3>
                            <div className="settings-list">
                                {categories.map((c) => (
                                    <div key={c.id} className="settings-item">
                                        <span
                                            className="settings-item-color"
                                            style={{
                                                background:
                                                    c.color || "#e8e8f0",
                                            }}
                                        ></span>
                                        <span>
                                            {c.icon} {c.name}
                                        </span>
                                        <button
                                            type="button"
                                            className="edit"
                                            title="Edit"
                                            onClick={() => startEditCategory(c)}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            type="button"
                                            className="delete"
                                            title="Delete"
                                            onClick={() =>
                                                startDeleteCategory(c)
                                            }
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="add-item-form">
                                <input
                                    type="text"
                                    value={newCat.icon}
                                    onChange={(e) =>
                                        setNewCat({
                                            ...newCat,
                                            icon: e.target.value,
                                        })
                                    }
                                    placeholder="🏷️"
                                    style={{
                                        maxWidth: "90px",
                                        textAlign: "center",
                                    }}
                                />
                                <input
                                    type="text"
                                    value={newCat.name}
                                    onChange={(e) =>
                                        setNewCat({
                                            ...newCat,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="New Category Name"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                            handleAddCategory();
                                    }}
                                />
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleAddCategory}
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                        <div className="settings-section">
                            <h2 className="settings-title">About</h2>
                            <p>Version: {APP_VERSION}</p>
                        </div>

                        {editingCategory && (
                            <div
                                className="modal-overlay"
                                onClick={() => setEditingCategory(null)}
                            >
                                <div
                                    className="modal"
                                    style={{ maxWidth: "520px" }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h2 className="modal-title">
                                        Edit Category
                                    </h2>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">
                                                Icon
                                            </label>
                                            <input
                                                className="form-input"
                                                value={editDraft.icon}
                                                onChange={(e) =>
                                                    setEditDraft((prev) => ({
                                                        ...prev,
                                                        icon: e.target.value,
                                                    }))
                                                }
                                                placeholder="🏷️"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Name
                                            </label>
                                            <input
                                                className="form-input"
                                                value={editDraft.name}
                                                onChange={(e) =>
                                                    setEditDraft((prev) => ({
                                                        ...prev,
                                                        name: e.target.value,
                                                    }))
                                                }
                                                placeholder="Category name"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            Color
                                        </label>
                                        <input
                                            type="color"
                                            value={editDraft.color}
                                            onChange={(e) =>
                                                setEditDraft((prev) => ({
                                                    ...prev,
                                                    color: e.target.value,
                                                }))
                                            }
                                            style={{
                                                width: "100%",
                                                height: "42px",
                                                padding: 0,
                                                border: "2px solid #e8e8f0",
                                                borderRadius: "12px",
                                                background: "transparent",
                                                cursor: "pointer",
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: "12px",
                                            marginTop: "-8px",
                                        }}
                                    >
                                        Renaming updates all related activities.
                                    </div>
                                    <div className="modal-actions">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() =>
                                                setEditingCategory(null)
                                            }
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={saveCategoryEdit}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {deletingCategory && (
                            <div
                                className="modal-overlay"
                                onClick={() => setDeletingCategory(null)}
                            >
                                <div
                                    className="modal"
                                    style={{ maxWidth: "560px" }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h2 className="modal-title">
                                        Delete Category
                                    </h2>
                                    <p
                                        style={{
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        Delete{" "}
                                        <b>
                                            {deletingCategory.icon}{" "}
                                            {deletingCategory.name}
                                        </b>
                                        ?
                                    </p>

                                    {deletingCategory.usedCount > 0 && (
                                        <div className="form-group">
                                            <label className="form-label">
                                                Move{" "}
                                                {deletingCategory.usedCount}{" "}
                                                activities to
                                            </label>
                                            <select
                                                className="form-select"
                                                value={deleteMoveTo}
                                                onChange={(e) =>
                                                    setDeleteMoveTo(
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                {categories
                                                    .filter(
                                                        (c) =>
                                                            c.id !==
                                                            deletingCategory.id,
                                                    )
                                                    .map((c) => (
                                                        <option
                                                            key={c.id}
                                                            value={c.name}
                                                        >
                                                            {c.icon} {c.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="modal-actions">
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() =>
                                                setDeletingCategory(null)
                                            }
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            onClick={confirmDeleteCategory}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }

            function Modal({
                activity,
                prefill,
                activities,
                categories,
                statuses,
                onSave,
                onClose,
            }) {
                const defaultForm = {
                    date: getLocalDateStr(),
                    timeFrom: "",
                    timeTo: "",
                    item: "",
                    category: categories[0]?.name || "",
                    status: statuses[0]?.name || "",
                    notes: "",
                };
                const [form, setForm] = useState(
                    activity || { ...defaultForm, ...(prefill || {}) },
                );
                const [suggestions, setSuggestions] = useState([]);
                const [keepOpen, setKeepOpen] = useState(false);
                const endsNextDay = useMemo(() => {
                    const from = timeStrToMins(form.timeFrom);
                    const to = timeStrToMins(form.timeTo);
                    if (from == null || to == null) return false;
                    return to < from;
                }, [form.timeFrom, form.timeTo]);
                const inferredEndDate = useMemo(
                    () =>
                        getEndDateForRange(
                            form.date,
                            form.timeFrom,
                            form.timeTo,
                        ),
                    [form.date, form.timeFrom, form.timeTo],
                );

                const handleChange = (field, value) => {
                    setForm((prev) => {
                        const next = { ...prev, [field]: value };
                        if (field === "timeFrom" && value && !prev.timeTo) {
                            next.timeTo = addMinutesToTime(value, 60);
                        }
                        return next;
                    });
                    if (field === "item" && value.length > 2) {
                        const uniqueItems = [
                            ...new Set(
                                activities.map((a) => a.item.toLowerCase()),
                            ),
                        ];
                        setSuggestions(
                            uniqueItems.filter((i) =>
                                i.includes(value.toLowerCase()),
                            ),
                        );
                    } else {
                        setSuggestions([]);
                    }
                };

                const handleSuggestionClick = (suggestion) => {
                    const existing = activities.find(
                        (a) => a.item.toLowerCase() === suggestion,
                    );
                    setForm({
                        ...form,
                        item: existing.item,
                        category: existing.category,
                    });
                    setSuggestions([]);
                };

                const handleSave = () => {
                    if (form.item.trim()) {
                        onSave(form, keepOpen);
                        if (keepOpen) {
                            const newTime = form.timeTo;
                            setForm({
                                date: form.date,
                                timeFrom: newTime,
                                timeTo: "",
                                item: "",
                                category: form.category,
                                status: form.status,
                                notes: "",
                            });
                        }
                    }
                };

                return (
                    <div className="modal-overlay" onClick={onClose}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="modal-title">
                                {activity ? "Edit" : "Add"} Activity
                            </h2>
                            <div className="form-group">
                                <label className="form-label">Activity</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.item}
                                    onChange={(e) =>
                                        handleChange("item", e.target.value)
                                    }
                                    placeholder="What did you do?"
                                    autoFocus
                                />
                                {suggestions.length > 0 && (
                                    <ul className="suggestions-list">
                                        {suggestions.map((s) => (
                                            <li
                                                key={s}
                                                onClick={() =>
                                                    handleSuggestionClick(s)
                                                }
                                            >
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={form.date}
                                        onChange={(e) =>
                                            handleChange("date", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        Category
                                    </label>
                                    <select
                                        className="form-select"
                                        value={form.category}
                                        onChange={(e) =>
                                            handleChange(
                                                "category",
                                                e.target.value,
                                            )
                                        }
                                    >
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.name}>
                                                {c.icon} {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">From</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={form.timeFrom}
                                        onChange={(e) =>
                                            handleChange(
                                                "timeFrom",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">To</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={form.timeTo}
                                        onChange={(e) =>
                                            handleChange(
                                                "timeTo",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    marginTop: "-6px",
                                    marginBottom: "12px",
                                    color: endsNextDay
                                        ? "var(--accent-red)"
                                        : "var(--text-muted)",
                                    fontSize: "12px",
                                }}
                            >
                                {form.timeFrom && form.timeTo ? (
                                    endsNextDay ? (
                                        <>
                                            To time is treated as{" "}
                                            <b>next day</b> ({inferredEndDate}).
                                            This helps overnight activities like
                                            Sleep.
                                        </>
                                    ) : (
                                        <>End date: {inferredEndDate}</>
                                    )
                                ) : (
                                    <>
                                        Tip: after setting From, To auto-fills
                                        +1 hour and supports overnight spans.
                                    </>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={form.status}
                                    onChange={(e) =>
                                        handleChange("status", e.target.value)
                                    }
                                >
                                    {statuses.map((s) => (
                                        <option key={s.id} value={s.name}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Notes</label>
                                <textarea
                                    className="form-textarea"
                                    value={form.notes}
                                    onChange={(e) =>
                                        handleChange("notes", e.target.value)
                                    }
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <label style={{ marginRight: "auto" }}>
                                    <input
                                        type="checkbox"
                                        checked={keepOpen}
                                        onChange={(e) =>
                                            setKeepOpen(e.target.checked)
                                        }
                                    />
                                    Continue adding
                                </label>
                                <button
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            function BulkEditModal({
                title,
                activityIds,
                activities,
                categories,
                statuses,
                defaultCategory = "",
                defaultStatus = "",
                onEditActivity,
                onApply,
                onClose,
            }) {
                const idSet = useMemo(
                    () => new Set(activityIds || []),
                    [activityIds],
                );
                const related = useMemo(() => {
                    return (activities || []).filter((a) => idSet.has(a.id));
                }, [activities, idSet]);

                const sortedRelated = useMemo(() => {
                    const list = [...(related || [])];
                    list.sort((a, b) => {
                        const dc = String(b.date || "").localeCompare(
                            String(a.date || ""),
                        );
                        if (dc !== 0) return dc;
                        return String(b.timeFrom || "").localeCompare(
                            String(a.timeFrom || ""),
                        );
                    });
                    return list;
                }, [related]);

                const commonCategory = useMemo(() => {
                    const counts = new Map();
                    for (const a of related) {
                        const val = String(a?.category || "");
                        if (!val) continue;
                        counts.set(val, (counts.get(val) || 0) + 1);
                    }
                    return (
                        [...counts.entries()].sort(
                            (a, b) => b[1] - a[1],
                        )[0]?.[0] || ""
                    );
                }, [related]);
                const commonStatus = useMemo(() => {
                    const counts = new Map();
                    for (const a of related) {
                        const val = String(a?.status || "");
                        if (!val) continue;
                        counts.set(val, (counts.get(val) || 0) + 1);
                    }
                    return (
                        [...counts.entries()].sort(
                            (a, b) => b[1] - a[1],
                        )[0]?.[0] || ""
                    );
                }, [related]);

                const [category, setCategory] = useState(
                    defaultCategory || commonCategory || "",
                );
                const [status, setStatus] = useState(
                    defaultStatus || commonStatus || "",
                );

                useEffect(() => {
                    setCategory(defaultCategory || commonCategory || "");
                }, [defaultCategory, commonCategory]);
                useEffect(() => {
                    setStatus(defaultStatus || commonStatus || "");
                }, [defaultStatus, commonStatus]);

                const [query, setQuery] = useState("");
                const visibleRelated = useMemo(() => {
                    const q = normalizeTextForMatch(query);
                    if (!q) return sortedRelated;
                    return (sortedRelated || []).filter((a) => {
                        const hay = normalizeTextForMatch(
                            `${a.item || ""} ${a.category || ""} ${a.status || ""} ${a.notes || ""} ${a.date || ""} ${a.timeFrom || ""} ${a.timeTo || ""}`,
                        );
                        return hay.includes(q);
                    });
                }, [sortedRelated, query]);

                const apply = () => {
                    const updates = {};
                    if (category) updates.category = category;
                    if (status) updates.status = status;
                    if (Object.keys(updates).length === 0) {
                        onClose && onClose();
                        return;
                    }
                    onApply && onApply(activityIds || [], updates);
                    onClose && onClose();
                };

                return (
                    <div
                        className="modal-overlay"
                        style={{ zIndex: 990 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose && onClose();
                        }}
                    >
                        <div
                            className="modal"
                            style={{ maxWidth: "720px" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="modal-title">
                                {title || "Bulk Edit Activities"}
                            </h2>
                            <div style={{ color: "var(--text-secondary)" }}>
                                Editing <b>{related.length}</b> activities.
                            </div>

                            <div
                                className="form-row"
                                style={{ marginTop: "16px" }}
                            >
                                <div
                                    className="form-group"
                                    style={{ marginBottom: 0 }}
                                >
                                    <label className="form-label">
                                        Category
                                    </label>
                                    <select
                                        className="form-select"
                                        value={category}
                                        onChange={(e) =>
                                            setCategory(e.target.value)
                                        }
                                    >
                                        <option value="">(No change)</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.name}>
                                                {c.icon} {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div
                                    className="form-group"
                                    style={{ marginBottom: 0 }}
                                >
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                    >
                                        <option value="">(No change)</option>
                                        {statuses.map((s) => (
                                            <option key={s.id} value={s.name}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="optimizer-section">
                                <div className="optimizer-section-title">
                                    Related activities
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        alignItems: "center",
                                        margin: "10px 0 12px",
                                    }}
                                >
                                    <input
                                        className="form-input"
                                        placeholder="Filter related..."
                                        value={query}
                                        onChange={(e) =>
                                            setQuery(e.target.value)
                                        }
                                    />
                                    {query && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setQuery("")}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div
                                    style={{
                                        maxHeight: "220px",
                                        overflow: "auto",
                                        background: "#fafbff",
                                        border: "1px solid #eef0ff",
                                        borderRadius: "12px",
                                        padding: "10px 12px",
                                    }}
                                >
                                    {visibleRelated.length === 0 && (
                                        <div
                                            style={{
                                                color: "var(--text-muted)",
                                                padding: "6px 0",
                                            }}
                                        >
                                            No matching activities.
                                        </div>
                                    )}
                                    {(visibleRelated || []).map((a) => (
                                        <div
                                            key={a.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: "12px",
                                                padding: "6px 0",
                                                borderBottom:
                                                    "1px solid rgba(0,0,0,0.04)",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <b>{a.item}</b>{" "}
                                                <span
                                                    style={{
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    ({a.date} {a.timeFrom}–
                                                    {a.timeTo})
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "10px",
                                                    alignItems: "center",
                                                    whiteSpace: "nowrap",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        color: "var(--text-secondary)",
                                                    }}
                                                >
                                                    {a.category} · {a.status}
                                                </div>
                                                {onEditActivity && (
                                                    <button
                                                        className="btn btn-sm btn-secondary"
                                                        onClick={() =>
                                                            onEditActivity(a)
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {query &&
                                        visibleRelated.length !==
                                            related.length && (
                                            <div
                                                style={{
                                                    paddingTop: "8px",
                                                    color: "var(--text-muted)",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                Showing {visibleRelated.length}{" "}
                                                of {related.length}.
                                            </div>
                                        )}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={apply}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            function OptimizerModal({
                scopeActivities,
                historyActivities,
                categories,
                statuses,
                onBulkUpdate,
                onAdd,
                onEdit,
                onCreateCategory,
                onClose,
            }) {
                const readCheckEnabled = (key) => {
                    const raw = getLS(key, true);
                    if (raw === false || raw === 0) return false;
                    const s = String(raw || "")
                        .trim()
                        .toLowerCase();
                    if (s === "false" || s === "0" || s === "off" || s === "no")
                        return false;
                    return true;
                };

                const [categoryEnabled, setCategoryEnabled] = useState(() =>
                    readCheckEnabled(OPTIMIZER_CATEGORY_ENABLED_KEY),
                );
                const [timeEnabled, setTimeEnabled] = useState(() =>
                    readCheckEnabled(OPTIMIZER_TIME_ENABLED_KEY),
                );
                const [gapsEnabled, setGapsEnabled] = useState(() =>
                    readCheckEnabled(OPTIMIZER_GAPS_ENABLED_KEY),
                );

                const computeIssues = (overrideOptions = {}) => {
                    const res = analyzeActivitiesOptimizer({
                        scopeActivities,
                        historyActivities,
                        categories,
                        statuses,
                        options: {
                            enableCategory: categoryEnabled,
                            enableTime: timeEnabled,
                            enableGaps: gapsEnabled,
                            ...overrideOptions,
                        },
                    });
                    return res.issues || [];
                };

                const [ignoredIssueIds, setIgnoredIssueIds] = useState(() =>
                    (getLS(OPTIMIZER_IGNORED_KEY, []) || []).filter(Boolean),
                );
                const ignoredSet = useMemo(
                    () => new Set(ignoredIssueIds || []),
                    [ignoredIssueIds],
                );
                const ignoreIssue = (id) => {
                    if (!id) return;
                    setIgnoredIssueIds((prev) => {
                        const list = Array.isArray(prev) ? prev : [];
                        if (list.includes(id)) return list;
                        const next = [...list, id];
                        setLS(OPTIMIZER_IGNORED_KEY, next);
                        return next;
                    });
                };
                const resetIgnores = () => {
                    setIgnoredIssueIds([]);
                    setLS(OPTIMIZER_IGNORED_KEY, []);
                };

                const [issuesSnapshot, setIssuesSnapshot] = useState(() =>
                    computeIssues(),
                );

                const issues = useMemo(
                    () =>
                        (issuesSnapshot || []).filter(
                            (i) => i && i.id && !ignoredSet.has(i.id),
                        ),
                    [issuesSnapshot, ignoredSet],
                );

                const [bulkEditConfig, setBulkEditConfig] = useState(null);
                const [categoryEdits, setCategoryEdits] = useState({});
                const getEditedCategoryName = (issue, fallback) => {
                    const raw =
                        categoryEdits[issue.id] ??
                        issue.suggestedName ??
                        fallback ??
                        "";
                    return String(raw || "").trim();
                };

                const rerun = () => {
                    setIssuesSnapshot(computeIssues());
                };
                const toggleCategoryEnabled = (enabled) => {
                    const next = Boolean(enabled);
                    setCategoryEnabled(next);
                    setLS(OPTIMIZER_CATEGORY_ENABLED_KEY, next);
                    setIssuesSnapshot(
                        computeIssues({
                            enableCategory: next,
                        }),
                    );
                };
                const toggleTimeEnabled = (enabled) => {
                    const next = Boolean(enabled);
                    setTimeEnabled(next);
                    setLS(OPTIMIZER_TIME_ENABLED_KEY, next);
                    setIssuesSnapshot(
                        computeIssues({
                            enableTime: next,
                        }),
                    );
                };
                const toggleGapsEnabled = (enabled) => {
                    const next = Boolean(enabled);
                    setGapsEnabled(next);
                    setLS(OPTIMIZER_GAPS_ENABLED_KEY, next);
                    setIssuesSnapshot(computeIssues({ enableGaps: next }));
                };
                const counts = useMemo(() => {
                    const out = { error: 0, warn: 0, info: 0 };
                    for (const i of issues) {
                        out[i.severity] = (out[i.severity] || 0) + 1;
                    }
                    return out;
                }, [issues]);

                const dayCount = useMemo(() => {
                    const s = new Set(
                        (scopeActivities || [])
                            .map((a) => a.date)
                            .filter(Boolean),
                    );
                    return s.size;
                }, [scopeActivities]);

                const sections = useMemo(() => {
                    const byKind = {
                        category: [],
                        other: [],
                        time: [],
                        gap: [],
                    };
                    for (const i of issues) {
                        if (byKind[i.kind]) byKind[i.kind].push(i);
                    }
                    return [
                        {
                            key: "category",
                            title: "Category & Tagging",
                            items: [...byKind.category, ...byKind.other],
                        },
                        {
                            key: "time",
                            title: "Time Conflicts",
                            items: byKind.time,
                        },
                        { key: "gap", title: "Gaps", items: byKind.gap },
                    ];
                }, [issues]);

                const severityIcon = (sev) => {
                    if (sev === "error") return "×";
                    if (sev === "warn") return "!";
                    return "i";
                };

                const handleAction = (issue, action) => {
                    if (!action) return;
                    if (action.kind === "createCategory") {
                        const name = getEditedCategoryName(
                            issue,
                            action.name || action.defaultName,
                        );
                        if (!name) return;
                        onCreateCategory && onCreateCategory(name);
                        return;
                    }
                    if (action.kind === "bulkEdit") {
                        setBulkEditConfig({
                            title:
                                action.title ||
                                `Manual edit related activities`,
                            ids: action.ids || [],
                            defaultCategory: action.defaultCategory || "",
                            defaultStatus: action.defaultStatus || "",
                        });
                        return;
                    }
                    if (action.kind === "applyCategory") {
                        const categoryName = getEditedCategoryName(
                            issue,
                            action.category || action.defaultName,
                        );
                        if (!categoryName) return;
                        if (action.alsoCreate && onCreateCategory) {
                            onCreateCategory(categoryName);
                        }
                        onBulkUpdate &&
                            onBulkUpdate(action.ids || [], {
                                category: categoryName,
                            });
                        return;
                    }
                    if (action.kind === "addActivity") {
                        onAdd && onAdd(action.prefill || null);
                        return;
                    }
                    if (action.kind === "editActivity") {
                        const target = (historyActivities || []).find(
                            (a) => a.id === action.activityId,
                        );
                        if (target && onEdit) onEdit(target);
                    }
                };

                return (
                    <div
                        className="modal-overlay"
                        style={{ zIndex: 980 }}
                        onClick={onClose}
                    >
                        <div
                            className="modal optimizer-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="modal-title">
                                Activities Optimizer
                            </h2>
                            <div style={{ color: "var(--text-secondary)" }}>
                                Runs checks on your current Activities filters
                                using your full history for smarter suggestions.
                            </div>
                            <div className="optimizer-summary">
                                <div className="optimizer-chip">
                                    Scope: <b>{scopeActivities?.length || 0}</b>{" "}
                                    activities
                                </div>
                                <div className="optimizer-chip">
                                    Days: <b>{dayCount}</b>
                                </div>
                                <div className="optimizer-chip">
                                    Issues: <b>{issues.length}</b> ({" "}
                                    {counts.error} errors, {counts.warn} warns,{" "}
                                    {counts.info} info )
                                </div>
                                <div className="optimizer-chip">
                                    Ignored: <b>{ignoredIssueIds.length}</b>
                                </div>
                            </div>

                            {issues.length === 0 && (
                                <div
                                    className="empty-state"
                                    style={{ margin: 0 }}
                                >
                                    <div className="empty-icon">✅</div>
                                    <h3 className="empty-title">All good!</h3>
                                    <p>No issues found in current scope.</p>
                                </div>
                            )}

                            {sections.map((section) => {
                                const enabled =
                                    section.key === "category"
                                        ? categoryEnabled
                                        : section.key === "time"
                                          ? timeEnabled
                                          : section.key === "gap"
                                            ? gapsEnabled
                                            : true;
                                const onToggle =
                                    section.key === "category"
                                        ? toggleCategoryEnabled
                                        : section.key === "time"
                                          ? toggleTimeEnabled
                                          : section.key === "gap"
                                            ? toggleGapsEnabled
                                            : null;
                                return (
                                    <div
                                        key={section.key}
                                        className="optimizer-section"
                                    >
                                        <div
                                            className="optimizer-section-title"
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: "12px",
                                            }}
                                        >
                                            <span>{section.title}</span>
                                            {onToggle && (
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "6px",
                                                        fontSize: "12px",
                                                        color: "var(--text-muted)",
                                                    }}
                                                >
                                                    Check:
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(
                                                            enabled,
                                                        )}
                                                        onChange={(e) =>
                                                            onToggle(
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        style={{
                                                            width: "16px",
                                                            height: "16px",
                                                            accentColor:
                                                                "var(--primary)",
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            fontWeight: 700,
                                                            color: enabled
                                                                ? "var(--accent-green)"
                                                                : "var(--text-muted)",
                                                        }}
                                                    >
                                                        {enabled ? "On" : "Off"}
                                                    </span>
                                                </span>
                                            )}
                                        </div>

                                        {section.items.length > 0 && (
                                            <div className="issue-list">
                                                {section.items.map((issue) => (
                                                    <div
                                                        key={issue.id}
                                                        className="issue-card"
                                                    >
                                                        <div
                                                            className={`issue-badge ${issue.severity}`}
                                                        >
                                                            {severityIcon(
                                                                issue.severity,
                                                            )}
                                                        </div>
                                                        <div className="issue-content">
                                                            <div className="issue-title">
                                                                {issue.suggestedName
                                                                    ? `New category candidate: "${getEditedCategoryName(issue, issue.suggestedName) || issue.suggestedName}"`
                                                                    : issue.title}
                                                            </div>
                                                            {issue.meta && (
                                                                <div className="issue-meta">
                                                                    {issue.meta}
                                                                </div>
                                                            )}
                                                            <div className="issue-details">
                                                                {Array.isArray(
                                                                    issue.details,
                                                                ) ? (
                                                                    <ul
                                                                        style={{
                                                                            marginLeft:
                                                                                "18px",
                                                                        }}
                                                                    >
                                                                        {issue.details.map(
                                                                            (
                                                                                line,
                                                                                idx,
                                                                            ) => (
                                                                                <li
                                                                                    key={`${issue.id}-${idx}`}
                                                                                >
                                                                                    {
                                                                                        line
                                                                                    }
                                                                                </li>
                                                                            ),
                                                                        )}
                                                                    </ul>
                                                                ) : (
                                                                    issue.details
                                                                )}
                                                            </div>
                                                            {issue.suggestedName && (
                                                                <div
                                                                    style={{
                                                                        marginTop:
                                                                            "10px",
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            fontSize:
                                                                                "11px",
                                                                            fontWeight: 700,
                                                                            color: "var(--text-muted)",
                                                                            textTransform:
                                                                                "uppercase",
                                                                            letterSpacing:
                                                                                "0.5px",
                                                                            marginBottom:
                                                                                "6px",
                                                                        }}
                                                                    >
                                                                        Category
                                                                        name
                                                                    </div>
                                                                    <input
                                                                        className="form-input"
                                                                        style={{
                                                                            padding:
                                                                                "10px 12px",
                                                                        }}
                                                                        value={
                                                                            categoryEdits[
                                                                                issue
                                                                                    .id
                                                                            ] ??
                                                                            issue.suggestedName
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setCategoryEdits(
                                                                                (
                                                                                    prev,
                                                                                ) => ({
                                                                                    ...prev,
                                                                                    [issue.id]:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }),
                                                                            )
                                                                        }
                                                                        placeholder="New category name"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="issue-actions">
                                                                {(
                                                                    issue.actions ||
                                                                    []
                                                                ).map(
                                                                    (
                                                                        a,
                                                                        idx,
                                                                    ) => (
                                                                        <button
                                                                            key={`${issue.id}-a-${idx}`}
                                                                            className="btn btn-sm btn-secondary"
                                                                            onClick={() =>
                                                                                handleAction(
                                                                                    issue,
                                                                                    a,
                                                                                )
                                                                            }
                                                                        >
                                                                            {
                                                                                a.label
                                                                            }
                                                                        </button>
                                                                    ),
                                                                )}
                                                                <button
                                                                    className="btn btn-sm btn-secondary"
                                                                    onClick={() =>
                                                                        ignoreIssue(
                                                                            issue.id,
                                                                        )
                                                                    }
                                                                >
                                                                    Ignore
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={rerun}
                                >
                                    Re-run
                                </button>
                                {ignoredIssueIds.length > 0 && (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={resetIgnores}
                                    >
                                        Reset ignores
                                    </button>
                                )}
                                <button
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        {bulkEditConfig && (
                            <BulkEditModal
                                title={bulkEditConfig.title}
                                activityIds={bulkEditConfig.ids}
                                activities={historyActivities}
                                categories={categories}
                                statuses={statuses}
                                defaultCategory={bulkEditConfig.defaultCategory}
                                defaultStatus={bulkEditConfig.defaultStatus}
                                onEditActivity={onEdit}
                                onApply={(ids, updates) =>
                                    onBulkUpdate && onBulkUpdate(ids, updates)
                                }
                                onClose={() => setBulkEditConfig(null)}
                            />
                        )}
                    </div>
                );
            }

            function Profile({ onBack }) {
                const [savedProfile, setSavedProfile] = useState(() =>
                    getLS(PROFILE_KEY, defaultProfile),
                );
                const [draft, setDraft] = useState(savedProfile);

                const profileDirty = useMemo(
                    () =>
                        JSON.stringify(draft) !== JSON.stringify(savedProfile),
                    [draft, savedProfile],
                );

                const initials = useMemo(() => {
                    const raw = String(draft.name || "").trim();
                    if (!raw) return "Y";
                    const parts = raw.split(/\s+/).filter(Boolean);
                    return (
                        parts
                            .slice(0, 2)
                            .map((p) => p.slice(0, 1).toUpperCase())
                            .join("") || "Y"
                    );
                }, [draft.name]);

                const updateField = (key, value) =>
                    setDraft((prev) => ({ ...prev, [key]: value }));

                const handleAvatarUpload = (file) => {
                    if (!file) return;
                    if (!file.type || !file.type.startsWith("image/")) {
                        alert("Please select an image file.");
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result;
                        if (typeof result === "string") {
                            updateField("avatarDataUrl", result);
                        }
                    };
                    reader.onerror = () => {
                        alert("❌ Failed to read image file.");
                    };
                    reader.readAsDataURL(file);
                };

                const handleSave = () => {
                    const next = {
                        name: String(draft.name || "").trim(),
                        school: String(draft.school || "").trim(),
                        grade: String(draft.grade || "").trim(),
                        email: String(draft.email || "").trim(),
                        avatarDataUrl: String(draft.avatarDataUrl || ""),
                    };
                    setLS(PROFILE_KEY, next);
                    setSavedProfile(next);
                    setDraft(next);
                    alert("✅ Profile saved.");
                };

                const handleReset = () => {
                    setDraft(savedProfile);
                };

                return (
                    <div className="animate-fade-in">
                        <div className="page-header">
                            <div>
                                <h1 className="page-title">Profile</h1>
                                <div className="page-subtitle">
                                    Manage your basic information.
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onBack}
                                >
                                    ← Back
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={!profileDirty}
                                >
                                    Save
                                </button>
                            </div>
                        </div>

                        <div className="settings-section">
                            <h2 className="settings-title">Basic Info</h2>

                            <div className="profile-avatar-row">
                                <div className="profile-avatar">
                                    {draft.avatarDataUrl ? (
                                        <img
                                            src={draft.avatarDataUrl}
                                            alt="Avatar"
                                        />
                                    ) : (
                                        <span>{initials}</span>
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: "220px" }}>
                                    <div className="profile-avatar-actions">
                                        <label className="btn btn-secondary">
                                            📷 Upload Avatar
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                onChange={(e) =>
                                                    handleAvatarUpload(
                                                        e.target.files?.[0],
                                                    )
                                                }
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() =>
                                                updateField("avatarDataUrl", "")
                                            }
                                            disabled={!draft.avatarDataUrl}
                                        >
                                            Remove Avatar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleReset}
                                            disabled={!profileDirty}
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    <div
                                        className="profile-hint"
                                        style={{ marginTop: "10px" }}
                                    >
                                        Saved locally in this browser.
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        className="form-input"
                                        value={draft.name}
                                        onChange={(e) =>
                                            updateField("name", e.target.value)
                                        }
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Grade</label>
                                    <input
                                        className="form-input"
                                        value={draft.grade}
                                        onChange={(e) =>
                                            updateField("grade", e.target.value)
                                        }
                                        placeholder="Year 9"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">School</label>
                                    <input
                                        className="form-input"
                                        value={draft.school}
                                        onChange={(e) =>
                                            updateField(
                                                "school",
                                                e.target.value,
                                            )
                                        }

    global.Settings = Settings;
    global.Profile = Profile;

})(window);
(function (global) {
  "use strict";

  const { useState, useMemo } = React;

  function Dashboard({ activities, categories, statuses, onAdd, setPage }) {
    const [viewDate, setViewDate] = useState(global.getLocalDateStr());
    const [viewMode, setViewMode] = useState("daily");
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({
      x: 0,
      y: 0,
    });
    const getDateRange = useMemo(() => {
      const baseDate = new Date(viewDate + "T00:00:00");
      if (viewMode === "daily")
        return {
          start: viewDate,
          end: viewDate,
          label: global.formatDate(viewDate),
        };
      if (viewMode === "weekly") {
        const day = baseDate.getDay();
        const startD = new Date(baseDate);
        startD.setDate(baseDate.getDate() - day);
        const endD = new Date(startD);
        endD.setDate(startD.getDate() + 6);
        return {
          start: global.getLocalDateStr(startD),
          end: global.getLocalDateStr(endD),
          label: `${global.formatDate(startD)} - ${global.formatDate(endD)}`,
        };
      }
      if (viewMode === "monthly") {
        const startD = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        const endD = new Date(
          baseDate.getFullYear(),
          baseDate.getMonth() + 1,
          0,
        );
        return {
          start: global.getLocalDateStr(startD),
          end: global.getLocalDateStr(endD),
          label: `${startD.toLocaleDateString("en-NZ", { month: "long", year: "numeric" })}`,
        };
      }
      const startD = new Date(baseDate.getFullYear(), 0, 1);
      const endD = new Date(baseDate.getFullYear(), 11, 31);
      return {
        start: global.getLocalDateStr(startD),
        end: global.getLocalDateStr(endD),
        label: `Year ${baseDate.getFullYear()}`,
      };
    }, [viewDate, viewMode]);
    const filteredActs = useMemo(
      () =>
        activities
          .filter(
            (a) => a.date >= getDateRange.start && a.date <= getDateRange.end,
          )
          .sort((a, b) => {
            const dc = b.date.localeCompare(a.date);
            return dc !== 0
              ? dc
              : (b.timeFrom || "00:00").localeCompare(a.timeFrom || "00:00");
          }),
      [activities, getDateRange],
    );

    const handlePieChartHover = (category, event) => {
      setHoveredCategory(category);
      if (event) {
        setTooltipPosition({
          x: event.clientX,
          y: event.clientY,
        });
      }
    };

    const stats = useMemo(() => {
      const cs = categories.map((c) => {
        const ca = filteredActs.filter((a) => a.category === c.name);
        const mins = ca.reduce(
          (s, a) => s + global.calcDuration(a.timeFrom, a.timeTo),
          0,
        );
        return {
          ...c,
          activities: ca,
          minutes: mins,
          hours: (mins / 60).toFixed(1),
        };
      });
      const totalMins = cs.reduce((s, c) => s + c.minutes, 0);
      return cs
        .map((c) => ({
          ...c,
          percentage:
            totalMins > 0 ? ((c.minutes / totalMins) * 100).toFixed(0) : 0,
        }))
        .sort((a, b) => b.minutes - a.minutes);
    }, [filteredActs, categories]);

    const pieData = useMemo(
      () =>
        stats
          .filter((s) => s.minutes > 0)
          .map((s) => ({
            name: s.name,
            value: s.minutes,
            color: s.color,
            icon: s.icon,
          })),
      [stats],
    );

    const statusStats = useMemo(() => {
      const ss = statuses.map((s) => ({
        name: s.name,
        value: filteredActs.filter((a) => a.status === s.name).length,
        color: s.color,
      }));
      return ss.filter((s) => s.value > 0);
    }, [filteredActs, statuses]);

    const classifyHealthCategory = (name, icon) => {
      const raw = String(name || "");
      const norm = global.normalizeTextForMatch(raw);
      const ic = String(icon || "");

      if (
        /sleep|nap|rest|bed/.test(norm) ||
        raw.includes("睡") ||
        raw.includes("休息") ||
        ic.includes("😴") ||
        ic.includes("🛌")
      )
        return "sleep";
      if (
        /exercise|workout|gym|run|running|walk|sport|fitness/.test(norm) ||
        raw.includes("运动") ||
        raw.includes("锻炼") ||
        raw.includes("健身") ||
        raw.includes("跑") ||
        ic.includes("🏃") ||
        ic.includes("🏋") ||
        ic.includes("🚴")
      )
        return "exercise";
      if (
        /study|learn|learning|read|reading|school|class|course|homework|revision/.test(
          norm,
        ) ||
        raw.includes("学习") ||
        raw.includes("读书") ||
        raw.includes("阅读") ||
        raw.includes("复习") ||
        raw.includes("作业") ||
        ic.includes("📚") ||
        ic.includes("📝")
      )
        return "study";
      if (
        /entertainment|fun|game|gaming|video|tv|movie|music|play|social media|tiktok|douyin|bilibili|youtube|netflix/.test(
          norm,
        ) ||
        raw.includes("娱乐") ||
        raw.includes("游戏") ||
        raw.includes("电影") ||
        raw.includes("电视剧") ||
        raw.includes("刷") ||
        raw.includes("抖") ||
        ic.includes("🎮") ||
        ic.includes("🎬") ||
        ic.includes("🎵")
      )
        return "entertainment";

      return null;
    };

    const healthBuckets = useMemo(() => {
      const totals = {
        study: 0,
        exercise: 0,
        sleep: 0,
        entertainment: 0,
      };
      for (const s of stats || []) {
        const bucket = classifyHealthCategory(s.name, s.icon);
        if (!bucket) continue;
        totals[bucket] += s.minutes || 0;
      }
      return totals;
    }, [stats]);

    const healthScore = useMemo(() => {
      const st = healthBuckets.study || 0;
      const ex = healthBuckets.exercise || 0;
      const sl = healthBuckets.sleep || 0;
      const en = healthBuckets.entertainment || 0;

      const mult =
        viewMode === "daily"
          ? 1
          : viewMode === "weekly"
            ? 7
            : viewMode === "monthly"
              ? 30
              : 365;

      let score = 50;

      if (st >= 180 * mult * 0.8 && st <= 180 * mult * 1.5) {
        score += 15;
      } else if (st >= 180 * mult * 0.5) {
        score += 10;
      }

      if (ex >= 45 * mult * 0.7) score += 15;
      else if (ex > 0) score += 8;

      if (sl >= 480 * mult * 0.9 && sl <= 480 * mult * 1.1) {
        score += 15;
      } else if (sl >= 480 * mult * 0.8) {
        score += 10;
      }

      if (en > 0 && en <= 120 * mult) score += 5;
      else if (en > 120 * mult) score -= 5;

      return Math.min(100, Math.max(0, Math.round(score)));
    }, [healthBuckets, viewMode]);

    const healthTips = useMemo(() => {
      const tips = [];

      const st = healthBuckets.study || 0;
      const ex = healthBuckets.exercise || 0;
      const en = healthBuckets.entertainment || 0;

      const mult =
        viewMode === "daily"
          ? 1
          : viewMode === "weekly"
            ? 7
            : viewMode === "monthly"
              ? 30
              : 365;

      if (st < 90 * mult) {
        tips.push({
          icon: "📚",
          text: `Study time is low. Aim for ${((180 * mult) / 60).toFixed(0)}h ${viewMode}.`,
        });
      }
      if (ex < 22 * mult) {
        tips.push({
          icon: "🏃",
          text: `Exercise more! Target: ${((45 * mult) / 60).toFixed(1)}h ${viewMode}.`,
        });
      }
      if (en > 180 * mult) {
        tips.push({
          icon: "🎮",
          text: "Screen time is high.",
        });
      }
      if (healthScore >= 80) {
        tips.push({
          icon: "🌟",
          text: "Excellent balance!",
        });
      }
      if (tips.length === 0) {
        tips.push({
          icon: "✨",
          text: "Start logging activities!",
        });
      }

      return tips;
    }, [healthBuckets, healthScore, viewMode]);

    const getColor = (score) => {
      if (score > 80) return "var(--accent-green)";
      if (score > 60) return "var(--accent-blue)";
      if (score > 40) return "var(--accent-orange)";
      return "var(--accent-red)";
    };

    const getGreeting = () => {
      const h = new Date().getHours();
      return h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening";
    };
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Good {getGreeting()}, Yang! 👋</h1>
            <p className="page-subtitle">{getDateRange.label}</p>
          </div>
          <button className="btn btn-primary" onClick={onAdd}>
            ➕ Add Activity
          </button>
        </div>
        <div className="date-picker-row">
          <input
            type="date"
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setViewDate(global.getLocalDateStr())}
          >
            Today
          </button>
          <div className="period-selector" style={{ marginBottom: 0 }}>
            {["daily", "weekly", "monthly", "yearly"].map((m) => (
              <button
                key={m}
                className={`period-btn ${viewMode === m ? "active" : ""}`}
                onClick={() => setViewMode(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="dashboard-grid">
          {stats.slice(0, 4).map((s) => (
            <div key={s.id} className={`stat-card ${s.name.toLowerCase()}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.hours}h</div>
              <div className="stat-label">
                {s.name} ({s.percentage}%)
              </div>
            </div>
          ))}
        </div>
        <div className="charts-grid">
          <div className="chart-card">
            <div className="card-header">
              <h3 className="card-title">Time by Category</h3>
            </div>
            <global.PieChart
              data={pieData}
              totalLabel={viewMode}
              onHover={handlePieChartHover}
              hoveredCategory={hoveredCategory}
            />
          </div>
          <div className="chart-card">
            <div className="card-header">
              <h3 className="card-title">Status Distribution</h3>
            </div>
            <global.BarChart data={statusStats} />
          </div>
          <div className="chart-card">
            <div className="card-header">
              <h3 className="card-title">Health Score</h3>
            </div>
            <div className="health-score-container">
              <div
                className="health-score-circle"
                style={{
                  background: `conic-gradient(${getColor(healthScore)} ${healthScore * 3.6}deg, #F5F5FA ${healthScore * 3.6}deg)`,
                }}
              >
                <div className="health-score-inner">
                  <div
                    className="health-score-value"
                    style={{
                      color: getColor(healthScore),
                    }}
                  >
                    {healthScore}
                  </div>
                  <div className="health-score-label">/ 100</div>
                </div>
              </div>
            </div>
            <div className="health-suggestions">
              <div className="health-suggestions-title">
                💡 Smart Suggestions
              </div>
              <div>
                {healthTips.map((t, i) => (
                  <div key={i} className="suggestion-item">
                    <div className="suggestion-icon">{t.icon}</div>
                    <div className="suggestion-text">{t.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {hoveredCategory && (
          <global.Tooltip
            activities={
              stats.find((s) => s.name === hoveredCategory)?.activities
            }
            category={hoveredCategory}
            position={tooltipPosition}
          />
        )}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activities</h2>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage("activities")}
            >
              View All
            </button>
          </div>
          <global.Activities
            activities={activities
              .sort(
                (a, b) =>
                  new Date(b.date) - new Date(a.date) ||
                  (b.timeFrom || "").localeCompare(a.timeFrom || ""),
              )
              .slice(0, 5)}
            categories={categories}
            statuses={statuses}
            condensed
          />
        </div>
      </div>
    );
  }
  global.Dashboard = Dashboard;
})(window);
(function(global) {
    'use strict';

    const { useState, useEffect, useMemo, useRef } = React;

            function App() {
                const [page, setPage] = useState("dashboard");
                const [activities, setActivities] = useState([]);
                const [categories, setCategories] = useState(defaultCategories);
                const [statuses, setStatuses] = useState(defaultStatuses);
                const [showModal, setShowModal] = useState(false);
                const [editingActivity, setEditingActivity] = useState(null);
                const [prefillActivity, setPrefillActivity] = useState(null);
                const [selectedDate, setSelectedDate] = useState(new Date());
                const [calendarView, setCalendarView] = useState("month");
                const [period, setPeriod] = useState("daily");
                const [isLoading, setIsLoading] = useState(true);
                const [isSaving, setIsSaving] = useState(false);
                const [isSyncing, setIsSyncing] = useState(false);
                const [confirmConfig, setConfirmConfig] = useState(null);
                const [reportPhoneNumber, setReportPhoneNumber] = useState("");
                const [showReportModal, setShowReportModal] = useState(false);
                const [reportDate, setReportDate] = useState(getLocalDateStr());
                const [reminderEnabled, setReminderEnabled] = useState(() => {
                    const raw = getLS(REMINDER_ENABLED_KEY, true);
                    if (raw === false || raw === 0) return false;
                    const s = String(raw || "")
                        .trim()
                        .toLowerCase();
                    if (s === "false" || s === "0" || s === "off" || s === "no")
                        return false;
                    return true;
                });
                const [reminderActivity, setReminderActivity] = useState(null);
                const reminderActivityRef = useRef(null);
                const reminderShownIds = useRef(new Set());
                const reminderDayRef = useRef(getLocalDateStr());
                const activitiesRef = useRef([]);
                const statusesRef = useRef([]);

                useEffect(() => {
                    setReportPhoneNumber(getLS("yang_report_phone", ""));
                }, []);
                useEffect(() => {
                    setLS("yang_report_phone", reportPhoneNumber);
                }, [reportPhoneNumber]);

                useEffect(() => {
                    loadDataFromGitHub().then((data) => {
                        if (data.activities) setActivities(data.activities);
                        if (data.categories) setCategories(data.categories);
                        if (data.statuses) setStatuses(data.statuses);
                        setIsLoading(false);
                    });
                }, []);
                useEffect(() => {
                    if (!isLoading) {
                        setLS("yang_activities", activities);
                        setLS("yang_last_updated", Date.now());
                    }
                }, [activities, isLoading]);
                useEffect(() => {
                    if (!isLoading) setLS("yang_categories", categories);
                }, [categories, isLoading]);
                useEffect(() => {
                    if (!isLoading) setLS("yang_statuses", statuses);
                }, [statuses, isLoading]);
                useEffect(() => {
                    setLS(REMINDER_ENABLED_KEY, reminderEnabled);
                    if (!reminderEnabled) setReminderActivity(null);
                }, [reminderEnabled]);
                useEffect(() => {
                    reminderActivityRef.current = reminderActivity;
                }, [reminderActivity]);
                useEffect(() => {
                    activitiesRef.current = activities;
                }, [activities]);
                useEffect(() => {
                    statusesRef.current = statuses;
                }, [statuses]);

                const handleSaveToGitHub = async (
                    nextActivities = activities,
                    nextCategories = categories,
                    nextStatuses = statuses,
                ) => {
                    setIsSaving(true);
                    const success = await saveDataToGitHub(
                        nextActivities,
                        nextCategories,
                        nextStatuses,
                    );
                    setIsSaving(false);
                    if (!success) {
                        const token = getGitHubToken();
                        alert(
                            token
                                ? "❌ Failed to save to GitHub."
                                : "⚠️ Please set GitHub token in Settings → System.",
                        );
                    }
                };

                const handleForceSync = async () => {
                    setIsSyncing(true);
                    try {
                        localStorage.removeItem("yang_last_updated");
                        const data = await loadDataFromGitHub(true);
                        if (data.activities) setActivities(data.activities);
                        if (data.categories) setCategories(data.categories);
                        if (data.statuses) setStatuses(data.statuses);
                        alert(
                            `✅ 同步成功！已从云端加载 ${data.activities?.length || 0} 条活动记录。`,
                        );
                    } catch (error) {
                        alert("❌ 同步失败，请检查网络连接。");
                    }
                    setIsSyncing(false);
                };

                const maybeTriggerReminder = () => {
                    if (!reminderEnabled) return;
                    if (reminderActivityRef.current) return;
                    const now = new Date();
                    const todayStr = getLocalDateStr(now);
                    if (reminderDayRef.current !== todayStr) {
                        reminderShownIds.current = new Set();
                        reminderDayRef.current = todayStr;
                    }
                    const nowMins = now.getHours() * 60 + now.getMinutes();
                    const planningActs = (activitiesRef.current || []).filter(
                        (a) =>
                            a &&
                            a.date === todayStr &&
                            /^planning$/i.test(String(a.status || "")),
                    );
                    const candidate = planningActs
                        .map((a) => ({
                            activity: a,
                            startMins: timeStrToMins(a.timeFrom),
                        }))
                        .filter((x) => x.startMins != null)
                        .filter(
                            (x) => !reminderShownIds.current.has(x.activity.id),
                        )
                        .sort((a, b) => a.startMins - b.startMins)
                        .find(
                            (x) =>
                                nowMins >= x.startMins &&
                                nowMins <= x.startMins + 10,
                        );
                    if (candidate) {
                        setReminderActivity(candidate.activity);
                        reminderShownIds.current.add(candidate.activity.id);
                    }
                };

                const markPreviousAsFinished = (current) => {
                    if (!current) return;
                    const finishedStatusName =
                        (statusesRef.current || []).find((s) =>
                            /^finished$/i.test(String(s.name || "")),
                        )?.name ||
                        statusesRef.current?.[0]?.name ||
                        "Finished";
                    const currentStart = getActivityStartDate(current);
                    if (!currentStart) return;

                    let previous = null;
                    for (const a of activitiesRef.current || []) {
                        if (a.id === current.id) continue;
                        const start = getActivityStartDate(a);
                        if (!start || start >= currentStart) continue;
                        if (!previous || start > previous.start) {
                            previous = { a, start };
                        }
                    }
                    if (previous && previous.a.status !== finishedStatusName) {
                        const updatedActivities = (
                            activitiesRef.current || []
                        ).map((a) =>
                            a.id === previous.a.id
                                ? { ...a, status: finishedStatusName }
                                : a,
                        );
                        setActivities(updatedActivities);
                        handleSaveToGitHub(
                            updatedActivities,
                            categories,
                            statusesRef.current,
                        );
                    }
                };

                const handleReminderConfirm = () => {
                    if (reminderActivityRef.current) {
                        markPreviousAsFinished(reminderActivityRef.current);
                    }
                    setReminderActivity(null);
                };

                const handleReminderDismiss = () => {
                    setReminderActivity(null);
                };

                useEffect(() => {
                    if (isLoading) return;
                    if (!reminderEnabled) return;
                    const timer = setInterval(() => {
                        if (document.hidden) return;
                        maybeTriggerReminder();
                    }, 30000);
                    maybeTriggerReminder();
                    return () => clearInterval(timer);
                }, [isLoading, reminderEnabled]);

                const addActivity = (a) =>
                    setActivities([...activities, { ...a, id: generateId() }]);
                const updateActivity = (a) =>
                    setActivities(
                        activities.map((x) => (x.id === a.id ? a : x)),
                    );
                const deleteActivity = (id) => {
                    setConfirmConfig({
                        title: "Delete Activity",
                        message:
                            "Are you sure you want to delete this activity?",
                        onConfirm: () => {
                            setActivities((prev) =>
                                prev.filter((a) => a.id !== id),
                            );
                            setConfirmConfig(null);
                            handleSaveToGitHub();
                        },
                    });
                };
                const bulkDeleteActivities = (ids, onSuccess) => {
                    if (!ids || ids.length === 0) return;
                    setConfirmConfig({
                        title: "Bulk Delete",
                        message: `Are you sure you want to delete ${ids.length} activities?`,
                        onConfirm: () => {
                            setActivities((prev) =>
                                prev.filter((a) => !ids.includes(a.id)),
                            );
                            if (onSuccess) onSuccess();
                            setConfirmConfig(null);
                            handleSaveToGitHub();
                        },
                    });
                };
                const bulkUpdateActivities = (ids, updates) => {
                    setActivities((prev) =>
                        prev.map((a) =>
                            ids.includes(a.id) ? { ...a, ...updates } : a,
                        ),
                    );
                    handleSaveToGitHub();
                };
                const createCategory = (name, icon = "🏷️") => {
                    const trimmed = String(name || "").trim();
                    if (!trimmed) return;
                    setCategories((prev) => {
                        if (
                            prev.some(
                                (c) =>
                                    String(c.name || "").toLowerCase() ===
                                    trimmed.toLowerCase(),
                            )
                        ) {
                            return prev;
                        }
                        const color = `#${Math.floor(Math.random() * 16777215)
                            .toString(16)
                            .padStart(6, "0")}`;
                        return [
                            ...prev,
                            {
                                id: generateId(),
                                name: trimmed,
                                icon,
                                color,
                            },
                        ];
                    });
                };

                const openAdd = (prefill = null) => {
                    setEditingActivity(null);
                    setPrefillActivity(prefill);
                    setShowModal(true);
                };
                const openEdit = (a) => {
                    setEditingActivity(a);
                    setPrefillActivity(null);
                    setShowModal(true);
                };

                const closeModal = () => {
                    setShowModal(false);
                    setEditingActivity(null);
                    setPrefillActivity(null);
                };

                const generateDailySummary = (date) => {
                    const today = date;
                    const todayActs = activities.filter(
                        (a) => a.date === today,
                    );
                    if (todayActs.length === 0)
                        return `📅 Daily Report [${today}]: No activities logged.`;

                    const finished = todayActs.filter(
                        (a) => a.status === "Finished",
                    );
                    const totalMins = todayActs.reduce(
                        (s, a) => s + calcDuration(a.timeFrom, a.timeTo),
                        0,
                    );
                    const studyMins = todayActs
                        .filter((a) => a.category === "Study")
                        .reduce(
                            (s, a) => s + calcDuration(a.timeFrom, a.timeTo),
                            0,
                        );

                    let text = `🌟 *Daily Report - ${formatDate(today)}*\n\n`;
                    text += `📊 *Summary*\n`;
                    text += `• Total Time: ${formatDuration(totalMins)}\n`;
                    text += `• Study Time: ${formatDuration(studyMins)}\n`;
                    text += `• Tasks Completed: ${finished.length}/${todayActs.length}\n\n`;

                    if (finished.length > 0) {
                        text += `✅ *Completed*\n`;
                        finished.forEach((a) => (text += `• ${a.item}\n`));
                        text += `\n`;
                    }

                    const others = todayActs.filter(
                        (a) => a.status !== "Finished",
                    );
                    if (others.length > 0) {
                        text += `🚧 *In Progress / Other*\n`;
                        others.forEach(
                            (a) => (text += `• ${a.item} (${a.status})\n`),
                        );
                    }

                    return text;
                };

                const handleSendReport = () => {
                    if (!reportPhoneNumber) {
                        alert(
                            "⚠️ Please set a Phone Number in Settings first.",
                        );
                        setPage("settings");
                        return;
                    }
                    setShowReportModal(true);
                };

                const handleConfirmSendReport = (date) => {
                    const text = generateDailySummary(date);
                    const phone = String(reportPhoneNumber || "").replace(
                        /[^0-9]/g,
                        "",
                    );
                    if (!phone) {
                        alert(
                            "⚠️ Invalid phone number. Please update it in Settings.",
                        );
                        setPage("settings");
                        return;
                    }
                    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
                    window.open(url, "_blank", "noopener,noreferrer");
                    setShowReportModal(false);
                };

                const navItems = [
                    { id: "dashboard", icon: "📊", label: "Dashboard" },
                    { id: "activities", icon: "📝", label: "Activities" },
                    { id: "calendar", icon: "📅", label: "Calendar" },
                    { id: "settings", icon: "⚙️", label: "Settings" },
                ];

                return (
                    <div className="app-container">
                        <aside className="sidebar">
                            <div
                                className="logo logo-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setPage("profile")}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setPage("profile");
                                    }
                                }}
                            >
                                <div className="logo-icon">🌟</div>
                                <div>
                                    <div className="logo-text">
                                        Yang's Planner
                                    </div>
                                    <div className="logo-sub">
                                        Daily Management
                                    </div>
                                </div>
                            </div>
                            <nav className="nav-menu">
                                {navItems.map((i) => (
                                    <div
                                        key={i.id}
                                        className={`nav-item ${page === i.id ? "active" : ""}`}
                                        onClick={() => setPage(i.id)}
                                    >
                                        <span className="nav-icon">
                                            {i.icon}
                                        </span>
                                        <span>{i.label}</span>
                                    </div>
                                ))}
                            </nav>
                            <div
                                style={{
                                    padding: "16px 0",
                                    borderTop:
                                        "1px solid rgba(255,255,255,0.1)",
                                    marginTop: "auto",
                                }}
                            >
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveToGitHub}
                                    disabled={isSaving}
                                    style={{
                                        width: "100%",
                                        fontSize: "13px",
                                        padding: "10px",
                                    }}
                                >
                                    {isSaving
                                        ? "⏳ Saving..."
                                        : "💾 Save to GitHub"}
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleSendReport}
                                    style={{
                                        width: "100%",
                                        fontSize: "13px",
                                        padding: "10px",
                                        marginTop: "8px",
                                        background: "#25D366",
                                        color: "#fff",
                                        border: "none",
                                    }}
                                >
                                    📱 Send Report
                                </button>
                            </div>
                        </aside>
                        <main className="main-content">
                            {page === "dashboard" && (
                                <Dashboard
                                    activities={activities}
                                    categories={categories}
                                    statuses={statuses}
                                    onAdd={openAdd}
                                    setPage={setPage}
                                />
                            )}
                            {page === "activities" && (
                                <Activities
                                    activities={activities}
                                    categories={categories}
                                    statuses={statuses}
                                    onAdd={openAdd}
                                    onEdit={openEdit}
                                    onDelete={deleteActivity}
                                    onBulkDelete={bulkDeleteActivities}
                                    onBulkUpdate={bulkUpdateActivities}
                                    onCreateCategory={createCategory}
                                />
                            )}
                            {page === "calendar" && (
                                <Calendar
                                    activities={activities}
                                    categories={categories}
                                    statuses={statuses}
                                    selectedDate={selectedDate}
                                    setSelectedDate={setSelectedDate}
                                    view={calendarView}
                                    setView={setCalendarView}
                                    onAdd={openAdd}
                                    onEdit={openEdit}
                                    onDelete={deleteActivity}
                                />
                            )}
                            {page === "settings" && (
                                <Settings
                                    categories={categories}
                                    setCategories={setCategories}
                                    activities={activities}
                                    setActivities={setActivities}
                                    statuses={statuses}
                                    setStatuses={setStatuses}
                                    onForceSync={handleForceSync}
                                    isSyncing={isSyncing}
                                    reportPhoneNumber={reportPhoneNumber}
                                    setReportPhoneNumber={setReportPhoneNumber}
                                    reminderEnabled={reminderEnabled}
                                    setReminderEnabled={setReminderEnabled}
                                />
                            )}
                            {page === "profile" && (
                                <Profile onBack={() => setPage("dashboard")} />
                            )}
                        </main>
                        {showModal && (
                            <Modal
                                activity={editingActivity}
                                prefill={prefillActivity}
                                activities={activities}
                                categories={categories}
                                statuses={statuses}
                                onSave={(a, keepOpen) => {
                                    if (editingActivity) {
                                        updateActivity(a);
                                    } else {
                                        addActivity(a);
                                    }
                                    if (!keepOpen) {
                                        closeModal();
                                    }
                                    handleSaveToGitHub();
                                }}
                                onClose={closeModal}
                            />
                        )}
                        {confirmConfig && (
                            <ConfirmModal
                                title={confirmConfig.title}
                                message={confirmConfig.message}
                                onConfirm={confirmConfig.onConfirm}
                                onCancel={() => setConfirmConfig(null)}
                            />
                        )}
                        {reminderActivity && (
                            <ReminderPopup
                                activity={reminderActivity}
                                onConfirm={handleReminderConfirm}
                                onDismiss={handleReminderDismiss}
                            />
                        )}
                        {showReportModal && (
                            <ReportModal
                                onConfirm={handleConfirmSendReport}
                                onCancel={() => setShowReportModal(false)}
                            />
                        )}
                        <div className="mobile-nav">
                            {navItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`mobile-nav-item ${page === item.id ? "active" : ""}`}
                                    onClick={() => setPage(item.id)}
                                >
                                    <div className="mobile-nav-icon">
                                        {item.icon}
                                    </div>
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

    global.App = App;

})(window);
