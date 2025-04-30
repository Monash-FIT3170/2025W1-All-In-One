import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import { LoginPage } from './LoginPage.jsx';
import { HomePage } from './HomePage.jsx'; // Add this import
import { SignUpPage } from './SignUpPage.jsx'; // your signup page

export const App = () => (
  <Router>
    <div>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Login Page */}
        <Route path="/login" element={<LoginPage />} />

        {/* You can add signup page later */}
      </Routes>
    </div>
  </Router>
);
