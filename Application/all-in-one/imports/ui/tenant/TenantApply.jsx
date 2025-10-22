import React, { useState } from 'react';
import GeneralSection from './applyPages/GeneralSection';
import PersonalDetails from './applyPages/PersonalDetails';
import AboutMe from './applyPages/AboutMe';
import AddressHistory from './applyPages/AddressHistory';
import EmploymentSection from './applyPages/Employment';
import Income from './applyPages/Income';
import Identity from './applyPages/Identity';
import Household from './applyPages/Household';
import SharedLease from './applyPages/SharedLease';
import Navbar from './components/TenNavbar';
import Footer from './components/Footer';
import { useLocation, useParams } from "react-router-dom";
import {
  RentalApplications,
  Properties,
  Tenants,
  Addresses,
  Incomes,
  Identities,
  Employment,
} from '/imports/api/database/collections';
import { useTracker } from 'meteor/react-meteor-data';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}


function Apply() {
  const { id } = useParams();
  const query = useQuery();
  const tenantId = query.get("tenantId");

  console.log("Property ID:", id);
  console.log("Tenant ID:", tenantId);

  const { rentalApplication, rentalReady } = useTracker(() => {
    const handle = Meteor.subscribe('rentalApplications');
    const doc = handle.ready()
      ? RentalApplications.findOne({ prop_id: id, ten_id: tenantId })
      : null;
    return { rentalApplication: doc, rentalReady: handle.ready() };
  }, [id, tenantId]);

  const property = useTracker(() => {
    Meteor.subscribe('properties');
    return Properties.findOne({ prop_id: id });
  }, [id]);

  console.log("Rental application:", rentalApplication);
  console.log("Property:", property);
  const { tenant, tenantReady } = useTracker(() => {
    const handle = Meteor.subscribe('tenants');
    const doc = handle.ready()
      ? Tenants.findOne({ ten_id: tenantId })
      : null;
    return { tenant: doc, tenantReady: handle.ready() };
  }, [tenantId]);

  const rentalAppId = rentalApplication?._id;

  const { addresses, addressesReady } = useTracker(() => {
    if (!rentalAppId) {
      return { addresses: [], addressesReady: true };
    }
    const handle = Meteor.subscribe('addresses');
    const ready = handle.ready();
    const docs = ready
      ? Addresses.find({ rental_app_id: rentalAppId }).fetch()
      : [];
    return { addresses: docs, addressesReady: ready };
  }, [rentalAppId]);

  const { incomes, incomesReady } = useTracker(() => {
    if (!rentalAppId) {
      return { incomes: [], incomesReady: true };
    }
    const handle = Meteor.subscribe('incomes');
    const ready = handle.ready();
    const docs = ready
      ? Incomes.find({ rental_app_id: rentalAppId }).fetch()
      : [];
    return { incomes: docs, incomesReady: ready };
  }, [rentalAppId]);

  const { identities, identitiesReady } = useTracker(() => {
    if (!rentalAppId) {
      return { identities: [], identitiesReady: true };
    }
    const handle = Meteor.subscribe('identities');
    const ready = handle.ready();
    const docs = ready
      ? Identities.find({ rental_app_id: rentalAppId }).fetch()
      : [];
    return { identities: docs, identitiesReady: ready };
  }, [rentalAppId]);

  const { employmentDoc, employmentReady } = useTracker(() => {
    const employmentId = rentalApplication?.employment_id;
    if (!employmentId || employmentId === null) {
      return { employmentDoc: null, employmentReady: true };
    }
    const handle = Meteor.subscribe('employment');
    const ready = handle.ready();
    const doc = ready
      ? Employment.findOne({ employment_id: employmentId })
      : null;
    return { employmentDoc: doc, employmentReady: ready };
  }, [rentalApplication?.employment_id]);

  const sectionList = [
    'General',
    'Personal Details',
    'About Me',
    'Address History',
    'Employment',
    'Income',
    'Identity',
    'Household',
    'Shared Lease',
  ];

  const [activeSection, setActiveSection] = useState(sectionList[0]);
  const [submitMessage, setSubmitMessage] = useState(null);
  const currentIndex = sectionList.indexOf(activeSection);
  const goNext = () => {
    if (currentIndex < sectionList.length - 1) {
      setActiveSection(sectionList[currentIndex + 1]);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setActiveSection(sectionList[currentIndex - 1]);
    }
  };

  const renderFormSection = () => {
  const sharedProps = { propId: id, tenId: tenantId };

  switch (activeSection) {
    case 'General':
      return <GeneralSection {...sharedProps} />;
    case 'Personal Details':
      return <PersonalDetails {...sharedProps} />;
    case 'About Me':
      return <AboutMe {...sharedProps} />;
    case 'Address History':
      return <AddressHistory {...sharedProps} />;
    case 'Employment':
      return <EmploymentSection {...sharedProps} />;
    case 'Income':
      return <Income {...sharedProps} />;
    case 'Identity':
      return <Identity {...sharedProps} />;
    case 'Household':
      return <Household {...sharedProps} />;
    case 'Shared Lease':
      return <SharedLease {...sharedProps} />;
    default:
      return <div>Select a section from the sidebar.</div>;
    }
  };

  const handleSubmitApplication = () => {
    setSubmitMessage(null);

    const dataStillLoading = !rentalReady || !tenantReady || !addressesReady || !incomesReady || !identitiesReady || !employmentReady;
    if (dataStillLoading) {
      setSubmitMessage({
        type: 'error',
        text: 'Application data is still loading. Please try again in a moment.',
      });
      return;
    }

    if (!rentalApplication) {
      setSubmitMessage({
        type: 'error',
        text: 'No rental application found. Please complete your application before submitting.',
      });
      return;
    }

    const missingSections = [];

    const leaseStartValue = rentalApplication.lease_start_date;
    const leaseStartValid =
      !!leaseStartValue &&
      !Number.isNaN(new Date(leaseStartValue).getTime());
    const hasLeaseTerm = Boolean(rentalApplication.lease_term && String(rentalApplication.lease_term).trim());
    const rentValue = Number(rentalApplication.app_rent);
    const hasRent = Number.isFinite(rentValue) && rentValue > 0;
    const inspectedSet = typeof rentalApplication.rental_app_prop_inspected === 'boolean';

    if (!leaseStartValid || !hasLeaseTerm || !hasRent || !inspectedSet) {
      missingSections.push('General');
    }

    const firstName = tenant?.ten_fn?.trim();
    const lastName = tenant?.ten_ln?.trim();
    const phone = tenant?.ten_pn?.trim();
    if (!firstName || !lastName || !phone) {
      missingSections.push('Personal Details');
    }

    const aboutMe = rentalApplication.app_desc ? rentalApplication.app_desc.toString().trim() : '';
    if (!aboutMe) {
      missingSections.push('About Me');
    }

    const normalizedAddresses = addresses.map((addr) => ({
      status: (addr.address_status || '').toLowerCase(),
    }));
    const hasCurrentAddress = normalizedAddresses.some((addr) => addr.status === 'current');
    const hasPastAddress = normalizedAddresses.some((addr) => addr.status === 'past');
    if (!hasCurrentAddress || !hasPastAddress) {
      missingSections.push('Address History');
    }

    const employmentId = rentalApplication.employment_id;
    const employmentComplete =
      employmentId === null ||
      (typeof employmentId === 'string' && employmentId.trim() && employmentDoc);
    if (!employmentComplete) {
      missingSections.push('Employment');
    }

    if (!incomes.length) {
      missingSections.push('Income');
    }

    if (!identities.length) {
      missingSections.push('Identity');
    }

    const hasHouseholdInfo =
      typeof rentalApplication.household_pets === 'boolean' &&
      (!rentalApplication.household_pets ||
        (rentalApplication.pet_description && rentalApplication.pet_description.trim()));
    if (!hasHouseholdInfo) {
      missingSections.push('Household');
    }

    if (missingSections.length > 0) {
      setActiveSection(missingSections[0]);
      setSubmitMessage({
        type: 'error',
        text: 'Please complete the following sections before submitting your application:',
        sections: missingSections,
      });
      return;
    }

    Meteor.call(
      "rentalApplications.update",
      rentalApplication._id,
      { submitted: true },
      (err, res) => {
        if (err) {
          setSubmitMessage({
            type: 'error',
            text: err.reason || "Error submitting application",
          });
          return;
        }
        if (res === 0) {
          setSubmitMessage({
            type: 'error',
            text: "No rental application found. Please complete your application before submitting.",
          });
          return;
        }

        Meteor.call(
          "rentalApplications.setStatus",
          rentalApplication._id,
          "Pending",
          (err2) => {
            if (err2) {
              setSubmitMessage({
                type: 'error',
                text: err2.reason || "Error setting status to Pending",
              });
            } else {
              setSubmitMessage({
                type: 'success',
                text: "Application submitted successfully!",
              });
            }
          }
        );
      }
    );
  };

  return (
    <>
    <div>
      <Navbar/>
      {/* Application Section */}
      <div className="flex flex-col p-8 bg-[#FFF8E9] min-h-screen">
        
        {/* Application Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Application</h1>
          <p className="text-gray-600">
            You are applying for the property listed at {property?.prop_address}
          </p>
        </div>

        {/* Content */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="flex flex-col w-1/4 bg-gray-100 p-4 rounded-lg shadow">
            {sectionList.map((item, index) => (
              <div
                key={index}
                onClick={() => setActiveSection(item)}
                className={`p-3 mb-2 rounded-md font-semibold cursor-pointer ${
                  item === activeSection ? 'bg-[#9747FF] text-white' : 'bg-transparent text-black hover:bg-violet-900 hover:text-white'
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main Form */}
          <div className="flex-1 bg-gray-50 p-6 rounded-lg shadow">
            {/* Step Indicator */}
            <div className="mb-4 text-sm text-gray-600 font-medium">
              Step {currentIndex + 1} of {sectionList.length}: {activeSection}
            </div>

            {/* Form Section */}
            {renderFormSection()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={goBack}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex === sectionList.length - 1}
                className="px-4 py-2 bg-[#9747FF] text-white text-gray-800 font-semibold rounded disabled:opacity-50 hover:bg-violet-900 hover:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex mt-12">
          <button
            onClick={handleSubmitApplication}
            className="px-6 py-3 bg-[#9747FF] text-white font-semibold rounded-lg shadow hover:bg-violet-900 transition"
          >
            Submit
          </button>
        </div>
        {submitMessage && (
          <div
            className={`mt-6 rounded-lg border px-5 py-4 text-sm ${
              submitMessage.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            <p className="font-semibold">{submitMessage.text}</p>
            {submitMessage.sections?.length ? (
              <ul className="mt-3 list-disc list-inside space-y-1">
                {submitMessage.sections.map((section) => (
                  <li key={section}>{section}</li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </div>
      <Footer/>
      </div>
    </>
  );
}

export default Apply;
