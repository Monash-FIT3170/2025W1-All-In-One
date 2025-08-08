import { Meteor } from 'meteor/meteor';
import { StarredProperties } from '/imports/api/database/collections';


Meteor.methods({
    async 'starredProperties.add'(prop_id){
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        // Check if the property is already starred
        const existingStar = await StarredProperties.findOneAsync({ userId: this.userId, prop_id });
        if (existingStar) {
            throw new Meteor.Error('already-starred', 'This property is already starred.');
        }

        // Insert the new starred property
        await StarredProperties.insertAsync({
            userId: this.userId,
            prop_id,
            starredAt: new Date()
        });
    },

    async 'starredProperties.remove'(prop_id){
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        // Find the starred property
        const star = await StarredProperties.findOneAsync({ userId: this.userId, prop_id });
        if (!star) {
            throw new Meteor.Error('not-starred', 'This property is not starred.');
        }

        // Remove the starred property
        await StarredProperties.removeAsync({ userId: this.userId, prop_id });
    }
});