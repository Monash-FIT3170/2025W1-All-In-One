import { Meteor } from 'meteor/meteor';
import { StarredProperties } from '/imports/api/database/collections';
import { Tenants } from '../database/collections';


Meteor.methods({
    async 'starredProperties.add'(prop_id){
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        // find tenant linked to this user
        const tenant= await Tenants.findOneAsync({ ten_id: this.userId });
        if (!tenant) {
            throw new Meteor.Error('tenant-not-found', 'No tenant found for this user.');
        }

        // Check if the property is already starred
        const existingStar = await StarredProperties.findOneAsync({ ten_id: tenant.ten_id, prop_id });
        if (existingStar) {
            throw new Meteor.Error('already-starred', 'This property is already starred.');
        }

        // Insert the new starred property
        await StarredProperties.insertAsync({
            ten_id: tenant.ten_id,
            prop_id,
            starredAt: new Date()
        });
    },

    async 'starredProperties.remove'(prop_id){
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }

        // find tenant linked to this user
        const tenant= await Tenants.findOneAsync({ ten_id: this.userId });
        if (!tenant) {
            throw new Meteor.Error('tenant-not-found', 'No tenant found for this user.');
        }

        // Find the starred property
        const star = await StarredProperties.findOneAsync({ ten_id: tenant.ten_id, prop_id });
        if (!star) {
            throw new Meteor.Error('not-starred', 'This property is not starred.');
        }

        // Remove the starred property
        await StarredProperties.removeAsync({ ten_id: tenant.ten_id, prop_id });
    }
});