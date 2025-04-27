import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import { About } from './About.jsx';

export const App = () => (
  <Router>
    <div>
      <h1>Home Page</h1>
      <Link to="/about">Go to About Page</Link>

      <Routes>
        <Route path="/" element={<div>Welcome to the home page!</div>} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  </Router>
);