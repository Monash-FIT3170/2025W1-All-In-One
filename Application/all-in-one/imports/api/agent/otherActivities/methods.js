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

  async 'otherActivities.remove'(id) {
    check(id, String);
    const doc = await OtherActivities.findOneAsync({ _id: id });
    if (!doc) throw new Meteor.Error('not-found', 'Availability not found');
    return OtherActivities.removeAsync({ _id: id });
  },

  async 'otherActivities.updateNotes'(id, newNote) {
    check(id, String);
    check(newNote, String);
    const doc = await OtherActivities.findOneAsync({ _id: id });
    if (!doc) throw new Meteor.Error('not-found', 'Availability not found');

    return OtherActivities.updateAsync({ _id: id }, { $set: {notes: newNote} });
  },

});
