import React, { useState, useMemo, useEffect } from "react";

export const TicketTypeDialog = ({ isOpen, onClose }) => {
  const DUMMY_TICKETS = [
    { id: 1, title: "Tap is leaking", tenant: "Iron Man", ticketNumber: 1, propertyAddress: "12 Stark Ave" },
    { id: 2, title: "Add on tenant", tenant: "Iron Man", ticketNumber: 2, propertyAddress: "12 Stark Ave" },
    { id: 5, title: "Broken lightbulb", tenant: "Bruce Wayne", ticketNumber: 5, propertyAddress: "100 Wayne Manor" },
    { id: 6, title: "Wall peeling", tenant: "James Charles", ticketNumber: 1, propertyAddress: "9 Beauty Blvd" },
  ];

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedId(null);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DUMMY_TICKETS;
    return DUMMY_TICKETS.filter(t =>
      [t.title, t.tenant, t.ticketNumber?.toString(), t.propertyAddress]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative w-[920px] max-w-[92vw] rounded-[28px] bg-[#CBADD8] p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-2xl leading-none hover:opacity-80"
        >
          ×
        </button>

        <div className="mt-1 mb-5 text-center">
          <h2 className="text-2xl font-bold text-black">Ticket Selection</h2>
          <p className="text-sm text-black/80">Below is a list of tickets to be actioned.</p>
          <p className="text-sm text-black/80">Select one to action.</p>
        </div>

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
        </div>

        <div className="rounded-2xl bg-[#FAEEDA] p-5">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-black/70">
              No tickets match “{query}”.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((t) => {
                const isSelected = selectedId === t.id;
                return (
                  <div
                    key={t.id}
                    className={`relative cursor-pointer rounded-2xl border bg-white px-5 py-4 transition hover:shadow
                      ${isSelected ? "border-[#9747FF] ring-2 ring-[#9747FF]" : "border-black/20"}`}
                    onClick={() => setSelectedId(t.id)}
                  >
                    <span className="absolute right-3 top-3 rounded-md p-1">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M7 17l10-10" stroke="black" strokeWidth="2" />
                        <path d="M9 7h8v8" stroke="black" strokeWidth="2" />
                      </svg>
                    </span>
                    <div className="space-y-1 pr-6">
                      <div className="text-sm font-bold">
                        <span className="font-semibold">Title:</span> {t.title}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Tenant:</span> {t.tenant}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">Ticket number:</span> {t.ticketNumber}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            disabled={!selectedId}
            onClick={() => {
              const chosen = DUMMY_TICKETS.find((t) => t.id === selectedId);
              console.log("Selected dummy ticket:", chosen);
              onClose();
            }}
            className={`w-[360px] rounded-full px-6 py-3 text-lg font-semibold
              ${selectedId ? "bg-[#7F7F7F] text-white hover:opacity-90" : "bg-[#C9C9C9] text-white cursor-not-allowed"}`}
          >
            Confirm Ticket Selection
          </button>
        </div>
      </div>
    </div>
  );
};
