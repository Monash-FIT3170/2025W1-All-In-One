import { Meteor } from "meteor/meteor";
import { TasksCollection } from "./TasksCollection";

Meteor.methods({
  "tasks.insert"(doc) {
    return TasksCollection.insertAsync(doc); // Use the synchronous insert method
  },
  "tasks.toggleChecked"({ _id, isChecked }) {
    return TasksCollection.updateAsync(_id, {
      $set: { isChecked: !isChecked }, // Use the synchronous update method
    });
  },
  "tasks.delete"({ _id }) {
    return TasksCollection.removeAsync(_id); // Use the synchronous remove method
  },
});