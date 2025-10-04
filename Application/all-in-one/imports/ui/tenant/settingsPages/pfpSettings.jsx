import React, { useState, useEffect } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Tenants } from "/imports/api/database/collections";

function ProfilePictureSetting(){
    const [uploading, setUploading]= useState(false);
    const [imageUrl, setImageUrl]= useState("");
    const [statusMessage, setStatusMessage]= useState ("");
    //const [currentPic, setCurrentPic]= useState("");

    const cloudName = 'dcceytydt'; // Replace with your Cloudinary cloud name
    const uploadPreset = 'q3as54rftg7'; // Replace with your unsigned preset name

    // useEffect(() => {
    //     const tenant= Tenants.findOne({ ten_id: Meteor.userId()});
    //     if (tenant?.ten_pfp) setCurrentPic (tenant.ten_pfp);
    // }, []);

    // Use useTracker for reactive data fetching
    const { currentPic, isLoading } = useTracker(() => {
        const handle = Meteor.subscribe('tenants');
        const tenant = Tenants.findOne({ ten_id: Meteor.userId() });
        
        return {
            currentPic: tenant?.ten_pfp || "",
            isLoading: !handle.ready()
        };
    }, []);

    const handleUpload= async (event) => {
        const file= event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setStatusMessage("");

        const formData= new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        try{
            const res= await fetch (`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
                method: "POST",
                body: formData,
            });
            const data= await res.json();

            if (data.secure_url){
                setImageUrl(data.secure_url);
                setStatusMessage("Upload complete! Click save to apply.");
            }else {
                setStatusMessage("Upload failed");
                console.error("Cloudinary error:", data);
            }
        }catch (err){
            console.error("Upload failed:", err);
            setStatusMessage("Uplaod failed.");
        } finally {
            setUploading(false);
        }
    }

const handleSave = async () => {
    if (!imageUrl) return setStatusMessage("No image to save.");

    try {
      const updated = await Meteor.callAsync("tenant.updateProfilePic", imageUrl);
      if (updated) {
        //setCurrentPic(imageUrl);
        setImageUrl(""); // Clear the temporary image URL after saving
        setStatusMessage("Profile picture updated successfully!");
      } else {
        setStatusMessage("No changes were made.");
      }
    } catch (err) {
      console.error(err);
      setStatusMessage(`Failed to save: ${err.message}`);
    }
  };

  if (isLoading) {
        return (
            <div className="p-4">
                <h3 className="text-xl font-semibold mb-4">Profile Picture</h3>
                <p>Loading...</p>
            </div>
        );
    }

  return (
    <div className="p-4">
      <h3 className="text-xl font-semibold mb-4">Profile Picture</h3>

      <div className="mb-4">
        <img
          src={imageUrl || currentPic || "/default-avatar.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border border-gray-300"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="pfp-upload"
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#9747FF] text-white hover:bg-violet-900"
        >
          Upload New Picture
        </label>
        <input
          id="pfp-upload"
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleUpload}
        />
      </div>

      {uploading && <p className="text-yellow-600 mb-2">Uploading...</p>}

      <button
        onClick={handleSave}
        disabled={!imageUrl || uploading}
        className={`px-6 py-2 rounded-full font-semibold transition ${
          imageUrl && !uploading
            ? "bg-[#9747FF] text-white hover:bg-violet-900"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Save
      </button>

      {statusMessage && <p className="mt-2 text-sm text-green-600">{statusMessage}</p>}
    </div>
  );
}

export default ProfilePictureSetting;
