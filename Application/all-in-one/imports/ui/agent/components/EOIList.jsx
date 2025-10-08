import React, { useEffect, useMemo, useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Trash2 } from "lucide-react";
import { ExpressionOfInterest, Properties, Tenants } from "/imports/api/database/collections.js";

export default function EOIList({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState(null); // which EOI is being deleted

  // --- lock scroll + close on ESC ---
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

  // --- Fetch + join Meteor data ---
  const { ready, items } = useTracker(() => {
    const subEOI = Meteor.subscribe("expressionOfInterest");
    const subProps = Meteor.subscribe("properties");
    const subTen = Meteor.subscribe("tenants");

    const ready = subEOI.ready() && subProps.ready() && subTen.ready();
    const agentId = Meteor.userId();

    // get all properties belonging to this agent
    const props = Properties.find(
      { agent_id: agentId },
      { fields: { prop_id: 1, prop_address: 1 } }
    ).fetch();
    const propIds = props.map((p) => p.prop_id);
    const propMap = Object.fromEntries(props.map((p) => [p.prop_id, p.prop_address]));

    // EOIs where inviteSent is explicitly false
    const eois = ExpressionOfInterest.find({
      propertyID: { $in: propIds },
      inviteSent: false,
    }).fetch();

    // match tenants
    const tenantIds = [...new Set(eois.map((e) => e.tenantID).filter(Boolean))];
    const tenants = Tenants.find(
      { ten_id: { $in: tenantIds } },
      { fields: { ten_id: 1, ten_fn: 1, ten_ln: 1 } }
    ).fetch();
    const tenantMap = Object.fromEntries(
      tenants.map((t) => [t.ten_id, `${t.ten_fn ?? ""} ${t.ten_ln ?? ""}`.trim()])
    );

    // combine data for display
    const items = eois.map((e) => ({
      id: e._id,
      tenantName: tenantMap[e.tenantID] || "Unknown applicant",
      property: propMap[e.propertyID] || e.propertyID,
      message: e.EOI || "—",
    }));

    return { ready, items };
  });

  // --- search filter ---
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (d) =>
        d.tenantName.toLowerCase().includes(q) ||
        d.property.toLowerCase().includes(q) ||
        (d.message || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  // --- delete handler (asks for confirmation, calls server, shows spinner) ---
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
        // publication reactivity will auto-remove it from the list
        alert("EOI deleted and tenant notified.");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eoi-modal-title"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* centered scrollable modal */}
      <div className="relative w-full max-w-[1000px] max-h-[85vh] overflow-y-auto rounded-3xl bg-[#DAB8F1] border border-black/5 shadow-2xl">
        {/* sticky header */}
        <div className="sticky top-0 z-10 bg-[#DAB8F1] rounded-t-3xl p-6 border-b border-black/10">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 grid h-8 w-8 place-items-center rounded-full bg-black/10 hover:bg-black/20"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <h2 id="eoi-modal-title" className="text-2xl font-semibold text-black/90 text-center">
            Pending EOIs
          </h2>
          <p className="mt-1 text-center text-black/70">
            Only showing EOIs where <b>inviteSent</b> is <b>false</b>.
          </p>

          {/* search bar */}
          <div className="mx-auto mt-5 flex w-full max-w-3xl items-center gap-3">
            <div className="flex w-full items-center rounded-full bg-white px-5 py-3 shadow-sm ring-1 ring-black/10">
              <svg viewBox="0 0 24 24" className="mr-3 h-5 w-5 opacity-60">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tenant, property, or message..."
                className="w-full bg-transparent outline-none placeholder:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* modal body */}
        <div className="p-6">
          <div className="rounded-2xl bg-[#FFF8E9] p-6 shadow-inner ring-1 ring-black/10">
            {!ready ? (
              <div className="grid h-48 place-items-center text-black/70">Loading EOIs…</div>
            ) : filtered.length === 0 ? (
              <div className="grid h-48 place-items-center text-black/70">
                You currently have no EOIs where inviteSent is false.
              </div>
            ) : (
              <ul className="space-y-6">
                {filtered.map((item) => (
                  <li
                    key={item.id}
                    className="relative border border-black rounded-3xl p-6 bg-white shadow-sm"
                  >
                    {/* delete (trash) icon */}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-4 right-4 text-black/80 hover:text-red-600 transition"
                      aria-label="Delete EOI"
                      title="Delete EOI"
                      disabled={loadingId === item.id}
                    >
                      {loadingId === item.id ? (
                        // minimal inline spinner
                        <svg
                          className="h-5 w-5 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>

                    <p className="text-lg">
                      <span className="font-semibold">Prospective Tenant Name:</span>{" "}
                      {item.tenantName}
                    </p>
                    <p className="text-lg mt-1">
                      <span className="font-semibold">Property:</span> {item.property}
                    </p>
                    <p className="text-lg mt-1 break-words whitespace-pre-wrap">
                      <span className="font-semibold">Expression of Interest:</span>{" "}
                      {item.message}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
