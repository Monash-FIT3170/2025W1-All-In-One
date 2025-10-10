import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { TicketActivities } from '/imports/api/database/collections';

Meteor.methods({
  async 'ticketActivities.insert'(start, end, ticket_id, agent_id, title, notes, status) {
    check(start, String);
    check(end, String);
    check(ticket_id, String);
    check(agent_id, String);
    check(title, String);
    check(notes, String);
    check(status, String);

    return await TicketActivities.insertAsync({
      start,
      end,
      ticket_id,
      agent_id,
      title,
      notes,
      status,
      createdAt: new Date(),
    });
  },

  async 'ticketActivities.remove'(activityId) {
    check(activityId, String);

    const existing = await TicketActivities.findOneAsync({ _id: activityId });
    if (!existing) {
      throw new Meteor.Error('not-found', 'Ticket activity not found');
    }

    await TicketActivities.removeAsync({ _id: activityId });
    return activityId;
  },
});
