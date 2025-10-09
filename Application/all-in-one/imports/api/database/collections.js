import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Properties = new Mongo.Collection('properties');
Properties.schema = new SimpleSchema({
  prop_id: { type: String },
  prop_address: { type: String },
  prop_pricepweek: { type: Number },
  prop_numbeds: { type: Number },
  prop_numbaths: { type: Number },
  prop_numcarspots: { type: Number },
  prop_type: { type: String },
  prop_desc: { type: String },
  prop_available_date: { type: Date },
  prop_furnish: { type: Boolean },
  prop_pets: { type: Boolean },
  prop_bond: { type: Number },
  prop_status: { type: String },
  agent_id: { type: String },
  landlord_id: { type: String },
  photo: { type: Array, optional: true },
  "photo.$": { type: String },

  video: { type: Array, optional: true },
  "video.$": { type: String },
});

export const Photos = new Mongo.Collection('photos');
Photos.schema = new SimpleSchema({
  prop_id: { type: String },
  photo_id: { type: String },
  photo_url: { type: String },
  photo_order: { type: Number },
});

export const Videos = new Mongo.Collection('videos');
Videos.schema = new SimpleSchema({
  prop_id: { type: String },
  video_id: { type: String },
  video_url: { type: String },
});

export const RentalApplications = new Mongo.Collection('rental_applications');
RentalApplications.schema = new SimpleSchema({
  rental_app_id: { type: String },
  prop_id: { type: String },
  rental_app_prop_inspected: { type: Boolean },
  lease_start_date: { type: Date },
  lease_term: { type: String },
  app_rent: { type: Number },
  app_desc: { type: String },
  ten_id: { type: String },
  employment_id: {
    type: String,
    optional: true,
  },
  status: { type: String, optional: true },
  household_pets: { type: Boolean },
  pet_description: { type: String, optional: true },
  emergency_contact_id: { type: String },

  landLordFinal: { type: String, optional: true }, // 'shortlisted', 'to_review', 'flagged'
  agentFlag: { type: String, optional: true }, // 'approved', 'rejected'
  finalDecision: { type: String, optional: true },
  // values: "Approved", "Rejected"

  submitted : {type: Boolean, defaultValue: false},
});

export const Tenants = new Mongo.Collection('tenants');
Tenants.schema = new SimpleSchema({
  ten_id: { type: String },
  ten_fn: { type: String },
  ten_ln: { type: String },
  ten_email: { type: String },
  ten_pn: { type: String },
  ten_pfp: { type: String },
  ten_role: { type: String },
  ten_dob: { type: Date },
  prop_id: { type: String },
});

export const Landlord = new Mongo.Collection('landlord');
Landlord.schema = new SimpleSchema({
  ll_id: { type: String },
  ll_fn: { type: String },
  ll_ln: { type: String },
  ll_email: { type: String },
  ll_pn: { type: String },
  ll_password: { type: String },
  ll_pfp: { type: String },
  prop_id: { type: String },
});

export const Employment = new Mongo.Collection('employment');
Employment.schema = new SimpleSchema({
  employment_id: { type: String },
  ten_id: { type: String },
  emp_type: { type: String },
  emp_comp: { type: String },
  emp_job_title: { type: String },
  emp_start_date: { type: Date },
  emp_verification: { type: String },
});

export const Addresses = new Mongo.Collection('addresses');
Addresses.schema = new SimpleSchema({
  address_id: { type: String },
  rental_app_id: { type: String },
  address_address: { type: String },
  address_movein: { type: Date },
  address_moveout: { type: Date },
  address_ownership: { type: String },
  address_reference_type: { type: String },
  address_reference_name: { type: String },
  address_reference_email: { type: String },
  address_reference_number: { type: String },
  address_status: { type: String },
});

export const Incomes = new Mongo.Collection("incomes");
Incomes.schema = new SimpleSchema({
  inc_id: { type: String },
  rental_app_id: { type: String },
  inc_type: { type: String },
  inc_amt: { type: Number },
  inc_supporting_doc: { type: String , optional: true },
  inc_public_id: { type: String , optional: true },
});

export const Identities = new Mongo.Collection("identities");
Identities.schema = new SimpleSchema({
  identity_id: { type: String },
  rental_app_id: { type: String },
  identity_type: { type: String },
  identity_public_id: { type: String , optional: true },
  identity_desc: { type: String, optional: true },
  identity_scan: { type: String, optional: true },
});

export const Households = new Mongo.Collection("households");
Households.schema = new SimpleSchema({
  occupant_id: { type: String },
  rental_app_id: { type: String },
  occupant_name: { type: String },
  occupant_age: { type: Number },
});

export const Agents = new Mongo.Collection("agents");
Agents.schema = new SimpleSchema({
  agent_id: { type: String },
  agent_fname: { type: String },
  agent_lname: { type: String },
  agent_ph: { type: String },
  agent_email: { type: String },
  agent_password: { type: String },
});

export const Tickets = new Mongo.Collection('tickets');
Tickets.schema = new SimpleSchema({
  ticket_id: {
    type: String,
  },
  ticket_no: {
    type: SimpleSchema.Integer,
  },
  prop_id: {
    type: String, // Links to the property the ticket is for
  },
  ten_id: {
    type: String, // ID of the tenant who created this ticket
  },
  agent_id: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String, // Detailed description of the issue
  },
  type: {
    type: String,
    allowedValues: ['Maintenance', 'General'], // Type of ticket
  },
  issue_start_date: {
    type: Date,
    optional: true, // When the issue began, primarily for maintenance tickets
  },
  date_logged: {
    type: String, // Timestamp when the ticket was created
  },
  status: {
    type: String,
    allowedValues: ['Active','Resolved']
  }

});


