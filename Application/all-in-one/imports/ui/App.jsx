// App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import  About  from './About.jsx';
import { ReviewApplication } from './agent/AgentReviewApplication.jsx';
import  Navbar  from './globalComponents/Navbar.jsx';
import  './tenant/TenantApply.jsx';

// Named import of Apply
// App.js
import Apply from './tenant/TenantApply.jsx'; // Default import (no curly braces)
export const App = () => (
  <>
    <Router>
      <div>
        <Navbar />
        
        

        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/applications" element={<ReviewApplication />} />
          <Route path="/apply" element={<Apply />} />
        </Routes>
      </div>
    </Router>


  </>
);

