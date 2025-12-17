// js/utils/dateUtils.js

export const getLocalDateStr = (date = new Date()) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const calcDuration = (timeFrom, timeTo) => {
    if (!timeFrom || !timeTo) return 0;
    const [h1, m1] = timeFrom.split(":").map(Number);
    const [h2, m2] = timeTo.split(":").map(Number);
    let mins = h2 * 60 + m2 - (h1 * 60 + m1);
    if (mins < 0) mins += 24 * 60;
    return mins;
};

export const timeStrToMins = (time) => {
    if (!time) return null;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

export const minsToTimeStr = (mins) => {
    if (mins == null || Number.isNaN(mins)) return "";
    const m = ((Math.round(mins) % 1440) + 1440) % 1440;
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

export const addMinutesToTime = (time, minutes) => {
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

export const getEndDateForRange = (dateStr, timeFrom, timeTo) => {
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

export const getActivityStartDate = (activity) => {
    if (!activity?.date) return null;
    const time = activity.timeFrom || "00:00";
    const d = new Date(`${activity.date}T${time}:00`);
    if (Number.isNaN(d.getTime())) return null;
    return d;
};

export const formatDuration = (mins) => {
    if (mins <= 0) return "-";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
};

export const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-NZ", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
