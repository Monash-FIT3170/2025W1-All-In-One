import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Calendar } from './components/Calendar.jsx';
import { Mail, BedDouble, ShowerHead, CarFront } from 'lucide-react';
import { mockData } from '/imports/api/database/mockData.js';
import AgentNavbar from './components/AgentNavbar.jsx';
import KPISection from './components/KPISection.jsx';
import { useTracker } from 'meteor/react-meteor-data';
import { ExpressionOfInterest, Properties, RentalApplications, Tenants, Employment } from '/imports/api/database/collections.js';
import { Tickets } from '/imports/api/database/collections.js';
import { AgentAvailabilities } from '/imports/api/database/collections.js';
import EOIList from './components/EOIList.jsx';
import TicketList from './components/TicketList.jsx';

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

  const [openEOIModal, setOpenEOIModal] = useState(false);
  const [openTicketsModal, setOpenTicketsModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);


  /**
   * Fetch inspection availabilities created in the calendar for tenants
   * Shows inspections scheduled in the next month via AgentAvailabilities
   */
  const upcomingInspections = useTracker(() => {
    // Subscribe to necessary collections
    const availHandle = Meteor.subscribe('agentAvailabilities');
    const tenantsHandle = Meteor.subscribe('tenants');
    const employmentHandle = Meteor.subscribe('employment');

    const isLoading = !availHandle.ready() || !tenantsHandle.ready() || !employmentHandle.ready();
    if (isLoading) return [];

    const agentId = Meteor.userId();
    if (!agentId) return [];

    // Calculate date range (inspections in the next month)
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    // Find inspection availabilities created by this agent that are booked
    const bookedInspections = AgentAvailabilities.find({
      agent_id: agentId,
      availability_type: 'Inspection',
      status: 'booked',
      start: {
        $gte: today.toISOString(),
        $lte: oneMonthFromNow.toISOString()
      },
      tenant: { $exists: true }
    }).fetch();

    // Map to display format
    return bookedInspections.map(inspection => {
      const tenant = Tenants.findOne({ ten_id: inspection.tenant?.tenantId });
      const employment = tenant ? Employment.findOne({ ten_id: tenant.ten_id }) : null;

      if (!tenant) return null;

      return {
        availability_id: inspection._id,
        ten_id: tenant.ten_id,
        ten_fn: tenant.ten_fn,
        ten_ln: tenant.ten_ln,
        ten_dob: tenant.ten_dob,
        ten_email: tenant.ten_email,
        property: {
          image: inspection.property?.image || inspection.image || '/images/default.jpg',
          address: inspection.property?.address || 'N/A',
          price: inspection.property?.price || inspection.price || 0,
          bedrooms: inspection.property?.bedrooms || inspection.bedrooms || 0,
          bathrooms: inspection.property?.bathrooms || inspection.bathrooms || 0,
          parking: inspection.property?.parking || inspection.parking || 0,
        },
        inspection_date: new Date(inspection.start),
        age: calculateAge(tenant.ten_dob),
        occupation: employment ? employment.emp_job_title : '—',
      };
    }).filter(item => item !== null);
  }, []);

  // reactive count of pending EOIs
  const pendingEOICount = useTracker(() => {
    // subscribe to collections 
    Meteor.subscribe('expressionOfInterest');
    Meteor.subscribe('properties');

    // get this agent’s ID (depends on your login setup)
    const agentId = Meteor.userId();

    // find properties belonging to this agent
    const agentProps = Properties.find({ agent_id: agentId }).map(p => p.prop_id);

    // count EOIs for those properties that are still pending
    return ExpressionOfInterest.find({
      propertyID: { $in: agentProps },
      $or: [
        { inviteSent: false }
      ]
  }).count();
  }, []);

  /**
   * Send inspection reminder emails to tenants with upcoming booked inspections
   */
  const handleSendInspectionEmails = async (availabilityId = null) => {
    setSendingEmail(true);
    setEmailStatus(null);

    try {
      // If specific availability ID, send to that tenant only
      // Otherwise send to all tenants with upcoming inspections
      const inspectionsToEmail = availabilityId
        ? upcomingInspections.filter(i => i.availability_id === availabilityId)
        : upcomingInspections;

      let successCount = 0;
      let failCount = 0;

      for (const inspection of inspectionsToEmail) {
        try {
          await Meteor.callAsync('inspection.sendBookingEmail', inspection.availability_id, []);
          successCount++;
        } catch (err) {
          console.error(`Failed to send email for inspection ${inspection.availability_id}:`, err);
          failCount++;
        }
      }

      setEmailStatus({
        type: successCount > 0 ? 'success' : 'error',
        message: `Sent ${successCount} reminder(s), ${failCount} failed.`
      });
    } catch (error) {
      console.error('Error sending inspection emails:', error);
      setEmailStatus({
        type: 'error',
        message: error.reason || 'Failed to send inspection emails'
      });
    } finally {
      setSendingEmail(false);

      // Clear status message after 5 seconds
      setTimeout(() => {
        setEmailStatus(null);
      }, 5000);
    }
  };

  const unresolvedTicketsCount = useTracker(() => {
    const subTickets = Meteor.subscribe('tickets'); // full publish already exists
    if (!subTickets.ready()) return 0;

    const agentId = Meteor.userId();

    return Tickets.find({
      agent_id: agentId,
      status: 'Active'
  }).count();
  }, []);

  const unbookedAvailabilitiesCount = useTracker(() => {
    const subAvail = Meteor.subscribe('agentAvailabilities');
    if (!subAvail.ready()) return 0;

    const agentId = Meteor.userId();

    return AgentAvailabilities.find({
      agent_id: agentId,
      $or: [
        { tenant: { $exists: false } },
        { tenant: null }
      ]
  }).count();
}, []);

  // KPI
  const kpis = [
    { label: 'Pending EOIs', value: pendingEOICount, actionLabel: 'View EOIs', onAction: () => setOpenEOIModal(true) },
    { label: 'Unscheduled Inspections', value: '7' },
    { label: 'Unbooked Availabilities', value: unbookedAvailabilitiesCount },
    { label: 'Unresolved Tickets', value: unresolvedTicketsCount, actionLabel: 'View Tickets', onAction: () => setOpenTicketsModal(true) },
  ];

  return (
    <div className="bg-[#FFF8E9] min-h-screen pb-20">
      {/* Navigation bar for agent interface */}
      <AgentNavbar />

      {/* KPI Section */}
      <KPISection kpis={kpis} />
      <EOIList
        isOpen={openEOIModal}
        onClose={() => setOpenEOIModal(false)}
        eois={[]} 
      />

      <TicketList
        isOpen={openTicketsModal}
        onClose={() => setOpenTicketsModal(false)}
      />

      {/* Calendar Section - Displays scheduling and appointment information */}
      <div className="mt-10">
        <Calendar />
      </div>

      {/* Tenant Inspection Section - Shows properties and tenants due for inspection */}
      <div className="px-8 pt-16">
        {/* Section header with title and description */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Tenant Inspection Due in a Month</h2>
            <p className="text-gray-600">All inspections due in one place!</p>
          </div>

          {/* Send All Emails Button */}
          {upcomingInspections.length > 0 && (
            <button
              onClick={() => handleSendInspectionEmails()}
              disabled={sendingEmail}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                sendingEmail
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <Mail size={20} />
              {sendingEmail ? 'Sending...' : 'Email All Tenants'}
            </button>
          )}
        </div>

        {/* Status Message */}
        {emailStatus && (
          <div className={`mb-4 p-4 rounded-lg ${
            emailStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {emailStatus.message}
          </div>
        )}

        {/* Visual separator */}
        <div className="border-t border-gray-300 mb-8"></div>

        {/* List of tenant-property pairs */}
        <div className="space-y-6">
          {upcomingInspections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No booked inspections in the next month.</p>
              <p className="text-gray-500 text-sm mt-2">Schedule inspections in the Calendar, then tenants can book them.</p>
            </div>
          ) : (
            upcomingInspections.map((tenant, idx) => (
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
                    <p className="text-gray-600 mb-1">Occupation: {tenant.occupation}</p>
                    {/* Inspection due date */}
                    <p className="text-purple-700 font-semibold mt-2">
                      Inspection Due: {new Date(tenant.inspection_date).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Contact button - Mail icon for contacting the tenant */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => handleSendInspectionEmails(tenant.availability_id)}
                      disabled={sendingEmail}
                      className={`p-3 rounded-lg transition-colors ${
                        sendingEmail
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                      title="Send inspection reminder email"
                    >
                      <Mail className="text-white" size={24} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;


