import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { check, Match } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { AgentAvailabilities, Tenants, Properties, RentalApplications } from '/imports/api/database/collections';

Meteor.methods({
  /**
   * Send inspection booking form email to tenants
   * Can be called by agents to manually email booking forms
   */
  async 'inspection.sendBookingEmail'(availabilityId, tenantEmails = []) {
    if (!availabilityId) {
      throw new Meteor.Error('bad-request', 'Missing availability ID.');
    }

    check(availabilityId, Match.OneOf(String, Mongo.ObjectID));
    check(tenantEmails, Array);

    // Fetch the availability details
    const availability = await AgentAvailabilities.findOneAsync({ _id: availabilityId });
    if (!availability) {
      throw new Meteor.Error('not-found', 'Inspection availability not found.');
    }

    // Format date and time for email
    const startDate = new Date(availability.start);
    const endDate = new Date(availability.end);

    const formatDate = (date) => {
      const d = new Date(date);
      const day = d.getDate();
      const month = d.toLocaleString('default', { month: 'long' });
      const year = d.getFullYear();
      const suffix =
        day === 1 || day === 21 || day === 31 ? 'st' :
        day === 2 || day === 22 ? 'nd' :
        day === 3 || day === 23 ? 'rd' : 'th';
      return `${day}${suffix} ${month} ${year}`;
    };

    const formatTime = (start, end) => {
      const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
      return `${new Date(start).toLocaleTimeString([], opts)} - ${new Date(end).toLocaleTimeString([], opts)}`;
    };

    const formattedDate = formatDate(startDate);
    const formattedTime = formatTime(startDate, endDate);

    // Get property details
    const propertyAddress = availability.property?.address || availability.address || 'your property';
    const propertyPrice = availability.property?.price || availability.price;
    const propertyBeds = availability.property?.bedrooms || availability.bedrooms;
    const propertyBaths = availability.property?.bathrooms || availability.bathrooms;
    const propertyParking = availability.property?.parking || availability.parking;

    // Build property details string
    let propertyDetails = `Address: ${propertyAddress}`;
    if (propertyPrice) propertyDetails += `\nRent: $${propertyPrice} per week`;
    if (propertyBeds) propertyDetails += `\nBedrooms: ${propertyBeds}`;
    if (propertyBaths) propertyDetails += `\nBathrooms: ${propertyBaths}`;
    if (propertyParking) propertyDetails += `\nParking: ${propertyParking}`;

    // If no specific tenants provided, fetch all active tenants
    let recipients = tenantEmails;
    if (recipients.length === 0) {
      const allTenants = await Tenants.find({}).fetchAsync();
      recipients = allTenants
        .filter(t => t.ten_email)
        .map(t => ({ email: t.ten_email, name: t.ten_fn }));
    }

    const emailsSent = [];
    const emailsFailed = [];

    // Send emails to each recipient
    for (const recipient of recipients) {
      const recipientEmail = typeof recipient === 'string' ? recipient : recipient.email;
      const recipientName = typeof recipient === 'object' ? recipient.name : 'there';

      if (!recipientEmail) continue;

      try {
        await Email.sendAsync({
          to: recipientEmail,
          from: 'All In One <allinone3170@gmail.com>',
          subject: `Inspection Booking Available - ${propertyAddress}`,
          text: `Hi ${recipientName || 'there'},

We have an upcoming routine inspection available for booking.

INSPECTION DETAILS:
Date: ${formattedDate}
Time: ${formattedTime}

PROPERTY DETAILS:
${propertyDetails}

To book this inspection slot, please log in to your All In One account and navigate to the Upcoming Inspections page.

If you have any questions, please don't hesitate to contact us.

Kind regards,
All In One Team`,
          html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #9747FF; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .details-box { background-color: #FFF8E9; border: 2px solid #E7E1D6; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .detail-item { margin: 8px 0; }
    .label { font-weight: bold; color: #555; }
    .cta-button {
      display: inline-block;
      background-color: #9747FF;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Inspection Booking Available</h1>
    </div>
    <div class="content">
      <p>Hi ${recipientName || 'there'},</p>
      <p>We have an upcoming routine inspection available for booking.</p>

      <div class="details-box">
        <h3 style="margin-top: 0; color: #9747FF;">Inspection Details</h3>
        <div class="detail-item"><span class="label">Date:</span> ${formattedDate}</div>
        <div class="detail-item"><span class="label">Time:</span> ${formattedTime}</div>
      </div>

      <div class="details-box">
        <h3 style="margin-top: 0; color: #9747FF;">Property Details</h3>
        <div class="detail-item"><span class="label">Address:</span> ${propertyAddress}</div>
        ${propertyPrice ? `<div class="detail-item"><span class="label">Rent:</span> $${propertyPrice} per week</div>` : ''}
        ${propertyBeds ? `<div class="detail-item"><span class="label">Bedrooms:</span> ${propertyBeds}</div>` : ''}
        ${propertyBaths ? `<div class="detail-item"><span class="label">Bathrooms:</span> ${propertyBaths}</div>` : ''}
        ${propertyParking ? `<div class="detail-item"><span class="label">Parking:</span> ${propertyParking}</div>` : ''}
      </div>

      <p>To book this inspection slot, please log in to your All In One account and navigate to the Upcoming Inspections page.</p>

      <center>
        <a href="${Meteor.absoluteUrl('upcoming-inspections')}" class="cta-button">View & Book Inspection</a>
      </center>

      <p>If you have any questions, please don't hesitate to contact us.</p>

      <p>Kind regards,<br>All In One Team</p>
    </div>
    <div class="footer">
      This is an automated message from All In One Property Management System.
    </div>
  </div>
</body>
</html>
          `,
        });
        emailsSent.push(recipientEmail);
      } catch (err) {
        console.error(`Failed to send inspection booking email to ${recipientEmail}:`, err);
        emailsFailed.push(recipientEmail);
      }
    }

    return {
      success: true,
      sent: emailsSent.length,
      failed: emailsFailed.length,
      emailsSent,
      emailsFailed,
    };
  },

  /**
   * Send confirmation email to tenant after they book an inspection
   */
  async 'inspection.sendBookingConfirmation'(bookingId) {
    if (!bookingId) {
      throw new Meteor.Error('bad-request', 'Missing booking ID.');
    }

    check(bookingId, Match.OneOf(String, Mongo.ObjectID));

    // This will be imported from TenantBookings collection
    const { TenantBookings } = await import('/imports/api/database/collections');
    const booking = await TenantBookings.findOneAsync({ _id: bookingId });

    if (!booking) {
      throw new Meteor.Error('not-found', 'Booking not found.');
    }

    // Get tenant details
    const tenant = await Tenants.findOneAsync({ ten_id: booking.tenantId });
    if (!tenant || !tenant.ten_email) {
      throw new Meteor.Error('not-found', 'Tenant email not found.');
    }

    // Get availability details
    const availability = await AgentAvailabilities.findOneAsync({ _id: booking.agentAvailabilityId });

    // Format date and time
    const startDate = new Date(booking.start);
    const endDate = new Date(booking.end);

    const formatDate = (date) => {
      const d = new Date(date);
      const day = d.getDate();
      const month = d.toLocaleString('default', { month: 'long' });
      const year = d.getFullYear();
      const suffix =
        day === 1 || day === 21 || day === 31 ? 'st' :
        day === 2 || day === 22 ? 'nd' :
        day === 3 || day === 23 ? 'rd' : 'th';
      return `${day}${suffix} ${month} ${year}`;
    };

    const formatTime = (start, end) => {
      const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
      return `${new Date(start).toLocaleTimeString([], opts)} - ${new Date(end).toLocaleTimeString([], opts)}`;
    };

    const formattedDate = formatDate(startDate);
    const formattedTime = formatTime(startDate, endDate);

    // Get property details from booking
    const propertyAddress = booking.property?.address || 'your property';
    const propertyPrice = booking.property?.price;
    const propertyBeds = booking.property?.bedrooms;
    const propertyBaths = booking.property?.bathrooms;
    const propertyParking = booking.property?.parking;

    try {
      await Email.sendAsync({
        to: tenant.ten_email,
        from: 'All In One <allinone3170@gmail.com>',
        subject: `Inspection Booking Confirmed - ${propertyAddress}`,
        text: `Hi ${tenant.ten_fn || 'there'},

Your inspection booking has been confirmed!

INSPECTION DETAILS:
Date: ${formattedDate}
Time: ${formattedTime}

PROPERTY DETAILS:
Address: ${propertyAddress}
${propertyPrice ? `Rent: $${propertyPrice} per week` : ''}
${propertyBeds ? `Bedrooms: ${propertyBeds}` : ''}
${propertyBaths ? `Bathrooms: ${propertyBaths}` : ''}
${propertyParking ? `Parking: ${propertyParking}` : ''}

Please make sure you're available at the scheduled time. If you need to cancel or reschedule, please contact us as soon as possible.

Kind regards,
All In One Team`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
    .details-box { background-color: #E8F5E9; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .detail-item { margin: 8px 0; }
    .label { font-weight: bold; color: #555; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .checkmark { font-size: 48px; color: #4CAF50; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="checkmark">✓</div>
      <h1>Inspection Booking Confirmed</h1>
    </div>
    <div class="content">
      <p>Hi ${tenant.ten_fn || 'there'},</p>
      <p><strong>Your inspection booking has been confirmed!</strong></p>

      <div class="details-box">
        <h3 style="margin-top: 0; color: #4CAF50;">Inspection Details</h3>
        <div class="detail-item"><span class="label">Date:</span> ${formattedDate}</div>
        <div class="detail-item"><span class="label">Time:</span> ${formattedTime}</div>
      </div>

      <div class="details-box" style="background-color: #FFF8E9; border-color: #E7E1D6;">
        <h3 style="margin-top: 0; color: #9747FF;">Property Details</h3>
        <div class="detail-item"><span class="label">Address:</span> ${propertyAddress}</div>
        ${propertyPrice ? `<div class="detail-item"><span class="label">Rent:</span> $${propertyPrice} per week</div>` : ''}
        ${propertyBeds ? `<div class="detail-item"><span class="label">Bedrooms:</span> ${propertyBeds}</div>` : ''}
        ${propertyBaths ? `<div class="detail-item"><span class="label">Bathrooms:</span> ${propertyBaths}</div>` : ''}
        ${propertyParking ? `<div class="detail-item"><span class="label">Parking:</span> ${propertyParking}</div>` : ''}
      </div>

      <p>Please make sure you're available at the scheduled time. If you need to cancel or reschedule, please contact us as soon as possible.</p>

      <p>Kind regards,<br>All In One Team</p>
    </div>
    <div class="footer">
      This is an automated confirmation from All In One Property Management System.
    </div>
  </div>
</body>
</html>
        `,
      });

      return { success: true };
    } catch (err) {
      console.error('Failed to send booking confirmation email:', err);
      throw new Meteor.Error('email-failed', 'Failed to send confirmation email.');
    }
  },
});