import { Accounts } from "meteor/accounts-base";

Accounts.urls.resetPassword = (token) => {
  // Point directly to React route- was doing some weoird home creen load then password reset page load before
  return Meteor.absoluteUrl(`reset-password/${token}`);
};

// Customize the email template with plain text version and html version
Accounts.emailTemplates.resetPassword = {
  subject(user) {
    return `Reset your All In One password, ${user.profile?.firstName || ""}`;
  },
  text(user, url) {
    return `Hello ${user.profile?.firstName || ""},

We received a request to reset your password for your All In One account.

Click the link below to reset your password:
${url}

If you did not request this, just ignore this email.

Thanks,
The All In One Team`;
  },
  html(user, url) {
    return `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; text-align: center;">
        <h2 style="color: #9747FF;">Hello ${user.profile?.firstName || ""},</h2>
        <p>We received a request to reset your password for your <strong>All In One</strong> account.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${url}" style="
            background-color: #9747FF;
            color: #fff;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            display: inline-block;
          ">Reset Password</a>
        </p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p style="margin-top: 30px; font-size: 14px; color: #999; text-align: center;">Thanks,<br/>The All In One Team</p>
      </div>
    `;
  },
};
