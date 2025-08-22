import React, { useState } from 'react';

export default function MultiFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const cloudName = 'dcceytydt'; // replace with your Cloudinary cloud name
  const uploadPreset = 'ml_default'; // replace with your unsigned preset name

  const handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const uploaded = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.secure_url) {
          const isPDF = file.type === 'application/pdf';
          const fileType = isPDF ? 'pdf' : 'image';
          const transformedUrl = isPDF
            ? `https://res.cloudinary.com/${cloudName}/raw/upload/fl_attachment/${data.public_id}`
            : data.secure_url;

          uploaded.push({
            name: file.name,
            url: transformedUrl,
            isPDF,
          });
        } else {
          console.error('Upload error:', data);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    setUploadedFiles((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  return (
    <div className="p-6 space-y-4">
      <label
        htmlFor="multi-upload"
        className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded inline-block"
      >
        Upload Files
      </label>
      <input
        id="multi-upload"
        type="file"
        multiple
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleUpload}
      />

      {uploading && <p className="text-yellow-600">Uploading...</p>}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file, idx) => (
            <div key={idx} className="text-sm">
              {file.isPDF ? (
                <a
                  href={file.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline"
                >
                  {file.name} (Download PDF)
                </a>
              ) : (
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-w-xs rounded shadow"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
