import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import {Apply} from './Apply.jsx';

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
            
            } 
            />
          <Route path="/apply" element={<Apply />} />
        </Routes>
      </div>
    </Router>


  </>
);