// USER SETTINGS - TENANT

// Tenant employment settings
export const Ten_SettingsEmployment = new Mongo.Collection('ten_SettingsEmployment');
Ten_SettingsEmployment.schema = new SimpleSchema({
  employment_id: { type: String },
  ten_id: { type: String },
  emp_type: { type: String },
  emp_comp: { type: String },
  emp_job_title: { type: String },
  emp_start_date: { type: Date },
  emp_verification: { type: String },
});

// Tenant addresses settings
export const Ten_SettingsAddresses = new Mongo.Collection('ten_SettingsAddresses');
Ten_SettingsAddresses.schema = new SimpleSchema({
  address_id: { type: String },
  ten_id: { type: String },
  address_address: { type: String },
  address_movein: { type: Date },
  address_moveout: { type: Date },
  address_ownership: { type: String },
  address_reference_type: { type: String },
  address_reference_name: { type: String },
  address_reference_email: { type: String },
  address_reference_number: { type: String },
  address_status: { type: String },
});

// Tenant incomes settings
export const Ten_SettingsIncomes = new Mongo.Collection('ten_SettingsIncomes');
Incomes.schema = new SimpleSchema({
  inc_id: { type: String },
  ten_id: { type: String },
  inc_type: { type: String },
  inc_amt: { type: Number },
  inc_supporting_doc: { type: String , optional: true },
  inc_public_id: { type: String , optional: true },
});

// Tenant settings documents
export const Ten_SettingsIdentities = new Mongo.Collection('ten_SettingsIdentities');
Identities.schema = new SimpleSchema({
  identity_id: { type: String },
  ten_id: { type: String },
  identity_type: { type: String },
  identity_public_id: { type: String , optional: true },
  identity_desc: { type: String, optional: true },
  identity_scan: { type: String, optional: true },
});

export const AgentAvailabilities = new Mongo.Collection('agentAvailabilities');
AgentAvailabilities.schema = new SimpleSchema({
  start: { type: String },
  end: { type: String },
  activity_type: { type: String },
  availability_type: { type: String },
  property: { type: Object, blackbox: true },
  price: { type: String, optional: true },
  bedrooms: { type: String, optional: true },
  bathrooms: { type: String, optional: true },
  parking: { type: String, optional: true },
  image: { type: String, optional: true },
  status: { type: String, optional: true },
  agent_id: { type: String },
  createdAt: { type: Date, optional: true },
  tenant: { type: Object, optional: true, blackbox: true },
  bookedAt: { type: Date, optional: true },
  notes: { type: String, optional: true },
  is_private: { type: Boolean, optional: true }
});

export const TenantBookings = new Mongo.Collection('tenantBookings');
TenantBookings.schema = new SimpleSchema({
  agentAvailabilityId: { type: String },
  tenantName: { type: String },
  tenantId: { type: String },
  start: { type: Date },
  end: { type: Date },
  property: { type: Object, blackbox: true },
  status: { type: String },
  createdAt: { type: Date, optional: true }
});

export const ExpressionOfInterest = new Mongo.Collection('expressionOfInterest');
ExpressionOfInterest.schema = new SimpleSchema({
  propertyID: { type: String },
  tenantID: { type: String },
  EOI: { type: String },
  inviteSent: { type: Boolean },
  inviteAccepted: { type: Boolean },
});

export const OpenHouseAttendance = new Mongo.Collection('openHouseAttendance');
OpenHouseAttendance.schema = new SimpleSchema({
  bookingID: { type: String },
  propertyAddress: { type: String },
  start: { type: String },
  end: { type: String },
  attendanceList: { type: Array },
    'attendanceList.$': { type: Object },
    'attendanceList.$.tenantID': { type: String },
    'attendanceList.$.tenantName': { type: String },
    'attendanceList.$.tenantAttendance': { type: Boolean },
    'attendanceList.$.notes': { type: String, optional: true } // Optional notes for the attendee (entered by agent)
});

export const StarredProperties = new Mongo.Collection('starredProperties');
StarredProperties.schema = new SimpleSchema({
  tent_id: { type: String }, // assuming only tenant gets to star properties
  prop_id: { type: String },
  starredAt: { type: Date, defaultValue: new Date() },
});


export const TicketActivities = new Mongo.Collection('ticketActivities');
TicketActivities.schema = new SimpleSchema({
  start: { type: String }, // stored as ISO string
  end: { type: String },
  ticket_id: { type: String }, // link back to parent ticket
  agent_id: { type: String },  // who created it
  title: { type: String },     // ticket title or short label
  notes: { type: String, optional: true },
  status: {
    type: String,
    allowedValues: ['pending', 'in-progress', 'completed'],
    defaultValue: 'pending'
  },
  createdAt: { type: Date, defaultValue: new Date() },
});

export const Messages = new Mongo.Collection('messages');
Messages.schema = new SimpleSchema({
  message_id: { type: String, optional: true },
  agent_id: { type: String },
  tenant_id: { type: String },
  sender_id: { type: String },  // who sent the message (could be agent or tenant)
  text: { type: String },
  createdAt: { type: Date, defaultValue: new Date() },
});