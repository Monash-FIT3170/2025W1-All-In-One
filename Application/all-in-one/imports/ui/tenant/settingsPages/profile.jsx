import React, { useState, useEffect } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Tenants } from "/imports/api/database/collections";
import { Meteor } from "meteor/meteor";

export default function ProfileSection() {
  const [profile, setProfile] = useState({
    ten_fn: "",
    ten_ln: "",
    ten_email:"",
    ten_pn: "",
    ten_dob: "",
  });

  // load both tenant and user data
  const { tenant,user, isLoading } = useTracker(() => {
    const sub = Meteor.subscribe("tenants");
    const t = Tenants.findOne({ ten_id: Meteor.userId() });
    const u= Meteor.user();
    return { tenant: t, user:u, isLoading: !sub.ready() || !u };
  }, []);

  useEffect(() => {
    console.log("Tenant data:", tenant);
    console.log("Is loading:", isLoading);
    if (!isLoading && tenant && user) {
      setProfile({
        ten_fn: tenant.ten_fn || user?.profile?.firstName|| "",
        ten_ln: tenant.ten_ln || user?.profile?.lasttName|| "",
        ten_email: tenant.ten_email || user?.emails?.[0]?.address || "",
        ten_pn: tenant.ten_pn || "",
        ten_dob: tenant.ten_dob
          ? new Date(tenant.ten_dob).toISOString().split("T")[0] // format date to YYYY-MM-DD
          : ""
      });
    }
  }, [tenant, user, isLoading]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {

    // required data must be filled
    if (!profile.ten_fn.trim() || !profile.ten_ln.trim() || !profile.ten_email.trim()) {
      alert("First name, last name, and email are required.");
      return;
    }
    const updateData = {
      ten_fn: profile.ten_fn.trim(),
      ten_ln: profile.ten_ln.trim(),
      ten_email: profile.ten_email.trim(),
      ten_pn: profile.ten_pn?.trim() || "" , // optional but never null
      ten_dob: profile.ten_dob ? new Date(profile.ten_dob) : new Date(0), // optional but never null
    };

    console.log("Sending update data:", updateData);

    Meteor.call(
      "tenantsProfile.update",
      Meteor.userId(),
      updateData,
      (err, res) => {
        if (err) {
          console.error("Error updating profile:", err);
          alert("Failed to update profile. Please try again.");
        } else {
          console.log("Profile updated successfully!");
        }
      }
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Profile</h3>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="First Name"
          value={profile.ten_fn}
          onChange={(e) => handleChange("ten_fn", e.target.value)}
          className="p-2 border rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={profile.ten_ln}
          onChange={(e) => handleChange("ten_ln", e.target.value)}
          className="p-2 border rounded w-full"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={profile.ten_email}
          onChange={(e) => handleChange("ten_email", e.target.value)}
          className="p-2 border rounded w-full"
          required
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={profile.ten_pn}
          onChange={(e) => handleChange("ten_pn", e.target.value)}
          className="p-2 border rounded w-full"
        />
        <input
          type="date"
          placeholder="Date of Birth"
          value={profile.ten_dob}
          onChange={(e) => handleChange("ten_dob", e.target.value)}
          className="p-2 border rounded w-full"
        />
      </div>
      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-[#9747FF] text-white rounded font-semibold hover:bg-violet-900"
      >
        Save Profile
      </button>
    </div>
  );
}
