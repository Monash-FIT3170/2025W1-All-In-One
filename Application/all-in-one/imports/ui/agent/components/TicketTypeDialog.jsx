// imports/ui/agent/TicketTypeDialog.jsx
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export const TicketTypeDialog = ({ isOpen, onClose }) => {
  const DUMMY_TICKETS = [
    {
      id: 1,
      title: "Tap is leaking",
      tenant: "Iron Man",
      ticketNumber: 1,
      type: "Maintenance",
      propertyAddress: "123 Main Street, Melton South, 3338 , VIC",
      description: "Outdoor tap won’t stop leaking.",
      issueStartDate: "2025-05-07",
      dateLogged: "2025-05-07",
    },
    {
      id: 2,
      title: "Add on tenant",
      tenant: "Iron Man",
      ticketNumber: 2,
      type: "Tenancy",
      propertyAddress: "12 Stark Ave",
      description: "Request to add an additional tenant to the lease.",
      issueStartDate: "2025-05-02",
      dateLogged: "2025-05-03",
    },
    {
      id: 5,
      title: "Broken lightbulb",
      tenant: "Bruce Wayne",
      ticketNumber: 5,
      type: "Maintenance",
      propertyAddress: "100 Wayne Manor",
      description: "Kitchen downlight keeps flickering and is now dead.",
      issueStartDate: "2025-05-05",
      dateLogged: "2025-05-06",
    },
    {
      id: 6,
      title: "Wall peeling",
      tenant: "James Charles",
      ticketNumber: 1,
      type: "Maintenance",
      propertyAddress: "9 Beauty Blvd",
      description: "Paint peeling in the living room due to damp.",
      issueStartDate: "2025-05-04",
      dateLogged: "2025-05-04",
    },
  ];

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // Lock background scroll when dialog is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedId(null);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DUMMY_TICKETS;
    return DUMMY_TICKETS.filter((t) =>
      [t.title, t.tenant, t.ticketNumber?.toString(), t.propertyAddress, t.type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  // Measure the yellow box height ONCE (on open, when nothing is expanded)
  const listRef = useRef(null);
  const [maxListHeightPx, setMaxListHeightPx] = useState(null);

  useLayoutEffect(() => {
    if (!isOpen) return;
    if (selectedId !== null) return; // only measure when nothing expanded
    if (maxListHeightPx != null) return; // only once

    const rAF = requestAnimationFrame(() => {
      if (listRef.current) {
        const h = listRef.current.clientHeight;
        if (h > 0) setMaxListHeightPx(h);
      }
    });
    return () => cancelAnimationFrame(rAF);
  }, [isOpen, selectedId, maxListHeightPx]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div className="min-h-full flex items-center justify-center p-6">
        {/* Keep the dialog natural height; only yellow box gets a max-height */}
        <div className="relative w-[920px] max-w-[92vw] rounded-[28px] bg-[#CBADD8] p-6 shadow-xl">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-2xl leading-none hover:opacity-80"
            aria-label="Close"
          >
            ×
          </button>

          <div className="mt-1 mb-5 text-center">
            <h2 className="text-2xl font-bold text-black">Ticket Selection</h2>
            <p className="text-sm text-black/80">
              Below is a list of tickets to be actioned.
            </p>
            <p className="text-sm text-black/80">Select one to action.</p>
          </div>

          {/* Search */}
          <div className="mx-auto mb-5 flex max-w-[640px] items-center gap-3">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search keyword, tenant or property address..."
                className="w-full rounded-full border border-purple-300 bg-[#FFF8E9] px-5 py-3 pr-12 outline-none"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="black" strokeWidth="2" />
                  <path d="M20 20l-3.5-3.5" stroke="black" strokeWidth="2" />
                </svg>
              </span>
            </div>
            <button
              className="grid h-11 w-11 place-items-center rounded-xl bg-[#9747FF] hover:opacity-90"
              aria-label="Search"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="white" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* Yellow list: scrolls once it exceeds the captured height */}
          <div
            ref={listRef}
            className="rounded-2xl bg-[#FAEEDA] p-5 overflow-y-auto overscroll-contain"
            style={
              maxListHeightPx != null ? { maxHeight: `${maxListHeightPx}px` } : undefined
            }
          >
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-black/70">
                No tickets match “{query}”.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
                {filtered.map((t) => {
                  const expanded = selectedId === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`relative rounded-2xl border px-5 pt-4 pb-4 transition hover:shadow cursor-pointer self-start
                        ${
                          expanded
                            ? "bg-[#CBADD8] border-black/30"
                            : "bg-white border-black/20"
                        }`}
                      onClick={() => setSelectedId(expanded ? null : t.id)}
                    >
                      {/* Expand/collapse icon styled like your example */}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(expanded ? null : t.id);
                        }}
                        aria-label="toggle expand"
                        className="absolute top-3 right-3 text-2xl font-bold text-black hover:text-gray-700"
                      >
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>

                      <div className="space-y-1 pr-10">
                        <div className="text-sm font-bold">
                          <span className="font-semibold">Title:</span> {t.title}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">Tenant:</span> {t.tenant}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">Ticket number:</span>{" "}
                          {t.ticketNumber}
                        </div>
                      </div>

                      <Collapse in={expanded}>
                        <div className="mt-4 rounded-2xl bg-[#B997C6]/40 p-4">
                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold">
                              Ticket Type
                            </label>
                            <input
                              readOnly
                              value={t.type}
                              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold">
                              Property
                            </label>
                            <input
                              readOnly
                              value={t.propertyAddress}
                              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold">
                              What is the issue?
                            </label>
                            <textarea
                              readOnly
                              value={t.description}
                              rows={3}
                              className="w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold">
                              When did the issue commence?
                            </label>
                            <input
                              readOnly
                              value={new Date(
                                t.issueStartDate
                              ).toLocaleDateString()}
                              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold">
                              Date logged
                            </label>
                            <input
                              readOnly
                              value={new Date(t.dateLogged).toLocaleDateString()}
                              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </Collapse>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-center">
            <button
              disabled={!selectedId}
              onClick={() => {
                const chosen = DUMMY_TICKETS.find((t) => t.id === selectedId);
                console.log("Selected dummy ticket:", chosen);
                onClose();
              }}
              className={`w-[360px] rounded-full px-6 py-3 text-lg font-semibold
                ${
                  selectedId
                    ? "bg-[#7F7F7F] text-white hover:opacity-90"
                    : "bg-[#C9C9C9] text-white cursor-not-allowed"
                }`}
            >
              Confirm Ticket Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
