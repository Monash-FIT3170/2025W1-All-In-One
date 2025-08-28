import React from "react";
import { Link } from "react-router-dom";

// Resuable nav bar button component
const NavButton = ({ to, onClick, children, className = "" }) => {
  const baseClasses =
    "bg-[#9747FF] text-white px-4 py-1.5 rounded-full font-base hover:bg-violet-900 transition";

  return to ? (
    <Link to={to} className={`${baseClasses}${className}`}>
      {children}
    </Link>
  ) : (
    <button
      onClick={onClick}
      className={`${baseClasses}${className}`}
      type="button"
    >
      {children}
    </button>
  );
};

export default NavButton;
