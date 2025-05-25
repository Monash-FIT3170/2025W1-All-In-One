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
import '/imports/api/methods/account.js';
import '/imports/api/agent/rentalApplications/methods'


Meteor.startup(async () => { 

  // Insert mock data only if collections are empty
  if ((await Properties.find().countAsync()) === 0) {
    for (const property of mockData.properties) {
      await Properties.insertAsync(property);
    }
  }

  if ((await Photos.find().countAsync()) === 0) {
    for (const photo of mockData.photos) {
      await Photos.insertAsync(photo);
    }
  }

  if ((await Videos.find().countAsync()) === 0) {
    for (const video of mockData.videos) {
      await Videos.insertAsync(video);
    }
  }

  if ((await Tenants.find().countAsync()) === 0) {
    for (const tenant of mockData.tenants) {
      await Tenants.insertAsync(tenant);
    }
  }

  if ((await RentalApplications.find().countAsync()) === 0) {
    for (const application of mockData.rentalApplications) {
      await RentalApplications.insertAsync(application);
    }
  }

  if ((await Employment.find().countAsync()) === 0) {
    for (const employment of mockData.employment) {
      await Employment.insertAsync(employment);
    }
  }

  if ((await Addresses.find().countAsync()) === 0) {
    for (const address of mockData.addresses) {
      await Addresses.insertAsync(address);
    }
  }

  if ((await Incomes.find().countAsync()) === 0) {
    for (const income of mockData.incomes) {
      await Incomes.insertAsync(income);
    }
  }

  if ((await Identities.find().countAsync()) === 0) {
    for (const identity of mockData.identities) {
      await Identities.insertAsync(identity);
    }
  }

  if ((await Households.find().countAsync()) === 0) {
    for (const household of mockData.households) {
      await Households.insertAsync(household);
    }
  }

  if ((await Agents.find().countAsync()) === 0) {
    for (const agent of mockData.agents) {
      await Agents.insertAsync(agent);
    }
  }

  if ((await Landlord.find().countAsync()) === 0) {
    for (const landlord of mockData.landlords) {
      await Landlord.insertAsync(landlord);
    }
  }


  const agentEmail = 'agent1@example.com';
  const existingAgentUser = await Meteor.users.findOneAsync({ 'emails.address': agentEmail });

  if (!existingAgentUser) {
    const agentUserId = await Accounts.createUser({
      email: agentEmail,
      password: 'securepassword123',
      profile: {
        firstName: 'Amy',
        lastName: 'Jones',
        role: 'agent'
      }
    });

    await Agents.insertAsync({
      agent_id: agentUserId,
      agent_fname: 'Amy',
      agent_lname: 'Jones',
      agent_ph: '0400000000',
      agent_email: agentEmail,
    });

    console.log('✅ Agent created and added to Agents collection');
  }

  const landlordEmail = 'landlord1@example.com';
  const existingLandlordUser = await Meteor.users.findOneAsync({ 'emails.address': landlordEmail });

  if (!existingLandlordUser) {
    const landlordUserId = await Accounts.createUser({
      email: landlordEmail,
      password: 'securepassword123',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        role: 'landlord'
      }
    });

    await Landlords.insertAsync({
      ll_id: landlordUserId,
      ll_fn: 'John',
      ll_ln: 'Doe',
      ll_email: landlordEmail,
      ll_pn: '0499999999',
      ll_pfp: '',
      prop_id: 'P001',
    });

    console.log('✅ Landlord created and added to Landlords collection');
  }


  // Publications
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