import React from 'react';
import { Calendar } from './components/Calendar.jsx';
import { Mail, BedDouble, ShowerHead, CarFront } from 'lucide-react';
// import { mockData } from '../../../api/database/mockData.js';
import { mockData } from '/imports/api/database/mockData.js';
import AgentNavbar from './components/AgentNavbar.jsx';



const AgentDashboard = () => {
  // Helper: Calculate age from DOB
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Pair each tenant with a property manually
  const tenantsWithProperties = mockData.tenants.slice(0, mockData.properties.length).map((tenant, idx) => {
    const property = mockData.properties[idx];
    const employment = mockData.employment.find(emp => emp.ten_id === tenant.ten_id);

    return {
      ...tenant,
      property: {
        image: '/images/properties/' + property.prop_id + '/main.jpg',
        address: property.prop_address,
        price: property.prop_pricepweek,
        bedrooms: property.prop_numbeds,
        bathrooms: property.prop_numbaths,
        parking: property.prop_numcarspots,
      },
      age: calculateAge(tenant.ten_dob),
      occupation: employment ? employment.emp_job_title : '—',
    };
  });


  return (
    <div className="bg-[#FFF8E9] min-h-screen pb-20">
      <AgentNavbar />

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
                    <div className="text-sm mb-2">{tenant.property.address}</div>
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

              {/* Tenant Info Card */}
              <div className="flex-1 rounded-lg p-6 relative" style={{backgroundColor: '#CBADD8'}}>
                <div className="bg-white rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">{tenant.ten_fn} {tenant.ten_ln}</h3>
                  <p className="text-gray-600 mb-1">Age: —</p> {/* You can calculate age if needed */}
                  <p className="text-gray-600">Occupation: —</p> {/* Can pull from employment if joined */}
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

export default AgentDashboard;


