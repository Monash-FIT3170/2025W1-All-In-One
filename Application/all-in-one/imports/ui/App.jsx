import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import AddPropertyListing from './AddPropertyListing';
import Test from './Test';

export default function App() {
  return(
    <Router>
        <Routes>
          <Route path="/" element={<AddPropertyListing />} />
          <Route path="/test" element={<Test />} />
        </Routes>
    </Router>

  );
}