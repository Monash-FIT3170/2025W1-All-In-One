Meteor.publish('tasks', function publishTasks() {
  if (!this.userId) {
    return this.ready();
  }

  return TasksCollection.find({ userId: this.userId });
});
