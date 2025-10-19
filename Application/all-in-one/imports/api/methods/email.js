import { Meteor } from "meteor/meteor";
import { Email } from "meteor/email";

Meteor.methods({
  sendBookingEmail(bookingData) {
    check(bookingData, Object);

    const { tenantName, property, start, end } = bookingData;
    const date = new Date(start).toLocaleString();
    const endTime = new Date(end).toLocaleTimeString();

    const subject = `Inspection Booking Confirmed for ${property.address}`;
    const text = `
      Hello ${tenantName},

      Your inspection has been confirmed for the property:
      ${property.address}
      
      📅 Date & Time: ${date} - ${endTime}
      🏠 Price: ${property.price ? `$${property.price} p/week` : "N/A"}
      🛏️ ${property.bedrooms} Bed | 🛁 ${property.bathrooms} Bath | 🚗 ${
      property.parking
    } Car Spot(s)

      Thank you for booking with us!
    `;

    // Send to tenant
    Email.send({
      to: bookingData.tenantEmail || Meteor.user().emails[0].address,
      from: "no-reply@propertymanager.com",
      subject,
      text,
    });

    // Send to agent
    Email.send({
      to: bookingData.agentEmail || "agent@propertymanager.com",
      from: "no-reply@propertymanager.com",
      subject: `Tenant Booking: ${tenantName} for ${property.address}`,
      text,
    });

    console.log(
      `[EMAIL SENT] Booking confirmation sent for ${property.address}`
    );
  },
});