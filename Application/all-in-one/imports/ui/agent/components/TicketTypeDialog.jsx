// imports/ui/agent/TicketTypeDialog.jsx
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import {
  Tickets,
  Tenants,
  Properties,
} from "/imports/api/database/collections"; // ← adjust path if needed

import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSelect?: (ticket) => void   // called when user confirms a ticket
 */
export const TicketTypeDialog = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // Subscribe to your existing publications; filter by agent on the client (per your request)
  const { ready, ticketsForAgent, tenantsMap, propertiesMap } = useTracker(() => {
    const subTickets = Meteor.subscribe("tickets");
    const subTenants = Meteor.subscribe("tenants");
    const subProps = Meteor.subscribe("properties");

    const allReady = subTickets.ready() && subTenants.ready() && subProps.ready();
    const uid = Meteor.userId();

    if (!allReady || !uid) {
      return { ready: allReady, ticketsForAgent: [], tenantsMap: {}, propertiesMap: {} };
    }

    // tickets for the logged-in agent (client-side filtering)
    const agentTickets = Tickets.find(
      { agent_id: uid },
      { sort: { date_logged: -1 } }
    ).fetch();

    // Build quick lookups
    const tMap = {};
    Tenants.find({}).forEach((t) => {
      tMap[t.ten_id] = {
        fullName: [t.ten_fn, t.ten_ln].filter(Boolean).join(" ").trim(),
      };
    });

    const pMap = {};
    Properties.find({}).forEach((p) => {
      pMap[p.prop_id] = { address: p.prop_address };
    });

    return {
      ready: allReady,
      ticketsForAgent: agentTickets,
      tenantsMap: tMap,
      propertiesMap: pMap,
    };
  }, []);

  // Lock background scroll when dialog is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedId(null);
    }
  }, [isOpen]);

  // Decorate with fields to match your original dummy UI
  const decorated = useMemo(() => {
    return ticketsForAgent.map((t) => {
      const tenantName = tenantsMap[t.ten_id]?.fullName || "—";
      const propertyAddress = propertiesMap[t.prop_id]?.address || "—";
      return {
        ...t,
        tenant: tenantName,
        propertyAddress,
        ticketNumber: t.ticket_no,
        issueStartDate: t.issue_start_date,
        dateLogged: t.date_logged,
      };
    });
  }, [ticketsForAgent, tenantsMap, propertiesMap]);

  // Search over same fields as before
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return decorated;
    return decorated.filter((t) =>
      [t.title, t.tenant, t.ticketNumber?.toString(), t.propertyAddress, t.type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query, decorated]);

  // Measure yellow box height once and add a buffer so it's a bit taller
  const listRef = useRef(null);
  const [maxListHeightPx, setMaxListHeightPx] = useState(null);
  const HEIGHT_BUFFER = 96; // increase to make the yellow area taller

  useLayoutEffect(() => {
    if (!isOpen) return;
    if (selectedId !== null) return; // only when nothing expanded
    if (maxListHeightPx != null) return; // only once

    const rAF = requestAnimationFrame(() => {
      if (listRef.current) {
        const h = listRef.current.clientHeight;
        if (h > 0) setMaxListHeightPx(h + HEIGHT_BUFFER);
      }
    });
    return () => cancelAnimationFrame(rAF);
  }, [isOpen, selectedId, maxListHeightPx]);

  if (!isOpen) return null;

  // New: explicit empty states
  const noTicketsAssigned = ready && Meteor.userId() && decorated.length === 0;
  const noMatches = ready && decorated.length > 0 && filtered.length === 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div className="min-h-full flex items-center justify-center p-6">
        {/* Dialog container (keep natural height) */}
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
              type="button"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="white" strokeWidth="2" />
              </svg>
            </button>
          </div>

          {/* Yellow list (slightly taller) */}
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
              <div className="py-10 text-center text-sm text-black/70">
                Loading tickets…
              </div>
            ) : !Meteor.userId() ? (
              <div className="py-10 text-center text-sm text-black/70">
                Please sign in as an agent to view your tickets.
              </div>
            ) : noTicketsAssigned ? (
              <div className="py-10 text-center text-sm text-black/70">
                You currently have no tickets assigned.
              </div>
            ) : noMatches ? (
              <div className="py-10 text-center text-sm text-black/70">
                No tickets match “{query}”.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
                {filtered.map((t) => {
                  const expanded = selectedId === t.ticket_id;
                  return (
                    <div
                      key={t.ticket_id}
                      className={`relative rounded-2xl border px-5 pt-4 pb-4 transition hover:shadow cursor-pointer self-start ${
                        expanded
                          ? "bg-[#CBADD8] border-black/30"
                          : "bg-white border-black/20"
                      }`}
                      onClick={() => setSelectedId(expanded ? null : t.ticket_id)}
                    >
                      {/* Arrow in TOP-RIGHT (fixed) */}
                      <div className="absolute top-3 right-3 z-10">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(expanded ? null : t.ticket_id);
                          }}
                          aria-label="toggle expand"
                          className="text-2xl font-bold text-black hover:text-gray-700"
                        >
                          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </div>

                      {/* Summary content (same styling as before) */}
                      <div className="space-y-1 pr-10">
                        <div className="text-sm font-bold">
                          <span className="font-semibold">Title:</span>{" "}
                          {t.title || "—"}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">Tenant:</span>{" "}
                          {t.tenant}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">Ticket number:</span>{" "}
                          {t.ticketNumber ?? "—"}
                        </div>
                      </div>

                      {/* Expanded details (same layout as before) */}
                      <Collapse in={expanded}>
                        <div className="mt-4 rounded-2xl bg-[#B997C6]/40 p-4">
                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold">
                              Ticket Type
                            </label>
                            <input
                              readOnly
                              value={t.type || ""}
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
                              value={t.description || ""}
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
                              value={
                                t.issueStartDate
                                  ? new Date(t.issueStartDate).toLocaleDateString()
                                  : ""
                              }
                              className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                            />
                          </div>

                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold">
                              Date logged
                            </label>
                            <input
                              readOnly
                              value={
                                t.dateLogged
                                  ? new Date(t.dateLogged).toLocaleDateString()
                                  : ""
                              }
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
                const chosen = decorated.find((t) => t.ticket_id === selectedId);
                if (chosen && onSelect) onSelect(chosen); // notify parent so it can open next dialog
                onClose();
              }}
              className={`w-[360px] rounded-full px-6 py-3 text-lg font-semibold ${
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
