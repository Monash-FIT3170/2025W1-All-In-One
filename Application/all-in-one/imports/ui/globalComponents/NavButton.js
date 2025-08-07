import React from "react";
import { Link } from "react-router-dom";

/**
 * NavButton Component
 * 
 * A reusable navigation button component that can be used as either a Link
 * or a regular button depending on the props provided.
 * 
 * Features:
 * - Can render as a Link (when 'to' prop is provided) or a button (when 'onClick' is provided)
 * - Consistent styling with the application theme
 * - Hover effects and transitions
 * - Customizable className support
 * 
 * @param {Object} props - Component props
 * @param {string} [props.to] - Route path for Link component
 * @param {Function} [props.onClick] - Click handler for button component
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} The rendered navigation button component
 */
const NavButton = ({ to, onClick, children, className = "" }) => {
  // Base styling classes for the button
  const baseClasses =
    "bg-[#9747FF] text-white px-4 py-1.5 rounded-full font-base hover:bg-violet-900 transition";

  // Render as Link if 'to' prop is provided, otherwise as button
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
