import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { ExpressionOfInterest } from '../../database/collections';

Meteor.methods({
  async 'expressionOfInterest.insert' ( propertyID, propertyAddress, tenantName, tenantID, EOI) {
    try{
      console.log('[DEBUG] insert args:', {
        propertyID, propertyAddress, tenantName, tenantID, EOI
      });

      check(propertyID, String);
      check(propertyAddress, String);
      check(tenantID, String);
      check(tenantName, String);
      check(EOI, String);

      const result = await ExpressionOfInterest.insertAsync({
        propertyID, propertyAddress, tenantName, tenantID, EOI,
      });

      console.log(`[Server] Added Expression of Interest ${result}`);
      return result;
    } catch (err){
      console.error('[SERVER ERROR] expressionOfInterest.insert: ', err);
      throw new Meteor.Error('insert-failed', err.message);
    }
  },

  
})
