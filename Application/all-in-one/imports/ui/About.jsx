import React from 'react';
import { Link } from 'react-router-dom';

export const About = () => (
  <div>
    <h2>About Page</h2>
    <p>This is the about page.</p>
    <Link to="/">Back to Home</Link>
  </div>
);