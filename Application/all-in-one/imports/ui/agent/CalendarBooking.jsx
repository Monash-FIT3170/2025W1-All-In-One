import React from 'react';
import { Calendar } from './components/Calendar.jsx';
import { Mail, BedDouble, ShowerHead, CarFront } from 'lucide-react';
import { mockTenants, mockProperties } from '../../api/mockData'; 

export const CalendarBooking = () => {
  // Pair each tenant with a property
  const tenantsWithProperties = mockTenants.slice(0, mockProperties.length).map((tenant, idx) => ({
    ...tenant,
    property: mockProperties[idx]
  }));

  return (
    <div className="bg-[#FFF8E9] min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-[#CBADD8]"> 
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-20 w-auto" />
        </div>
        <div className="flex gap-4">
          {['Dashboard', 'Applications', 'Properties'].map(label => (
            <button key={label} className="bg-[#9747FF] hover:bg-purple-200 text-white px-4 py-2 rounded-full font-semibold">
              {label}
            </button>
          ))}
          <button className="bg-[#9747FF] hover:bg-purple-200 text-white px-4 py-2 rounded-full font-semibold">Log out</button>
          <img src="/user-avatar.png" alt="User" className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* Calendar */}
      <div className="mt-20">
        <Calendar />
      </div>

      {/* Tenant Inspection Section */}
      <div className="px-8 pt-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Tenant Inspection Due in a Month</h2>
          <p className="text-gray-600">All inspections due in one place!</p>
        </div>

        {/* Divider line */}
        <div className="border-t border-gray-300 mb-8"></div>

        <div className="space-y-6">
          {tenantsWithProperties.map((tenant, idx) => (
            <div key={idx} className="flex gap-6 items-center">
              {/* Property Card */}
              <div className="relative bg-white rounded-lg shadow-sm overflow-hidden w-80">
                <img 
                  src={tenant.property.image} 
                  alt="Property" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white">
                    <div className="text-xl font-bold mb-2">${tenant.property.price} per week</div>
                    <div className="text-sm mb-2">{tenant.property.name}</div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <BedDouble className="w-4 h-4 text-white" />
                          <span>{tenant.property.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShowerHead className="w-4 h-4 text-white" />
                          <span>{tenant.property.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CarFront className="w-4 h-4 text-white" />
                          <span>{tenant.property.parking}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tenant Info Card */}
              <div className="flex-1 rounded-lg p-6 relative" style={{backgroundColor: '#CBADD8'}}>
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">{tenant.name}</h3>
                  <p className="text-gray-600 mb-1">Age: {tenant.age || '-'}</p>
                  <p className="text-gray-600">Occupation: {tenant.occupation || '-'}</p>
                </div>
                
                {/* Mail Icon */}
                <div className="absolute top-4 right-4">
                  <div className="bg-purple-600 p-3 rounded-lg">
                    <Mail className="text-white" size={24} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
