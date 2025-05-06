import React from 'react';
import { BrowserRouter as Router, Routes, Route,Link } from 'react-router-dom';
import AgentPropListing from './AgentPropListing';
import BasicPropListing from './BasicPropListing';

export default function App() {
  return <BasicPropListing />;
}