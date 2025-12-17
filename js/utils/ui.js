
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
                localStorage.getItem(global.GITHUB_TOKEN_KEY),
            );
        } catch {
            return "";
        }
    };

    const setGitHubToken = (token) => {
        try {
            const trimmed = String(token || "").trim();
            if (!trimmed) {
                localStorage.removeItem(global.GITHUB_TOKEN_KEY);
                return;
            }
            localStorage.setItem(global.GITHUB_TOKEN_KEY, trimmed);
        } catch (e) {
            console.error(e);
        }
    };

    const clearGitHubToken = () => {
        try {
            localStorage.removeItem(global.GITHUB_TOKEN_KEY);
        } catch {}
    };

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
                            global.defaultCategories,
                        ),
                        statuses: getLS(
                            "yang_statuses",
                            global.defaultStatuses,
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
            categories: getLS("yang_categories", global.defaultCategories),
            statuses: getLS("yang_statuses", global.defaultStatuses),
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
                version: global.APP_VERSION,
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
                `https://api.github.com/repos/${global.GITHUB_OWNER}/${global.GITHUB_REPO}/contents/${global.GITHUB_FILE_PATH}?ref=${global.GITHUB_BRANCH}&t=${Date.now()}`,
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
                `https://api.github.com/repos/${global.GITHUB_OWNER}/${global.GITHUB_REPO}/contents/${global.GITHUB_FILE_PATH}`,
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
                        branch: global.GITHUB_BRANCH,
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
