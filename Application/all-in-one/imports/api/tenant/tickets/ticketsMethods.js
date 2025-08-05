import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { v4 as uuidv4 } from 'uuid';

// Import your Tickets collection
import { Tickets, Agents } from '/imports/api/database/collections';

Meteor.methods({
  /**
   * Inserts a new ticket into the database, generating a unique ticket_id and auto-incrementing ticket_no
   * based on the provided prop_id by finding the maximum existing ticket_no for that property.
   *
   * @param {Object} ticketData - The data for the new ticket (excluding ticket_id, ticket_no, createdAt).
   * @returns {string} The ID of the newly created ticket.
   */
  'tickets.insert': async function(ticketData) { // Make the method async
    check(ticketData, {
      prop_id: String, // Ensure prop_id is always provided
      ten_id: String,
      agent_id: String,
      title: String,
      description: String,
      type: String,
      issue_start_date: Match.Maybe(Date), // Use Match.Maybe for optional Date field
      date_logged: String
    });

    const propId = ticketData.prop_id;

    // Find the highest existing ticket_no for this specific prop_id
    const lastTicket = await Tickets.rawCollection().findOne(
      { prop_id: propId },
      { sort: { ticket_no: -1 }, projection: { ticket_no: 1 } } // Sort descending by ticket_no, get only ticket_no field
    );

    // Calculate the next ticket number: if no tickets exist for this property, start at 1, otherwise increment the max.
    const nextTicketNo = lastTicket ? lastTicket.ticket_no + 1 : 1;

    const newTicket = {
      ...ticketData,
      ticket_id: uuidv4(), // Generate a unique ID for the ticket
      ticket_no: nextTicketNo, // Assign the calculated ticket number
      createdAt: new Date(), // Set creation timestamp on the server
    };

    await Tickets.insertAsync(newTicket); // Changed from insert to insertAsync() and added await


    return newTicket.ticket_id; // Return the ID of the newly created ticket
  },

  //get agent's name to display on ticket
  'agents.getById'(agentId) {
    check(agentId, String);
    const agent = Agents.findOneAsync(
      { agent_id: agentId },
      { fields: { agent_fname: 1, agent_lname: 1 } }
    );
    if (!agent) throw new Meteor.Error('not-found', 'Agent not found');
    return agent;
  }
});