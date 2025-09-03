import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { ExpressionOfInterest, AgentAvailabilities, Tenants, Properties } from '../../database/collections';

Meteor.methods({
  async 'expressionOfInterest.insert' ( propertyID, tenantID, EOI) {
    try{
      console.log('[DEBUG] insert args:', {
        propertyID, tenantID, EOI
      });

      check(propertyID, String);
      check(tenantID, String);
      check(EOI, String);

      const result = await ExpressionOfInterest.insertAsync({
        propertyID, tenantID, EOI, inviteSent: false, inviteAccepted: false,
      });

      console.log(`[Server] Added Expression of Interest ${result}`);
      return result;
    } catch (err){
      console.error('[SERVER ERROR] expressionOfInterest.insert: ', err);
      throw new Meteor.Error('insert-failed', err.message);
    }
  },

  
  async 'expressionOfInterest.sendInvite' (eoiID, bookingID){
    try{
      console.log('[DEBUG] insert args:', {
        eoiID, bookingID
      });

      check(eoiID, String);
      check(bookingID, String);

      //Creating new tenant booking (status --> pending or invited)
      const eoi = await ExpressionOfInterest.findOneAsync({_id: eoiID});

      const tenantID = eoi.tenantID;
      const tenant = await Tenants.findOneAsync({ten_id: tenantID});

      const tenantName = tenant.ten_fn + " " + tenant.ten_ln;
      const booking = await AgentAvailabilities.findOneAsync({_id: bookingID});
      const bookingStart = new Date(booking.start);
      const bookingEnd = new Date(booking.end);
      const property = booking.property;
      const propertyID = (await Properties.findOneAsync({prop_address: property.address})).prop_id;
      const bookingData = {
        agentAvailabilityId: bookingID,
        tenantName: tenantName,
        tenantId: tenantID,
        start: bookingStart,
        end: bookingEnd,
        property: {
          id: propertyID,
          address: property.address,
          price: property.price,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          parking: property.parking,
          image: property.image
        },
        status: "Invited"
      }

      await ExpressionOfInterest.updateAsync({_id: eoiID}, {$set: {inviteSent: true}});
        
      await Meteor.call('tenantBookings.insert', bookingData, 
        (err) => {if (err) 
          console.error('EOI invite send failed: ', err);
        });

      console.log(`[Server] Sent Invite Successfully`);
    } catch (err){
      console.error('[SERVER ERROR] expressionOfInterest.sendInvite: ', err);
      throw new Meteor.Error('sending-invite-failed', err.message);
    }
  },


  async 'expressionOfInterest.confirmInvite' (eoiID) {
      try{
      console.log('[DEBUG] insert args:', {
        eoiID
      });

      check(eoiID, String);

      const result = await ExpressionOfInterest.updateAsync(
        {_id: eoiID},
        {$set: 
          {inviteConfirmed: true}
      });

      console.log(`[Server] Invitation Confirmed ${result}`);
      return result;
    } catch (err){
      console.error('[SERVER ERROR] expressionOfInterest.confirmInvite: ', err);
      throw new Meteor.Error('sending-invite-failed', err.message);
    }
  },

  async 'eoi.remove'(eoiID) {
    check(id, String);
    ExpressionOfInterest.remove({ _id: eoiID });
  }

});

  