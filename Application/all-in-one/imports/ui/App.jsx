import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';


import { CalendarBooking } from './agent/CalendarBooking.jsx'; 
import { PropertyListing } from './tenant/PropertyListing.jsx';
import { InspectionBooking } from './tenant/InspectionBooking.jsx';

export const App = () => (
  <Router>
    <div>
      <h1>Home Page</h1>
      <div className="flex gap-4">
      <Link to="/calendar-booking">Calendar Booking Page</Link> {/* New Link */}
      <Link to="/property-listing">property listing</Link> {/* New Link */}
      <Link to="/inspection-booking">Inspection Booking</Link>
      </div>

      <Routes>
        <Route path="/" element={<div>Welcome to the home page!</div>} />
        <Route path="/calendar-booking" element={<CalendarBooking />} /> {/* New Route */}
        <Route path="/property-listing" element={<PropertyListing />} />
        <Route path="/inspection-booking" element={<InspectionBooking/>} />
      </Routes>
    </div>
  </Router>
);