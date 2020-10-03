import { Meteor } from 'meteor/meteor';

const HamkelasiAction = new Mongo.Collection('hamkelasi-action');

if (Meteor.isServer) {
  HamkelasiAction._ensureIndex({ meetingId: 1, requesterUserId: 1 });
}

export { HamkelasiAction };
