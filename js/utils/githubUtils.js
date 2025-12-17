// js/utils/githubUtils.js
import { getLS, setLS, getGitHubToken } from './storageUtils.js';
import {
    APP_VERSION,
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_FILE_PATH,
    GITHUB_BRANCH,
    defaultCategories,
    defaultStatuses
} from '../config.js';

export async function loadDataFromGitHub(forceRemote = false) {
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

export async function saveDataToGitHub(activities, categories, statuses) {
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
