(function (global) {
  "use strict";

  const { useState, useMemo } = React;

  function Dashboard({ activities, categories, statuses, onAdd, setPage }) {
    const [viewDate, setViewDate] = useState(global.getLocalDateStr());
    const [viewMode, setViewMode] = useState("daily");
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({
      x: 0,
      y: 0,
    });
    const getDateRange = useMemo(() => {
      const baseDate = new Date(viewDate + "T00:00:00");
      if (viewMode === "daily")
        return {
          start: viewDate,
          end: viewDate,
          label: global.formatDate(viewDate),
        };
      if (viewMode === "weekly") {
        const day = baseDate.getDay();
        const startD = new Date(baseDate);
        startD.setDate(baseDate.getDate() - day);
        const endD = new Date(startD);
        endD.setDate(startD.getDate() + 6);
        return {
          start: global.getLocalDateStr(startD),
          end: global.getLocalDateStr(endD),
          label: `${global.formatDate(startD)} - ${global.formatDate(endD)}`,
        };
      }
      if (viewMode === "monthly") {
        const startD = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        const endD = new Date(
          baseDate.getFullYear(),
          baseDate.getMonth() + 1,
          0,
        );
        return {
          start: global.getLocalDateStr(startD),
          end: global.getLocalDateStr(endD),
          label: `${startD.toLocaleDateString("en-NZ", { month: "long", year: "numeric" })}`,
        };
      }
      const startD = new Date(baseDate.getFullYear(), 0, 1);
      const endD = new Date(baseDate.getFullYear(), 11, 31);
      return {
        start: global.getLocalDateStr(startD),
        end: global.getLocalDateStr(endD),
        label: `Year ${baseDate.getFullYear()}`,
      };
    }, [viewDate, viewMode]);
    const filteredActs = useMemo(
      () =>
        activities
          .filter(
            (a) => a.date >= getDateRange.start && a.date <= getDateRange.end,
          )
          .sort((a, b) => {
            const dc = b.date.localeCompare(a.date);
            return dc !== 0
              ? dc
              : (b.timeFrom || "00:00").localeCompare(a.timeFrom || "00:00");
          }),
      [activities, getDateRange],
    );

    const handlePieChartHover = (category, event) => {
      setHoveredCategory(category);
      if (event) {
        setTooltipPosition({
          x: event.clientX,
          y: event.clientY,
        });
      }
    };

    const stats = useMemo(() => {
      const cs = categories.map((c) => {
        const ca = filteredActs.filter((a) => a.category === c.name);
        const mins = ca.reduce(
          (s, a) => s + global.calcDuration(a.timeFrom, a.timeTo),
          0,
        );
        return {
          ...c,
          activities: ca,
          minutes: mins,
          hours: (mins / 60).toFixed(1),
        };
      });
      const totalMins = cs.reduce((s, c) => s + c.minutes, 0);
      return cs
        .map((c) => ({
          ...c,
          percentage:
            totalMins > 0 ? ((c.minutes / totalMins) * 100).toFixed(0) : 0,
        }))
        .sort((a, b) => b.minutes - a.minutes);
    }, [filteredActs, categories]);

    const pieData = useMemo(
      () =>
        stats
          .filter((s) => s.minutes > 0)
          .map((s) => ({
            name: s.name,
            value: s.minutes,
            color: s.color,
            icon: s.icon,
          })),
      [stats],
    );

    const statusStats = useMemo(() => {
      const ss = statuses.map((s) => ({
        name: s.name,
        value: filteredActs.filter((a) => a.status === s.name).length,
        color: s.color,
      }));
      return ss.filter((s) => s.value > 0);
    }, [filteredActs, statuses]);

    const classifyHealthCategory = (name, icon) => {
      const raw = String(name || "");
      const norm = global.normalizeTextForMatch(raw);
      const ic = String(icon || "");

      if (
        /sleep|nap|rest|bed/.test(norm) ||
        raw.includes("睡") ||
        raw.includes("休息") ||
        ic.includes("😴") ||
        ic.includes("🛌")
      )
        return "sleep";
      if (
        /exercise|workout|gym|run|running|walk|sport|fitness/.test(norm) ||
        raw.includes("运动") ||
        raw.includes("锻炼") ||
        raw.includes("健身") ||
        raw.includes("跑") ||
        ic.includes("🏃") ||
        ic.includes("🏋") ||
        ic.includes("🚴")
      )
        return "exercise";
      if (
        /study|learn|learning|read|reading|school|class|course|homework|revision/.test(
          norm,
        ) ||
        raw.includes("学习") ||
        raw.includes("读书") ||
        raw.includes("阅读") ||
        raw.includes("复习") ||
        raw.includes("作业") ||
        ic.includes("📚") ||
        ic.includes("📝")
      )
        return "study";
      if (
        /entertainment|fun|game|gaming|video|tv|movie|music|play|social media|tiktok|douyin|bilibili|youtube|netflix/.test(
          norm,
        ) ||
        raw.includes("娱乐") ||
        raw.includes("游戏") ||
        raw.includes("电影") ||
        raw.includes("电视剧") ||
        raw.includes("刷") ||
        raw.includes("抖") ||
        ic.includes("🎮") ||
        ic.includes("🎬") ||
        ic.includes("🎵")
      )
        return "entertainment";

      return null;
    };

    const healthBuckets = useMemo(() => {
      const totals = {
        study: 0,
        exercise: 0,
        sleep: 0,
        entertainment: 0,
      };
      for (const s of stats || []) {
        const bucket = classifyHealthCategory(s.name, s.icon);
        if (!bucket) continue;
        totals[bucket] += s.minutes || 0;
      }
      return totals;
    }, [stats]);

    const healthScore = useMemo(() => {
      const st = healthBuckets.study || 0;
      const ex = healthBuckets.exercise || 0;
      const sl = healthBuckets.sleep || 0;
      const en = healthBuckets.entertainment || 0;

      const mult =
        viewMode === "daily"
          ? 1
          : viewMode === "weekly"
            ? 7
            : viewMode === "monthly"
              ? 30
              : 365;

      let score = 50;

      if (st >= 180 * mult * 0.8 && st <= 180 * mult * 1.5) {
        score += 15;
      } else if (st >= 180 * mult * 0.5) {
        score += 10;
      }

      if (ex >= 45 * mult * 0.7) score += 15;
      else if (ex > 0) score += 8;

      if (sl >= 480 * mult * 0.9 && sl <= 480 * mult * 1.1) {
        score += 15;
      } else if (sl >= 480 * mult * 0.8) {
        score += 10;
      }

      if (en > 0 && en <= 120 * mult) score += 5;
      else if (en > 120 * mult) score -= 5;

      return Math.min(100, Math.max(0, Math.round(score)));
    }, [healthBuckets, viewMode]);

    const healthTips = useMemo(() => {
      const tips = [];

      const st = healthBuckets.study || 0;
      const ex = healthBuckets.exercise || 0;
      const en = healthBuckets.entertainment || 0;

      const mult =
        viewMode === "daily"
          ? 1
          : viewMode === "weekly"
            ? 7
            : viewMode === "monthly"
              ? 30
              : 365;

      if (st < 90 * mult) {
        tips.push({
          icon: "📚",
          text: `Study time is low. Aim for ${((180 * mult) / 60).toFixed(0)}h ${viewMode}.`,
        });
      }
      if (ex < 22 * mult) {
        tips.push({
          icon: "🏃",
          text: `Exercise more! Target: ${((45 * mult) / 60).toFixed(1)}h ${viewMode}.`,
        });
      }
      if (en > 180 * mult) {
        tips.push({
          icon: "🎮",
          text: "Screen time is high.",
        });
      }
      if (healthScore >= 80) {
        tips.push({
          icon: "🌟",
          text: "Excellent balance!",
        });
      }
      if (tips.length === 0) {
        tips.push({
          icon: "✨",
          text: "Start logging activities!",
        });
      }

      return tips;
    }, [healthBuckets, healthScore, viewMode]);

    const getColor = (score) => {
      if (score > 80) return "var(--accent-green)";
      if (score > 60) return "var(--accent-blue)";
      if (score > 40) return "var(--accent-orange)";
      return "var(--accent-red)";
    };

    const getGreeting = () => {
      const h = new Date().getHours();
      return h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening";
    };
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Good {getGreeting()}, Yang! 👋</h1>
            <p className="page-subtitle">{getDateRange.label}</p>
          </div>
          <button className="btn btn-primary" onClick={onAdd}>
            ➕ Add Activity
          </button>
        </div>
        <div className="date-picker-row">
          <input
            type="date"
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
          />
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setViewDate(global.getLocalDateStr())}
          >
            Today
          </button>
          <div className="period-selector" style={{ marginBottom: 0 }}>
            {["daily", "weekly", "monthly", "yearly"].map((m) => (
              <button
                key={m}
                className={`period-btn ${viewMode === m ? "active" : ""}`}
                onClick={() => setViewMode(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="dashboard-grid">
          {stats.slice(0, 4).map((s) => (
            <div key={s.id} className={`stat-card ${s.name.toLowerCase()}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.hours}h</div>
              <div className="stat-label">
                {s.name} ({s.percentage}%)
              </div>
            </div>
          ))}
        </div>
        <div className="charts-grid">
          <div className="chart-card">
            <div className="card-header">
              <h3 className="card-title">Time by Category</h3>
            </div>
            <global.PieChart
              data={pieData}
              totalLabel={viewMode}
              onHover={handlePieChartHover}
              hoveredCategory={hoveredCategory}
            />
          </div>
          <div className="chart-card">
            <div className="card-header">
              <h3 className="card-title">Status Distribution</h3>
            </div>
            <global.BarChart data={statusStats} />
          </div>
          <div className="chart-card">
            <div className="card-header">
              <h3 className="card-title">Health Score</h3>
            </div>
            <div className="health-score-container">
              <div
                className="health-score-circle"
                style={{
                  background: `conic-gradient(${getColor(healthScore)} ${healthScore * 3.6}deg, #F5F5FA ${healthScore * 3.6}deg)`,
                }}
              >
                <div className="health-score-inner">
                  <div
                    className="health-score-value"
                    style={{
                      color: getColor(healthScore),
                    }}
                  >
                    {healthScore}
                  </div>
                  <div className="health-score-label">/ 100</div>
                </div>
              </div>
            </div>
            <div className="health-suggestions">
              <div className="health-suggestions-title">
                💡 Smart Suggestions
              </div>
              <div>
                {healthTips.map((t, i) => (
                  <div key={i} className="suggestion-item">
                    <div className="suggestion-icon">{t.icon}</div>
                    <div className="suggestion-text">{t.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {hoveredCategory && (
          <global.Tooltip
            activities={
              stats.find((s) => s.name === hoveredCategory)?.activities
            }
            category={hoveredCategory}
            position={tooltipPosition}
          />
        )}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Activities</h2>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage("activities")}
            >
              View All
            </button>
          </div>
          <global.Activities
            activities={activities
              .sort(
                (a, b) =>
                  new Date(b.date) - new Date(a.date) ||
                  (b.timeFrom || "").localeCompare(a.timeFrom || ""),
              )
              .slice(0, 5)}
            categories={categories}
            statuses={statuses}
            condensed
          />
        </div>
      </div>
    );
  }
  global.Dashboard = Dashboard;
})(window);
