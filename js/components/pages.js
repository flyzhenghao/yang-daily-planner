(function (global) {
  "use strict";

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
    const [savedGitHubToken, setSavedGitHubToken] = useState(
      global.getGitHubToken(),
    );
    const [githubToken, setGithubToken] = useState(savedGitHubToken);
    const [githubTokenVisible, setGithubTokenVisible] = useState(false);
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
      global.setGitHubToken(githubToken);
      const next = global.getGitHubToken();
      setSavedGitHubToken(next);
      setGithubToken(next);
      alert(next ? "✅ GitHub token saved." : "✅ GitHub token cleared.");
    };

    const handleClearGitHubToken = () => {
      global.clearGitHubToken();
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
          (c) => String(c.name || "").toLowerCase() === name.toLowerCase(),
        )
      ) {
        setCategories([
          ...categories,
          {
            name,
            icon,
            id: global.generateId(),
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
      const nextIcon = String(editDraft.icon || "").trim() || "🏷️";
      const nextColor = String(editDraft.color || "").trim();

      if (!nextName) {
        alert("Category name cannot be empty.");
        return;
      }
      if (
        categories.some(
          (c) =>
            c.id !== editingCategory.id &&
            String(c.name || "").toLowerCase() === nextName.toLowerCase(),
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
            a.category === oldName ? { ...a, category: nextName } : a,
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
          (c) => c.id !== cat.id && global.isOtherCategoryName(c.name),
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
        alert("Please choose a category to move activities to.");
        return;
      }

      if (usedCount > 0 && setActivities) {
        setActivities((prev) =>
          prev.map((a) =>
            a.category === oldName ? { ...a, category: replacement } : a,
          ),
        );
      }
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
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
            <h3 className="settings-subtitle" style={{ margin: 0 }}>
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
            A GitHub personal access token with <code>repo</code> scope is
            required for cloud sync.{" "}
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
            <label className="form-label">Personal Access Token</label>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <input
                className="form-input"
                type={githubTokenVisible ? "text" : "password"}
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_..."
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setGithubTokenVisible((v) => !v)}
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

          <h3 className="settings-subtitle">WhatsApp Reporting</h3>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              type="tel"
              value={reportPhoneNumber}
              onChange={(e) => setReportPhoneNumber(e.target.value)}
              placeholder="+1234567890"
            />
          </div>

          <div className="settings-divider" />

          <h3 className="settings-subtitle">Activity Reminders</h3>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: "12px",
            }}
          >
            Show an in-app popup when a <b>Planning</b> activity starts (today).
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
                setReminderEnabled && setReminderEnabled(e.target.checked)
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
          <h3 className="settings-subtitle">Data Management</h3>
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
                    background: c.color || "#e8e8f0",
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
                  onClick={() => startDeleteCategory(c)}
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
                if (e.key === "Enter") handleAddCategory();
              }}
            />
            <button className="btn btn-secondary" onClick={handleAddCategory}>
              Add
            </button>
          </div>
        </div>
        <div className="settings-section">
          <h2 className="settings-title">About</h2>
          <p>Version: {global.APP_VERSION}</p>
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
              <h2 className="modal-title">Edit Category</h2>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Icon</label>
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
                  <label className="form-label">Name</label>
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
                <label className="form-label">Color</label>
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
                  onClick={() => setEditingCategory(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveCategoryEdit}>
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
              <h2 className="modal-title">Delete Category</h2>
              <p
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Delete{" "}
                <b>
                  {deletingCategory.icon} {deletingCategory.name}
                </b>
                ?
              </p>

              {deletingCategory.usedCount > 0 && (
                <div className="form-group">
                  <label className="form-label">
                    Move {deletingCategory.usedCount} activities to
                  </label>
                  <select
                    className="form-select"
                    value={deleteMoveTo}
                    onChange={(e) => setDeleteMoveTo(e.target.value)}
                  >
                    {categories
                      .filter((c) => c.id !== deletingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeletingCategory(null)}
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

  function Profile({ onBack }) {
    const [savedProfile, setSavedProfile] = useState(() =>
      global.getLS(global.PROFILE_KEY, global.defaultProfile),
    );
    const [draft, setDraft] = useState(savedProfile);

    const profileDirty = useMemo(
      () => JSON.stringify(draft) !== JSON.stringify(savedProfile),
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
      global.setLS(global.PROFILE_KEY, next);
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
            <div className="page-subtitle">Manage your basic information.</div>
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
                <img src={draft.avatarDataUrl} alt="Avatar" />
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
                    onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => updateField("avatarDataUrl", "")}
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
              <div className="profile-hint" style={{ marginTop: "10px" }}>
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
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Grade</label>
              <input
                className="form-input"
                value={draft.grade}
                onChange={(e) => updateField("grade", e.target.value)}
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
                onChange={(e) => updateField("school", e.target.value)}
                placeholder="School name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={draft.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="name@example.com"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  global.Settings = Settings;
  global.Profile = Profile;
})(window);
