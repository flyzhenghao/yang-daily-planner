(function (global) {
  "use strict";

  const { useState, useMemo } = React;

  function Activities({
    activities,
    categories,
    statuses,
    onAdd,
    onEdit,
    onDelete,
    onBulkDelete,
    onBulkUpdate,
    onCreateCategory,
    condensed,
  }) {
    const [filter, setFilter] = useState({
      text: "",
      category: "all",
      status: "all",
      startDate: "",
      endDate: "",
    });
    const [sort, setSort] = useState({
      by: "date",
      asc: false,
    });
    const [selectedIds, setSelectedIds] = useState([]);
    const [showOptimizer, setShowOptimizer] = useState(false);

    const handleFilterChange = (field, value) => {
      setFilter({ ...filter, [field]: value });
    };

    const compareByDateTime = (a, b) => {
      const dc = String(a.date || "").localeCompare(String(b.date || ""));
      if (dc !== 0) return dc;
      return String(a.timeFrom || "").localeCompare(String(b.timeFrom || ""));
    };

    const filteredActivities = useMemo(() => {
      return [...activities]
        .filter((a) => {
          const txt = filter.text.toLowerCase();
          const matchesText =
            !txt ||
            a.item.toLowerCase().includes(txt) ||
            (a.notes && a.notes.toLowerCase().includes(txt));
          const matchesCategory =
            filter.category === "all" || a.category === filter.category;
          const matchesStatus =
            filter.status === "all" || a.status === filter.status;
          const matchesStartDate =
            !filter.startDate || a.date >= filter.startDate;
          const matchesEndDate = !filter.endDate || a.date <= filter.endDate;
          return (
            matchesText &&
            matchesCategory &&
            matchesStatus &&
            matchesStartDate &&
            matchesEndDate
          );
        })
        .sort((a, b) => {
          const direction = sort.asc ? 1 : -1;
          let res;
          if (sort.by === "date") {
            res = compareByDateTime(a, b);
          } else {
            res = String(a[sort.by] || "").localeCompare(
              String(b[sort.by] || ""),
            );
          }
          return res * direction;
        });
    }, [activities, filter, sort]);

    const handleSelect = (id) => {
      if (Array.isArray(id)) {
        setSelectedIds(id);
      } else {
        setSelectedIds((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
      }
    };

    if (condensed) {
      return (
        <ActivityList
          activities={activities}
          categories={categories}
          statuses={statuses}
          onEdit={onEdit}
          condensed
        />
      );
    }

    return (
      <div className="animate-fade-in">
        {!condensed && (
          <div className="page-header">
            <div>
              <h1 className="page-title">Activities</h1>
              <p className="page-subtitle">
                You have {activities.length} logged activities in total.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowOptimizer(true)}
              >
                🧠 Optimize
              </button>
              <button
                className="btn btn-primary"
                onClick={() => onAdd && onAdd()}
              >
                ✨ Add Activity
              </button>
            </div>
          </div>
        )}
        <div className="card">
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search..."
              value={filter.text}
              onChange={(e) => handleFilterChange("text", e.target.value)}
            />
            <select
              value={filter.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            <select
              value={filter.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="bulk-actions">
              <span>
                <b>{selectedIds.length}</b> selected
              </span>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  onBulkDelete(selectedIds, () => setSelectedIds([]));
                }}
              >
                Delete
              </button>
              <select
                className="form-select"
                style={{ width: "auto" }}
                onChange={(e) => {
                  if (e.target.value) {
                    onBulkUpdate(selectedIds, {
                      status: e.target.value,
                    });
                    setSelectedIds([]);
                  }
                }}
              >
                <option value="">Update Status</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <ActivityList
            activities={filteredActivities}
            onEdit={onEdit}
            onDelete={onDelete}
            categories={categories}
            statuses={statuses}
            onSelect={handleSelect}
            selectedIds={selectedIds}
          />
        </div>
        {showOptimizer && (
          <global.OptimizerModal
            scopeActivities={filteredActivities}
            historyActivities={activities}
            categories={categories}
            statuses={statuses}
            onBulkUpdate={onBulkUpdate}
            onAdd={onAdd}
            onEdit={onEdit}
            onCreateCategory={onCreateCategory}
            onClose={() => setShowOptimizer(false)}
          />
        )}
      </div>
    );
  }

  function ActivityList({
    activities,
    onEdit,
    onDelete,
    categories,
    statuses,
    condensed = false,
    onSelect,
    selectedIds = [],
  }) {
    const allSelected =
      !condensed &&
      selectedIds.length === activities.length &&
      activities.length > 0;

    const handleSelectAll = (e) => {
      if (e.target.checked) {
        onSelect(activities.map((a) => a.id));
      } else {
        onSelect([]);
      }
    };

    if (activities.length === 0 && !condensed) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🤷</div>
          <h3 className="empty-title">No activities found.</h3>
          <p>Try adjusting your filters.</p>
        </div>
      );
    }

    return (
      <table className="activity-table">
        {!condensed && (
          <thead>
            <tr>
              <th style={{ width: "40px" }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Date</th>
              <th>Time</th>
              <th>Activity</th>
              <th>Category</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Actions</th>
            </tr>
          </thead>
        )}
        <tbody>
          {activities.map((a) => (
            <ActivityRow
              key={a.id}
              activity={a}
              onEdit={onEdit}
              onDelete={onDelete}
              categories={categories}
              statuses={statuses}
              condensed={condensed}
              onSelect={onSelect}
              isSelected={!condensed && selectedIds.includes(a.id)}
            />
          ))}
        </tbody>
      </table>
    );
  }

  function ActivityRow({
    activity: a,
    onEdit,
    onDelete,
    categories,
    statuses,
    condensed,
    onSelect,
    isSelected,
  }) {
    const category = categories.find((c) => c.name === a.category);
    const status = statuses.find((s) => s.name === a.status);
    return (
      <tr onClick={() => onEdit && onEdit(a)}>
        {!condensed && (
          <td data-label="Select" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect && onSelect(a.id)}
            />
          </td>
        )}
        {!condensed && <td data-label="Date">{global.formatDate(a.date)}</td>}
        <td data-label="Time">
          {a.timeFrom} - {a.timeTo}
        </td>
        <td data-label="Activity">{a.item}</td>
        <td data-label="Category">
          <span
            className={`category-badge category-${a.category?.toLowerCase()}`}
          >
            {category?.icon} {a.category}
          </span>
        </td>
        {!condensed && (
          <td data-label="Status">
            <span
              className={`status-badge status-${a.status?.replace(/ /g, "").toLowerCase()}`}
            >
              {a.status}
            </span>
          </td>
        )}
        <td data-label="Duration">
          <span className="duration-badge">
            {global.formatDuration(global.calcDuration(a.timeFrom, a.timeTo))}
          </span>
        </td>
        {!condensed && (
          <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
            <div className="action-btns">
              <button className="action-btn edit" onClick={() => onEdit(a)}>
                ✏️
              </button>
              <button
                className="action-btn delete"
                onClick={() => onDelete(a.id)}
              >
                🗑️
              </button>
            </div>
          </td>
        )}
      </tr>
    );
  }

  global.Activities = Activities;
  global.ActivityList = ActivityList;
  global.ActivityRow = ActivityRow;
})(window);
