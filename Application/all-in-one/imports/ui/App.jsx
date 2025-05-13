import React from 'react';
import { BrowserRouter as Router, Routes, Route,Link } from 'react-router-dom';
import AgentPropListing from './AgentPropListing';
import TenantPropListing from './TenantPropListing';

export default function App() {
  return <AgentPropListing />;
}