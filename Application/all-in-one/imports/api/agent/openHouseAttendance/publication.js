import { Meteor } from 'meteor/meteor';
import { OpenHouseAttendance } from '../../database/collections';

if (Meteor.isServer) {
    Meteor.publish('openHouseAttendance', function () {
        return OpenHouseAttendance.find();
});
}