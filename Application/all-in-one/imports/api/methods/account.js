import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Tenants, Properties } from '../database/collections.js'; // adjust path if needed

Meteor.methods({
  async registerUser({ email, password, firstName, lastName, role }) {
    try {
      //  Create the Meteor account and await the user ID
      const userId = await Accounts.createUserAsync({
        email,
        password,
        profile: {
          role,
          firstName,
          lastName
        }
      });

      //  Insert tenant data using userId as ten_id
      await Tenants.insertAsync({
        ten_id: userId,
        ten_fn: firstName,
        ten_ln: lastName,
        ten_email: email,
        ten_pn: '',         // optional: fill in from form later
        ten_pfp: '',
        ten_add: '',
        ten_role: role
      });

      return userId;
    } catch (error) {
      console.error("registerUser error:", error);
      throw new Meteor.Error("register-failed", error.message || "Something went wrong.");
    }
  },

  async "addProperty" ({propAddress, pricePerWeek, numBeds, numBaths, numParkSpots, propType, description, dateAvailable, isFurnished, petsAllowed, bond, status}) {
    try {
      {/* Creating Property Id */}
      const collectionSize = await Properties.find({}, {fields: {prop_id: 1}}).countAsync() + 1;
      const idNum = String(collectionSize).padStart(3, '0');
      const propID = "P" + idNum;
      const date = new Date(dateAvailable);
   
      {/* Adding Property to 'Properties' Database */}
      await Properties.insertAsync({
        prop_id: propID,
        prop_address: propAddress,
        prop_pricepweek: pricePerWeek,
        prop_numbeds: numBeds,
        prop_numbaths: numBaths,
        prop_numcarspots: numParkSpots,
        prop_type: propType,
        prop_desc: description,
        prop_available_date: date,
        prop_furnish: isFurnished,
        prop_pets: petsAllowed,
        prop_bond: bond,
        prop_status: status,
        agent_id: 'A001',   // to be changed
        landlord_id: 'L001' // to be changed
      });
  
      return propID;
    } catch (error) {
      console.error("addProperty error:", error);
      throw new Meteor.Error("add-property-failed", error.message || "Something went wrong.");
    }
  },
  
});