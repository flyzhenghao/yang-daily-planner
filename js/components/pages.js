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
