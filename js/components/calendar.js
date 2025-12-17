(function(global) {
    'use strict';

    const { useState, useMemo } = React;

            function Calendar({
                activities,
                categories,
                statuses,
                selectedDate,
                setSelectedDate,
                view,
                setView,
                onAdd,
                onEdit,
                onDelete,
            }) {
                const [currentDate, setCurrentDate] = useState(new Date());

                return (
                    <div className="animate-fade-in">
                        <div className="page-header">
                            <div>
                                <h1 className="page-title">Calendar</h1>
                            </div>
                        </div>
                        <div className="calendar-page-grid">
                            <div className="calendar-container">
                                <CalendarHeader
                                    date={currentDate}
                                    setDate={setCurrentDate}
                                    view={view}
                                    setView={setView}
                                />
                                {view === "month" ? (
                                    <CalendarMonthView
                                        date={currentDate}
                                        activities={activities}
                                        onDayClick={setCurrentDate}
                                    />
                                ) : (
                                    <CalendarYearView
                                        date={currentDate}
                                        activities={activities}
                                        onMonthClick={(month) => {
                                            const newDate = new Date(
                                                currentDate,
                                            );
                                            newDate.setMonth(month);
                                            setCurrentDate(newDate);
                                            setView("month");
                                        }}
                                    />
                                )}
                            </div>
                            <ActivityDetailPanel
                                date={currentDate}
                                activities={activities}
                                categories={categories}
                                onEdit={onEdit}
                            />
                        </div>
                    </div>
                );
            }

            function CalendarHeader({ date, setDate, view, setView }) {
                const changeMonth = (offset) => {
                    const newDate = new Date(date);
                    newDate.setMonth(newDate.getMonth() + offset);
                    setDate(newDate);
                };

                const changeYear = (offset) => {
                    const newDate = new Date(date);
                    newDate.setFullYear(newDate.getFullYear() + offset);
                    setDate(newDate);
                };

                const title =
                    view === "month"
                        ? date.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                          })
                        : date.getFullYear();

                return (
                    <div className="calendar-header">
                        <div className="calendar-nav">
                            <button
                                className="calendar-nav-btn"
                                onClick={() =>
                                    view === "month"
                                        ? changeMonth(-1)
                                        : changeYear(-1)
                                }
                            >
                                &lt;
                            </button>
                            <h2 className="calendar-title">{title}</h2>
                            <button
                                className="calendar-nav-btn"
                                onClick={() =>
                                    view === "month"
                                        ? changeMonth(1)
                                        : changeYear(1)
                                }
                            >
                                &gt;
                            </button>
                        </div>
                        <div className="calendar-view-toggle">
                            <button
                                className={`view-toggle-btn ${view === "month" ? "active" : ""}`}
                                onClick={() => setView("month")}
                            >
                                Month
                            </button>
                            <button
                                className={`view-toggle-btn ${view === "year" ? "active" : ""}`}
                                onClick={() => setView("year")}
                            >
                                Year
                            </button>
                        </div>
                    </div>
                );
            }

            function CalendarMonthView({ date, activities, onDayClick }) {
                const monthStart = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    1,
                );
                const monthEnd = new Date(
                    date.getFullYear(),
                    date.getMonth() + 1,
                    0,
                );
                const startDate = new Date(monthStart);
                startDate.setDate(startDate.getDate() - monthStart.getDay());
                const endDate = new Date(monthEnd);
                endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

                const days = [];
                let d = new Date(startDate);
                while (d <= endDate) {
                    days.push(new Date(d));
                    d.setDate(d.getDate() + 1);
                }

                return (
                    <div className="calendar-grid">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                            (day) => (
                                <div key={day} className="calendar-weekday">
                                    {day}
                                </div>
                            ),
                        )}
                        {days.map((day) => {
                            const dayStr = getLocalDateStr(day);
                            const isToday =
                                getLocalDateStr(new Date()) === dayStr;
                            const isSelected = getLocalDateStr(date) === dayStr;
                            const isCurrentMonth =
                                day.getMonth() === date.getMonth();

                            const dayActs = activities.filter(
                                (a) => a.date === dayStr,
                            );

                            let health = "none";
                            if (dayActs.length > 0) {
                                const sleep = dayActs
                                    .filter((a) => a.category === "Sleep")
                                    .reduce(
                                        (s, a) =>
                                            s +
                                            calcDuration(a.timeFrom, a.timeTo),
                                        0,
                                    );
                                if (sleep >= 420) health = "good";
                                else health = "poor";
                            }

                            return (
                                <div
                                    key={dayStr}
                                    className={`calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${!isCurrentMonth ? "other-month" : ""}`}
                                    onClick={() => onDayClick(day)}
                                >
                                    <span className="day-number">
                                        {day.getDate()}
                                    </span>
                                    <div
                                        className={`health-indicator health-${health}`}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                );
            }

            function CalendarYearView({ date, activities, onMonthClick }) {
                return (
                    <div className="year-grid">
                        {Array.from({ length: 12 }).map((_, i) => {
                            const monthDate = new Date(
                                date.getFullYear(),
                                i,
                                1,
                            );
                            const monthActivities = activities.filter((a) =>
                                a.date.startsWith(
                                    `${date.getFullYear()}-${String(i + 1).padStart(2, "0")}`,
                                ),
                            );

                            return (
                                <div
                                    key={i}
                                    className="month-card"
                                    onClick={() => onMonthClick(i)}
                                >
                                    <h4 className="month-name">
                                        {monthDate.toLocaleDateString("en-US", {
                                            month: "long",
                                        })}
                                    </h4>
                                    <MiniCalendar
                                        year={date.getFullYear()}
                                        month={i}
                                        activities={monthActivities}
                                    />
                                </div>
                            );
                        })}
                    </div>
                );
            }

            function MiniCalendar({ year, month, activities }) {
                const monthStart = new Date(year, month, 1);
                const startDate = new Date(monthStart);
                startDate.setDate(startDate.getDate() - startDate.getDay());

                const days = [];
                for (let i = 0; i < 42; i++) {
                    const d = new Date(startDate);
                    d.setDate(d.getDate() + i);
                    days.push(d);
                }

                return (
                    <div className="mini-calendar">
                        {days.map((d, i) => {
                            const dayStr = getLocalDateStr(d);
                            const hasActivity = activities.some(
                                (a) => a.date === dayStr,
                            );
                            let color = "transparent";
                            if (d.getMonth() === month) {
                                color = "#f0f0f0";
                                if (hasActivity) color = "var(--primary-light)";
                            }
                            return (
                                <div
                                    key={i}
                                    className="mini-day"
                                    style={{ backgroundColor: color }}
                                />
                            );
                        })}
                    </div>
                );
            }

            function ActivityDetailPanel({
                date,
                activities,

    global.Calendar = Calendar;
    global.CalendarHeader = CalendarHeader;
    global.CalendarMonthView = CalendarMonthView;
    global.CalendarYearView = CalendarYearView;
    global.MiniCalendar = MiniCalendar;

})(window);
