import React, { useState } from 'react';
import { Search, Calendar, Filter, ChevronDown, Home, MessageSquare, Ticket, LogOut, User } from 'lucide-react';

// Mock data for events
const mockEvents = [
  {
    id: 1,
    date: 'April 25th',
    property: 'Melton South, 3338',
    time: '1:00 - 2:00 pm',
    applicant: 'Tony Stark',
    age: 35,
    occupation: 'Iron Man',
    image: '/api/placeholder/400/240'
  },
  {
    id: 2,
    date: 'April 25th',
    property: 'Melton South, 3338',
    time: '2:00 - 3:00 pm',
    applicant: 'Bruce Wayne',
    age: 100,
    occupation: 'Batman',
    image: '/api/placeholder/400/240'
  },
  {
    id: 3,
    date: 'April 29th',
    property: 'Clayton North, 3168',
    time: '10:00 - 11:00 am',
    applicant: 'Harley Quinn',
    age: 25,
    occupation: 'Psychiatrist',
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

export const PropertyBooking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  
  // Group events by date
  const eventsByDate = groupEventsByDate(mockEvents);
  
  return (
     <div className="bg-[#FFF8E9] min-h-screen pb-20"> 
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-[#CEF4F1]"> 
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-12" />
          <span className="text-xl font-bold">All In One</span>
        </div>
        <div className="flex gap-4">
          {['Dashboard', 'Applications', 'Tickets', 'Properties'].map(label => (
            <button key={label} className="bg-[#FFE284] hover:bg-yellow-200 px-4 py-2 rounded-full font-semibold">
              {label}
            </button>
          ))}
          <button className="bg-[#FFE284] hover:bg-yellow-200 px-4 py-2 rounded-full font-semibold">Log out</button>
          <img src="/user-avatar.png" alt="User" className="w-10 h-10 rounded-full" />
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4">
        <div className="bg-orange-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800">View Events</h2>
          <p className="text-gray-600">All upcoming events in one place!</p>
          
          {/* Search and Filter */}
          <div className="bg-blue-100 p-4 rounded-xl mt-6 flex flex-wrap gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search Applicant..."
                className="pl-10 p-2 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative flex-1">
              <select 
                className="p-2 rounded-md w-full appearance-none"
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
              >
                <option value="">Select Property</option>
                <option value="melton">Melton South, 3338</option>
                <option value="clayton">Clayton North, 3168</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-500" size={18} />
            </div>
            
            <div className="relative w-32">
              <select className="p-2 rounded-md w-full appearance-none">
                <option>Filter</option>
                <option>By Date</option>
                <option>By Applicant</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-500" size={18} />
            </div>
          </div>
          
          {/* Edit Button */}
          <button className="bg-yellow-200 px-4 py-2 rounded-lg mt-4 font-medium">
            Edit Inspection Availability
          </button>
          
          {/* Events List */}
          <div className="mt-6">
            {Object.keys(eventsByDate).map(date => (
              <div key={date} className="mb-8">
                <div className="flex items-center">
                  <div className="border-t border-gray-400 flex-grow"></div>
                  <h3 className="text-xl text-gray-600 font-medium px-4">{date}</h3>
                  <div className="border-t border-gray-400 flex-grow"></div>
                </div>
                
                {eventsByDate[date].map(event => (
                  <div key={event.id} className="bg-blue-100 rounded-lg mt-4 flex overflow-hidden">
                    <div className="w-48 h-32">
                      <img src={event.image} alt="Property" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="p-4 flex-grow bg-blue-100">
                      <h4 className="text-lg font-medium text-gray-700">{event.property}</h4>
                      <p className="text-gray-600">{event.time}</p>
                    </div>
                    
                    <div className="bg-white rounded-lg m-3 p-4 w-60">
                      <h5 className="font-medium">{event.applicant}</h5>
                      <p className="text-gray-600">Age: {event.age}</p>
                      <p className="text-gray-600">
                        Occupation: {event.occupation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}


// Navigation Button Component
function NavButton({ label, active }) {
  return (
    <button 
      className={`px-4 py-2 rounded-full font-medium ${active ? 'bg-yellow-200 text-gray-800' : 'bg-yellow-100 text-gray-600'}`}
    >
      {label}
    </button>
  );
}