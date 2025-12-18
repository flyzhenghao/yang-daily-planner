// ============================================================================
// categoryMatcher.js
// Category matching and suggestion engine
// ============================================================================

import {
    normalizeTextForMatch,
    isOtherCategoryName,
    extractCategoryCandidate,
} from "../utils/formatUtils.js";

/**
 * Build an index of historical activities grouped by normalized item name
 * @param {Array} activities - Array of historical activities
 * @returns {Object} Index with byItem Map
 */
export const buildActivityHistoryIndex = (activities) => {
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
        entry.categories.set(cat, (entry.categories.get(cat) || 0) + 1);
        if (
            a.item &&
            String(a.item).trim().length > String(entry.item || "").length
        ) {
            entry.item = String(a.item).trim();
        }
        byItem.set(itemKey, entry);
    }
    return { byItem };
};

/**
 * Build a keyword index for all categories
 * @param {Array} categories - Array of category objects
 * @returns {Map} Map of category name to keywords array
 */
export const buildCategoryKeywordIndex = (categories) => {
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

/**
 * Suggest category based on semantic keyword matching
 * @param {string} item - Activity item name
 * @param {Array} categories - Array of categories
 * @param {Map} keywordIndex - Keyword index from buildCategoryKeywordIndex
 * @returns {Object|null} Best match with category, score, and matched keywords
 */
export const suggestCategoryBySemantic = (item, categories, keywordIndex) => {
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

/**
 * Suggest category based on historical usage
 * @param {string} item - Activity item name
 * @param {Object} historyIndex - Index from buildActivityHistoryIndex
 * @returns {Object|null} Suggestion with top category, confidence, and breakdown
 */
export const suggestCategoryByHistory = (item, historyIndex) => {
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
