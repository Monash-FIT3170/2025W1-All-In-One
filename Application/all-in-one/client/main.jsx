import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../imports/ui/App';
import './main.css';

// clicking the email link redirects to  ResetPassword page
Accounts.onResetPasswordLink((token, done) => {
  window.location.href = `/reset-password/${token}`;
});


Meteor.startup(() => {
  const root = createRoot(document.getElementById('react-target'));
  root.render(<App />);
}); 