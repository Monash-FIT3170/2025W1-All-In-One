import React from 'react';
import { Calendar } from './components/Calendar.jsx';
import { Mail, BedDouble, ShowerHead, CarFront } from 'lucide-react';
import { mockData } from '/imports/api/database/mockData.js';
import AgentNavbar from './components/AgentNavbar.jsx';

/**
 * AgentDashboard Component
 * 
 * This component serves as the main dashboard for real estate agents, providing:
 * - A calendar view for scheduling and viewing appointments
 * - A tenant inspection section showing properties and tenants due for inspection
 * - Property cards with key details (price, address, bedrooms, bathrooms, parking)
 * - Tenant information cards with personal details and contact options
 * 
 * The dashboard displays mock data from the mockData.js file, pairing tenants
 * with properties for demonstration purposes.
 * 
 * @returns {JSX.Element} The rendered dashboard component
 */
const AgentDashboard = () => {
  /**
   * Calculates the age of a person based on their date of birth
   * 
   * @param {string} dob - Date of birth in string format (e.g., "1990-01-01")
   * @returns {number} The calculated age in years
   */
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * Creates a combined dataset of tenants and their associated properties
   * This manually pairs tenants with properties for demonstration purposes
   * 
   * @type {Array} Array of tenant objects with property and employment information
   */
  const tenantsWithProperties = mockData.tenants.slice(0, mockData.properties.length).map((tenant, idx) => {
    const property = mockData.properties[idx];
    // Find employment information for the current tenant
    const employment = mockData.employment.find(emp => emp.ten_id === tenant.ten_id);

    return {
      ...tenant,
      property: {
        image: `/images/properties/${property.prop_id}/main.jpg`,
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
      {/* Navigation bar for agent interface */}
      <AgentNavbar />

      {/* Calendar Section - Displays scheduling and appointment information */}
      <div className="mt-20">
        <Calendar />
      </div>

      {/* Tenant Inspection Section - Shows properties and tenants due for inspection */}
      <div className="px-8 pt-16">
        {/* Section header with title and description */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Tenant Inspection Due in a Month</h2>
          <p className="text-gray-600">All inspections due in one place!</p>
        </div>
        
        {/* Visual separator */}
        <div className="border-t border-gray-300 mb-8"></div>
        
        {/* List of tenant-property pairs */}
        <div className="space-y-6">
          {tenantsWithProperties.map((tenant, idx) => (
            <div key={idx} className="flex gap-6 items-center">
              {/* Property Card - Displays property image and key details */}
              <div className="relative bg-white rounded-lg shadow-sm overflow-hidden w-80">
                <img src={tenant.property.image} alt="Property" className="w-full h-48 object-cover" />
                
                {/* Property details overlay on the image */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white">
                    {/* Weekly rent price */}
                    <div className="text-xl font-bold mb-2">${tenant.property.price} per week</div>
                    
                    {/* Property address */}
                    <div className="text-sm mb-2">{tenant.property.address}</div>
                    
                    {/* Property features (bedrooms, bathrooms, parking) */}
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

              {/* Tenant Information Card - Displays tenant details and contact option */}
              <div className="flex-1 rounded-lg p-6 relative" style={{ backgroundColor: '#CBADD8' }}>
                <div className="bg-white rounded-lg p-6">
                  {/* Tenant name */}
                  <h3 className="text-xl font-semibold mb-2">{tenant.ten_fn} {tenant.ten_ln}</h3>
                  
                  {/* Tenant age and occupation */}
                  <p className="text-gray-600 mb-1">Age: {tenant.age}</p>
                  <p className="text-gray-600">Occupation: {tenant.occupation}</p>
                </div>

                {/* Contact button - Mail icon for contacting the tenant */}
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

