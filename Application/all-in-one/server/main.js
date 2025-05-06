import { Meteor } from 'meteor/meteor';
import {
  Properties,
  Tenants,
  RentalApplications
} from '/imports/api/collections';
import { Employment } from '../imports/api/collections';
import '/imports/api/rentalApplications/methods';

Meteor.startup(async () => {
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

  if (!await Tenants.findOneAsync({ ten_id: 'T002' })) {
    await Tenants.insertAsync({
      ten_id: 'T002',
      ten_fn: 'Bob',
      ten_ln: 'Lee',
      ten_email: 'bob@example.com',
      ten_pn: '0412340000',
      ten_password: 'hashedpassword',
      ten_pfp: '/images/bob.png',
      ten_add: '789 Ocean Rd, NSW',
      ten_role: 'Tenant',
    });
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
  
  Meteor.publish('properties', function () {
    return Properties.find();
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
});
