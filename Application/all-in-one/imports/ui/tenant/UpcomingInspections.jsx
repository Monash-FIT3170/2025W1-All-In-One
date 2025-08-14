import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { AgentAvailabilities } from '../../api/AgentAvailabilities';
import { Properties, Agents, Photos } from "../../api/database/collections";
import Navbar from "./components/TenNavbar";
import { Link } from "react-router-dom";

// Group events by Availability Type
const groupEventsByType = (events) => {
  const grouped = {};
  events.forEach(event => {
    if (!grouped[event.availabilityType]) {
      grouped[event.availabilityType] = [];
    }
    grouped[event.availabilityType].push(event);
  });
  return grouped;
};

// Format date for display
const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: 'long', day: 'numeric'}
  const options_year = {year: 'numeric'};
  return date.toLocaleDateString('en-US', options) + getOrdinalSuffix(date.getDate()) + ", " + date.toLocaleDateString('en-us', options_year);
};

// Get ordinal suffix for date
const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

// Format time for display
const formatTime = (start, end) => {
  const startTime = new Date(start).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const endTime = new Date(end).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  return `${startTime} - ${endTime}`;
};


export const UpcomingInspections = () => {
  const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedAgents, setSelectedAgents] = useState(['All Agents']);
    const [selectedAvailabilities, setSelectedAvailabilities] = useState(['All Availabilities']);
    const [selectedDates, setSelectedDates] = useState(['All Dates']);
    const [loading, setLoading] = useState(true);
  
    // Subscribe to data - only get current user's bookings
    const { availabilities, properties, agents, photos, isReady } = useTracker(() => {
      const availabilitiesHandle = Meteor.subscribe('agentAvailabilities');
      const propertiesHandle = Meteor.subscribe('properties');
      const agentsHandle = Meteor.subscribe('agents');
      const photosHandle = Meteor.subscribe('photos');
      
      const ready = availabilitiesHandle.ready() && 
                    propertiesHandle.ready() && 
                    agentsHandle.ready() &&
                    photosHandle.ready();
  
      return {
        availabilities: AgentAvailabilities.find({}).fetch(),
        properties: Properties.find({}).fetch(),
        agents: Agents.find({}).fetch(),
        photos: Photos.find({}).fetch(),
        isReady: ready
      };
    }, []);
  
    useEffect(() => {
      setLoading(!isReady);
    }, [isReady]);
  
    // Transform booked data for display 
    const transformedEvents = availabilities.map(booking => {
      
      let property = {};
      
      // Try to find property by booking.property first
      if (booking.property && booking.property !== "") {
        property = properties.find(p => p.prop_address === booking.property.address) || {};
      }
      
      // If no property found, try to get from booking.property if it exists
      if (!property.prop_id && booking.property.id) {
        // Check if booking.property has property info directly
        if (typeof booking.property === 'object' && booking.property.address) {
          // Use property data directly from booking
          property = {
            prop_id: booking.property.id || 'unknown',
            prop_address: booking.property.address,
            prop_pricepweek: booking.property.price,
            prop_numbeds: booking.property.bedrooms,
            prop_numbaths: booking.property.bathrooms,
            prop_numcarspots: booking.property.parking,
            prop_type: booking.property.type || 'Property',
            prop_available_date: new Date(),
            prop_pets: false,
            prop_furnish: false,
            prop_desc: 'Booked property'
          };
        }
      }
      
      // // If still no property, use first available property as fallback (this is the case for inspections since no property is specified)
      // if (!property.prop_id && properties.length > 0) {
      //   property = properties[0]; // Use first property as fallback
      // }
      
      // Find corresponding agent details
      const agent = agents.find(a => a.agent_id === property.agent_id) || {};
      
      // Find property photos
      const propertyPhotos = photos.filter(photo => photo.prop_id === property.prop_id);
  
      // Create propertyData object
      const propertyData = {
        id: property.prop_id,
        address: property.prop_address || 'Select to Choose Property',
        price: property.prop_pricepweek || 0,
        type: property.prop_type || 'Property',
        AvailableDate: property.prop_available_date || new Date(),
        Pets: property.prop_pets ? "True" : "False",
        imageUrls: propertyPhotos.length ? propertyPhotos.map((photo) => `/images/properties/${property.prop_id}/main.jpg`) : ["/images/default.jpg"],
        details: {
          beds: property.prop_numbeds ?? "N/A",
          baths: property.prop_numbaths ?? "N/A",
          carSpots: property.prop_numcarspots ?? "N/A",
          furnished: property.prop_furnish ? "Yes" : "No",
        },
        description: property.prop_desc || 'Property description',
      };
  
      return {
        id: booking._id,
        date: formatDisplayDate(booking.start),
        property: propertyData.address,
        time: formatTime(booking.start, booking.end),
        agent: `${agent.agent_fname || 'Unknown'} ${agent.agent_lname || 'Agent'}`,
        image: propertyData.imageUrls[0],
        activityType: booking.activity_type || 'Standard',
        availabilityType: booking.availability_type || 'Inspection',
        status: booking.status,
        bookingDate: booking.createdAt,
        propertyDetails: {
          price: propertyData.price,
          bedrooms: propertyData.details.beds,
          bathrooms: propertyData.details.baths,
          parking: propertyData.details.carSpots
        },
        fullPropertyData: propertyData,
        property_id: propertyData.id
      };
    });
  
    // Filter events based on selected filters
    const filteredEvents = transformedEvents.filter(event => {
      const agentMatch = selectedAgents.includes('All Agents') || selectedAgents.includes(event.agent);
      const propertyMatch = selectedAvailabilities.includes('All Availabilities') || 
        selectedAvailabilities.some(availabilityType => event.availabilityType.toLowerCase().includes(availabilityType.toLowerCase()));
      const dateMatch = selectedDates.includes('All Dates') || 
        selectedDates.some(date => event.date.includes(date));
      const searchMatch = searchTerm === '' || 
        event.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.activityType.toLowerCase().includes(searchTerm.toLowerCase())||
        event.availabilityType.toLowerCase().includes(searchTerm.toLowerCase());
      
      return agentMatch && propertyMatch && dateMatch && searchMatch;
    });
    
    // Group filtered events by date
    const eventsByType = groupEventsByType(filteredEvents);
    
    // Generate filter options from actual data
    const agentOptions = ['All Agents', ...new Set(transformedEvents.map(e => e.agent))];
    const availabilityOptions = ['All Availabilities', ...new Set(transformedEvents.map(e => e.availabilityType))];
    const dateOptions = ['All Dates', ...new Set(transformedEvents.map(e => e.date))];
  
    const handleCheckboxChange = (value, type, setterFunction, currentValues) => {
      if (value === `All ${type}`) {
        setterFunction([`All ${type}`]);
      } else {
        const newValues = currentValues.includes(`All ${type}`) 
          ? [value]
          : currentValues.includes(value) 
            ? currentValues.filter(item => item !== value)
            : [...currentValues.filter(item => item !== `All ${type}`), value];
        
        if (newValues.length === 0) {
          setterFunction([`All ${type}`]);
        } else {
          setterFunction(newValues);
        }
      }
    };
  
    if (loading) {
      return (
        <div className="bg-[#FFF8E9] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading all upcoming inspections...</p>
          </div>
        </div>
      );
    }


  return (
    <div className="bg-[#FFF8E9] min-h-screen pb-20"> 
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">All Upcoming Open Houses and Inspections</h2>
          <p className="text-gray-600">All upcoming property open houses and inspections in one place!</p>
        </div>

        {/* Search and Filter */}
        <div className="p-6 rounded-xl mb-8 flex gap-4 relative" style={{backgroundColor: '#CBADD8'}}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search agent, property, or activity type..."
              className="pl-10 p-3 rounded-md w-full border-0 focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white hover:bg-gray-50 px-6 py-3 rounded-md font-semibold flex items-center gap-2 text-purple-600"
          >
            <Filter size={18} />
            Filters
            {(selectedAgents.length > 1 || selectedAvailabilities.length > 1 || selectedDates.length > 1 || 
              !selectedAgents.includes('All Agents') || !selectedAvailabilities.includes('All Properties') || 
              !selectedDates.includes('All Dates')) && (
              <span className="bg-purple-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                Active
              </span>
            )}
          </button>
          
          {/* Filter Modal */}
          {showFilters && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border p-6 z-50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Filter by:</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X size={20} className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              
              {/* Agent Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center justify-between">
                  Agent ({agentOptions.length - 1} available)
                  <ChevronDown size={16} />
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {agentOptions.map(agent => (
                    <label key={agent} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedAgents.includes(agent)}
                        onChange={() => handleCheckboxChange(agent, 'Agents', setSelectedAgents, selectedAgents)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm">{agent}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Availability Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center justify-between">
                  Availability ({availabilityOptions.length - 1} available)
                  <ChevronDown size={16} />
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availabilityOptions.map(availabilityType => (
                    <label key={availabilityType} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedAvailabilities.includes(availabilityType)}
                        onChange={() => handleCheckboxChange(availabilityType, 'Properties', setSelectedAvailabilities, selectedAvailabilities)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm truncate">{availabilityType}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Date Filter */}
              <div className="mb-4">
                <h4 className="font-medium mb-3 flex items-center justify-between">
                  Date ({dateOptions.length - 1} available)
                  <ChevronDown size={16} />
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {dateOptions.map(date => (
                    <label key={date} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedDates.includes(date)}
                        onChange={() => handleCheckboxChange(date, 'Dates', setSelectedDates, selectedDates)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm">{date}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Events List */}
        {Object.keys(eventsByType).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">No upcoming inspections found</h3>
            <p className="text-gray-500">
              {availabilities.length === 0 
                ? "You haven't booked any inspections yet" 
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </div>
          ) : (
          <div className="space-y-8">

              {Object.keys(eventsByType).map(availabilityType => (
                <div key={availabilityType}>
                  <div className="flex items-center mb-6">
                    <div className="border-t border-gray-400 flex-grow"></div>
                    <h3 className="text-xl text-gray-600 font-medium px-4">{availabilityType}</h3>
                    <div className="border-t border-gray-400 flex-grow"></div>
                  </div>
                  
                  {eventsByType[availabilityType].map(event => (
                    <Link
                      key={event.property_id}
                      to={`/TenDetailedPropListing/${event.property_id}`}>
                      <div key={event.id} className="rounded-lg mb-4 flex overflow-hidden shadow-sm" style={{backgroundColor: '#EADAFF'}}>
                        <div className="w-48 h-32 flex-shrink-0">
                          <img src={event.image} alt="Property" className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="p-6 flex-grow">
                          <h4 className="text-xl underline font-extrabold text-gray-800">{event.property}</h4>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-800">{event.date}</h4>
                          </div>
                          <p className="text-gray-700 font-medium mb-3">{event.time}</p>

                        </div>
                        
                        <div className="bg-white rounded-lg m-4 p-6 w-64">
                          <h5 className="font-semibold text-gray-600 mb-1">Agent: {event.agent}</h5>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
          </div>
        )}
      </main> 
      <div className="h-16 bg-[#CBADD8]" />
    </div>
  );
};