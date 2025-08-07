import React from 'react';
import { Link } from 'react-router-dom';

/**
 * About Component
 * 
 * A simple about page component that displays information about the application.
 * This component provides a basic about page with a link back to the home page.
 * 
 * @returns {JSX.Element} The rendered about page component
 */
export const About = () => (
  <div>
    <h2>About Page</h2>
    <p>This is the about page.</p>
    <Link to="/">Back to Home</Link>
  </div>
);