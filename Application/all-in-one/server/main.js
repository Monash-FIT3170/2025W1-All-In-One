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
  Landlords
} from '/imports/api/database/collections';
import { mockData } from '/imports/api/database/mockData';
import '/imports/api/methods/account.js';


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
  await Landlords.removeAsync({});

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
    await Landlords.insertAsync(landlord);
  }

  // Manual addition of extra data if not already present
  if (!await Properties.findOneAsync({ prop_id: 'P001' })) {
    await Properties.insertAsync({
      prop_id: 'P001',
      prop_address: '123 Main St, Melbourne VIC',
      prop_pricepweek: 450,
      prop_numbeds: 3,
      prop_numbaths: 2,
      prop_numcarspots: 1,
      prop_type: 'Apartment',
      prop_desc: 'Modern apartment in the city centre.',
      prop_available_date: new Date('2025-06-01'),
      prop_furnish: true,
      prop_pets: false,
      prop_bond: 1800,
    });
  }

  if (!await Properties.findOneAsync({ prop_id: 'P002' })) {
    await Properties.insertAsync({
      prop_id: 'P002',
      prop_address: '89 Beachside Ave, Sydney NSW',
      prop_pricepweek: 650,
      prop_numbeds: 4,
      prop_numbaths: 3,
      prop_numcarspots: 2,
      prop_type: 'House',
      prop_desc: 'Spacious beachfront home.',
      prop_available_date: new Date('2025-07-01'),
      prop_furnish: false,
      prop_pets: true,
      prop_bond: 2600,
    });
  }

  if (!await Tenants.findOneAsync({ ten_id: 'T001' })) {
    await Tenants.insertAsync({
      ten_id: 'T001',
      ten_fn: 'Alice',
      ten_ln: 'Smith',
      ten_email: 'alice@example.com',
      ten_pn: '0412345678',
      ten_password: 'hashedpassword',
      ten_pfp: '/images/alice.png',
      ten_add: '456 Suburb St, Victoria',
      ten_role: 'Tenant',
    });
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

  if (!await RentalApplications.findOneAsync({ rental_app_id: 'RA001' })) {
    await RentalApplications.insertAsync({
      rental_app_id: 'RA001',
      prop_id: 'P001',
      rental_app_prop_inspected: true,
      lease_start_date: new Date('2025-06-15'),
      lease_term: '12 months',
      app_rent: 450,
      app_desc: 'Looking forward to a long-term lease.',
      ten_id: 'T001',
      leaseholder_id: 'L001',
      employment_id: 'E001',
      household_pets: false,
      status: 'Pending',
    });
  }

  if (!await RentalApplications.findOneAsync({ rental_app_id: 'RA002' })) {
    await RentalApplications.insertAsync({
      rental_app_id: 'RA002',
      prop_id: 'P002',
      rental_app_prop_inspected: false,
      lease_start_date: new Date('2025-07-15'),
      lease_term: '6 months',
      app_rent: 650,
      app_desc: 'Relocating for work, interested in short-term lease.',
      ten_id: 'T002',
      leaseholder_id: 'L002',
      employment_id: 'E002',
      household_pets: true,
      status: 'Approved',
    });
  }

  if (!await Employment.findOneAsync({ employment_id: 'E001' })) {
    await Employment.insertAsync({
      employment_id: 'E001',
      ten_id: 'T001',
      emp_type: 'Full-Time',
      emp_status: 'Employed',
      emp_comp: 'TechCorp Ltd',
      emp_job_title: 'Software Developer',
      emp_start_date: new Date('2023-02-01'),
    });
  }

  if (!await Employment.findOneAsync({ employment_id: 'E002' })) {
    await Employment.insertAsync({
      employment_id: 'E002',
      ten_id: 'T002',
      emp_type: 'Part-Time',
      emp_status: 'Employed',
      emp_comp: 'Seaside Creative Agency',
      emp_job_title: 'Graphic Designer',
      emp_start_date: new Date('2023-08-15'),
    });
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
    return Landlords.find();
  });
});