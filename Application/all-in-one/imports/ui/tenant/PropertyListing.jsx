import React, { useState } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';

// Mock data for events
const mockEvents = [
  {
    id: 1,
    date: 'April 25th',
    property: 'Melton South, 3338',
    time: '1:00 - 2:00 pm',
    agent: 'Michael Scott',
    image: '/api/placeholder/400/240'
  },
  {
    id: 2,
    date: 'April 25th',
    property: 'Caulfield, 3162',
    time: '4:00 - 5:00 pm',
    agent: 'Pam Beesly',
    image: '/api/placeholder/400/240'
  },
  {
    id: 3,
    date: 'April 29th',
    property: 'Clayton North, 3168',
    time: '10:00 - 11:00 am',
    agent: 'Dwight Schrute',
    image: '/api/placeholder/400/240'
  }
];

// Group events by date
const groupEventsByDate = (events) => {
  const grouped = {};
  events.forEach(event => {
    if (!grouped[event.date]) {
      grouped[event.date] = [];
    }
    grouped[event.date].push(event);
  });
  return grouped;
};

export default function PropertyListing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState(['All Agents']);
  const [selectedProperties, setSelectedProperties] = useState(['All Properties']);
  const [selectedDates, setSelectedDates] = useState(['All Dates']);
  
  // Filter events based on selected filters
  const filteredEvents = mockEvents.filter(event => {
    const agentMatch = selectedAgents.includes('All Agents') || selectedAgents.includes(event.agent);
    const propertyMatch = selectedProperties.includes('All Properties') || 
      selectedProperties.some(prop => event.property.includes(prop.split(',')[0]));
    const dateMatch = selectedDates.includes('All Dates') || 
      selectedDates.some(date => {
        if (date === '25/04/25') return event.date === 'April 25th';
        if (date === '29/04/25') return event.date === 'April 29th';
        return false;
      });
    const searchMatch = searchTerm === '' || 
      event.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.property.toLowerCase().includes(searchTerm.toLowerCase());
    
    return agentMatch && propertyMatch && dateMatch && searchMatch;
  });
  
  // Group filtered events by date
  const eventsByDate = groupEventsByDate(filteredEvents);
  
  const agents = ['All Agents', 'Michael Scott', 'Dwight Schrute', 'Pam Beesly'];
  const properties = ['All Properties', '123 Main Street, Melton South, VIC, Australia', '456 Sesame Street, Caulfield, VIC, Australia', '789 Hello Road, Clayton North, VIC, Australia'];
  const dates = ['All Dates', '25/04/25', '29/04/25'];

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
  
  return (
    <div className="bg-[#FFF8E9] min-h-screen pb-20"> 
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-[#CBADD8]"> 
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-20 w-auto" />
        </div>
        <div className="flex gap-4">
          {['Inspections', 'Applications', 'Properties'].map(label => (
            <button key={label} className="bg-[#9747FF] hover:bg-purple-200 text-white px-4 py-2 rounded-full font-semibold">
              {label}
            </button>
          ))}
          <button className="bg-[#9747FF] hover:bg-purple-200 text-white px-4 py-2 rounded-full font-semibold">Log out</button>
          <img src="/user-avatar.png" alt="User" className="w-10 h-10 rounded-full" />
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">View Inspections</h2>
          <p className="text-gray-600">All upcoming inspections in one place!</p>
        </div>
        
        {/* Search and Filter */}
        <div className="p-6 rounded-xl mb-8 flex gap-4 relative" style={{backgroundColor: '#CBADD8'}}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search agent or property address..."
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
                  Agent
                  <ChevronDown size={16} />
                </h4>
                <div className="space-y-2">
                  {agents.map(agent => (
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
              
              {/* Property Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 flex items-center justify-between">
                  Property
                  <ChevronDown size={16} />
                </h4>
                <div className="space-y-2">
                  {properties.map(property => (
                    <label key={property} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedProperties.includes(property)}
                        onChange={() => handleCheckboxChange(property, 'Properties', setSelectedProperties, selectedProperties)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm">{property}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Date Filter */}
              <div className="mb-4">
                <h4 className="font-medium mb-3 flex items-center justify-between">
                  Date
                  <ChevronDown size={16} />
                </h4>
                <div className="space-y-2">
                  {dates.map(date => (
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
        <div className="space-y-8">
          {Object.keys(eventsByDate).map(date => (
            <div key={date}>
              <div className="flex items-center mb-6">
                <div className="border-t border-gray-400 flex-grow"></div>
                <h3 className="text-xl text-gray-600 font-medium px-4">{date}</h3>
                <div className="border-t border-gray-400 flex-grow"></div>
              </div>
              
              {eventsByDate[date].map(event => (
                <div key={event.id} className="rounded-lg mb-4 flex overflow-hidden shadow-sm" style={{backgroundColor: '#CBADD8'}}>
                  <div className="w-48 h-32">
                    <img src={event.image} alt="Property" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="p-6 flex-grow">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{event.property}</h4>
                    <p className="text-gray-700 font-medium">{event.time}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg m-4 p-6 w-64">
                    <h5 className="font-semibold text-gray-600 mb-1">Agent Name: {event.agent}</h5>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}