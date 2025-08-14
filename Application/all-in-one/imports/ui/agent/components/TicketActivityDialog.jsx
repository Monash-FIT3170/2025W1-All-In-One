// imports/ui/agent/TicketActivityDialog.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * TicketActivityDialog
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - ticket: {
 *     ticket_id, title, tenant, ticketNumber, type,
 *     propertyAddress, description, issueStartDate, dateLogged
 *   } | null
 * - pendingSlot: { start: Date, end: Date }    // REQUIRED: slot chosen on the calendar
 * - onCreate?: (payload: { start: Date, end: Date, notes: string, ticket: any }) => void
 * - onChangeTicket?: () => void
 */

export const TicketActivityDialog = ({
  isOpen,
  onClose,
  ticket,
  pendingSlot,
  onCreate,
  onChangeTicket,
}) => {
  // ---------- helpers ----------
  const toDateInput = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const toTimeInput = (d) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
      2,
      "0"
    )}`;

  // ---------- controlled inputs (strictly from pendingSlot) ----------
  const [dateStr, setDateStr] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  // When dialog opens or slot changes, populate from the slot (NOT current date)
  useEffect(() => {
    if (!isOpen) return;

    if (pendingSlot?.start && pendingSlot?.end) {
      setDateStr(toDateInput(pendingSlot.start));
      setStartTime(toTimeInput(pendingSlot.start));
      setEndTime(toTimeInput(pendingSlot.end));
    } else {
      // Clear if no slot (we'll show a warning in UI)
      setDateStr("");
      setStartTime("");
      setEndTime("");
    }
    setNotes("");
  }, [isOpen, pendingSlot]);

  if (!isOpen) return null;

  // ---------- create handler ----------
  const handleCreate = () => {
    if (!ticket) return;

    if (!dateStr || !startTime || !endTime) {
      alert("Please select a time slot on the calendar first.");
      return;
    }

    const [sh, sm] = startTime.split(":").map((n) => parseInt(n, 10));
    const [eh, em] = endTime.split(":").map((n) => parseInt(n, 10));
    const [yy, mm, dd] = dateStr.split("-").map((n) => parseInt(n, 10));

    const start = new Date(yy, mm - 1, dd, sh, sm, 0, 0);
    const end = new Date(yy, mm - 1, dd, eh, em, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert("Please enter a valid date and time.");
      return;
    }
    if (end <= start) {
      alert("End time must be after start time.");
      return;
    }

    onCreate?.({ start, end, notes, ticket });
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/30">
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="relative w-[560px] max-w-[94vw] rounded-[28px] bg-[#CBADD8] p-6 shadow-xl">
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 text-2xl leading-none hover:opacity-80"
          >
            ×
          </button>

          {/* Header */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-black">Ticket Activity</h2>
          </div>

          {/* Ticket Selected */}
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-black">Ticket Selected</div>
            <button
              type="button"
              onClick={onChangeTicket}
              className="rounded-full bg-[#8B5CF6] text-white text-xs font-semibold px-4 py-2 hover:opacity-90"
              title="Change Ticket Selected"
            >
              Change Ticket Selected ↔
            </button>
          </div>

          <div className="rounded-2xl bg-[#FFF0C9] p-4 mb-6">
            <div className="relative rounded-2xl border px-5 py-4 bg-white">
              <span className="absolute right-4 top-3 select-none">↗</span>
              <div className="space-y-1 pr-6">
                <div className="text-sm font-bold">
                  <span className="font-semibold">Title:</span>{" "}
                  {ticket?.title ?? "—"}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Tenant:</span>{" "}
                  {ticket?.tenant ?? "—"}
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Ticket number:</span>{" "}
                  {ticket?.ticketNumber ?? ticket?.ticket_no ?? "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Date and Time (strictly from calendar slot) */}
          <div className="mb-4">
            <div className="text-base font-semibold text-black mb-1">
              Date and Time
            </div>
            <p className="text-xs text-black/70 mb-3">
              These fields come from the time slot you selected on the calendar.
            </p>

            {!pendingSlot?.start || !pendingSlot?.end ? (
              <div className="mb-3 rounded-xl bg-red-100 text-red-700 text-xs px-3 py-2">
                No calendar slot selected. Close this dialog and click a time slot
                on the calendar first.
              </div>
            ) : null}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Start time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-2xl border bg-white px-4 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  End time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-2xl border bg-white px-4 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Date</label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full rounded-2xl border bg-white px-4 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-xs font-semibold mb-1">Notes</label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes..."
              className="w-full rounded-2xl border bg-white px-4 py-3 text-sm resize-none"
            />
          </div>

          {/* Footer */}
          <div className="mt-2">
            <button
              onClick={handleCreate}
              disabled={!ticket || !pendingSlot?.start || !pendingSlot?.end}
              className={`w-full rounded-2xl px-6 py-3 text-lg font-semibold ${
                ticket && pendingSlot?.start && pendingSlot?.end
                  ? "bg-[#9747FF] text-white hover:opacity-90"
                  : "bg-gray-300 text-white cursor-not-allowed"
              }`}
            >
              Create Ticket Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
