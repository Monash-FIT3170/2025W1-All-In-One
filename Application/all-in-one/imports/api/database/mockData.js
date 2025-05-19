// TODO: Remove this once we have a real database

export const mockData = {
  properties: [
    {
      prop_id: 'P001',
      prop_address: '123 Main St, Melbourne VIC 3000',
      prop_pricepweek: 450,
      prop_numbeds: 3,
      prop_numbaths: 2,
      prop_numcarspots: 1,
      prop_type: 'Apartment',
      prop_desc: 'Modern apartment in the city centre with stunning views.',
      prop_available_date: new Date('2025-06-01'),
      prop_furnish: true,
      prop_pets: false,
      prop_bond: 1800,
      prop_status: 'Available',
      agent_id: 'A001',
      landlord_id: 'L001'
    },
    {
      prop_id: 'P002',
      prop_address: '89 Beachside Ave, Sydney NSW 2000',
      prop_pricepweek: 650,
      prop_numbeds: 4,
      prop_numbaths: 3,
      prop_numcarspots: 2,
      prop_type: 'House',
      prop_desc: 'Spacious beachfront home with ocean views.',
      prop_available_date: new Date('2025-07-01'),
      prop_furnish: false,
      prop_pets: true,
      prop_bond: 2600,
      prop_status: 'Available',
      agent_id: 'A002',
      landlord_id: 'L002'
    },
    {
      prop_id: 'P003',
      prop_address: '45 Park Lane, Brisbane QLD 4000',
      prop_pricepweek: 380,
      prop_numbeds: 2,
      prop_numbaths: 1,
      prop_numcarspots: 1,
      prop_type: 'Townhouse',
      prop_desc: 'Cozy townhouse near the park.',
      prop_available_date: new Date('2025-05-15'),
      prop_furnish: true,
      prop_pets: true,
      prop_bond: 1520,
      prop_status: 'Available',
      agent_id: 'A001',
      landlord_id: 'L003'
    }
  ],

  photos: [
    {
      prop_id: 'P001',
      photo_id: 'PH001',
      photo_url: '/images/properties/P001/main.jpg',
      photo_order: 1
    },
    {
      prop_id: 'P001',
      photo_id: 'PH002',
      photo_url: '/images/properties/P001/living.jpg',
      photo_order: 2
    },
    {
      prop_id: 'P002',
      photo_id: 'PH003',
      photo_url: '/images/properties/P002/main.jpg',
      photo_order: 1
    }
  ],

  videos: [
    {
      prop_id: 'P001',
      video_id: 'V001',
      video_url: '/videos/properties/P001/tour.mp4'
    },
    {
      prop_id: 'P002',
      video_id: 'V002',
      video_url: '/videos/properties/P002/tour.mp4'
    }
  ],

  tenants: [
    {
      ten_id: 'T001',
      ten_fn: 'Alice',
      ten_ln: 'Smith',
      ten_email: 'alice.smith@example.com',
      ten_pn: '0412345678',
      ten_pfp: '/images/tenants/alice.jpg',
      ten_role: 'Tenant',
      ten_dob: new Date('1990-05-15'),
      prop_id: 'P001'
    },
    {
      ten_id: 'T002',
      ten_fn: 'Bob',
      ten_ln: 'Lee',
      ten_email: 'bob.lee@example.com',
      ten_pn: '0412340000',
      ten_pfp: '/images/tenants/bob.jpg',
      ten_role: 'Tenant',
      ten_dob: new Date('1988-11-23'),
      prop_id: 'P002'
    },
    {
      ten_id: 'T003',
      ten_fn: 'Emma',
      ten_ln: 'Wilson',
      ten_email: 'emma.wilson@example.com',
      ten_pn: '0423456789',
      ten_pfp: '/images/tenants/emma.jpg',
      ten_role: 'Tenant',
      ten_dob: new Date('1995-03-10'),
      prop_id: 'P003'
    }
  ],

  landlords: [
    {
      ll_id: 'L001',
      ll_fn: 'John',
      ll_ln: 'Doe',
      ll_email: 'john.doe@example.com',
      ll_pn: '0400000001',
      ll_password: 'hashedpassword1',
      ll_pfp: '/images/landlords/john.jpg',
      prop_id: 'P001'
    },
    {
      ll_id: 'L002',
      ll_fn: 'Sarah',
      ll_ln: 'Johnson',
      ll_email: 'sarah.j@example.com',
      ll_pn: '0400000002',
      ll_password: 'hashedpassword2',
      ll_pfp: '/images/landlords/sarah.jpg',
      prop_id: 'P002'
    },
    {
      ll_id: 'L003',
      ll_fn: 'Michael',
      ll_ln: 'Brown',
      ll_email: 'michael.b@example.com',
      ll_pn: '0400000003',
      ll_password: 'hashedpassword3',
      ll_pfp: '/images/landlords/michael.jpg',
      prop_id: 'P003'
    }
  ],

  agents: [
    {
      agent_id: 'A001',
      agent_fname: 'David',
      agent_lname: 'Wilson',
      agent_ph: '0400000004',
      agent_email: 'david.w@example.com',
      agent_password: 'hashedpassword4'
    },
    {
      agent_id: 'A002',
      agent_fname: 'Lisa',
      agent_lname: 'Chen',
      agent_ph: '0400000005',
      agent_email: 'lisa.c@example.com',
      agent_password: 'hashedpassword5'
    }
  ],

  rentalApplications: [
    {
      rental_app_id: 'RA001',
      prop_id: 'P001',
      rental_app_prop_inspected: true,
      lease_start_date: new Date('2025-06-15'),
      lease_term: '12 months',
      app_rent: 450,
      app_desc: 'Looking forward to a long-term lease.',
      ten_id: 'T001',
      employment_id: 'E001',
      status: 'Pending',
      household_pets: false,
      emergency_contact_id: 'EC001'
    },
    {
      rental_app_id: 'RA002',
      prop_id: 'P002',
      rental_app_prop_inspected: false,
      lease_start_date: new Date('2025-07-15'),
      lease_term: '6 months',
      app_rent: 650,
      app_desc: 'Relocating for work, interested in short-term lease.',
      ten_id: 'T002',
      employment_id: 'E002',
      status: 'Approved',
      household_pets: true,
      emergency_contact_id: 'EC002'
    }
  ],

  employment: [
    {
      employment_id: 'E001',
      ten_id: 'T001',
      emp_type: 'Full-Time',
      emp_comp: 'TechCorp Ltd',
      emp_job_title: 'Software Developer',
      emp_start_date: new Date('2023-02-01'),
      emp_verification: 'verified'
    },
    {
      employment_id: 'E002',
      ten_id: 'T002',
      emp_type: 'Part-Time',
      emp_comp: 'Seaside Creative Agency',
      emp_job_title: 'Graphic Designer',
      emp_start_date: new Date('2023-08-15'),
      emp_verification: 'verified'
    },
    {
      employment_id: 'E003',
      ten_id: 'T003',
      emp_type: 'Full-Time',
      emp_comp: 'Healthcare Solutions',
      emp_job_title: 'Nurse',
      emp_start_date: new Date('2022-05-10'),
      emp_verification: 'pending'
    }
  ],

  addresses: [
    {
      address_id: 'AD001',
      rental_app_id: 'RA001',
      address_address: '789 Previous St, Melbourne VIC 3000',
      address_movein: new Date('2020-01-01'),
      address_moveout: new Date('2025-05-31'),
      address_ownership: 'Rented',
      address_reference_type: 'Previous Landlord',
      address_reference_name: 'Previous Landlord Name',
      address_reference_email: 'prev.landlord@example.com',
      address_reference_number: '0400000006',
      address_status: 'Verified'
    },
    {
      address_id: 'AD002',
      rental_app_id: 'RA002',
      address_address: '456 Old Ave, Sydney NSW 2000',
      address_movein: new Date('2019-06-01'),
      address_moveout: new Date('2025-06-30'),
      address_ownership: 'Rented',
      address_reference_type: 'Previous Landlord',
      address_reference_name: 'Old Landlord Name',
      address_reference_email: 'old.landlord@example.com',
      address_reference_number: '0400000007',
      address_status: 'Verified'
    }
  ],

  incomes: [
    {
      inc_id: 'INC001',
      rental_app_id: 'RA001',
      inc_type: 'Salary',
      inc_amt: 85000,
      inc_supporting_doc: '/documents/income/T001/salary.pdf'
    },
    {
      inc_id: 'INC002',
      rental_app_id: 'RA002',
      inc_type: 'Freelance',
      inc_amt: 65000,
      inc_supporting_doc: '/documents/income/T002/freelance.pdf'
    }
  ],

  identities: [
    {
      identity_id: 'ID001',
      rental_app_id: 'RA001',
      identity_type: 'Passport',
      identity_scan: '/documents/identity/T001/passport.pdf'
    },
    {
      identity_id: 'ID002',
      rental_app_id: 'RA002',
      identity_type: 'Driver License',
      identity_scan: '/documents/identity/T002/license.pdf'
    }
  ],

  households: [
    {
      occupant_id: 'H001',
      rental_app_id: 'RA001',
      occupant_name: 'Alice Smith',
      occupant_age: 33
    },
    {
      occupant_id: 'H002',
      rental_app_id: 'RA001',
      occupant_name: 'Partner Name',
      occupant_age: 31
    },
    {
      occupant_id: 'H003',
      rental_app_id: 'RA002',
      occupant_name: 'Bob Lee',
      occupant_age: 35
    }
  ]
}; 