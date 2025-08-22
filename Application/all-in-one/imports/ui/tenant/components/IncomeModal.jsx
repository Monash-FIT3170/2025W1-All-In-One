import React, { useState, useEffect } from 'react';

function IncomeModal({ open, onClose, onSave, income }) {
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [documents, setDocuments] = useState('');
  const [public_id, setPublicId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  const cloudName = 'dcceytydt'; // Replace with your Cloudinary cloud name
  const uploadPreset = 'q3as54rftg7'; // Replace with your unsigned preset name

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        console.log('Uploaded Image URL:', data.secure_url);
      } else {
        console.error('Upload error:', data);
      }
      setDocuments(data.secure_url);
      setPublicId(data.public_id);
    } catch (err) {
      console.error('Upload failed:', err);
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


    // Clear fields after save
    setType('');
    setAmount('');
    setDocuments('');
    setPublicId('');
    setImageUrl('');
    setUploadSuccess(false);
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

        <div className="p-6">
            <label
              htmlFor="dropzone-file"
              className="cursor-pointer inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#9747FF] text-white font-semibold hover:bg-violet-900 transition"
            >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Upload Image
          </label>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
          />

          {uploading && <p className="mt-4 text-yellow-600">Uploading...</p>}

        </div>
        {imageUrl && <p className="mt-4 text-green-600">Upload complete!</p>}

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