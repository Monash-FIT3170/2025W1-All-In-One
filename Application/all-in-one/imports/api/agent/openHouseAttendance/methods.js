import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { OpenHouseAttendance } from '../../database/collections';

Meteor.methods({
  async 'openHouseAttendance.insert' ( 
    bookingID, propertyAddress, start, end, attendanceList ) {
      try {
        console.log('[DEBUG] insert args:', {
          bookingID, propertyAddress, start, end, attendanceList
        });

        check(bookingID, String);
        check(propertyAddress, String);
        check(start, String);
        check(end, String);
        check(attendanceList, Array);

        const result = await OpenHouseAttendance.insertAsync({
          bookingID, propertyAddress, start, end, attendanceList
        });

      console.log(`[SERVER] Inserted attendance list ${result}`);
      return result;

      } catch (err) {
        console.error('[SERVER ERROR] openHouseAttendance.insert:', err);
        throw new Meteor.Error('open-house-insert-failed', err.message);
      }
  },

  async 'openHouseAttendance.addTenant' ( 
    book_id, ten_id, ten_name ) {
      try {
        console.log('[DEBUG] add tenant to list:', {
          book_id, ten_id, ten_name
        });

        check(book_id, String);
        check(ten_id, String);
        check(ten_name, String);

        const attendance = false;

        const result = await OpenHouseAttendance.updateAsync(
          { _id: book_id }, 
          { $push: {attendanceList: {tenantID: ten_id, tenantName: ten_name, tenantAttendance: attendance }}
        });

      console.log(`[SERVER] Added tenant to attendance list ${result}`);
      return result;

      } catch (err) {
        console.error('[SERVER ERROR] openHouseAttendance.addTenant:', err);
        throw new Meteor.Error('update-failed', err.message);
      }
  },

  async 'openHouseAttendance.toggleAttendance' (
    book_id, ten_id ) {
      try {
        console.log('[DEBUG] Toggle tenant attendance:', {
          book_id, ten_id
        });

        check(book_id, String);
        check(ten_id, String);

        const result = await OpenHouseAttendance.updateAsync(
          { _id: book_id, 'attendanceList.$.tenantID': ten_id }, 
          { $bit: {tenantAttendance: {xor: 1} } }
        );

      console.log(`[SERVER] Toggle tenant attendance ${result}`);
      return result;

      } catch (err) {
        console.error('[SERVER ERROR] openHouseAttendance.toggleAttendance:', err);
        throw new Meteor.Error('update-failed', err.message);
      }
  },

})