import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import  About  from './About.jsx';
import { ReviewApplication } from './ReviewApplication.jsx';
import  Navbar  from './components/Navbar.jsx';

export const App = () => (
  <>
    <Router>
      <div>
        <Navbar />
        
        

        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/applications" element={<ReviewApplication />} />
        </Routes>
      </div>
    </Router>


  </>
);

