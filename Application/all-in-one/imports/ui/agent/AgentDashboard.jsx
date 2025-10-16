import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Calendar } from './components/Calendar.jsx';
import { Mail, BedDouble, ShowerHead, CarFront } from 'lucide-react';
import { Properties, Tenants } from '/imports/api/database/collections.js';
import AgentNavbar from './components/AgentNavbar.jsx';

const AgentDashboard = () => {
  const { tenantsWithProperties } = useTracker(() => {
    const propSub = Meteor.subscribe('properties');
    const tenantSub = Meteor.subscribe('tenants');

    if (!propSub.ready() || !tenantSub.ready()) return { tenantsWithProperties: [] };

    const properties = Properties.find({ tenant_id: { $exists: true }, inspected_date: { $exists: true } }).fetch();
    const tenants = Tenants.find().fetch();

    const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
    };

    const calculateLabel = (inspectedDate) => {
      if (!inspectedDate) return null;
      const inspected = new Date(inspectedDate);
      const today = new Date();
      const monthsDiff = (today.getFullYear() - inspected.getFullYear()) * 12 + (today.getMonth() - inspected.getMonth());
      if (monthsDiff >= 5 && monthsDiff < 6) return 'upcoming';
      if (monthsDiff >= 6) return 'overdue';
      return null;
    };

    return {
      tenantsWithProperties: properties
        .map((prop) => {
          const tenant = tenants.find((t) => t.ten_id === prop.tenant_id);
          if (!tenant) return null;

          const label = calculateLabel(prop.inspected_date);
          if (!label) return null;

          return {
            ...tenant,
            property: {
              image: `/images/properties/${prop.prop_id}/main.jpg`,
              address: prop.prop_address,
              price: prop.prop_pricepweek,
              bedrooms: prop.prop_numbeds,
              bathrooms: prop.prop_numbaths,
              parking: prop.prop_numcarspots,
            },
            age: calculateAge(tenant.ten_dob),
            inspectionStatus: label,
          };
        })
        .filter(Boolean),
    };
  });

  return (
    <div className="bg-[#FFF8E9] min-h-screen pb-20">
      <AgentNavbar />
      <div className="mt-20">
        <Calendar />
      </div>

      <div className="px-8 pt-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Tenant Inspection Due in a Month</h2>
          <p className="text-gray-600">All inspections due in one place!</p>
        </div>

        <div className="border-t border-gray-300 mb-8"></div>

        <div className="space-y-6">
          {tenantsWithProperties.map((tenant, idx) => (
            <div key={idx} className="flex gap-6 items-center">
              <div className="relative bg-white rounded-lg shadow-sm overflow-hidden w-80">
                <img src={tenant.property.image} alt="Property" className="w-full h-48 object-cover" />
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
                    <div className={`mt-2 font-semibold ${tenant.inspectionStatus === 'upcoming' ? 'text-yellow-300' : 'text-red-500'}`}>
                      {tenant.inspectionStatus.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 rounded-lg p-6 relative" style={{ backgroundColor: '#CBADD8', height: '12rem' }}>
                <div className="bg-white rounded-lg p-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{tenant.ten_fn} {tenant.ten_ln}</h3>
                    <p className="text-gray-600 mb-1">Age: {tenant.age}</p>
                  </div>

                  <div className="absolute top-4 right-4">
                    <div className="bg-purple-600 p-3 rounded-lg">
                      <Mail className="text-white" size={24} />
                    </div>
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
