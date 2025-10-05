import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Incomes, RentalApplications, Ten_SettingsIncomes } from '/imports/api/database/collections';
import IncomeModal from '../components/IncomeModal';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

function Income({ propId, tenId }) {
  const [openModal, setOpenModal] = useState(false);
  const [rentalAppId, setRentalAppId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [editingIncome, setEditingIncome] = useState(null);

  const rentalApp = useTracker(() => {
    Meteor.subscribe('rentalApplications');
    return RentalApplications.findOne({ prop_id: propId, ten_id: tenId });
  }, [propId, tenId]);

  useEffect(() => {
    if (rentalApp) {
      setRentalAppId(rentalApp._id);
    }
  }, [rentalApp]);

  const incomes = useTracker(() => {
    if (!rentalAppId) return [];
    Meteor.subscribe('incomes');
    return Incomes.find({ rental_app_id: rentalAppId }).fetch();
  }, [rentalAppId]);

  // data for income settings for prefilling
  const settingsIncome = useTracker(() => {
    const handle = Meteor.subscribe('tenSettingsIncomes');
    if (!handle.ready()) return null;
    return Ten_SettingsIncomes.findOne({ ten_id: tenId });
  }, [tenId]);

  // handler to load income from settings
  const handleLoadFromProfile = () => {
    if (!rentalAppId) {
      setStatusMessage('Please complete the general section first.');
      return;
    }

    if (!settingsIncome) {
      setStatusMessage('No income data found in your profile.');
      return;
    }

    const newIncome = {
      inc_id: Random.id(),
      rental_app_id: rentalAppId,
      inc_type: settingsIncome.inc_type || '',
      inc_amt: settingsIncome.inc_amt || 0,
      inc_supporting_doc: settingsIncome.inc_supporting_doc || '',
      inc_public_id: settingsIncome.inc_public_id || '',
    };

    Meteor.call('incomes.insert', newIncome, (err) => {
      if (err) {
        setStatusMessage(`Error loading income from profile: ${err.message}`);
      } else {
        setStatusMessage('Income loaded from profile successfully! You can now edit it here.');
      }
    });
  };

  const handleAddIncome = async (incomeData) => {
    if (!rentalAppId) {
      setStatusMessage('Please complete the general section first.');
      return;
    }

    let cloudinaryResponse = {};
    if (incomeData.file) {
      try {
        cloudinaryResponse = await uploadToCloudinary(incomeData.file);
      } catch (err) {
        setStatusMessage(`File upload failed: ${err.message}`);
        return;
      }
    }

    const newIncome = {
      inc_id: Random.id(),
      rental_app_id: rentalAppId,
      inc_type: incomeData.type,
      inc_amt: parseFloat(incomeData.amount),
      inc_supporting_doc: cloudinaryResponse.url || incomeData.documents || '',
      inc_public_id: cloudinaryResponse.public_id || incomeData.public_id || '',
    };

    Meteor.call('incomes.insert', newIncome, (err) => {
      if (err) {
        setStatusMessage(`Error saving income document: ${err.message}`);
      } else {
        setStatusMessage(editingIncome
          ? 'Income document updated successfully.'
          : 'Income document added successfully.');

        if (editingIncome?.inc_id) {
          Meteor.call('incomes.remove', editingIncome.inc_id);
        }
      }
    });

    setOpenModal(false);
    setEditingIncome(null);
  };

  const handleDeleteIncome = (incId) => {
    if (window.confirm('Are you sure you want to delete this income document?')) {
      Meteor.call('incomes.remove', incId, (err) => {
        setStatusMessage(err
          ? `Error deleting income document: ${err.message}`
          : 'Income document deleted.');
      });
    }
  };

  const handleEditIncome = (income) => {
    setEditingIncome({
      inc_id: income.inc_id,
      type: income.inc_type,
      amount: income.inc_amt,
      documents: income.inc_supporting_doc || '',
      public_id: income.inc_public_id || '',
    });
    setOpenModal(true);
  };

  const handleDownload = async (url, publicId, filename = 'income-document') => {
    try {
      let downloadUrl = url;
      if (publicId) {
        const extension = url.split('.').pop().toLowerCase();
        let resourceType = 'image';

        if (['mp4', 'webm', 'mov'].includes(extension)) {
          resourceType = 'video';
        } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(extension)) {
          resourceType = 'raw';
        }

        downloadUrl = `https://res.cloudinary.com/dcceytydt/${resourceType}/upload/fl_attachment/${publicId}`;
      }

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(url, '_blank');
    }
  };

  const renderMedia = (url, publicId) => {
    if (!url) return null;
    const extension = url.split('.').pop().toLowerCase();

    if (['mp4', 'webm', 'mov'].includes(extension)) {
      return (
        <div>
          <span className="text-xs text-purple-500">[Video]</span>
          <video
            className="w-full rounded-md border border-gray-300 mt-1"
            controls
            preload="metadata"
            style={{ maxHeight: '200px' }}
          >
            <source src={url} type={`video/${extension}`} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return (
        <div>
          <span className="text-xs text-green-600">[Image]</span>
          <img
            src={url}
            alt="Uploaded Income Document"
            className="w-full rounded-md border border-gray-300 mt-1 max-h-48 object-contain"
          />
        </div>
      );
    } else {
      return (
        <div>
          <span className="text-xs text-yellow-600">[Document]</span>
          <button 
            onClick={() => handleDownload(url, publicId, `income-document.${extension}`)}
            className="text-blue-600 underline bg-none border-none cursor-pointer p-0 font-inherit"
          >
            Download Document
          </button>
        </div>
      );
    }
  };

  // constants to check if settings income exists and can be loaded
  const hasProfileIncome= settingsIncome && (settingsIncome.inc_type || settingsIncome.inc_amt || settingsIncome.inc_supporting_doc);
  const hasExistingIncomes= incomes.length > 0;
  const canLoadFromProfile= hasProfileIncome && rentalAppId && !hasExistingIncomes;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Income</h3>
      <p className="text-gray-600 text-sm mb-6">
        Please provide supporting documents to help show that you can afford the rent.
      </p>

      <div className="mb-4">
        <label htmlFor="income" className="block mb-1 font-medium">Income</label>
        {/* MODIFIED: Added flex container with gap for both buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => {
              setEditingIncome(null);
              setOpenModal(true);
            }}
            className="bg-[#CBADD8] px-6 py-2 rounded-full font-semibold hover:bg-[#9747FF] hover:text-white transition"
          >
            Add Source
          </button>
          
          {/* Load from Profile button - only show if no existing incomes */}
          {!hasExistingIncomes && (
            <button
              onClick={handleLoadFromProfile}
              disabled={!canLoadFromProfile}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                canLoadFromProfile
                  ? 'bg-[#CBADD8] hover:bg-[#9747FF] hover:text-white transition'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={!rentalAppId ? 'Please complete the general section first' : !hasProfileIncome ? 'No income data in profile' : 'Load income from your profile'}
            >
              Load from Profile
            </button>
          )}
        </div>
        {/*Disclaimer text */}
        {canLoadFromProfile && (
          <p className="text-xs text-gray-500 mt-2 italic">
            You can edit the details in this application once loaded from profile
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {incomes.map((income) => (
          <div
            key={income.inc_id}
            className="bg-white p-5 rounded-lg shadow-md relative border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="absolute top-3 right-3 flex space-x-2">
              <button
                onClick={() => handleEditIncome(income)}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteIncome(income.inc_id)}
                className="text-red-500 hover:text-red-700 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <p className="font-semibold text-lg mb-2 truncate">{income.inc_type}</p>
            <p className="text-gray-700 text-sm">Amount: ${income.inc_amt}</p>
            {income.inc_supporting_doc && (
              <div className="mt-3">{renderMedia(income.inc_supporting_doc, income.inc_public_id)}</div>
            )}
          </div>
        ))}
      </div>

      <button
        className="bg-[#9747FF] text-white px-6 py-2 rounded-full font-semibold hover:bg-violet-900 hover:text-white transition"
        disabled
      >
        Save Details
      </button>

      {statusMessage && <p className="mt-4 text-green-600 text-sm">{statusMessage}</p>}

      <IncomeModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingIncome(null);
        }}
        onSave={handleAddIncome}
        income={editingIncome}
      />
    </div>
  );
}

export default Income;

