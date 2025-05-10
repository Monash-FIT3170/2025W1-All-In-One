import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';


import { BookInspection } from './tenant/BookInspection.jsx'; // import new page
import { PropertyBooking } from './agent/PropertyBooking.jsx';

export const App = () => (
  <Router>
    <div>
      <h1>Home Page</h1>
      <div className="flex gap-4">
      <Link to="/book-inspection">Book Inspection Page</Link> {/* New Link */}
      <Link to="/property-booking">property inspection</Link>
      </div>

      <Routes>
        <Route path="/" element={<div>Welcome to the home page!</div>} />
        <Route path="/book-inspection" element={<BookInspection />} /> {/* New Route */}
        <Route path="/property-booking" element={<PropertyBooking />} />
      </Routes>
    </div>
  </Router>
);