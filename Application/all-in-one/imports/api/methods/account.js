import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Tenants, Properties, Photos } from '../database/collections.js'; // adjust path if needed

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

  async "addProperty" ({propAddress, pricePerWeek, numBeds, numBaths, numParkSpots, propType, description, dateAvailable, isFurnished, petsAllowed, bond, landlordEmail, status, agentId}) {
    try {
      //The following 3 lines can be used to make IDs for any collection, given you replace the following aspects:
        // Properties --> {name of collection}
        // prop_id --> {name of id attribute in collection}
        // 3 (in padStart) --> {number of digits you want excluding the letter}
        // "P" --> {letter to represent the collection's data}

      
      // First, find the landlord by email
      const landlord = await Meteor.users.findOneAsync({ "emails.address": landlordEmail });
      
      if (!landlord) {
        throw new Meteor.Error("landlord-not-found", "No landlord found with that email");
      }

      {/* Creating Property Id */}
      const collectionSize = await Properties.find({}, {fields: {prop_id: 1}}).countAsync() + 1;  // Counts the number of items in the collection, then adds 1 
      const idNum = String(collectionSize).padStart(3, '0');  // Pads out the number with leading zeros to make sure the ID has 3 digits. Can be changed to have more or less.
      const propID = "P" + idNum;   // Concatenates the number with a leading P for Properties. 
      

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
        agent_id: agentId,   // to be changed
        landlord_id: landlord._id
      });
      
      await Photos.insertAsync({
        prop_id: propID,
        photo_id: 'PH004',
        photo_url: '/images/properties/P001/P001_1.jpg',
        photo_order: 1
      });

      return propID;
    } catch (error) {
      console.error("addProperty error:", error);
      throw new Meteor.Error("add-property-failed", error.message || "Something went wrong.");
    }
  },

});