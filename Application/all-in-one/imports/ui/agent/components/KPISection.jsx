import React from 'react';

/**
 * KPISection Component
 *
 * Displays a row/grid of KPI cards.
 * Each KPI can have:
 * - label (string)
 * - value (string/number)
 * - optional action button (with label + click handler)
 */
function KPISection({ kpis }) {
  return (
    <section className="mx-auto max-w-7xl px-6 mt-20 mb-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map(({ label, value, actionLabel, onAction }, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white shadow-md border border-black/5 overflow-hidden"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-fuchsia-600" />
            <div className="p-5 md:p-6">
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-3xl font-extrabold tracking-tight text-purple-600 mt-1">
                {value}
              </p>

              {actionLabel && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={onAction}
                    className="px-4 py-2 rounded-lg border border-purple-600 text-black text-sm font-medium hover:opacity-90 transition"
                  >
                    {actionLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default KPISection;
