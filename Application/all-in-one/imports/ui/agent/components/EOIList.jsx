import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

// collections stay local to this file
import { ExpressionOfInterest, Properties, Tenants } from "/imports/api/database/collections.js";

// UI bits to match TicketList expand/collapse style
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function EOIList({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  // --- lock scroll + close on ESC + backdrop ---
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

  // --- Fetch + join (same logic you had) ---
  const { ready, rows } = useTracker(() => {
    if (!isOpen) return { ready: true, rows: [] };

    const subEOI = Meteor.subscribe("expressionOfInterest");
    const subProps = Meteor.subscribe("properties");
    const subTen = Meteor.subscribe("tenants");
    const allReady = subEOI.ready() && subProps.ready() && subTen.ready();

    const agentId = Meteor.userId();

    // agent’s properties
    const props = Properties.find(
      { agent_id: agentId },
      { fields: { prop_id: 1, prop_address: 1 } }
    ).fetch();
    const propIds = props.map((p) => p.prop_id);
    const propMap = Object.fromEntries(props.map((p) => [p.prop_id, p.prop_address]));

    // pending EOIs (inviteSent=false)
    const eois = ExpressionOfInterest.find({
      propertyID: { $in: propIds },
      inviteSent: false,
    }).fetch();

    // tenants
    const tenantIds = [...new Set(eois.map((e) => e.tenantID).filter(Boolean))];
    const tenants = Tenants.find(
      { ten_id: { $in: tenantIds } },
      { fields: { ten_id: 1, ten_fn: 1, ten_ln: 1 } }
    ).fetch();
    const tenantMap = Object.fromEntries(
      tenants.map((t) => [t.ten_id, `${t.ten_fn ?? ""} ${t.ten_ln ?? ""}`.trim()])
    );

    // decorate for UI (align to TicketList card style)
    const rows = eois.map((e) => ({
      _idKey: e._id,
      tenantName: tenantMap[e.tenantID] || "Unknown applicant",
      propertyAddress: propMap[e.propertyID] || e.propertyID,
      message: e.EOI || "—",
    }));

    return { ready: allReady, rows };
  }, [isOpen]);

  // --- reset on open ---
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setExpandedId(null);
    }
  }, [isOpen]);

  // --- search (tenant, property, message) ---
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((d) =>
      [d.tenantName, d.propertyAddress, d.message].join(" ").toLowerCase().includes(q)
    );
  }, [rows, query]);

  // --- measure yellow box height (same vibe as TicketList) ---
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

  // --- delete handler (kept your flow; moved button into expanded area) ---
  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this EOI? The tenant will be notified by email."
    );
    if (!confirmed) return;

    setLoadingId(id);
    Meteor.call("eoi.reject", id, (err) => {
      setLoadingId(null);
      if (err) {
        alert(`Failed to delete EOI: ${err.reason || err.message}`);
      } else {
        alert("EOI deleted and tenant notified.");
      }
    });
  };

  if (!isOpen) return null;

  const noEOIs = ready && rows.length === 0;
  const noMatches = ready && rows.length > 0 && filtered.length === 0;

  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/30" onMouseDown={onBackdrop} role="dialog" aria-modal="true">
      <div className="min-h-full flex items-center justify-center p-6">
        {/* dialog shell — matches TicketList */}
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
            <h2 id="eoi-modal-title" className="text-2xl font-bold text-black">Pending EOIs</h2>
          </div>

          {/* search pill (same shape/colors) */}
          <div className="mx-auto mb-5 flex max-w-[640px] items-center gap-3">
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tenant, property, or message..."
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

          {/* yellow list area */}
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
              <div className="py-10 text-center text-sm text-black/70">Loading EOIs…</div>
            ) : noEOIs ? (
              <div className="py-10 text-center text-sm text-black/70">You currently have no pending EOIs.</div>
            ) : noMatches ? (
              <div className="py-10 text-center text-sm text-black/70">No EOIs match “{query}”.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
                {filtered.map((item) => {
                  const expanded = expandedId === item._idKey;
                  return (
                    <div
                      key={item._idKey}
                      className={`relative rounded-2xl border px-5 pt-4 pb-4 transition hover:shadow cursor-pointer self-start ${
                        expanded ? "bg-[#CBADD8] border-black/30" : "bg-white border-black/20"
                      }`}
                      onClick={() => setExpandedId(expanded ? null : item._idKey)}
                    >
                      {/* expand toggle (top-right) */}
                      <div className="absolute top-3 right-3 z-10">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expanded ? null : item._idKey);
                          }}
                          aria-label="toggle expand"
                          className="text-2xl font-bold text-black hover:text-gray-700"
                        >
                          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </div>

                      {/* summary */}
                      <div className="space-y-1 pr-10">
                        <div className="text-sm">
                          <span className="font-semibold">Prospective Tenant:</span> {item.tenantName}
                        </div>
                        <div className="text-sm">
                          <span className="font-semibold">Property:</span> {item.propertyAddress}
                        </div>
                      </div>

                      {/* expanded details */}
                      <Collapse in={expanded}>
                        <div className="mt-4 rounded-2xl bg-white/40 p-4">
                          <div className="mb-3">
                            <label className="mb-1 block text-xs font-semibold">Expression of Interest</label>
                            <textarea
                              readOnly
                              value={item.message || ""}
                              rows={4}
                              className="w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm"
                            />
                          </div>

                          <div className="mt-4 flex items-center justify-end gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item._idKey);
                              }}
                              disabled={loadingId === item._idKey}
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                                loadingId === item._idKey
                                  ? "bg-[#C9C9C9] text-white cursor-not-allowed"
                                  : "bg-[#7F7F7F] text-white hover:opacity-90"
                              }`}
                              title="Delete EOI"
                            >
                              {loadingId === item._idKey ? (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                  <path d="M12 3a9 9 0 1 0 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              ) : (
                                <DeleteOutlineIcon fontSize="small" />
                              )}
                              Delete
                            </button>
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
