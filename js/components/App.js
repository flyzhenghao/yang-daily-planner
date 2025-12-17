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
