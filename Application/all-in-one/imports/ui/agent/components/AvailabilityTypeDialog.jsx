import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Meteor } from 'meteor/meteor';
import { Properties, ExpressionOfInterest, Agents, Tenants, Photos } from "/imports/api/database/collections";
import { useTracker } from 'meteor/react-meteor-data';
import { EOI } from './EOI';

/**
 * AvailabilityTypeDialog Component
 *
 * A modal dialog that allows agents to create availability slots for inspections or open houses.
 * Features:
 * - Toggle between "Inspection" and "Open House" availability types
 * - Property search and selection for open houses (from MongoDB)
 * - Date and time selection for availability slots
 * - Optional notes field for additional information
 * - Real-time property data from MongoDB collections
 */
export const AvailabilityTypeDialog = ({ isOpen, pendingSlot, onSelect, onClose }) => {
  if (!isOpen) return null;
  
  const [type, setType] = useState('Inspection');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [date, setDate] = useState('');
  const [property, setProperty] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [note, setNote] = useState('');
  const [selectedEOI, setSelectedEOI] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  // Get agent's properties from database
  const { agentProperties, photos, propsReady } = useTracker(() => {
    const propertiesHandle = Meteor.subscribe('properties');
    const photosHandle = Meteor.subscribe('photos');
    const currentUserId = Meteor.userId();

    const ready = propertiesHandle.ready() && photosHandle.ready();

    return {
      agentProperties: ready && currentUserId
        ? Properties.find({ agent_id: currentUserId }).fetch()
        : [],
      photos: ready ? Photos.find({}).fetch() : [],
      propsReady: ready,
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
      ? agentProperties.find(p => p.prop_id === property.prop_id)
      : null;

    // ✅ send acceptance email if this is a private open house with an EOI selected
    if (type === 'Open House' && isPrivate && selectedEOI) {
      Meteor.call('eoi.accept', selectedEOI, (err) => {
        if (err) console.error('EOI accept email failed:', err);
      });
    }

    // Find property photos
    const propertyPhotos = selected ? photos.filter(photo => photo.prop_id === selected.prop_id) : [];
    const propertyImage = propertyPhotos.length > 0 ? propertyPhotos[0].photo_url : '/images/default.jpg';

    onSelect(type, start, end, {
      id: selected?.prop_id || null,
      address: selected?.prop_address || property?.prop_address || null,
      image: propertyImage,
      price: selected?.prop_pricepweek || null,
      bedrooms: selected?.prop_numbeds || null,
      bathrooms: selected?.prop_numbaths || null,
      parking: selected?.prop_numcarspots || null,
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

  // Filter EOIs to only those related to the logged-in agent's properties
  const { filteredEOIs, agent, eoisReady } = useTracker(() => {
    const agentsSub = Meteor.subscribe('agents');
    const eoIsSub = Meteor.subscribe('expressionOfInterest');
    const ready = agentsSub.ready() && eoIsSub.ready();

    const userId = Meteor.userId();
    const agent = userId ? Agents.findOne({ agent_id: userId }) : null;

    let filteredEOIs = [];
    if (agent) {
      const allEOIs = ExpressionOfInterest.find().fetch();
      filteredEOIs = allEOIs.filter((eoi) => {
        const propMatch = Properties.findOne({ prop_id: eoi.propertyID, agent_id: userId });
        return !!propMatch && eoi.inviteSent === false;
      });
    }
    return { filteredEOIs, agent, eoisReady: ready };
  }, []);

  function getPropertyAddress(eoi) {
    const prop = Properties.findOne({ prop_id: eoi.propertyID });
    return prop ? prop.prop_address : '';
  }

  function getProspectiveTenantName(eoi) {
    const tenant = Tenants.findOne({ ten_id: eoi.tenantID });
    return tenant ? `${tenant.ten_fn} ${tenant.ten_ln}` : '';
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-[#CBADD8] p-6 rounded-3xl shadow-lg w-[440px] text-left space-y-6 relative overflow-y-auto overscroll-contain max-h-[700px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold text-black hover:text-gray-700"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold text-center text-black">Availability Type</h2>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setType('Inspection')}
            className={`py-2 px-6 rounded-full font-semibold transition-all duration-150 ${
              type === 'Inspection' ? 'bg-[#9747FF] text-white' : 'bg-[#CDCDCD] text-black'
            }`}
          >
            Inspection
          </button>
          <button
            onClick={() => setType('Open House')}
            className={`py-2 px-6 rounded-full font-semibold transition-all duration-150 ${
              type === 'Open House' ? 'bg-[#9747FF] text-white' : 'bg-[#CDCDCD] text-black'
            }`}
          >
            Open House
          </button>
        </div>

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

            {/* EOIs */}
            <h3 className="text-lg font-bold mt-4 mb-2 text-black">Expressions of Interest</h3>
            <p className="text-sm text-gray-800 mb-4">
              Expressions of interest (EOI) for properties, with dates requested by prospective tenants. Choose to "remove" EOI or "select", to send an invite to the prospective tenant for this open house.
            </p>
            {/* list of EOI */}
            <div
              className="rounded-2xl bg-[#FAEEDA] p-6 overflow-y-auto overscroll-contain mb-4 max-h-[300px]"
              role="region"
            >
              <div className="text-center text-sm text-black/70">
                {filteredEOIs.length > 0 ? (
                  filteredEOIs.map((eoi) => (
                    <EOI
                      key={eoi._id}
                      eoiDoc={eoi}
                      address={getPropertyAddress(eoi)}
                      prospectiveTenName={getProspectiveTenantName(eoi)}
                      isSelected={String(selectedEOI) === String(eoi._id)}
                      onSelect={() => {
                        setSelectedEOI(eoi._id);
                        const prop = Properties.findOne({ prop_id: eoi.propertyID });
                        if (prop) setProperty(prop);   // ✅ keep property in sync with EOI
                      }}
                      onRemoved={(id) => {
                        // optional: if you removed the selected one, clear selection
                        if (String(selectedEOI) === String(id)) setSelectedEOI(null);
                        setProperty(null);
                      }}
                    />
                  ))
                ) : (
                  <p>You currently have no EOIs.</p>
                )}
              </div>
            </div>

            {/* Private Open House checkbox */}
            <div>
              <label className="block text-lg text-black font-semibold mb-1">Private Open House</label>
              <p className="text-sm text-gray-800 mb-4">
                Select the checkbox if this is a private open house for the selected EOI prospective tenant.
              </p>
              <div className="flex items-center gap-2">
                <input
                  id="privateOpenHouse"
                  type="checkbox"
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded-lg border-gray-300"
                />
                <label htmlFor="privateOpenHouse" className="text-left">
                  Private Open House
                </label>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold mb-2 text-black">Date and Time</h3>
          <p className="text-sm text-gray-800 mb-4">
            The start and end time entered will appear as a timeslot for possible tenants to book inspections for this property.
          </p>
          <div className="flex justify-between gap-3">
            <div className="flex flex-col w-1/3">
              <label className="text-sm font-semibold mb-1">Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-lg px-2 py-1 bg-yellow-50 border"
              />
            </div>
            <div className="flex flex-col w-1/3">
              <label className="text-sm font-semibold mb-1">End time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-lg px-2 py-1 bg-yellow-50 border"
              />
            </div>
            <div className="flex flex-col w-1/3">
              <label className="text-sm font-semibold mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg px-2 py-1 bg-yellow-50 border"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-black font-semibold mb-1">Notes (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="i.e., Bring pen & notepad"
            className="w-full h-24 px-4 py-2 rounded-lg bg-[#FFF8E9] border border-purple-400 resize-none"
          />
        </div>

        <div className="text-center pt-2">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#9747FF] hover:bg-purple-700 text-white font-bold py-3 rounded-full"
          >
            Create Availability
          </button>
        </div>
      </div>
    </div>
  );
};