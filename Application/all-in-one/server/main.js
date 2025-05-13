import { Meteor } from 'meteor/meteor';
import {
  Properties,
  Photos,
  Videos,
  Tenants,
  RentalApplications,
  Employment,
  Addresses,
  Incomes,
  Identities,
  Households,
  Agents,
  Landlord
} from '/imports/api/database/collections';
import { mockData } from '/imports/api/database/mockData';
import '/imports/api/agent/rentalApplications/methods';

Meteor.startup(async () => {
  // Clear existing data 
  // TODO: Remove this once we have a real database
  await Properties.removeAsync({});
  await Photos.removeAsync({});
  await Videos.removeAsync({});
  await Tenants.removeAsync({});
  await RentalApplications.removeAsync({});
  await Employment.removeAsync({});
  await Addresses.removeAsync({});
  await Incomes.removeAsync({});
  await Identities.removeAsync({});
  await Households.removeAsync({});
  await Agents.removeAsync({});
  await Landlord.removeAsync({});

  // Insert mock data - one item at a time
  for (const property of mockData.properties) {
    await Properties.insertAsync(property);
  }

  for (const photo of mockData.photos) {
    await Photos.insertAsync(photo);
  }

  for (const video of mockData.videos) {
    await Videos.insertAsync(video);
  }

  for (const tenant of mockData.tenants) {
    await Tenants.insertAsync(tenant);
  }

  for (const application of mockData.rentalApplications) {
    await RentalApplications.insertAsync(application);
  }

  for (const employment of mockData.employment) {
    await Employment.insertAsync(employment);
  }

  for (const address of mockData.addresses) {
    await Addresses.insertAsync(address);
  }

  for (const income of mockData.incomes) {
    await Incomes.insertAsync(income);
  }

  for (const identity of mockData.identities) {
    await Identities.insertAsync(identity);
  }

  for (const household of mockData.households) {
    await Households.insertAsync(household);
  }

  for (const agent of mockData.agents) {
    await Agents.insertAsync(agent);
  }

  for (const landlord of mockData.landlords) {
    await Landlord.insertAsync(landlord);
  }

  // Publish collections
  Meteor.publish('properties', function () {
    return Properties.find();
  });

  Meteor.publish('photos', function () {
    return Photos.find();
  });

  Meteor.publish('videos', function () {
    return Videos.find();
  });

  Meteor.publish('tenants', function () {
    return Tenants.find();
  });

  Meteor.publish('rentalApplications', function () {
    return RentalApplications.find();
  });

  Meteor.publish('employment', function () {
    return Employment.find();
  });

  Meteor.publish('addresses', function () {
    return Addresses.find();
  });

  Meteor.publish('incomes', function () {
    return Incomes.find();
  });

  Meteor.publish('identities', function () {
    return Identities.find();
  });

  Meteor.publish('households', function () {
    return Households.find();
  });

  Meteor.publish('agents', function () {
    return Agents.find();
  });

  Meteor.publish('landlords', function () {
    return Landlord.find();
  });
});
