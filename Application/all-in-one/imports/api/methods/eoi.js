// /imports/api/methods/eoi.js
import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { check, Match } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { ExpressionOfInterest, Tenants, Properties } from '/imports/api/database/collections';

Meteor.methods({
  'eoi.reject'(eoiId) {
    if (eoiId == null) {
      throw new Meteor.Error('bad-request', 'Missing EOI id.');
    }

    check(eoiId, Match.OneOf(String, Mongo.ObjectID));

    const eoi = ExpressionOfInterest.findOneAsync({ _id: eoiId });
    if (!eoi) throw new Meteor.Error('not-found', 'EOI not found.');

    const tenant = Tenants.findOneAsync({ ten_id: eoi.tenantID });
    const property = Properties.findOneAsync({ prop_id: eoi.propertyID });

    ExpressionOfInterest.removeAsync({ _id: eoiId });

    return true;
  }
});
