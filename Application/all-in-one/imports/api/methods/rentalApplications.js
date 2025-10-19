import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { RentalApplications } from "../database/collections.js";

Meteor.methods({
  async updateFeedback({ propId, feedback, status }) {
    try {
      check(propId, String);
      check(feedback, String);
      check(status, String);

      const updated = RentalApplications.update(
        { prop_id: propId },
        {
          $set: {
            landlordFeedback: feedback,
            status,
            updatedAt: new Date(),
          },
        },
        { multi: true } // update all applications for this property
      );

      if (updated === 0) {
        throw new Meteor.Error(
          "not-found",
          "No rental applications found for this property"
        );
      }
    } catch (error) {
      console.log(error);
    }
  },

  //Set final decision for rental application
  async setFinalDecision({ propId, selectedAppId }) {
    try {
      check(propId, String);
      check(selectedAppId, String);

      // mark all as Rejected for that property
      RentalApplications.update(
        { prop_id: propId },
        { $set: { finalDecision: "Rejected" } },
        { multi: true }
      );

      // approve the selected application (using _id)
      RentalApplications.update(
        { _id: selectedAppId },
        { $set: { finalDecision: "Approved" } }
      );
    } catch (error) {
      console.log(error);
    }
  },
});