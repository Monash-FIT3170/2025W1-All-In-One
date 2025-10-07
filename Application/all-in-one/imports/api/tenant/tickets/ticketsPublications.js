import { Meteor } from 'meteor/meteor';
import { Tickets } from '/imports/api/database/collections'; // Adjust path if necessary

Meteor.publish('tickets.forProperty', function(propId) {

  // Validate the propId.
  if (!propId || typeof propId !== 'string') {
    this.ready(); // Signal that the publication is ready but yielded no data.
    return;
  }

  // Return the cursor for tickets belonging to the given propId.
  return Tickets.find({ prop_id: propId });
});