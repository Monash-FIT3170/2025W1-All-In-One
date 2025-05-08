import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BasicPropListing from './BasicPropListing.jsx';
import DetailedPropListing from './DetailedPropListing.jsx';
import AgentPorpListing from './AgentPropListing.jsx';
import AddPropertyListing from './AddPropertyListing.jsx';

export default function App ()  {
  return(
  <Router>
    <Routes>
      <Route path="/BasicPropListing" element={<BasicPropListing />} />
      <Route path="/DetailedPropListing/:id" element={<DetailedPropListing/>}/>
      <Route path="/AgentPropListing" element={<AgentPorpListing/>}/>
      <Route path="/AddPropertyListing" element={<AddPropertyListing/>}/>
      <Route path="/" element={<div>Welcome Page</div>} />
    </Routes>
  </Router>
  );
}

