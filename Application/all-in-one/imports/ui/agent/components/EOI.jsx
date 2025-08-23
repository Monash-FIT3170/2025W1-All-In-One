// imports/ui/agent/EOI.jsx
import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Collapse from '@mui/material/Collapse';

/**
 * Props:
 * - eoiDoc: the full EOI Mongo document (must include _id, EOI, propertyID, tenantID, etc.)
 * - prospectiveTenName: string (e.g., "Jane Doe")
 * - address: string (property address)
 * - isSelected: boolean (styling only)
 * - onSelect: function () => void  (called when Select is clicked)
 * - onRemoved?: function (id) => void  (optional; called after successful removal)
 */
export const EOI = ({
  eoiDoc,
  prospectiveTenName,
  address,
  isSelected = false,
  onSelect,
  onRemoved,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleExpand = () => setIsExpanded(v => !v);

  const handleRemove = () => {
    if (!eoiDoc?._id) {
      console.error('EOI card: missing _id on eoiDoc:', eoiDoc);
      alert('Cannot reject: missing EOI id.');
      return;
    }
    if (!confirm('Reject this expression of interest? The tenant will be notified.')) return;

    setBusy(true);
    Meteor.call('eoi.reject', eoiDoc._id, (err) => {
      setBusy(false);
      if (err) {
        alert('Error: ' + (err.reason || err.message));
        console.error('eoi.reject failed:', err);
        return;
      }
      // Optional optimistic removal in parent
      onRemoved?.(eoiDoc._id);
      alert('EOI rejected and tenant notified.');
      // Collapse after action (optional)
      setIsExpanded(false);
    });
  };

  const handleSelect = () => {
    onSelect?.(eoiDoc);
    setIsExpanded(false);
  };

  return (
    <div
      className={`${isSelected ? 'bg-[#CBADD8]' : 'bg-white'} border rounded-3xl shadow-md flex flex-col relative pb-4`}
      title={isExpanded ? 'Collapse EOI' : 'Expand EOI'}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="pt-2 px-4 text-left">
          <p>
            <strong className="font-bold font-sans">Prospective Tenant Name: </strong>
            {prospectiveTenName}
          </p>
          <p>
            <strong className="font-bold font-sans">Property: </strong>
            {address}
          </p>
        </div>
        <IconButton
          onClick={toggleExpand}
          aria-label="toggle expand"
          className="text-2xl font-bold text-black hover:text-gray-700"
        >
          {isExpanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
        </IconButton>
      </div>

      {/* Body */}
      <Collapse in={isExpanded}>
        <div className="px-4 max-h-[300px] overflow-y-auto text-left">
          <p><strong className="font-bold font-sans">Expression of Interest: </strong></p>
          <p>{eoiDoc?.EOI || <em>No message provided.</em>}</p>
        </div>

        {/* Actions */}
        <div className="px-4 flex justify-center gap-4">
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="mt-4 self-center w-1/3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-base text-center py-2 rounded-3xl shadow-md transition duration-200"
          >
            {busy ? 'Removing…' : 'Remove'}
          </button>

          <button
            type="button"
            onClick={handleSelect}
            className="mt-4 self-center w-1/3 bg-[#9747FF] hover:bg-violet-900 text-white font-base text-center py-2 rounded-3xl shadow-md transition duration-200"
          >
            Select
          </button>
        </div>
      </Collapse>
    </div>
  );
};
