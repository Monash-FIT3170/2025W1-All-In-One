import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

const SharedLease = ({ propId, tenId }) => {
  const [groupId, setGroupId] = useState('');
  const [joinedGroupId, setJoinedGroupId] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateGroup = () => {
    Meteor.call('sharedLease.createGroup', tenId, propId, (err, res) => {
      if (err) {
        setMessage(`Error creating group: ${err.message}`);
      } else {
        setGroupId(res);
        setMessage(`Group created! Your group ID is: ${res}`);
      }
    });
  };

  const handleJoinGroup = () => {
    if (!joinedGroupId) {
      setMessage('Please enter a Group ID to join.');
      return;
    }
    Meteor.call('sharedLease.joinGroup', joinedGroupId, tenId, (err) => {
      if (err) {
        setMessage(`Error joining group: ${err.message}`);
      } else {
        setGroupId(joinedGroupId);
        setMessage(`Successfully joined group ${joinedGroupId}`);
      }
    });
  };

  return (
    <div>
      <h3>Shared Lease Group</h3>

      {!groupId && (
        <>
          <button onClick={handleCreateGroup}>Create Group</button>

          <div style={{ marginTop: '1em' }}>
            <input
              type="text"
              placeholder="Enter Group ID to Join"
              value={joinedGroupId}
              onChange={(e) => setJoinedGroupId(e.target.value)}
            />
            <button onClick={handleJoinGroup}>Join Group</button>
          </div>
        </>
      )}

      {groupId && (
        <p>
          You are in group <strong>{groupId}</strong>.
        </p>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default SharedLease;
