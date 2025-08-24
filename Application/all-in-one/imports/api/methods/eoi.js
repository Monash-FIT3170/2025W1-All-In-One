import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { check, Match } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { ExpressionOfInterest, Tenants, Properties } from '/imports/api/database/collections';

Meteor.methods({
  async 'eoi.reject'(eoiId) {                 // ← make the method async
    if (eoiId == null) {
      throw new Meteor.Error('bad-request', 'Missing EOI id.');
    }

    // Accept string or ObjectID
    check(eoiId, Match.OneOf(String, Mongo.ObjectID));

    // Await async DB calls
    const eoi = await ExpressionOfInterest.findOneAsync({ _id: eoiId });
    if (!eoi) throw new Meteor.Error('not-found', 'EOI not found.');

    const tenant = await Tenants.findOneAsync({ ten_id: eoi.tenantID });
    const property = await Properties.findOneAsync({ prop_id: eoi.propertyID });

    // Remove the EOI (await so errors surface properly)
    await ExpressionOfInterest.removeAsync({ _id: eoiId });

    // Send the email (MAIL_URL must be set)
    if (tenant?.ten_email) {
      try {
        Email.sendAsync({
          to: tenant.ten_email,
          from: 'All In One <allinone3170@gmail.com>', // must be a verified sender for your SMTP
          subject: 'Update on your Expression of Interest',
          text: `Hi ${tenant.ten_fn || 'there'},

Thanks for your interest in ${property?.prop_address || 'the property'}.
We’re writing to let you know this expression of interest was not selected for a private viewing at this time.

Kind regards,
All In One Team`,
        });
      } catch (err) {
        // Don’t fail the rejection just because email failed
        console.error('EOI rejection email failed:', err);
      }
    }

    return true;
  },

  async 'eoi.accept'(eoiId) {                  // ← ACCEPT version: just send the email
    if (eoiId == null) {
      throw new Meteor.Error('bad-request', 'Missing EOI id.');
    }

    check(eoiId, Match.OneOf(String, Mongo.ObjectID));

    const eoi = await ExpressionOfInterest.findOneAsync({ _id: eoiId });
    if (!eoi) throw new Meteor.Error('not-found', 'EOI not found.');

    const tenant = await Tenants.findOneAsync({ ten_id: eoi.tenantID });
    const property = await Properties.findOneAsync({ prop_id: eoi.propertyID });

    if (tenant?.ten_email) {
      try {
        Email.sendAsync({
          to: tenant.ten_email,
          from: 'All In One <allinone3170@gmail.com>',
          subject: 'Great news about your Expression of Interest!',
          text: `Hi ${tenant.ten_fn || 'there'},

Good news! Your expression of interest for ${property?.prop_address || 'the property'} has been accepted for a private viewing.

Please login into your account to accept or reject this invitation.

Kind regards,
All In One Team`,
        });
      } catch (err) {
        console.error('EOI acceptance email failed:', err);
      }
    }

    return true;
  },
});
