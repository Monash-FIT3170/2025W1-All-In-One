import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Ten_SettingsEmployment } from "/imports/api/database/collections";

function EmploymentSettings() {
  const tenId = Meteor.userId();

  const [notEmployed, setNotEmployed] = useState(false);
  const [empType, setEmpType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [employment, setEmployment] = useState(null);

  const [initialData, setInitialData] = useState(null); // for reactive button

  // fetch tenant employment record
  const tenantEmployment = useTracker(() => {
    Meteor.subscribe("tenSettingsEmployment", tenId);
    return Ten_SettingsEmployment.findOne({ ten_id: tenId });
  }, [tenId]);

  useEffect(() => {
  if (tenantEmployment) {
    const normalizedData = {
      emp_type: tenantEmployment.emp_type || "",
      emp_comp: tenantEmployment.emp_comp || "",
      emp_job_title: tenantEmployment.emp_job_title || "",
      emp_start_date: tenantEmployment.emp_start_date?.toISOString().slice(0,10) || "",
    };

    setEmployment(tenantEmployment);
    setEmpType(normalizedData.emp_type);
    setCompanyName(normalizedData.emp_comp);
    setJobTitle(normalizedData.emp_job_title);
    setStartDate(normalizedData.emp_start_date);
    setNotEmployed(false);

    setInitialData(normalizedData); // keep snapshot for comparison
  } else {
    setEmployment(null);
    setEmpType("");
    setCompanyName("");
    setJobTitle("");
    setStartDate("");
    setNotEmployed(true);

    setInitialData(null);
  }
}, [tenantEmployment]);

  const isDirty = () => {
  if (notEmployed) return true; // toggling this is a change
  if (!initialData) {
    return empType || companyName || jobTitle || startDate;
  }
  return (
    empType !== initialData.emp_type ||
    companyName !== initialData.emp_comp ||
    jobTitle !== initialData.emp_job_title ||
    startDate !== initialData.emp_start_date
  );
};

  const handleSubmit = () => {
    if (notEmployed) {
      if (employment) {
        Meteor.call(
          "tenantEmployment.remove",
          employment.employment_id,
          (err) => {
            setStatusMessage(
              err ? `Error: ${err.message}` : "Marked as not employed"
            );
          }
        );
      } else {
        setStatusMessage("No employment record to remove");
      }
      return;
    }

    // validation for required fields
    if (!empType || !companyName.trim() || !jobTitle.trim() || !startDate) {
      setStatusMessage("Please fill in all fields before saving.");
      return;
    }

    const employmentData = {
      emp_type: empType,
      emp_comp: companyName,
      emp_job_title: jobTitle,
      emp_start_date: new Date(startDate),
      emp_verification: "null"
    };

    if (employment?.employment_id) {
      Meteor.call(
        "tenantEmployment.update",
        employment.employment_id,
        employmentData,
        (err) => {
          setStatusMessage(
            err
              ? `Error updating employment: ${err.message}`
              : "Employment added successfully."
          );
        }
      );
    } else {
      Meteor.call("tenantEmployment.insert", employmentData, (err) => {
        setStatusMessage(
          err
            ? `Error saving employment: ${err.message}`
            : "Employment added successfully"
        );
      });
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Current Employment</h3>
      <p className="text-gray-600 text-sm mb-6">
        Your current employment will be taken into account for the application.
      </p>

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={notEmployed}
            onChange={(e) => setNotEmployed(e.target.checked)}
            className="w-4 h-4 text-yellow-400 bg-gray-100 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            I am currently not employed
          </span>
        </label>
      </div>

      {!notEmployed && (
        <>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Employment Type</label>
            <select
              value={empType}
              onChange={(e) => setEmpType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled>
                Select your employment type
              </option>
              <option value="Part Time">Part Time</option>
              <option value="Casual">Casual</option>
              <option value="Full Time">Full Time</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="E.g. Google"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="E.g. Manager"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </>
      )}

      <button
  onClick={handleSubmit}
  disabled={!isDirty()}
  className={`px-6 py-2 rounded-full font-semibold transition
    ${isDirty()
      ? "bg-[#9747FF] text-white hover:bg-violet-900"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"}
  `}
>
        Save Details
      </button>

      {statusMessage && (
        <p className="mt-4 text-sm text-green-600">{statusMessage}</p>
      )}
    </div>
  );
}

export default EmploymentSettings;
