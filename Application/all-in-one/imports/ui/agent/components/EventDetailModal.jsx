import React from 'react';
import { BedDouble, ShowerHead, CarFront, Users, Check } from 'lucide-react';
import { Meteor } from 'meteor/meteor';

export const EventDetailModal = ({ event, onClose, onAttendanceUpdate }) => {
  if (!event) return null;
  
  // Debug logging to see what data is being passed
  console.log('EventDetailModal received event:', event);
  console.log('Event attendanceList:', event.attendanceList);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('default', { month: 'long' });
    const year = d.getFullYear();
    const suffix =
      day === 1 || day === 21 || day === 31 ? 'st' :
      day === 2 || day === 22 ? 'nd' :
      day === 3 || day === 23 ? 'rd' : 'th';
    return `${day}${suffix} ${month} ${year}`;
  };

  const formatTime = (start, end) => {
    const opts = { hour: 'numeric', minute: '2-digit', hour12: true };
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleTimeString([], opts)} - ${e.toLocaleTimeString([], opts)}`;
  };

  const handleAttendanceToggle = (tenantID) => {
    console.log('Toggling attendance for tenant:', tenantID, 'event ID:', event.id);
    
    if (!event.id) {
      console.error('Event ID is missing!');
      alert('Error: Event ID is missing. Please try refreshing the page.');
      return;
    }
    
    Meteor.call(
      'openHouseAttendance.toggleAttendance',
      event.id,
      tenantID,
      (err) => {
        if (err) {
          console.error('Failed to toggle attendance:', err);
          alert('Failed to update attendance: ' + err.reason);
        } else {
          console.log('Attendance toggled successfully');
          // Call the callback to refresh the attendance data
          if (onAttendanceUpdate) {
            onAttendanceUpdate();
          }
        }
      }
    );
  };

  const handleNotesSave = (tenantID, notes) => {
    if (!event.id) {
      alert('Error: Event ID is missing.');
      return;
    }
    Meteor.call(
      'openHouseAttendance.updateNotes',
      event.id,
      tenantID,
      notes,
      (err) => {
        if (err) {
          console.error('Failed to save notes:', err);
          alert('Failed to save notes: ' + err.reason);
        } else if (onAttendanceUpdate) {
          onAttendanceUpdate();
        }
      }
    );
  };

  const handleAddAnonymous = () => {
    const first = prompt('Enter first name');
    if (!first) return;
    const last = prompt('Enter last name');
    if (!last) return;
    if (!event.id) {
      alert('Error: Event ID is missing.');
      return;
    }
    Meteor.call(
      'openHouseAttendance.addAnonymousAttendee',
      event.id,
      first,
      last,
      (err) => {
        if (err) {
          console.error('Failed to add attendee:', err);
          alert('Failed to add attendee: ' + err.reason);
        } else if (onAttendanceUpdate) {
          onAttendanceUpdate();
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-[#CBADD8] p-6 rounded-xl w-[900px] max-h-[90vh] overflow-y-auto shadow-lg flex gap-6">
        <button
          className="absolute top-4 right-4 text-2xl font-bold text-black hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* Left: Property Info */}
        <div className="flex-1">
          <h2 className="text-3xl text-center font-semibold text-gray-800 mb-2 tracking-wide">
            {event.type || ''}
          </h2>

          <img
            src={event.property?.image || event.image || '/images/default.jpg'}
            alt="Property"
            className="rounded-xl mb-2 w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/default.jpg';
            }}
          />

          <div className="bg-[#FFF8E9] p-4 rounded-xl">
            {event.property ? (
              <>
                <p className="text-center text-gray-700">
                  {event.property.address || 'No address available'}
                </p>

                {event.property.price && (
                  <p className="text-center text-sm text-gray-700">
                    ${event.property.price} per week
                  </p>
                )}

                <div className="flex justify-center gap-6 text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-1">
                    <BedDouble className="w-4 h-4" />
                    {event.property.bedrooms ?? '—'}
                  </div>
                  <div className="flex items-center gap-1">
                    <ShowerHead className="w-4 h-4" />
                    {event.property.bathrooms ?? '—'}
                  </div>
                  <div className="flex items-center gap-1">
                    <CarFront className="w-4 h-4" />
                    {event.property.parking ?? '—'}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-700">No property information</p>
            )}
          </div>
        </div>

        {/* Right: Booking Info & Attendance List */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{formatDate(event.start)}</h2>
          <p className="text-lg font-medium text-gray-700">
            {formatTime(event.start, event.end)}
          </p>

          {/* Combined Tenant Information & Attendance List */}
          <div className="bg-white p-4 rounded-xl space-y-4 mt-4">
            {/* Individual Tenant Info (if exists) */}
            {event.tenant ? (
              <div className="space-y-2">
                <p className="font-semibold text-lg">{event.tenant}</p>
                <p className="text-sm text-gray-600">Age: {event.tenantAge || '—'}</p>
                <p className="text-sm text-gray-600">Occupation: {event.occupation || '—'}</p>
              </div>
            ) : null}

            {/* Divider if both sections exist */}
            {event.tenant && event.attendanceList && event.attendanceList.length > 0 && (
              <div className="border-t border-gray-200 my-3"></div>
            )}

            {/* Attendance List Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Tenants Subscribed to Open House</h3>
              </div>
              
              {event.attendanceList && event.attendanceList.length > 0 ? (
                <div className="space-y-2">
                  {event.attendanceList.map((attendee, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleAttendanceToggle(attendee.tenantID)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              attendee.tenantAttendance
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                            title={attendee.tenantAttendance ? 'Mark as not attended' : 'Mark as attended'}
                          >
                            {attendee.tenantAttendance && <Check className="w-3 h-3" />}
                          </button>
                          <button className="font-medium text-gray-800 underline" onClick={() => {
                            const current = attendee.notes || '';
                            const updated = prompt(`Notes for ${attendee.tenantName}:`, current) ?? current;
                            if (updated !== current) handleNotesSave(attendee.tenantID, updated);
                          }}>{attendee.tenantName}</button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            attendee.tenantAttendance 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {attendee.tenantAttendance ? 'Attended' : 'Registered'}
                          </span>
                        </div>
                      </div>
                      {attendee.notes?.trim() ? (
                        <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
                          {attendee.notes}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Total: {event.attendanceList.length} tenant(s)
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No tenants have subscribed yet</p>
                </div>
              )}
              <div className="mt-3 text-center">
                <button onClick={handleAddAnonymous} className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">
                  Add Name
                </button>
              </div>
            </div>
          </div>

          {event.notes?.trim() && (
            <div className="bg-white p-4 rounded-xl mt-4 text-sm text-gray-700">
              <p className="font-semibold mb-1">Note</p>
              <p className="whitespace-pre-line">{event.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

