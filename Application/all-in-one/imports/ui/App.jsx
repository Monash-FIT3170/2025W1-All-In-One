// App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

// Named import of Apply
// App.js
import Apply from './Apply.jsx'; // Default import (no curly braces)
export const App = () => (
  <>
    <Router>
      <div>
        <Routes>
          <Route path="/" element={
            <div>Welcome to the home page!
              <div>
                <Link to="/apply">Apply For a Property</Link>
              </div>
              <div>
                <h1>Home Page</h1>
              </div>
            </div>
          } />
          <Route path="/apply" element={<Apply />} />
        </Routes>
      </div>
    </Router>
  </>
);
