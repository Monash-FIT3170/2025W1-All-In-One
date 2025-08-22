import React, { useState } from 'react';

export default function UploadImage() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

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
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <label
        htmlFor="dropzone-file"
        className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded inline-block"
      >
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

      {imageUrl && (
        <div className="mt-4">
          <p className="text-green-600">Upload complete!</p>
          <img src={imageUrl} alt="Uploaded" className="mt-2 max-w-xs rounded shadow" />
        </div>
      )}
    </div>
  );
}
