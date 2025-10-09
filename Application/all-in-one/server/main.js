process.env.MAIL_URL = "smtps://allinone3170%40gmail.com:llqwcpiqphurfowj@smtp.gmail.com:465";

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
function maskMongoUrl(uri) {
  if (!uri) return '(not set)';
  try {
    // Only mask the password part in mongodb:// or mongodb+srv:// URIs
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:@]+):([^@]+)@(.+)$/);
    if (!match) return uri; // unexpected format, return as-is
    const [, prefix, user, _pw, rest] = match;
    return `${prefix}${user}:***@${rest}`;
  } catch (e) {
    return '(unable to parse MONGO_URL)';
  }
}

function logDbTarget() {
  const uri = process.env.MONGO_URL;
  console.log('🗄️  MONGO_URL =>', maskMongoUrl(uri));
  if (!uri) {
    console.warn('⚠️  MONGO_URL is not set. The app will use the default local Meteor Mongo.');
    return;
  }

  try {
    // Attempt to parse the URI to extract host and db name for clarity
    const url = new URL(uri);
    const dbName = (url.pathname || '/').replace('/', '') || '(default)';
    const host = url.host || '(unknown host)';
    console.log(`✅ Connected DB target => host: ${host}, db: ${dbName}`);
  } catch (e) {
    // Fallback: simple extraction for non-standard URIs (e.g., multi-host mongodb://host1,host2/...)
    try {
      const withoutProtocol = uri.replace(/^mongodb(?:\+srv)?:\/\//, '');
      const [hostsPart, pathAndQuery] = withoutProtocol.split('@').pop().split('/');
      const hosts = hostsPart.split('?')[0];
      const dbName = (pathAndQuery || '').split('?')[0] || '(default)';
      console.log(`✅ Connected DB target => host(s): ${hosts}, db: ${dbName}`);
    } catch (_e) {
      console.log('ℹ️  Unable to parse MONGO_URL for display.');
    }
  }
}

// Log the resolved database target at server startup
logDbTarget();
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
  Landlord,
  Ten_SettingsAddresses,
  Ten_SettingsEmployment,
  Ten_SettingsIdentities,
  Ten_SettingsIncomes,
  Tickets,
  OpenHouseAttendance,
  ExpressionOfInterest,
  StarredProperties,
} from "/imports/api/database/collections";
import { mockData } from "/imports/api/database/mockData";
import "/imports/api/methods/account.js";
import '/imports/api/methods/starredProp.js';
import "/imports/api/methods/rentalApplications.js";
import "/imports/api/agent/rentalApplications/methods";
import { LinksCollection } from "/imports/api/links";
import '/imports/api/agent/agentAvailabilities/methods';
import '/imports/api/agent/agentAvailabilities/publications';
import '/imports/api/tenant/tenantBookings/methods';
import '/imports/api/tenant/tenantBookings/publications';
import '/imports/api/agent/tenantBookings/publications';
import '/imports/api/agent/openHouseAttendance/methods';
import '/imports/api/agent/openHouseAttendance/publication';
import '/imports/api/agent/expressionOfInterest/methods';
import '/imports/api/agent/expressionOfInterest/publication';
import '/imports/api/tenant/tickets/ticketsMethods';
import '/imports/api/tenant/tickets/ticketsPublications'
import '/imports/api/methods/eoi.js';
import '/imports/api/agent/ticketActivities/methods.js';
import '/imports/api/agent/ticketActivities/publications.js';

import '/imports/api/methods/properties.js';
import '/imports/api/methods/profileSettings.js';

import 'dotenv/config';

Meteor.startup(async () => {
  const shouldSeedMockData = process.env.SEED_MOCK_DATA === 'true';
  if (shouldSeedMockData) {
    console.log('🌱 SEED_MOCK_DATA=true → Seeding mock data where collections are empty');
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

    const agentEmail = "agent1@example.com";
    const existingAgentUser = await Meteor.users.findOneAsync({
      "emails.address": agentEmail,
    });

    if (!existingAgentUser) {
      const agentUserId = await Accounts.createUser({
        email: agentEmail,
        password: "securepassword123",
        profile: {
          firstName: "Amy",
          lastName: "Jones",
          role: "agent",
        },
      });

      await Agents.insertAsync({
        agent_id: agentUserId,
        agent_fname: "Amy",
        agent_lname: "Jones",
        agent_ph: "0400000000",
        agent_email: agentEmail,
      });

      console.log("✅ Agent created and added to Agents collection");
    }

    const landlordEmail = "landlord1@example.com";
    const existingLandlordUser = await Meteor.users.findOneAsync({
      "emails.address": landlordEmail,
    });

    if (!existingLandlordUser) {
      const landlordUserId = await Accounts.createUser({
        email: landlordEmail,
        password: "securepassword123",
        profile: {
          firstName: "John",
          lastName: "Doe",
          role: "landlord",
        },
      });

      await Landlord.insertAsync({
        ll_id: landlordUserId,
        ll_fn: "John",
        ll_ln: "Doe",
        ll_email: landlordEmail,
        ll_pn: "0499999999",
        ll_pfp: "",
        prop_id: "P001",
      });

      console.log("✅ Landlord created and added to Landlords collection");
    }
  } else {
    console.log('🌱 SEED_MOCK_DATA!=true → Skipping mock data seeding');
  }

  async function insertLink({ title, url }) {
    await LinksCollection.insertAsync({ title, url, createdAt: new Date() });
  }

  // Publications
  Meteor.publish("properties", function () {
    return Properties.find();
  });

  Meteor.publish("photos", function () {
    return Photos.find();
  });

  Meteor.publish("videos", function () {
    return Videos.find();
  });

  Meteor.publish("tenants", function () {
    return Tenants.find();
  });

  Meteor.publish("rentalApplications", function () {
    return RentalApplications.find();
  });

  Meteor.publish("employment", function () {
    return Employment.find();
  });

  Meteor.publish("addresses", function () {
    return Addresses.find();
  });

  Meteor.publish("incomes", function () {
    return Incomes.find();
  });

  Meteor.publish("identities", function () {
    return Identities.find();
  });

  Meteor.publish("households", function () {
    return Households.find();
  });

  Meteor.publish("agents", function () {
    return Agents.find();
  });

  Meteor.publish("landlords", function () {
    return Landlord.find();
  });

  Meteor.publish('tenSettingsAddresses', function () {
    return Ten_SettingsAddresses.find();
  });

  Meteor.publish('tenSettingsEmployment', function () {
    return Ten_SettingsEmployment.find();
  });

  Meteor.publish('tenSettingsIdentities', function () {
    return Ten_SettingsIdentities.find();
  });

  Meteor.publish('tenSettingsIncomes', function () {
  if (!this.userId) return this.ready();
  return Ten_SettingsIncomes.find({ ten_id: this.userId });
});


  Meteor.publish('starredProperties', async function () {
  if (!this.userId) return this.ready();
  const tenant = await Tenants.findOneAsync({ ten_id: this.userId });
  if (!tenant) return this.ready();
  
  return StarredProperties.find({ ten_id: tenant.ten_id });
});

  Meteor.publish('tickets', function () {
    return Tickets.find();
  })
});

Meteor.publish("userById", function (userId) {
  check(userId, String); // Validate input

  // Only publish safe fields (never publish `services`)
  return Meteor.users.find(
    { _id: userId },
    { fields: { username: 1, emails: 1, profile: 1 } }
  );
});

