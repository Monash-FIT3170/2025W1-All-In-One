import React, { useEffect, useRef } from 'react';

const StatusMenu = ({ show, onClose, onAccept, onReject, status, className = '', style = {} }) => {
  const menuRef = useRef(null);

  // Close menu if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      ref={menuRef}
      className={`absolute z-50 top-10 right-0 bg-white rounded-lg shadow-lg p-2 w-48 ${className}`}
      style={style}
    >
      <div className="font-bold mb-2 text-sm">Application Status</div>
      <button
        className="w-full text-xs text-left px-2 py-1 rounded hover:bg-green-100"
        onClick={onAccept}
      >
        Accept
      </button>
      <button
        className="w-full text-xs text-left px-2 py-1 rounded hover:bg-red-100"
        onClick={onReject}
      >
        Reject
      </button>
      <button
        className="absolute top-1 right-2 text-gray-400 hover:text-gray-700"
        onClick={onClose}
        aria-label="Close"
      >×</button>
    </div>
  );
};

export default StatusMenu;
