import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Meteor } from 'meteor/meteor';                       // ✅ add
import { Properties, ExpressionOfInterest, Agents, Tenants, Photos } from "/imports/api/database/collections"; // ✅ include Photos
import { useTracker } from 'meteor/react-meteor-data';
import { EOI } from './EOI';

export const AvailabilityTypeDialog = ({ isOpen, pendingSlot, onSelect, onClose }) => {
  const [type, setType] = useState('Inspection');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [date, setDate] = useState('');
  const [property, setProperty] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [note, setNote] = useState('');
  const [selectedEOI, setSelectedEOI] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  // --- Tracker 1: agent's properties & photos
  const { agentProperties, photos, propsReady } = useTracker(() => {     // ✅ renamed
    const propertiesHandle = Meteor.subscribe('properties');
    const photosHandle = Meteor.subscribe('photos');
    const currentUserId = Meteor.userId();

    const ready = propertiesHandle.ready() && photosHandle.ready();

    return {
      agentProperties: ready && currentUserId
        ? Properties.find({ agent_id: currentUserId }).fetch()           // ✅ keep collection intact
        : [],
      photos: ready ? Photos.find({}).fetch() : [],
      propsReady: ready,                                                 // ✅ renamed
    };
  }, []);

  useEffect(() => {
    if (pendingSlot && isOpen) {
      const start = dayjs(pendingSlot.start);
      const end = dayjs(pendingSlot.end);
      setDate(start.format('YYYY-MM-DD'));
      setStartTime(start.format('HH:mm'));
      setEndTime(end.format('HH:mm'));
      setProperty(null);
      setShowSuggestions(false);
      setNote('');
      setSelectedEOI(null);
      setIsPrivate(false);
    }
  }, [pendingSlot, isOpen]);

  const handleSubmit = () => {
    const start = dayjs(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm').toDate();
    const end = dayjs(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm').toDate();

    const selected = property && property.prop_address
      ? Properties.findOne({ prop_id: property.prop_id }) : null;

    if (type === 'Open House' && isPrivate && selectedEOI) {
      Meteor.call('eoi.accept', selectedEOI, (err) => {
        if (err) console.error('EOI accept email failed:', err);
      });
    }

    const propertyPhotos = selected ? photos.filter(ph => ph.prop_id === selected.prop_id) : [];
    const propertyImage = propertyPhotos.length > 0 ? propertyPhotos[0].photo_url : '/images/default.jpg';

    onSelect(type, start, end, {
      id: selected?.prop_id || null,
      address: selected?.prop_address || property?.prop_address || '-',
      image: propertyImage,
      price: selected?.prop_pricepweek || '-',
      bedrooms: selected?.prop_numbeds || '-',
      bathrooms: selected?.prop_numbaths || '-',
      parking: selected?.prop_numcarspots || '-',
      is_private: isPrivate
    }, note, selectedEOI);
  };

  // Use the collection directly (with agent filter) OR filter the already-fetched agentProperties
  const filteredProperties = propsReady
    ? Properties.find({
        agent_id: Meteor.userId(),
        prop_address: { $regex: property?.prop_address || '', $options: 'i' },
      }).fetch()
    : [];

  // --- Tracker 2: EOIs for the logged-in agent
  const { filteredEOIs, agent, eoisReady } = useTracker(() => {          // ✅ renamed
    const agentsSub = Meteor.subscribe('agents');
    const eoIsSub = Meteor.subscribe('expressionOfInterest');
    const ready = agentsSub.ready() && eoIsSub.ready();

    const userId = Meteor.userId();
    const agent = userId ? Agents.findOne({ agent_id: userId }) : null;

    let filteredEOIs = [];
    if (agent) {
      const allEOIs = ExpressionOfInterest.find().fetch();
      filteredEOIs = allEOIs.filter((eoi) => {
        const propMatch = Properties.findOne({ prop_id: eoi.propertyID, agent_id: userId }); // ✅ renamed
        return !!propMatch && eoi.inviteSent === false;
      });
    }
    return { filteredEOIs, agent, eoisReady: ready };                    // ✅ renamed
  }, []);

  function getPropertyAddress(eoi) {
    const prop = Properties.findOne({ prop_id: eoi.propertyID });
    return prop ? prop.prop_address : '';
  }

  function getProspectiveTenantName(eoi) {
    const tenant = Tenants.findOne({ ten_id: eoi.tenantID });
    return tenant ? `${tenant.ten_fn} ${tenant.ten_ln}` : '';
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#CBADD8] p-6 rounded-3xl shadow-lg w-[440px] text-left space-y-6 relative overflow-y-auto overscroll-contain max-h-[700px]">
        {/* ... */}
        {type === 'Open House' && (
          <div>
            <label className="block text-black font-semibold mb-1">
              Your Property {!propsReady && <span className="text-xs">(Loading...)</span>}
            </label>
            <input
              type="text"
              placeholder={propsReady ? "Search your properties..." : "Loading properties..."}
              value={property?.prop_address || ''}
              onChange={(e) => {
                setProperty({ prop_address: e.target.value });
                setShowSuggestions(true);
              }}
              disabled={!propsReady}
              className="w-full px-4 py-2 rounded-lg bg-[#FFF8E9] border border-purple-400 disabled:opacity-50"
            />
            {showSuggestions && property?.prop_address && propsReady && (
              <div className="mt-1 border rounded bg-white max-h-40 overflow-y-auto shadow">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((p) => (
                    <div
                      key={p.prop_id}
                      onClick={() => {
                        setProperty(p);
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {p.prop_address}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    {agentProperties.length === 0
                      ? "You don't have any properties listed yet"
                      : "No matching properties found"}
                  </div>
                )}
              </div>
            )}
            {/* EOIs list uses filteredEOIs and eoisReady if you want a loader */}
            {/* ... unchanged UI below ... */}
          </div>
        )}
        {/* ... rest of component unchanged ... */}
      </div>
    </div>
  );
};
