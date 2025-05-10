Package["core-runtime"].queue("null",function () {/* Imports for global scope */

MongoInternals = Package.mongo.MongoInternals;
Mongo = Package.mongo.Mongo;
ReactiveVar = Package['reactive-var'].ReactiveVar;
ECMAScript = Package.ecmascript.ECMAScript;
Meteor = Package.meteor.Meteor;
global = Package.meteor.global;
meteorEnv = Package.meteor.meteorEnv;
EmitterPromise = Package.meteor.EmitterPromise;
WebApp = Package.webapp.WebApp;
WebAppInternals = Package.webapp.WebAppInternals;
main = Package.webapp.main;
DDP = Package['ddp-client'].DDP;
DDPServer = Package['ddp-server'].DDPServer;
LaunchScreen = Package['launch-screen'].LaunchScreen;
meteorInstall = Package.modules.meteorInstall;
Promise = Package.promise.Promise;
Autoupdate = Package.autoupdate.Autoupdate;

var require = meteorInstall({"imports":{"api":{"collections.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// imports/api/collections.js                                                             //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      Properties: () => Properties,
      Photos: () => Photos,
      Videos: () => Videos,
      RentalApplications: () => RentalApplications,
      Tenants: () => Tenants,
      Leaseholders: () => Leaseholders,
      Employment: () => Employment,
      Addresses: () => Addresses,
      Incomes: () => Incomes,
      Identities: () => Identities,
      Households: () => Households,
      Agents: () => Agents
    });
    let Mongo;
    module.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 0);
    let SimpleSchema;
    module.link("simpl-schema", {
      default(v) {
        SimpleSchema = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const Properties = new Mongo.Collection('properties');
    Properties.schema = new SimpleSchema({
      prop_id: {
        type: String
      },
      prop_address: {
        type: String
      },
      prop_pricepweek: {
        type: Number
      },
      prop_numbeds: {
        type: Number
      },
      prop_numbaths: {
        type: Number
      },
      prop_numcarspots: {
        type: Number
      },
      prop_type: {
        type: String
      },
      prop_desc: {
        type: String
      },
      prop_available_date: {
        type: Date
      },
      prop_furnish: {
        type: Boolean
      },
      prop_pets: {
        type: Boolean
      },
      prop_bond: {
        type: Number
      }
    });
    const Photos = new Mongo.Collection('photos');
    Photos.schema = new SimpleSchema({
      prop_id: {
        type: String
      },
      photo_id: {
        type: String
      },
      photo_url: {
        type: String
      },
      photo_order: {
        type: Number
      }
    });
    const Videos = new Mongo.Collection('videos');
    Videos.schema = new SimpleSchema({
      prop_id: {
        type: String
      },
      video_id: {
        type: String
      },
      video_url: {
        type: String
      }
    });
    const RentalApplications = new Mongo.Collection('rental_applications');
    RentalApplications.schema = new SimpleSchema({
      rental_app_id: {
        type: String
      },
      prop_id: {
        type: String
      },
      rental_app_prop_inspected: {
        type: Boolean
      },
      lease_start_date: {
        type: Date
      },
      lease_term: {
        type: String
      },
      app_rent: {
        type: Number
      },
      app_desc: {
        type: String
      },
      ten_id: {
        type: String
      },
      leaseholder_id: {
        type: String
      },
      employment_id: {
        type: String
      },
      status: {
        type: String,
        optional: true
      },
      household_pets: {
        type: Boolean
      }
    });
    const Tenants = new Mongo.Collection('tenants');
    Tenants.schema = new SimpleSchema({
      ten_id: {
        type: String
      },
      ten_fn: {
        type: String
      },
      ten_ln: {
        type: String
      },
      ten_email: {
        type: String
      },
      ten_pn: {
        type: String
      },
      ten_password: {
        type: String
      },
      ten_pfp: {
        type: String
      },
      ten_add: {
        type: String
      },
      ten_role: {
        type: String
      }
    });
    const Leaseholders = new Mongo.Collection('leaseholders');
    Leaseholders.schema = new SimpleSchema({
      leaseholder_id: {
        type: String
      },
      leaseholder_name: {
        type: String
      },
      leaseholder_email: {
        type: String
      }
    });
    const Employment = new Mongo.Collection('employment');
    Employment.schema = new SimpleSchema({
      employment_id: {
        type: String
      },
      ten_id: {
        type: String
      },
      emp_type: {
        type: String
      },
      emp_status: {
        type: String
      },
      emp_comp: {
        type: String
      },
      emp_job_title: {
        type: String
      },
      emp_start_date: {
        type: Date
      }
    });
    const Addresses = new Mongo.Collection('addresses');
    Addresses.schema = new SimpleSchema({
      address_id: {
        type: String
      },
      rental_app_id: {
        type: String
      },
      address_address: {
        type: String
      },
      address_movein: {
        type: Date
      },
      address_moveout: {
        type: Date
      },
      address_ownership: {
        type: String
      },
      address_reference_type: {
        type: String
      },
      address_reference_name: {
        type: String
      },
      address_reference_email: {
        type: String
      },
      address_reference_number: {
        type: String
      },
      address_status: {
        type: String
      }
    });
    const Incomes = new Mongo.Collection('incomes');
    Incomes.schema = new SimpleSchema({
      inc_id: {
        type: String
      },
      rental_app_id: {
        type: String
      },
      inc_type: {
        type: String
      },
      inc_amt: {
        type: Number
      }
    });
    const Identities = new Mongo.Collection('identities');
    Identities.schema = new SimpleSchema({
      identity_id: {
        type: String
      },
      rental_app_id: {
        type: String
      },
      identity_type: {
        type: String
      },
      identity_scan: {
        type: String
      }
    });
    const Households = new Mongo.Collection('households');
    Households.schema = new SimpleSchema({
      occupant_id: {
        type: String
      },
      rental_app_id: {
        type: String
      },
      occupant_name: {
        type: String
      },
      occupant_age: {
        type: Number
      }
    });
    const Agents = new Mongo.Collection('agents');
    Agents.schema = new SimpleSchema({
      agent_id: {
        type: String
      },
      agent_fname: {
        type: String
      },
      agent_lname: {
        type: String
      },
      agent_ph: {
        type: String
      },
      agent_email: {
        type: String
      },
      agent_password: {
        type: String
      }
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
////////////////////////////////////////////////////////////////////////////////////////////

}}},"server":{"main.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// server/main.js                                                                         //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    let Properties, Tenants, RentalApplications;
    module.link("/imports/api/collections", {
      Properties(v) {
        Properties = v;
      },
      Tenants(v) {
        Tenants = v;
      },
      RentalApplications(v) {
        RentalApplications = v;
      }
    }, 1);
    let Employment;
    module.link("../imports/api/collections", {
      Employment(v) {
        Employment = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    Meteor.startup(async () => {
      if (!(await Properties.findOneAsync({
        prop_id: 'P001'
      }))) {
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
          prop_bond: 1800
        });
      }
      if (!(await Properties.findOneAsync({
        prop_id: 'P002'
      }))) {
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
          prop_bond: 2600
        });
      }
      if (!(await Tenants.findOneAsync({
        ten_id: 'T001'
      }))) {
        await Tenants.insertAsync({
          ten_id: 'T001',
          ten_fn: 'Alice',
          ten_ln: 'Smith',
          ten_email: 'alice@example.com',
          ten_pn: '0412345678',
          ten_password: 'hashedpassword',
          ten_pfp: '/images/alice.png',
          ten_add: '456 Suburb St, Victoria',
          ten_role: 'Tenant'
        });
      }
      if (!(await Tenants.findOneAsync({
        ten_id: 'T002'
      }))) {
        await Tenants.insertAsync({
          ten_id: 'T002',
          ten_fn: 'Bob',
          ten_ln: 'Lee',
          ten_email: 'bob@example.com',
          ten_pn: '0412340000',
          ten_password: 'hashedpassword',
          ten_pfp: '/images/bob.png',
          ten_add: '789 Ocean Rd, NSW',
          ten_role: 'Tenant'
        });
      }
      if (!(await RentalApplications.findOneAsync({
        rental_app_id: 'RA001'
      }))) {
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
          status: 'Pending'
        });
      }
      if (!(await RentalApplications.findOneAsync({
        rental_app_id: 'RA002'
      }))) {
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
          status: 'Approved'
        });
      }
      if (!(await Employment.findOneAsync({
        employment_id: 'E001'
      }))) {
        await Employment.insertAsync({
          employment_id: 'E001',
          ten_id: 'T001',
          emp_type: 'Full-Time',
          emp_status: 'Employed',
          emp_comp: 'TechCorp Ltd',
          emp_job_title: 'Software Developer',
          emp_start_date: new Date('2023-02-01')
        });
      }
      if (!(await Employment.findOneAsync({
        employment_id: 'E002'
      }))) {
        await Employment.insertAsync({
          employment_id: 'E002',
          ten_id: 'T002',
          emp_type: 'Part-Time',
          emp_status: 'Employed',
          emp_comp: 'Seaside Creative Agency',
          emp_job_title: 'Graphic Designer',
          emp_start_date: new Date('2023-08-15')
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
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".ts",
    ".mjs",
    ".jsx"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/server/main.js"
  ]
}});

//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvY29sbGVjdGlvbnMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9tYWluLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsIlByb3BlcnRpZXMiLCJQaG90b3MiLCJWaWRlb3MiLCJSZW50YWxBcHBsaWNhdGlvbnMiLCJUZW5hbnRzIiwiTGVhc2Vob2xkZXJzIiwiRW1wbG95bWVudCIsIkFkZHJlc3NlcyIsIkluY29tZXMiLCJJZGVudGl0aWVzIiwiSG91c2Vob2xkcyIsIkFnZW50cyIsIk1vbmdvIiwibGluayIsInYiLCJTaW1wbGVTY2hlbWEiLCJkZWZhdWx0IiwiX19yZWlmeVdhaXRGb3JEZXBzX18iLCJDb2xsZWN0aW9uIiwic2NoZW1hIiwicHJvcF9pZCIsInR5cGUiLCJTdHJpbmciLCJwcm9wX2FkZHJlc3MiLCJwcm9wX3ByaWNlcHdlZWsiLCJOdW1iZXIiLCJwcm9wX251bWJlZHMiLCJwcm9wX251bWJhdGhzIiwicHJvcF9udW1jYXJzcG90cyIsInByb3BfdHlwZSIsInByb3BfZGVzYyIsInByb3BfYXZhaWxhYmxlX2RhdGUiLCJEYXRlIiwicHJvcF9mdXJuaXNoIiwiQm9vbGVhbiIsInByb3BfcGV0cyIsInByb3BfYm9uZCIsInBob3RvX2lkIiwicGhvdG9fdXJsIiwicGhvdG9fb3JkZXIiLCJ2aWRlb19pZCIsInZpZGVvX3VybCIsInJlbnRhbF9hcHBfaWQiLCJyZW50YWxfYXBwX3Byb3BfaW5zcGVjdGVkIiwibGVhc2Vfc3RhcnRfZGF0ZSIsImxlYXNlX3Rlcm0iLCJhcHBfcmVudCIsImFwcF9kZXNjIiwidGVuX2lkIiwibGVhc2Vob2xkZXJfaWQiLCJlbXBsb3ltZW50X2lkIiwic3RhdHVzIiwib3B0aW9uYWwiLCJob3VzZWhvbGRfcGV0cyIsInRlbl9mbiIsInRlbl9sbiIsInRlbl9lbWFpbCIsInRlbl9wbiIsInRlbl9wYXNzd29yZCIsInRlbl9wZnAiLCJ0ZW5fYWRkIiwidGVuX3JvbGUiLCJsZWFzZWhvbGRlcl9uYW1lIiwibGVhc2Vob2xkZXJfZW1haWwiLCJlbXBfdHlwZSIsImVtcF9zdGF0dXMiLCJlbXBfY29tcCIsImVtcF9qb2JfdGl0bGUiLCJlbXBfc3RhcnRfZGF0ZSIsImFkZHJlc3NfaWQiLCJhZGRyZXNzX2FkZHJlc3MiLCJhZGRyZXNzX21vdmVpbiIsImFkZHJlc3NfbW92ZW91dCIsImFkZHJlc3Nfb3duZXJzaGlwIiwiYWRkcmVzc19yZWZlcmVuY2VfdHlwZSIsImFkZHJlc3NfcmVmZXJlbmNlX25hbWUiLCJhZGRyZXNzX3JlZmVyZW5jZV9lbWFpbCIsImFkZHJlc3NfcmVmZXJlbmNlX251bWJlciIsImFkZHJlc3Nfc3RhdHVzIiwiaW5jX2lkIiwiaW5jX3R5cGUiLCJpbmNfYW10IiwiaWRlbnRpdHlfaWQiLCJpZGVudGl0eV90eXBlIiwiaWRlbnRpdHlfc2NhbiIsIm9jY3VwYW50X2lkIiwib2NjdXBhbnRfbmFtZSIsIm9jY3VwYW50X2FnZSIsImFnZW50X2lkIiwiYWdlbnRfZm5hbWUiLCJhZ2VudF9sbmFtZSIsImFnZW50X3BoIiwiYWdlbnRfZW1haWwiLCJhZ2VudF9wYXNzd29yZCIsIl9fcmVpZnlfYXN5bmNfcmVzdWx0X18iLCJfcmVpZnlFcnJvciIsInNlbGYiLCJhc3luYyIsIk1ldGVvciIsInN0YXJ0dXAiLCJmaW5kT25lQXN5bmMiLCJpbnNlcnRBc3luYyIsInB1Ymxpc2giLCJmaW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUFBLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDO01BQUNDLFVBQVUsRUFBQ0EsQ0FBQSxLQUFJQSxVQUFVO01BQUNDLE1BQU0sRUFBQ0EsQ0FBQSxLQUFJQSxNQUFNO01BQUNDLE1BQU0sRUFBQ0EsQ0FBQSxLQUFJQSxNQUFNO01BQUNDLGtCQUFrQixFQUFDQSxDQUFBLEtBQUlBLGtCQUFrQjtNQUFDQyxPQUFPLEVBQUNBLENBQUEsS0FBSUEsT0FBTztNQUFDQyxZQUFZLEVBQUNB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b3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XHJcbmltcG9ydCBTaW1wbGVTY2hlbWEgZnJvbSAnc2ltcGwtc2NoZW1hJztcclxuXHJcbmV4cG9ydCBjb25zdCBQcm9wZXJ0aWVzID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ3Byb3BlcnRpZXMnKTtcclxuUHJvcGVydGllcy5zY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcclxuICBwcm9wX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIHByb3BfYWRkcmVzczogeyB0eXBlOiBTdHJpbmcgfSxcclxuICBwcm9wX3ByaWNlcHdlZWs6IHsgdHlwZTogTnVtYmVyIH0sXHJcbiAgcHJvcF9udW1iZWRzOiB7IHR5cGU6IE51bWJlciB9LFxyXG4gIHByb3BfbnVtYmF0aHM6IHsgdHlwZTogTnVtYmVyIH0sXHJcbiAgcHJvcF9udW1jYXJzcG90czogeyB0eXBlOiBOdW1iZXIgfSxcclxuICBwcm9wX3R5cGU6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgcHJvcF9kZXNjOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIHByb3BfYXZhaWxhYmxlX2RhdGU6IHsgdHlwZTogRGF0ZSB9LFxyXG4gIHByb3BfZnVybmlzaDogeyB0eXBlOiBCb29sZWFuIH0sXHJcbiAgcHJvcF9wZXRzOiB7IHR5cGU6IEJvb2xlYW4gfSxcclxuICBwcm9wX2JvbmQ6IHsgdHlwZTogTnVtYmVyIH0sXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBob3RvcyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdwaG90b3MnKTtcclxuUGhvdG9zLnNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gIHByb3BfaWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgcGhvdG9faWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgcGhvdG9fdXJsOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIHBob3RvX29yZGVyOiB7IHR5cGU6IE51bWJlciB9LFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBWaWRlb3MgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbigndmlkZW9zJyk7XHJcblZpZGVvcy5zY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcclxuICBwcm9wX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIHZpZGVvX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIHZpZGVvX3VybDogeyB0eXBlOiBTdHJpbmcgfSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgUmVudGFsQXBwbGljYXRpb25zID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ3JlbnRhbF9hcHBsaWNhdGlvbnMnKTtcclxuUmVudGFsQXBwbGljYXRpb25zLnNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gIHJlbnRhbF9hcHBfaWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgcHJvcF9pZDogeyB0eXBlOiBTdHJpbmcgfSxcclxuICByZW50YWxfYXBwX3Byb3BfaW5zcGVjdGVkOiB7IHR5cGU6IEJvb2xlYW4gfSxcclxuICBsZWFzZV9zdGFydF9kYXRlOiB7IHR5cGU6IERhdGUgfSxcclxuICBsZWFzZV90ZXJtOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIGFwcF9yZW50OiB7IHR5cGU6IE51bWJlciB9LFxyXG4gIGFwcF9kZXNjOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIHRlbl9pZDogeyB0eXBlOiBTdHJpbmcgfSxcclxuICBsZWFzZWhvbGRlcl9pZDogeyB0eXBlOiBTdHJpbmcgfSxcclxuICBlbXBsb3ltZW50X2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIHN0YXR1czogeyB0eXBlOiBTdHJpbmcsIG9wdGlvbmFsOiB0cnVlIH0sXHJcbiAgaG91c2Vob2xkX3BldHM6IHsgdHlwZTogQm9vbGVhbiB9LFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBUZW5hbnRzID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ3RlbmFudHMnKTtcclxuVGVuYW50cy5zY2hlbWEgPSBuZXcgU2ltcGxlU2NoZW1hKHtcclxuICB0ZW5faWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgdGVuX2ZuOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIHRlbl9sbjogeyB0eXBlOiBTdHJpbmcgfSxcclxuICB0ZW5fZW1haWw6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgdGVuX3BuOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIHRlbl9wYXNzd29yZDogeyB0eXBlOiBTdHJpbmcgfSxcclxuICB0ZW5fcGZwOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIHRlbl9hZGQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgdGVuX3JvbGU6IHsgdHlwZTogU3RyaW5nIH0sXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IExlYXNlaG9sZGVycyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdsZWFzZWhvbGRlcnMnKTtcclxuTGVhc2Vob2xkZXJzLnNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gIGxlYXNlaG9sZGVyX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIGxlYXNlaG9sZGVyX25hbWU6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgbGVhc2Vob2xkZXJfZW1haWw6IHsgdHlwZTogU3RyaW5nIH0sXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEVtcGxveW1lbnQgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbignZW1wbG95bWVudCcpO1xyXG5FbXBsb3ltZW50LnNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gIGVtcGxveW1lbnRfaWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgdGVuX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIGVtcF90eXBlOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIGVtcF9zdGF0dXM6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgZW1wX2NvbXA6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgZW1wX2pvYl90aXRsZTogeyB0eXBlOiBTdHJpbmcgfSxcclxuICBlbXBfc3RhcnRfZGF0ZTogeyB0eXBlOiBEYXRlIH0sXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEFkZHJlc3NlcyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdhZGRyZXNzZXMnKTtcclxuQWRkcmVzc2VzLnNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gIGFkZHJlc3NfaWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgcmVudGFsX2FwcF9pZDogeyB0eXBlOiBTdHJpbmcgfSxcclxuICBhZGRyZXNzX2FkZHJlc3M6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgYWRkcmVzc19tb3ZlaW46IHsgdHlwZTogRGF0ZSB9LFxyXG4gIGFkZHJlc3NfbW92ZW91dDogeyB0eXBlOiBEYXRlIH0sXHJcbiAgYWRkcmVzc19vd25lcnNoaXA6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgYWRkcmVzc19yZWZlcmVuY2VfdHlwZTogeyB0eXBlOiBTdHJpbmcgfSxcclxuICBhZGRyZXNzX3JlZmVyZW5jZV9uYW1lOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIGFkZHJlc3NfcmVmZXJlbmNlX2VtYWlsOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIGFkZHJlc3NfcmVmZXJlbmNlX251bWJlcjogeyB0eXBlOiBTdHJpbmcgfSxcclxuICBhZGRyZXNzX3N0YXR1czogeyB0eXBlOiBTdHJpbmcgfSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgSW5jb21lcyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdpbmNvbWVzJyk7XHJcbkluY29tZXMuc2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgaW5jX2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIHJlbnRhbF9hcHBfaWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgaW5jX3R5cGU6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgaW5jX2FtdDogeyB0eXBlOiBOdW1iZXIgfSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgSWRlbnRpdGllcyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdpZGVudGl0aWVzJyk7XHJcbklkZW50aXRpZXMuc2NoZW1hID0gbmV3IFNpbXBsZVNjaGVtYSh7XHJcbiAgaWRlbnRpdHlfaWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgcmVudGFsX2FwcF9pZDogeyB0eXBlOiBTdHJpbmcgfSxcclxuICBpZGVudGl0eV90eXBlOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIGlkZW50aXR5X3NjYW46IHsgdHlwZTogU3RyaW5nIH0sXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEhvdXNlaG9sZHMgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbignaG91c2Vob2xkcycpO1xyXG5Ib3VzZWhvbGRzLnNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gIG9jY3VwYW50X2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIHJlbnRhbF9hcHBfaWQ6IHsgdHlwZTogU3RyaW5nIH0sXHJcbiAgb2NjdXBhbnRfbmFtZTogeyB0eXBlOiBTdHJpbmcgfSxcclxuICBvY2N1cGFudF9hZ2U6IHsgdHlwZTogTnVtYmVyIH0sXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEFnZW50cyA9IG5ldyBNb25nby5Db2xsZWN0aW9uKCdhZ2VudHMnKTtcclxuQWdlbnRzLnNjaGVtYSA9IG5ldyBTaW1wbGVTY2hlbWEoe1xyXG4gIGFnZW50X2lkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIGFnZW50X2ZuYW1lOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIGFnZW50X2xuYW1lOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIGFnZW50X3BoOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIGFnZW50X2VtYWlsOiB7IHR5cGU6IFN0cmluZyB9LFxyXG4gIGFnZW50X3Bhc3N3b3JkOiB7IHR5cGU6IFN0cmluZyB9LFxyXG59KTsiLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcclxuaW1wb3J0IHtcclxuICBQcm9wZXJ0aWVzLFxyXG4gIFRlbmFudHMsXHJcbiAgUmVudGFsQXBwbGljYXRpb25zXHJcbn0gZnJvbSAnL2ltcG9ydHMvYXBpL2NvbGxlY3Rpb25zJztcclxuaW1wb3J0IHsgRW1wbG95bWVudCB9IGZyb20gJy4uL2ltcG9ydHMvYXBpL2NvbGxlY3Rpb25zJztcclxuXHJcbk1ldGVvci5zdGFydHVwKGFzeW5jICgpID0+IHtcclxuICBpZiAoIWF3YWl0IFByb3BlcnRpZXMuZmluZE9uZUFzeW5jKHsgcHJvcF9pZDogJ1AwMDEnIH0pKSB7XHJcbiAgICBhd2FpdCBQcm9wZXJ0aWVzLmluc2VydEFzeW5jKHtcclxuICAgICAgcHJvcF9pZDogJ1AwMDEnLFxyXG4gICAgICBwcm9wX2FkZHJlc3M6ICcxMjMgTWFpbiBTdCwgTWVsYm91cm5lIFZJQycsXHJcbiAgICAgIHByb3BfcHJpY2Vwd2VlazogNDUwLFxyXG4gICAgICBwcm9wX251bWJlZHM6IDMsXHJcbiAgICAgIHByb3BfbnVtYmF0aHM6IDIsXHJcbiAgICAgIHByb3BfbnVtY2Fyc3BvdHM6IDEsXHJcbiAgICAgIHByb3BfdHlwZTogJ0FwYXJ0bWVudCcsXHJcbiAgICAgIHByb3BfZGVzYzogJ01vZGVybiBhcGFydG1lbnQgaW4gdGhlIGNpdHkgY2VudHJlLicsXHJcbiAgICAgIHByb3BfYXZhaWxhYmxlX2RhdGU6IG5ldyBEYXRlKCcyMDI1LTA2LTAxJyksXHJcbiAgICAgIHByb3BfZnVybmlzaDogdHJ1ZSxcclxuICAgICAgcHJvcF9wZXRzOiBmYWxzZSxcclxuICAgICAgcHJvcF9ib25kOiAxODAwLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBpZiAoIWF3YWl0IFByb3BlcnRpZXMuZmluZE9uZUFzeW5jKHsgcHJvcF9pZDogJ1AwMDInIH0pKSB7XHJcbiAgICBhd2FpdCBQcm9wZXJ0aWVzLmluc2VydEFzeW5jKHtcclxuICAgICAgcHJvcF9pZDogJ1AwMDInLFxyXG4gICAgICBwcm9wX2FkZHJlc3M6ICc4OSBCZWFjaHNpZGUgQXZlLCBTeWRuZXkgTlNXJyxcclxuICAgICAgcHJvcF9wcmljZXB3ZWVrOiA2NTAsXHJcbiAgICAgIHByb3BfbnVtYmVkczogNCxcclxuICAgICAgcHJvcF9udW1iYXRoczogMyxcclxuICAgICAgcHJvcF9udW1jYXJzcG90czogMixcclxuICAgICAgcHJvcF90eXBlOiAnSG91c2UnLFxyXG4gICAgICBwcm9wX2Rlc2M6ICdTcGFjaW91cyBiZWFjaGZyb250IGhvbWUuJyxcclxuICAgICAgcHJvcF9hdmFpbGFibGVfZGF0ZTogbmV3IERhdGUoJzIwMjUtMDctMDEnKSxcclxuICAgICAgcHJvcF9mdXJuaXNoOiBmYWxzZSxcclxuICAgICAgcHJvcF9wZXRzOiB0cnVlLFxyXG4gICAgICBwcm9wX2JvbmQ6IDI2MDAsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGlmICghYXdhaXQgVGVuYW50cy5maW5kT25lQXN5bmMoeyB0ZW5faWQ6ICdUMDAxJyB9KSkge1xyXG4gICAgYXdhaXQgVGVuYW50cy5pbnNlcnRBc3luYyh7XHJcbiAgICAgIHRlbl9pZDogJ1QwMDEnLFxyXG4gICAgICB0ZW5fZm46ICdBbGljZScsXHJcbiAgICAgIHRlbl9sbjogJ1NtaXRoJyxcclxuICAgICAgdGVuX2VtYWlsOiAnYWxpY2VAZXhhbXBsZS5jb20nLFxyXG4gICAgICB0ZW5fcG46ICcwNDEyMzQ1Njc4JyxcclxuICAgICAgdGVuX3Bhc3N3b3JkOiAnaGFzaGVkcGFzc3dvcmQnLFxyXG4gICAgICB0ZW5fcGZwOiAnL2ltYWdlcy9hbGljZS5wbmcnLFxyXG4gICAgICB0ZW5fYWRkOiAnNDU2IFN1YnVyYiBTdCwgVmljdG9yaWEnLFxyXG4gICAgICB0ZW5fcm9sZTogJ1RlbmFudCcsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGlmICghYXdhaXQgVGVuYW50cy5maW5kT25lQXN5bmMoeyB0ZW5faWQ6ICdUMDAyJyB9KSkge1xyXG4gICAgYXdhaXQgVGVuYW50cy5pbnNlcnRBc3luYyh7XHJcbiAgICAgIHRlbl9pZDogJ1QwMDInLFxyXG4gICAgICB0ZW5fZm46ICdCb2InLFxyXG4gICAgICB0ZW5fbG46ICdMZWUnLFxyXG4gICAgICB0ZW5fZW1haWw6ICdib2JAZXhhbXBsZS5jb20nLFxyXG4gICAgICB0ZW5fcG46ICcwNDEyMzQwMDAwJyxcclxuICAgICAgdGVuX3Bhc3N3b3JkOiAnaGFzaGVkcGFzc3dvcmQnLFxyXG4gICAgICB0ZW5fcGZwOiAnL2ltYWdlcy9ib2IucG5nJyxcclxuICAgICAgdGVuX2FkZDogJzc4OSBPY2VhbiBSZCwgTlNXJyxcclxuICAgICAgdGVuX3JvbGU6ICdUZW5hbnQnLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBpZiAoIWF3YWl0IFJlbnRhbEFwcGxpY2F0aW9ucy5maW5kT25lQXN5bmMoeyByZW50YWxfYXBwX2lkOiAnUkEwMDEnIH0pKSB7XHJcbiAgICBhd2FpdCBSZW50YWxBcHBsaWNhdGlvbnMuaW5zZXJ0QXN5bmMoe1xyXG4gICAgICByZW50YWxfYXBwX2lkOiAnUkEwMDEnLFxyXG4gICAgICBwcm9wX2lkOiAnUDAwMScsXHJcbiAgICAgIHJlbnRhbF9hcHBfcHJvcF9pbnNwZWN0ZWQ6IHRydWUsXHJcbiAgICAgIGxlYXNlX3N0YXJ0X2RhdGU6IG5ldyBEYXRlKCcyMDI1LTA2LTE1JyksXHJcbiAgICAgIGxlYXNlX3Rlcm06ICcxMiBtb250aHMnLFxyXG4gICAgICBhcHBfcmVudDogNDUwLFxyXG4gICAgICBhcHBfZGVzYzogJ0xvb2tpbmcgZm9yd2FyZCB0byBhIGxvbmctdGVybSBsZWFzZS4nLFxyXG4gICAgICB0ZW5faWQ6ICdUMDAxJyxcclxuICAgICAgbGVhc2Vob2xkZXJfaWQ6ICdMMDAxJyxcclxuICAgICAgZW1wbG95bWVudF9pZDogJ0UwMDEnLFxyXG4gICAgICBob3VzZWhvbGRfcGV0czogZmFsc2UsXHJcbiAgICAgIHN0YXR1czogJ1BlbmRpbmcnLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBpZiAoIWF3YWl0IFJlbnRhbEFwcGxpY2F0aW9ucy5maW5kT25lQXN5bmMoeyByZW50YWxfYXBwX2lkOiAnUkEwMDInIH0pKSB7XHJcbiAgICBhd2FpdCBSZW50YWxBcHBsaWNhdGlvbnMuaW5zZXJ0QXN5bmMoe1xyXG4gICAgICByZW50YWxfYXBwX2lkOiAnUkEwMDInLFxyXG4gICAgICBwcm9wX2lkOiAnUDAwMicsXHJcbiAgICAgIHJlbnRhbF9hcHBfcHJvcF9pbnNwZWN0ZWQ6IGZhbHNlLFxyXG4gICAgICBsZWFzZV9zdGFydF9kYXRlOiBuZXcgRGF0ZSgnMjAyNS0wNy0xNScpLFxyXG4gICAgICBsZWFzZV90ZXJtOiAnNiBtb250aHMnLFxyXG4gICAgICBhcHBfcmVudDogNjUwLFxyXG4gICAgICBhcHBfZGVzYzogJ1JlbG9jYXRpbmcgZm9yIHdvcmssIGludGVyZXN0ZWQgaW4gc2hvcnQtdGVybSBsZWFzZS4nLFxyXG4gICAgICB0ZW5faWQ6ICdUMDAyJyxcclxuICAgICAgbGVhc2Vob2xkZXJfaWQ6ICdMMDAyJyxcclxuICAgICAgZW1wbG95bWVudF9pZDogJ0UwMDInLFxyXG4gICAgICBob3VzZWhvbGRfcGV0czogdHJ1ZSxcclxuICAgICAgc3RhdHVzOiAnQXBwcm92ZWQnLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBpZiAoIWF3YWl0IEVtcGxveW1lbnQuZmluZE9uZUFzeW5jKHsgZW1wbG95bWVudF9pZDogJ0UwMDEnIH0pKSB7XHJcbiAgICBhd2FpdCBFbXBsb3ltZW50Lmluc2VydEFzeW5jKHtcclxuICAgICAgZW1wbG95bWVudF9pZDogJ0UwMDEnLFxyXG4gICAgICB0ZW5faWQ6ICdUMDAxJyxcclxuICAgICAgZW1wX3R5cGU6ICdGdWxsLVRpbWUnLFxyXG4gICAgICBlbXBfc3RhdHVzOiAnRW1wbG95ZWQnLFxyXG4gICAgICBlbXBfY29tcDogJ1RlY2hDb3JwIEx0ZCcsXHJcbiAgICAgIGVtcF9qb2JfdGl0bGU6ICdTb2Z0d2FyZSBEZXZlbG9wZXInLFxyXG4gICAgICBlbXBfc3RhcnRfZGF0ZTogbmV3IERhdGUoJzIwMjMtMDItMDEnKSxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgaWYgKCFhd2FpdCBFbXBsb3ltZW50LmZpbmRPbmVBc3luYyh7IGVtcGxveW1lbnRfaWQ6ICdFMDAyJyB9KSkge1xyXG4gICAgYXdhaXQgRW1wbG95bWVudC5pbnNlcnRBc3luYyh7XHJcbiAgICAgIGVtcGxveW1lbnRfaWQ6ICdFMDAyJyxcclxuICAgICAgdGVuX2lkOiAnVDAwMicsXHJcbiAgICAgIGVtcF90eXBlOiAnUGFydC1UaW1lJyxcclxuICAgICAgZW1wX3N0YXR1czogJ0VtcGxveWVkJyxcclxuICAgICAgZW1wX2NvbXA6ICdTZWFzaWRlIENyZWF0aXZlIEFnZW5jeScsXHJcbiAgICAgIGVtcF9qb2JfdGl0bGU6ICdHcmFwaGljIERlc2lnbmVyJyxcclxuICAgICAgZW1wX3N0YXJ0X2RhdGU6IG5ldyBEYXRlKCcyMDIzLTA4LTE1JyksXHJcbiAgICB9KTtcclxuICB9XHJcbiAgXHJcbiAgTWV0ZW9yLnB1Ymxpc2goJ3Byb3BlcnRpZXMnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gUHJvcGVydGllcy5maW5kKCk7XHJcbiAgfSk7XHJcblxyXG4gIE1ldGVvci5wdWJsaXNoKCd0ZW5hbnRzJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIFRlbmFudHMuZmluZCgpO1xyXG4gIH0pO1xyXG5cclxuICBNZXRlb3IucHVibGlzaCgncmVudGFsQXBwbGljYXRpb25zJywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIFJlbnRhbEFwcGxpY2F0aW9ucy5maW5kKCk7XHJcbiAgfSk7XHJcblxyXG4gIE1ldGVvci5wdWJsaXNoKCdlbXBsb3ltZW50JywgZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIEVtcGxveW1lbnQuZmluZCgpO1xyXG4gIH0pO1xyXG59KTsiXX0=
