import React, { useState, useEffect } from 'react';

function IncomeModal({ open, onClose, onSave, income }) {
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [documents, setDocuments] = useState('');
  const [public_id, setPublicId] = useState('');
  const [uploading, setUploading] = useState(false);

  // When the modal opens or income changes, prefill the form if editing
  useEffect(() => {
    if (income) {
      setType(income.type || '');
      setAmount(income.amount || '');
      setDocuments(income.documents || '');
      setPublicId(income.public_id || '');
    } else {
      // Reset when no income (adding new)
      setType('');
      setAmount('');
      setDocuments('');
      setPublicId('');
    }
  }, [income, open]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const fileType = file.type;
    let resourceType = 'image';

    if (fileType.startsWith('video/')) {
      resourceType = 'video';
    } else if (fileType === 'application/pdf' || fileType.startsWith('application/')) {
      resourceType = 'raw';
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'All in one');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dcceytydt/${resourceType}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setDocuments(data.secure_url);
        console.log(data.public_id + " 1 ");
        setPublicId(data.public_id);
      } else {
        alert('Upload failed: no URL returned.');
      }
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      alert('Upload failed, please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!type || !amount) {
      return alert("Please fill in the required fields.");
    }

    console.log(public_id);
    onSave({
      type,
      amount,
      documents,
      public_id,
    });

    // No need to reset here because useEffect handles it on modal close/open
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-[#CBADD8] p-8 rounded-lg shadow-lg w-[90%] max-w-md relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl font-bold focus:outline-none"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-1">
          {income ? 'Edit Income Source' : 'Add Income Source'}
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          Please fill out the following to {income ? 'edit' : 'add'} income source.
        </p>

        <div className="border-t border-gray-300 mb-6"></div>

        {/* Income Type */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Income Type</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="E.g. Employment, pension..."
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
        </div>

        {/* Annual Amount */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Annual Amount (AUD)</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in AUD"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
        </div>

        {/* Upload Supporting Documents */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Upload Supporting Documents</label>
          <input
            type="file"
            accept="image/*,.pdf,video/*"
            onChange={handleFileUpload}
            className="w-full text-sm"
          />
          {uploading && <p className="text-sm text-gray-600 mt-1">Uploading...</p>}
          {documents && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-green-700">Uploaded successfully!</p>
              <a
                href={documents}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                View Uploaded Document
              </a>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-black text-white px-6 py-2 rounded-full text-sm hover:bg-gray-800"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : income ? 'Update Income Source' : 'Save Income Source'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default IncomeModal;