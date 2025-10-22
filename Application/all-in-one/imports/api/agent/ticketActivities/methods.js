import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
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

  async 'ticketActivities.update'(activityId, update) {
    check(activityId, String);
    check(update, Object);

    const existing = await TicketActivities.findOneAsync({ _id: activityId });
    if (!existing) {
      throw new Meteor.Error('not-found', 'Ticket activity not found');
    }

    const $set = {};

    if (update.start !== undefined) {
      check(update.start, String);
      $set.start = update.start;
    }

    if (update.end !== undefined) {
      check(update.end, String);
      $set.end = update.end;
    }

    if (update.notes !== undefined) {
      check(update.notes, String);
      $set.notes = update.notes;
    } else if (update.note !== undefined) {
      check(update.note, String);
      $set.notes = update.note;
    }

    if (update.title !== undefined) {
      check(update.title, String);
      $set.title = update.title;
    }

    if (update.status !== undefined) {
      check(
        update.status,
        Match.Where(
          (value) =>
            typeof value === 'string' &&
            ['pending', 'in-progress', 'completed'].includes(value)
        )
      );
      $set.status = update.status;
    }

    if (Object.keys($set).length === 0) {
      return activityId;
    }

    await TicketActivities.updateAsync({ _id: activityId }, { $set });
    return activityId;
  },
});
