import React, { useState, useEffect } from 'react';

function IdentityModal({ open, onClose, onSave, initialData }) {
  const [type, setType] = useState('');
  const [scan, setScan] = useState('');
  const [public_id, setPublicId] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type || '');
      setScan(initialData.scan || '');
      setDescription(initialData.description || '');
      setPublicId(initialData.public_id || '');
    } else {
      setType('');
      setScan('');
      setDescription('');
      setPublicId('');
    }
  }, [initialData]);

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
        setScan(data.secure_url);
        console.log(data.public_id+ " 1 ")
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
    if (!type || !scan) {
      alert('Please provide a document type and upload a file.');
      return;
    }
    console.log(public_id);
    onSave({ type, scan, description, public_id });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-[#CBADD8] p-8 rounded-lg shadow-lg w-[90%] max-w-md relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl font-bold focus:outline-none"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-1">Add Identity Document</h2>
        <p className="text-gray-600 mb-6 text-sm">Please provide details for your identity document.</p>
        <div className="border-t border-gray-300 mb-6" />

        {/* Document Type */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Document Type</label>
          <input
            type="text"
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="E.g. Passport, Driver's License"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Description <span className="text-gray-500 text-xs">(optional)</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="E.g. Front side only"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm"
            rows={2}
          />
        </div>

        {/* Upload Field */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Upload Document</label>
          <input
            type="file"
            accept="image/*,.pdf,video/*"
            onChange={handleFileUpload}
            className="w-full text-sm"
          />
          {uploading && <p className="text-sm text-gray-600 mt-1">Uploading...</p>}
          {scan && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-green-700">Uploaded successfully!</p>
              <a
                href={scan}
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
            {uploading ? 'Uploading...' : initialData ? 'Update' : 'Save Identity Document'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IdentityModal;
