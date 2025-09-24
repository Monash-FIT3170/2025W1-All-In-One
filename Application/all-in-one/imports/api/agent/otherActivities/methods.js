import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { OtherActivities } from '/imports/api/database/collections';

Meteor.methods({
  async 'otherActivities.insert'(agent_id, start, end, title, notes) {
    check(agent_id, String);
    check(start, String);
    check(end, String);
    check(title, String);
    check(notes, String);

    return await OtherActivities.insertAsync({
      agent_id,
      start,
      end,
      title,
      notes,
    });
  },
});
