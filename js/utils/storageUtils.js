// js/utils/storageUtils.js
import { GITHUB_TOKEN_KEY } from '../config.js';

export const generateId = () =>
    Date.now() + Math.random().toString(36).substr(2, 9);

export const getLS = (key, def) => {
    try {
        const s = localStorage.getItem(key);
        return s ? JSON.parse(s) : def;
    } catch {
        return def;
    }
};

export const setLS = (key, val) => {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
        console.error(e);
    }
};

export const normalizeGitHubToken = (raw) => {
    const trimmed = String(raw || "").trim();
    if (!trimmed) return "";
    try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === "string") return parsed.trim();
    } catch {}
    return trimmed;
};

export const getGitHubToken = () => {
    try {
        return normalizeGitHubToken(
            localStorage.getItem(GITHUB_TOKEN_KEY),
        );
    } catch {
        return "";
    }
};

export const setGitHubToken = (token) => {
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

export const clearGitHubToken = () => {
    try {
        localStorage.removeItem(GITHUB_TOKEN_KEY);
    } catch {}
};
