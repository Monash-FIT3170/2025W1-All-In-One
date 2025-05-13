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
  employment_id: { type: String },
  status: { type: String, optional: true },
  household_pets: { type: Boolean },
  emergency_contact_id: { type: String },
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

export const Incomes = new Mongo.Collection('incomes');
Incomes.schema = new SimpleSchema({
  inc_id: { type: String },
  rental_app_id: { type: String },
  inc_type: { type: String },
  inc_amt: { type: Number },
  inc_supporting_doc: { type: String },
});

export const Identities = new Mongo.Collection('identities');
Identities.schema = new SimpleSchema({
  identity_id: { type: String },
  rental_app_id: { type: String },
  identity_type: { type: String },
  identity_scan: { type: String },
});

export const Households = new Mongo.Collection('households');
Households.schema = new SimpleSchema({
  occupant_id: { type: String },
  rental_app_id: { type: String },
  occupant_name: { type: String },
  occupant_age: { type: Number },
});

export const Agents = new Mongo.Collection('agents');
Agents.schema = new SimpleSchema({
  agent_id: { type: String },
  agent_fname: { type: String },
  agent_lname: { type: String },
  agent_ph: { type: String },
  agent_email: { type: String },
  agent_password: { type: String },
});