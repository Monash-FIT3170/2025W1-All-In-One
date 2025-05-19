import React from 'react';
import { createBrowserRouter, BrowserRouter as Router, Routes, Route, Link, RouterProvider } from 'react-router-dom';

import { LoginPage } from './LoginPage.jsx';
import { HomePage } from './HomePage.jsx'; // Add this import
import { SignUpPage } from './SignUpPage.jsx'; // your signup page
import { Dashboard } from './Dashboard.jsx';

const router = createBrowserRouter([
  {
    path: '/', 
    element: <HomePage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/signup',
    element: <SignUpPage />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  // Add other routes here

])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider isSignedIn=false>
      <RouterProvider router={router} />
    </AuthProvider>
    <Router router={router} />
  </React.StrictMode>,
);

export const App = () => (
  // <Router>
  //   <div>
  //     <Routes>
  //       {/* Home Page */}
  //       <Route path="/" element={<HomePage />} />

  //       {/* Login Page */}
  //       <Route path="/login" element={<LoginPage />} />

  //       {/* Sign Up Page */}
  //       <Route path="/signup" element={<SignUpPage />} />

  //       {/* Dashboard Page - Agent*/}
  //       <Route path="/dashboard" element={<Dashboard/>} />
  //     </Routes>
  //   </div>
  // </Router>  
);
