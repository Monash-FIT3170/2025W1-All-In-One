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
          { bookingID: book_id }, 
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

        // First, find the current attendance record to get the current value
        const attendanceRecord = await OpenHouseAttendance.findOneAsync({ 
          bookingID: book_id 
        });
        
        if (!attendanceRecord) {
          throw new Meteor.Error('not-found', 'Attendance record not found');
        }

        // Find the specific tenant in the attendance list
        const tenantIndex = attendanceRecord.attendanceList.findIndex(
          tenant => tenant.tenantID === ten_id
        );
        
        if (tenantIndex === -1) {
          throw new Meteor.Error('not-found', 'Tenant not found in attendance list');
        }

        // Toggle the attendance value
        const newAttendanceValue = !attendanceRecord.attendanceList[tenantIndex].tenantAttendance;
        
        // Update using the array index
        const result = await OpenHouseAttendance.updateAsync(
          { bookingID: book_id }, 
          { $set: { [`attendanceList.${tenantIndex}.tenantAttendance`]: newAttendanceValue } }
        );

        console.log(`[SERVER] Toggle tenant attendance ${result}, new value: ${newAttendanceValue}`);
        return result;

      } catch (err) {
        console.error('[SERVER ERROR] openHouseAttendance.toggleAttendance:', err);
        throw new Meteor.Error('update-failed', err.message);
      }
  },

})