import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import { About } from './About.jsx';
import { BookInspection } from './BookInspection.jsx'; // import new page

export const App = () => (
  <Router>
    <div>
      <h1>Home Page</h1>
      <div className="flex gap-4">
      <Link to="/about">Go to About Page</Link>
      <Link to="/book-inspection">Book Inspection Page</Link> {/* New Link */}
      </div>a

      <Routes>
        <Route path="/" element={<div>Welcome to the home page!</div>} />
        <Route path="/about" element={<About />} />
        <Route path="/book-inspection" element={<BookInspection />} /> {/* New Route */}
      </Routes>
    </div>
  </Router>
);