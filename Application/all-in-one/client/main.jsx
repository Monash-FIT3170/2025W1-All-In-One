import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../imports/ui/App';
import './main.css';

Meteor.startup(() => {
  const root = createRoot(document.getElementById('react-target'));
  root.render(<App />);
});