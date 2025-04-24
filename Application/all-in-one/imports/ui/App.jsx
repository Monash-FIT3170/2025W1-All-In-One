import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import { About } from './About.jsx';
import { ReviewApplication } from './ReviewApplication.jsx';

export const App = () => (
  <>
    <Router>
      <div>
        

        <Routes>
          <Route path="/" element={
            <div>Welcome to the home page!
              <div>
              <Link to="/about">Go to About Page</Link>
              </div>
              <div>
                <Link to="/review">Go to Review Page</Link>
              </div>
              <div>
                <h1>Home Page</h1>
              </div>
            </div>
            
            } 
            />
          <Route path="/about" element={<About />} />
          <Route path="/review" element={<ReviewApplication />} />
        </Routes>
      </div>
    </Router>


  </>
);

