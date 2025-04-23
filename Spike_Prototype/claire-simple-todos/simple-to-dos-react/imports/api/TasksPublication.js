import { Meteor } from "meteor/meteor";
import { TasksCollection } from "./TasksCollection";

// publish the collection - publishes the data to the client
Meteor.publish("tasks", () => {
  return TasksCollection.find();
});