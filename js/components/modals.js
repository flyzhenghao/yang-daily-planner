(function(global) {
    'use strict';

    const { useState } = React;

            function ReminderPopup({ activity, onConfirm, onDismiss }) {
                if (!activity) return null;
                return (
                    <div className="modal-overlay">
                        <div className="modal" style={{ maxWidth: "420px" }}>
                            <h2 className="modal-title">
                                ⏰ Activity Reminder
                            </h2>
                            <p style={{ marginBottom: "8px" }}>
                                Planning item <b>{activity.item}</b> is
                                scheduled to start now.
                            </p>
                            <div
                                style={{
                                    color: "var(--text-secondary)",
                                    marginBottom: "10px",
                                }}
                            >
                                {formatDate(activity.date)} ·{" "}
                                {activity.timeFrom} - {activity.timeTo}
                            </div>
                            <p
                                style={{
                                    marginTop: 0,
                                    color: "var(--text-muted)",
                                    fontSize: "13px",
                                }}
                            >
                                Confirm to close this reminder. The previous
                                activity will be marked <b>Finished</b> by
                                default.
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={onDismiss}
                                >
                                    Later
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={onConfirm}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            function ConfirmModal({ title, message, onConfirm, onCancel }) {
                return (
                    <div className="modal-overlay">
                        <div className="modal" style={{ maxWidth: "400px" }}>
                            <h2 className="modal-title">{title}</h2>
                            <p>{message}</p>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={onCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={onConfirm}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            function ReportModal({ onConfirm, onCancel }) {
                const [date, setDate] = useState(getLocalDateStr());

                const handleConfirm = () => {
                    onConfirm(date);
                };

                return (
                    <div className="modal-overlay">
                        <div className="modal" style={{ maxWidth: "400px" }}>
                            <h2 className="modal-title">Select Report Date</h2>
                            <div className="form-group">
                                <input
                                    type="date"
                                    className="form-input"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={onCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleConfirm}
                                >

    global.ReminderPopup = ReminderPopup;
    global.ConfirmModal = ConfirmModal;
    global.ReportModal = ReportModal;

})(window);
