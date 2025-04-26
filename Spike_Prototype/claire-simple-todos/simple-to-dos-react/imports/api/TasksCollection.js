import { Mongo } from "meteor/mongo";

// Create a new MongoDB collection called "tasks"
export const TasksCollection = new Mongo.Collection("tasks");

