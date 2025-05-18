import { Meteor } from 'meteor/meteor';
import { Properties, Photos, Videos } from '../database/collections.js';


Meteor.methods({

    async addProperty({propAddress, pricePerWeek, numBeds, numBaths, numParkSpots, propType, description, dateAvailable, isFurnished, petsAllowed, bond, status}) {
    try {
      const propID = await Properties.createIndexAsync({
        property: {
          propAddress,
          pricePerWeek,
          numBeds,
          numBaths,
          numParkSpots,
          propType,
          description,
          dateAvailable,
          isFurnished,
          petsAllowed,
          bond,
          status
        }
      });

      await Properties.insertAsync({
        prop_id: propID,
        prop_address: propAddress,
        prop_pricepweek: pricePerWeek,
        prop_numbeds: numBeds,
        prop_numbaths: numBaths,
        prop_numcarspots: numParkSpots,
        prop_type: propType,
        prop_desc: description,
        prop_available_date: new Date(dateAvailable),
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
  }

})

