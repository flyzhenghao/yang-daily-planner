(function (global) {
  "use strict";

  const { useState, useMemo } = React;

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
      date: global.getLocalDateStr(),
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
      const from = global.timeStrToMins(form.timeFrom);
      const to = global.timeStrToMins(form.timeTo);
      if (from == null || to == null) return false;
      return to < from;
    }, [form.timeFrom, form.timeTo]);
    const inferredEndDate = useMemo(
      () => global.getEndDateForRange(form.date, form.timeFrom, form.timeTo),
      [form.date, form.timeFrom, form.timeTo],
    );

    const handleChange = (field, value) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "timeFrom" && value && !prev.timeTo) {
          next.timeTo = global.addMinutesToTime(value, 60);
        }
        return next;
      });
      if (field === "item" && value.length > 2) {
        const uniqueItems = [
          ...new Set(activities.map((a) => a.item.toLowerCase())),
        ];
        setSuggestions(
          uniqueItems.filter((i) => i.includes(value.toLowerCase())),
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
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="modal-title">{activity ? "Edit" : "Add"} Activity</h2>
          <div className="form-group">
            <label className="form-label">Activity</label>
            <input
              type="text"
              className="form-input"
              value={form.item}
              onChange={(e) => handleChange("item", e.target.value)}
              placeholder="What did you do?"
              autoFocus
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((s) => (
                  <li key={s} onClick={() => handleSuggestionClick(s)}>
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
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
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
                onChange={(e) => handleChange("timeFrom", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">To</label>
              <input
                type="time"
                className="form-input"
                value={form.timeTo}
                onChange={(e) => handleChange("timeTo", e.target.value)}
              />
            </div>
          </div>
          <div
            style={{
              marginTop: "-6px",
              marginBottom: "12px",
              color: endsNextDay ? "var(--accent-red)" : "var(--text-muted)",
              fontSize: "12px",
            }}
          >
            {form.timeFrom && form.timeTo ? (
              endsNextDay ? (
                <>
                  To time is treated as <b>next day</b> ({inferredEndDate}).
                  This helps overnight activities like Sleep.
                </>
              ) : (
                <>End date: {inferredEndDate}</>
              )
            ) : (
              <>
                Tip: after setting From, To auto-fills +1 hour and supports
                overnight spans.
              </>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
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
              onChange={(e) => handleChange("notes", e.target.value)}
            ></textarea>
          </div>
          <div className="modal-actions">
            <label style={{ marginRight: "auto" }}>
              <input
                type="checkbox"
                checked={keepOpen}
                onChange={(e) => setKeepOpen(e.target.checked)}
              />
              Continue adding
            </label>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  global.Modal = Modal;
})(window);
