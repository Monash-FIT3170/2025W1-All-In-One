// /imports/ui/components/TicketList.jsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

// ⬇️ collections imported here (dashboard stays unchanged)
import { Tickets, Tenants, Properties } from "/imports/api/database/collections.js";

import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function TicketList({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // lock scroll + close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  // subscribe + join (Active tickets for this agent)
  const { ready, rows } = useTracker(() => {
    if (!isOpen) return { ready: true, rows: [] };

    const sT = Meteor.subscribe("tickets");
    const sTen = Meteor.subscribe("tenants");
    const sP = Meteor.subscribe("properties");
    const allReady = sT.ready() && sTen.ready() && sP.ready();
    const uid = Meteor.userId();

    if (!allReady || !uid) return { ready: allReady, rows: [] };

    // status could be 'Active' or 'active' depending on seed — accept both
    const activeTickets = Tickets.find(
      { agent_id: uid, status: { $in: ["Active", "active"] } },
      { sort: { date_logged: -1 } }
    ).fetch();

    // quick lookups
    const tenMap = {};
    Tenants.find({}).forEach((t) => {
      tenMap[t.ten_id] = {
        fullName: [t.ten_fn, t.ten_ln].filter(Boolean).join(" ").trim() || "—",
      };
    });

    const propMap = {};
    Properties.find({}).forEach((p) => {
      propMap[p.prop_id] = { address: p.prop_address || "—" };
    });

    const decorated = activeTickets.map((t) => ({
      ...t,
      _tenantName: tenMap[t.ten_id]?.fullName || "—",
      _propertyAddress: propMap[t.prop_id]?.address || "—",
      _ticketNumber: t.ticket_no ?? "—",
      _issueStartDate: t.issue_start_date ? new Date(t.issue_start_date) : null,
      _dateLogged: t.date_logged || "",
      _title: t.title || "Untitled Ticket",
      _type: t.type || "",
      _description: t.description || "",
      _idKey: t.ticket_id || t._id, // prefer your numeric/string ticket_id; fallback to _id
    }));

    return { ready: allReady, rows: decorated };
  }, [isOpen]);

  // reset when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setExpandedId(null);
    }
  }, [isOpen]);

  // search: title, tenant, ticket number, property, type, description
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((t) =>
      [
        t._title,
        t._tenantName,
        String(t._ticketNumber),
        t._propertyAddress,
        t._type,
        t._description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, query]);

  // measure yellow box once (like your calendar dialog)
  const listRef = useRef(null);
  const [maxListHeightPx, setMaxListHeightPx] = useState(null);
  const HEIGHT_BUFFER = 96;

  useLayoutEffect(() => {
    if (!isOpen) return;
    if (expandedId !== null) return;
    if (maxListHeightPx != null) return;
    const rAF = requestAnimationFrame(() => {
      if (listRef.current) {
        const h = listRef.current.clientHeight;
        if (h > 0) setMaxListHeightPx(h + HEIGHT_BUFFER);
      }
    });
    return () => cancelAnimationFrame(rAF);
  }, [isOpen, expandedId, maxListHeightPx]);

  if (!isOpen) return null;

  const noTickets = ready && Meteor.userId() && rows.length === 0;
  const noMatches = ready && rows.length > 0 && filtered.length === 0;

  // backdrop click to close
  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30" onMouseDown={onBackdrop}>
      <div className="min-h-full flex items-center justify-center p-6">
        {/* dialog */}
        <div className="relative w-[920px] max-w-[92vw] rounded-[28px] bg-[#CBADD8] p-6 shadow-xl">
          {/* close */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-2xl leading-none hover:opacity-80"
            aria-label="Close"
          >
            ×
          </button>

          {/* header */}
          <div className="mt-1 mb-5 text-center">
            <h2 className="text-2xl font-bold text-black">Unresolved Tickets</h2>
          </div>

          {/* search pill */}
          <div className="mx-auto mb-5 flex max-w-[640px] items-center gap-3">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title, tenant, property, or ticket #..."
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
              type="button"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="white" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* yellow list */}
          <div
            ref={listRef}
            className="rounded-2xl bg-[#FAEEDA] p-5 overflow-y-auto overscroll-contain"
            style={
              maxListHeightPx != null
                ? { maxHeight: `${maxListHeightPx}px`, minHeight: "260px" }
                : { minHeight: "260px" }
            }
          >
            {!ready ? (
              <div className="py-10 text-center text-sm text-black/70">Loading tickets…</div>
            ) : !Meteor.userId() ? (
              <div className="py-10 text-center text-sm text-black/70">
                Please sign in as an agent to view your tickets.
              </div>
            ) : noTickets ? (
              <div className="py-10 text-center text-sm text-black/70">
                You currently have no unresolved tickets.
              </div>
            ) : noMatches ? (
              <div className="py-10 text-center text-sm text-black/70">
                No tickets match “{query}”.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
                {filtered.map((t) => {
                  const expanded = expandedId === t._idKey;
                  return (
                    <div
                      key={t._idKey}
                      className={`relative rounded-2xl border px-5 pt-4 pb-4 transition hover:shadow cursor-pointer self-start ${
                        expanded ? "bg-[#CBADD8] border-black/30" : "bg-white border-black/20"
                      }`}
                      onClick={() => setExpandedId(expanded ? null : t._idKey)}
                    >
                      {/* toggle icon */}
                      <div className="absolute top-3 right-3 z-10">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expanded ? null : t._idKey);
                          }}
                          aria-label="toggle expand"
                          className="text-2xl font-bold text-black hover:text-gray-700"
                        >
                          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </div>

                      {/* summary */}
                      <div className="space-y-1 pr-10">
                        <div className="text-sm font-bold">
                          <span className="font-semibold">Title:</span> {t._title}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">Property:</span> {t._propertyAddress}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">Tenant:</span> {t._tenantName}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">Ticket #:</span> {t._ticketNumber}
                        </div>
                      </div>

                      {/* expanded details */}
                      <Collapse in={expanded}>
                        <div className="mt-4 rounded-2xl bg-[#B997C6]/40 p-4">
                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold">Ticket Type</label>
                            <input
                              readOnly
                              value={t._type}
                              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold">What is the issue?</label>
                            <textarea
                              readOnly
                              value={t._description}
                              rows={3}
                              className="w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm"
                            />
                          </div>

                          {t._type === "Maintenance" && (
                            <div className="mb-3">
                              <label className="mb-1 block text-xs font-semibold">
                                When did the issue commence?
                              </label>
                              <input
                                readOnly
                                value={t._issueStartDate ? t._issueStartDate.toLocaleDateString() : ""}
                                className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                              />
                            </div>
                          )}

                          <div className="mb-1">
                            <label className="mb-1 block text-xs font-semibold">Date logged</label>
                            <input
                              readOnly
                              value={t._dateLogged || ""}
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
        </div>
      </div>
    </div>
  );
}
