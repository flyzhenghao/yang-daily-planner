// js/utils/formatUtils.js

export const isOtherCategoryName = (name) => {
    const raw = String(name || "").trim();
    if (!raw) return false;
    if (/other/i.test(raw)) return true;
    if (raw.includes("其他") || raw.includes("其它")) return true;
    return false;
};

export const normalizeTextForMatch = (text) => {
    return String(text || "")
        .trim()
        .toLowerCase()
        .replace(/[\u2014\u2013]/g, "-")
        .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

export const extractCategoryCandidate = (item) => {
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
