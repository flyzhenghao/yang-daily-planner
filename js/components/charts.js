(function(global) {
    'use strict';

    const { useState, useMemo } = React;

            function PieChart({ data, totalLabel, onHover, hoveredCategory }) {
                const total = data.reduce((s, i) => s + i.value, 0);
                if (total === 0)
                    return (
                        <div
                            className="empty-state"
                            style={{ padding: "40px 20px" }}
                        >
                            <div className="empty-icon">📊</div>
                            <p>No data</p>
                        </div>
                    );
                let parts = [],
                    angle = 0;
                data.forEach((i) => {
                    const a = (i.value / total) * 360;
                    parts.push(`${i.color} ${angle}deg ${angle + a}deg`);
                    angle += a;
                });
                return (
                    <div className="pie-chart-container">
                        <div
                            className="pie-chart"
                            style={{
                                background: `conic-gradient(${parts.join(", ")})`,
                            }}
                        >
                            <div className="pie-chart-inner">
                                <div className="pie-chart-total">
                                    {Math.round(total / 60)}h
                                </div>
                                <div className="pie-chart-label">
                                    {totalLabel || "Total"}
                                </div>
                            </div>
                        </div>
                        <div className="pie-legend">
                            {data.map((i, idx) => (
                                <div
                                    key={idx}
                                    className={`legend-item ${hoveredCategory === i.name ? "hovered" : ""}`}
                                    onMouseEnter={(e) => onHover(i.name, e)}
                                    onMouseLeave={() => onHover(null)}
                                >
                                    <div
                                        className="legend-color"
                                        style={{ background: i.color }}
                                    ></div>
                                    <span>
                                        {i.icon} {i.name}
                                    </span>
                                    <span className="legend-value">
                                        {Math.round(i.value)}m
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            }

            function BarChart({ data }) {
                const max = Math.max(...data.map((d) => d.value), 1);
                if (data.length === 0)
                    return (
                        <div
                            className="empty-state"
                            style={{ padding: "40px 20px" }}
                        >
                            <div className="empty-icon">📊</div>
                            <p>No data</p>
                        </div>
                    );
                return (
                    <div className="bar-chart-container">
                        {data.map((i, idx) => (
                            <div key={idx} className="bar-chart-item">
                                <div className="bar-label">{i.name}</div>
                                <div className="bar-track">
                                    <div
                                        className="bar-fill"
                                        style={{
                                            width: `${Math.max((i.value / max) * 100, i.value > 0 ? 10 : 0)}%`,
                                            background: i.color,
                                        }}
                                    >
                                        {i.value > 0 && (
                                            <span className="bar-value">
                                                {i.value}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            function Tooltip({ activities, category, position }) {
                if (!activities || activities.length === 0) return null;

                const sortedActivities = [...activities].sort((a, b) => {
                    return (
                        calcDuration(b.timeFrom, b.timeTo) -
                        calcDuration(a.timeFrom, a.timeTo)
                    );
                });

                return (
                    <div
                        className="tooltip"
                        style={{
                            left: position.x,
                            top: position.y,
                        }}
                    >
                        <h4>{category}</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Duration</th>
                                    <th>Activity</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedActivities.map((a) => (
                                    <tr key={a.id}>
                                        <td>
                                            {formatDuration(
                                                calcDuration(
                                                    a.timeFrom,
                                                    a.timeTo,
                                                ),
                                            )}
                                        </td>
                                        <td>{a.item}</td>
                                        <td>{a.date}</td>
                                        <td>
                                            {a.timeFrom} - {a.timeTo}
                                        </td>

    global.PieChart = PieChart;
    global.BarChart = BarChart;
    global.Tooltip = Tooltip;

})(window);
